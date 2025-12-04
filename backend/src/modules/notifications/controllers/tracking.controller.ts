import {
  Controller,
  Get,
  Post,
  Query,
  Param,
  Body,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { NotificationAnalyticsService } from '../services/notification-analytics.service';

/**
 * Controller for tracking notification interactions
 * These endpoints are typically called from:
 * - Email tracking pixels
 * - Notification click links
 * - Mobile app SDK
 */
@ApiTags('Notification Tracking')
@Controller('notifications/track')
export class TrackingController {
  // 1x1 transparent GIF pixel for email open tracking
  private readonly TRACKING_PIXEL = Buffer.from(
    'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    'base64',
  );

  constructor(private readonly analyticsService: NotificationAnalyticsService) {}

  /**
   * Track notification open (via pixel or redirect)
   * Used for email notifications with tracking pixel
   */
  @Get(':trackingId/open')
  @ApiOperation({
    summary: 'Track notification open',
    description: 'Track when a notification is opened. Returns a tracking pixel for email notifications.',
  })
  @ApiParam({ name: 'trackingId', description: 'Notification tracking ID' })
  @ApiQuery({ name: 'r', required: false, description: 'Redirect URL after tracking' })
  @ApiResponse({ status: 200, description: 'Open tracked successfully' })
  async trackOpen(
    @Param('trackingId') trackingId: string,
    @Query('r') redirectUrl: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      await this.analyticsService.trackOpen(trackingId);
    } catch (error) {
      // Silently fail tracking - don't interrupt user experience
    }

    if (redirectUrl) {
      // Redirect to actual content
      res.redirect(redirectUrl);
    } else {
      // Return tracking pixel
      res.set({
        'Content-Type': 'image/gif',
        'Content-Length': this.TRACKING_PIXEL.length,
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      });
      res.end(this.TRACKING_PIXEL);
    }
  }

  /**
   * Track notification click
   * Used when user clicks a link in notification
   */
  @Get(':trackingId/click')
  @ApiOperation({
    summary: 'Track notification click',
    description: 'Track when a notification link is clicked and redirect to target URL.',
  })
  @ApiParam({ name: 'trackingId', description: 'Notification tracking ID' })
  @ApiQuery({ name: 'url', required: true, description: 'Target URL to redirect to' })
  @ApiQuery({ name: 'btn', required: false, description: 'Button ID that was clicked' })
  @ApiResponse({ status: 302, description: 'Redirected to target URL' })
  async trackClick(
    @Param('trackingId') trackingId: string,
    @Query('url') targetUrl: string,
    @Query('btn') buttonId: string,
    @Res() res: Response,
  ): Promise<void> {
    if (!targetUrl) {
      throw new BadRequestException('Target URL is required');
    }

    try {
      await this.analyticsService.trackClick(trackingId, targetUrl, buttonId);
    } catch (error) {
      // Silently fail tracking - don't interrupt user experience
    }

    // Validate and redirect to target URL
    const safeUrl = this.sanitizeUrl(targetUrl);
    res.redirect(safeUrl);
  }

  /**
   * Track notification click (POST variant for mobile apps)
   */
  @Post(':trackingId/click')
  @ApiOperation({
    summary: 'Track notification click (POST)',
    description: 'Track notification click from mobile apps or web SDK.',
  })
  @ApiParam({ name: 'trackingId', description: 'Notification tracking ID' })
  @ApiResponse({ status: 200, description: 'Click tracked successfully' })
  async trackClickPost(
    @Param('trackingId') trackingId: string,
    @Body() body: { url?: string; buttonId?: string },
  ): Promise<{ success: boolean; message: string }> {
    await this.analyticsService.trackClick(trackingId, body.url, body.buttonId);

    return {
      success: true,
      message: 'Click tracked successfully',
    };
  }

  /**
   * Track conversion event
   * Used when user completes a desired action
   */
  @Post(':trackingId/convert')
  @ApiOperation({
    summary: 'Track conversion',
    description: 'Track when a user completes a conversion action from a notification.',
  })
  @ApiParam({ name: 'trackingId', description: 'Notification tracking ID' })
  @ApiResponse({ status: 200, description: 'Conversion tracked successfully' })
  async trackConversion(
    @Param('trackingId') trackingId: string,
    @Body() body: { value?: number; type?: string; metadata?: Record<string, unknown> },
  ): Promise<{ success: boolean; message: string }> {
    await this.analyticsService.trackConversion(
      trackingId,
      body.value,
      body.type,
      body.metadata,
    );

    return {
      success: true,
      message: 'Conversion tracked successfully',
    };
  }

  /**
   * Track notification dismissal
   * Used when user dismisses/swipes away notification
   */
  @Post(':trackingId/dismiss')
  @ApiOperation({
    summary: 'Track notification dismissal',
    description: 'Track when a notification is dismissed by the user.',
  })
  @ApiParam({ name: 'trackingId', description: 'Notification tracking ID' })
  @ApiResponse({ status: 200, description: 'Dismissal tracked successfully' })
  async trackDismiss(
    @Param('trackingId') trackingId: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.analyticsService.trackDismiss(trackingId);

    return {
      success: true,
      message: 'Dismissal tracked successfully',
    };
  }

  /**
   * Sanitize and validate URL for redirect
   */
  private sanitizeUrl(url: string): string {
    try {
      const parsedUrl = new URL(url);
      
      // Only allow http and https protocols
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return '/';
      }
      
      return url;
    } catch {
      // Invalid URL, return home
      return '/';
    }
  }
}

