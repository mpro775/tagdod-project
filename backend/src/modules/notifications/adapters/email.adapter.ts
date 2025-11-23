import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

export interface EmailNotification {
  to: string | string[];
  subject: string;
  template?: string;
  data?: Record<string, unknown>;
  html?: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

@Injectable()
export class EmailAdapter {
  private readonly logger = new Logger(EmailAdapter.name);
  private transporter?: nodemailer.Transporter;
  private templateCache = new Map<string, HandlebarsTemplateDelegate>();

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    try {
      const smtpHost = this.configService.get('SMTP_HOST');
      const smtpUser = this.configService.get('SMTP_USER');
      const smtpPass = this.configService.get('SMTP_PASS');

      // Check if required environment variables are set
      if (!smtpHost || !smtpUser || !smtpPass) {
        this.logger.warn(
          'SMTP environment variables are not fully configured. ' +
          'Required: SMTP_HOST, SMTP_USER, SMTP_PASS. ' +
          'Email notifications will be disabled.'
        );
        return;
      }

      const smtpPort = parseInt(this.configService.get('SMTP_PORT') || '587');
      const smtpSecure = this.configService.get('SMTP_SECURE') === 'true';
      
      const smtpConfig = {
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
        tls: {
          rejectUnauthorized: false,
        },
        connectionTimeout: 60000, // زيادة إلى 60 ثانية
        greetingTimeout: 60000,   // زيادة إلى 60 ثانية
        socketTimeout: 60000,     // زيادة إلى 60 ثانية
        debug: process.env.NODE_ENV === 'development',
        logger: process.env.NODE_ENV === 'development',
      };

      this.transporter = nodemailer.createTransport(smtpConfig);
      this.logger.log('Email transporter initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize email transporter:', error);
      this.transporter = undefined as unknown as nodemailer.Transporter;
    }
  }

  /**
   * Check if email transporter is properly initialized
   */
  public isInitialized(): boolean {
    return this.transporter !== undefined && this.transporter !== null;
  }

  /**
   * Send email notification
   */
  async sendEmail(notification: EmailNotification): Promise<EmailResult> {
    if (!this.isInitialized()) {
      this.logger.warn('Email transporter is not initialized. Cannot send email.');
      return {
        success: false,
        error: 'Email transporter not initialized',
      };
    }

    try {

      let html = notification.html;
      let text = notification.text;

      // Use template if provided
      if (notification.template && notification.data) {
        const templateResult = await this.renderTemplate(notification.template, notification.data);
        html = templateResult.html;
        text = templateResult.text;
      }

      const mailOptions = {
        from: this.configService.get('SMTP_FROM') || this.configService.get('SMTP_USER'),
        to: Array.isArray(notification.to) ? notification.to.join(', ') : notification.to,
        subject: notification.subject,
        html,
        text,
        attachments: notification.attachments,
        encoding: 'UTF-8',
        headers: {
          'Content-Type': 'text/html; charset=UTF-8',
          'Content-Transfer-Encoding': 'quoted-printable',
        },
      };

      // إضافة timeout wrapper للتعامل مع الملفات المرفقة الكبيرة
      const sendMailPromise = this.transporter!.sendMail(mailOptions);
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Email send timeout after 90 seconds')), 90000);
      });

      const info = await Promise.race([sendMailPromise, timeoutPromise]) as any;

      this.logger.log(`Email sent successfully to ${notification.to}: ${info.messageId}`);

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      this.logger.error(`Failed to send email to ${notification.to}:`, error);
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  /**
   * Send bulk email notifications
   */
  async sendBulkEmail(notifications: EmailNotification[]): Promise<{
    successCount: number;
    failureCount: number;
    results: EmailResult[];
  }> {
    const results = {
      successCount: 0,
      failureCount: 0,
      results: [] as EmailResult[],
    };

    for (const notification of notifications) {
      const result = await this.sendEmail(notification);
      results.results.push(result);

      if (result.success) {
        results.successCount++;
      } else {
        results.failureCount++;
      }
    }

    this.logger.log(
      `Bulk email results: ${results.successCount} success, ${results.failureCount} failed`,
    );
    return results;
  }

  /**
   * Render email template
   */
  private async renderTemplate(
    templateName: string,
    data: Record<string, unknown>,
  ): Promise<{
    html: string;
    text: string;
  }> {
    try {
      // Check cache first
      if (this.templateCache.has(templateName)) {
        const template = this.templateCache.get(templateName)!;
        const html = template(data);
        return {
          html,
          text: this.htmlToText(html),
        };
      }

      // Load template from file
      const templatePath = path.join(process.cwd(), 'templates', 'emails', `${templateName}.hbs`);
      const templateContent = fs.readFileSync(templatePath, 'utf8');

      // Compile template
      const template = handlebars.compile(templateContent);
      this.templateCache.set(templateName, template);

      const html = template(data);
      return {
        html,
        text: this.htmlToText(html),
      };
    } catch (error) {
      this.logger.error(`Failed to render template ${templateName}:`, error);
      return {
        html: `<p>Error rendering template: ${(error as Error).message}</p>`,
        text: `Error rendering template: ${(error as Error).message}`,
      };
    }
  }

  /**
   * Convert HTML to text
   */
  private htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .trim();
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(to: string, userName: string): Promise<EmailResult> {
    const appDeepLink = this.configService.get<string>('MOBILE_APP_DEEP_LINK_SCHEME', 'tagdodapp://');
    return this.sendEmail({
      to,
      subject: 'مرحباً بك في تجدٌد',
      template: 'welcome',
      data: {
        userName,
        siteName: 'تجدٌد',
        loginUrl: `${appDeepLink}login`,
      },
    });
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmation(
    to: string,
    orderData: Record<string, unknown>,
  ): Promise<EmailResult> {
    const appDeepLink = this.configService.get<string>('MOBILE_APP_DEEP_LINK_SCHEME', 'tagdodapp://');
    return this.sendEmail({
      to,
      subject: `تأكيد الطلب #${orderData.orderNumber}`,
      template: 'order-confirmation',
      data: {
        ...orderData,
        siteName: 'تجدٌد',
        orderUrl: `${appDeepLink}orders/${orderData.id}`,
      },
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(to: string, resetToken: string): Promise<EmailResult> {
    // الحصول على رابط Deep Link للتطبيق
    const appDeepLink = this.configService.get<string>('MOBILE_APP_DEEP_LINK_SCHEME', 'tagdodapp://');
    const resetUrl = `${appDeepLink}reset-password?token=${resetToken}`;
    
    return this.sendEmail({
      to,
      subject: 'إعادة تعيين كلمة المرور',
      template: 'password-reset',
      data: {
        resetUrl,
        siteName: 'تجدٌد',
      },
    });
  }

  /**
   * Send stock alert email
   */
  async sendStockAlert(to: string, productData: Record<string, unknown>): Promise<EmailResult> {
    const appDeepLink = this.configService.get<string>('MOBILE_APP_DEEP_LINK_SCHEME', 'tagdodapp://');
    return this.sendEmail({
      to,
      subject: `تنبيه: مخزون منخفض - ${productData.name}`,
      template: 'stock-alert',
      data: {
        ...productData,
          siteName: 'تجدٌد',
        productUrl: `${appDeepLink}products/${productData.id}`,
      },
    });
  }

  /**
   * Verify email configuration
   */
  async verifyConfiguration(): Promise<boolean> {
    if (!this.isInitialized()) {
      return false;
    }

    try {
      await this.transporter!.verify();
      this.logger.log('Email configuration verified successfully');
      return true;
    } catch (error) {
      this.logger.error('Email configuration verification failed:', error);
      return false;
    }
  }

  /**
   * Get email statistics
   */
  async getEmailStatistics(): Promise<unknown> {
    try {
      // This would require additional setup for email tracking
      return {
        totalSent: 0,
        totalDelivered: 0,
        totalBounced: 0,
        totalOpened: 0,
        totalClicked: 0,
      };
    } catch (error) {
      this.logger.error('Failed to get email statistics:', error);
      return null;
    }
  }
}
