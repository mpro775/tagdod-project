import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TejoQueryDto } from './dto/tejo-query.dto';
import { TejoService } from './tejo.service';

interface JwtUser {
  sub: string;
}

interface RequestWithUser {
  user: JwtUser;
}

@ApiTags('tejo')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('tejo')
export class TejoController {
  constructor(private readonly tejoService: TejoService) {}

  @Post('query')
  @ApiOperation({ summary: 'Query Tejo assistant' })
  @ApiBody({ type: TejoQueryDto })
  @ApiResponse({ status: 201, description: 'Tejo response generated successfully' })
  async query(@Req() req: RequestWithUser, @Body() dto: TejoQueryDto) {
    return this.tejoService.handleQuery(req.user.sub, dto);
  }

  @Post('sessions/:sessionId/handoff')
  @ApiOperation({ summary: 'Trigger handoff from Tejo session to human support' })
  @ApiResponse({ status: 201, description: 'Handoff triggered successfully' })
  async handoff(@Req() req: RequestWithUser, @Param('sessionId') sessionId: string) {
    return this.tejoService.triggerHandoff(sessionId, req.user.sub);
  }

  @Get('sessions/:sessionId/messages')
  @ApiOperation({ summary: 'Get messages from a Tejo session' })
  @ApiResponse({ status: 200, description: 'Session messages retrieved' })
  async getSessionMessages(
    @Req() req: RequestWithUser,
    @Param('sessionId') sessionId: string,
  ) {
    return this.tejoService.getSessionMessages(sessionId, req.user.sub);
  }

  @Get('sessions')
  @ApiOperation({ summary: 'Get user Tejo sessions' })
  @ApiResponse({ status: 200, description: 'User sessions retrieved' })
  async getUserSessions(@Req() req: RequestWithUser) {
    return this.tejoService.getUserSessions(req.user.sub);
  }
}
