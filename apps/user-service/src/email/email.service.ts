import { InjectQueue } from '@nestjs/bullmq';
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { AuthService } from 'src/auth/auth.service';
import { EmailVerificationConfig } from 'src/config/email-verification.config';
import { PasswordResetConfig } from 'src/config/password-reset.config';
import { EMAIL_QUEUE } from './constants/email.constant';
import { EmailTemplateService } from './email-template.service';

@Injectable()
export class EmailService {
  private readonly logger: Logger = new Logger(EmailService.name, {
    timestamp: true,
  });

  constructor(
    @InjectQueue(EMAIL_QUEUE) private readonly emailQueue: Queue,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
    private readonly templateService: EmailTemplateService,
  ) {}

  async sendVerificationEmail(email: string, username: string) {
    try {
      const config =
        this.configService.get<EmailVerificationConfig>('emailVerification');

      const token =
        await this.authService.generateEmailVerificationToken(email);
      const verificationLink = this.generateUrlWithQuery(config.url, { token });

      const emailTemplate = this.templateService.renderTemplate(
        'email-verification',
        {
          appName: this.configService.get<string>('appName'),
          username,
          verificationLink,
          contactSupport: this.configService.get<string>('EMAIL_SUPPORT'),
        },
      );

      await this.emailQueue.add('send-email', {
        to: email,
        subject: 'Verify Your Email',
        text: this.templateService.convertHtmlToPlainText(emailTemplate),
        html: emailTemplate,
      });

      this.logger.debug(`Verification email queued for: ${email}`);
    } catch (e) {
      this.logger.error('Error sending verification email:', e.stack);
    }
  }

  async sendPasswordResetEmail(
    userId: string,
    username: string,
    email: string,
  ) {
    const config = this.configService.get<PasswordResetConfig>('passwordReset');

    const token = await this.authService.generatePasswordResetToken(userId);
    const resetLink = this.generateUrlWithQuery(config.url, { token });

    const emailTemplate = this.templateService.renderTemplate(
      'password-reset',
      {
        appName: this.configService.get<string>('appName'),
        username,
        resetLink,
        expiresIn: this.formatExpirationTime(config.expiresIn),
        contactSupport: this.configService.get<string>('EMAIL_SUPPORT'),
      },
    );

    await this.emailQueue.add('send-email', {
      to: email,
      subject: 'Password Reset Request',
      text: this.templateService.convertHtmlToPlainText(emailTemplate),
      html: emailTemplate,
    });

    this.logger.debug(`Password reset email queued for: ${email}`);
  }

  private generateUrlWithQuery(
    url: string,
    queryParams: Record<string, string | number | boolean>,
  ): string {
    const urlObj = new URL(url);

    Object.entries(queryParams).forEach(([key, value]) => {
      urlObj.searchParams.append(key, value.toString());
    });

    return urlObj.toString();
  }

  private formatExpirationTime(expiration: string): string {
    // Regex to match the number followed by the unit (e.g., "2m", "1h", "3d")
    const regex = /^(\d+)([smhdwMy])$/;
    const match = expiration.match(regex);

    if (!match) {
      throw new Error(
        'Invalid format for expiration time. Expected format: number followed by a time unit (s, m, h, d, w, M, y)',
      );
    }

    const value = parseInt(match[1], 10);
    const unit = match[2];

    let timeString = '';

    switch (unit) {
      case 's': // seconds
        timeString = `${value} second${value > 1 ? 's' : ''}`;
        break;
      case 'm': // minutes
        timeString = `${value} minute${value > 1 ? 's' : ''}`;
        break;
      case 'h': // hours
        timeString = `${value} hour${value > 1 ? 's' : ''}`;
        break;
      case 'd': // days
        timeString = `${value} day${value > 1 ? 's' : ''}`;
        break;
      case 'w': // weeks
        timeString = `${value} week${value > 1 ? 's' : ''}`;
        break;
      case 'M': // months
        timeString = `${value} month${value > 1 ? 's' : ''}`;
        break;
      case 'y': // years
        timeString = `${value} year${value > 1 ? 's' : ''}`;
        break;
      default:
        throw new Error(
          'Unsupported time unit. Allowed units: s, m, h, d, w, M, y',
        );
    }

    return timeString;
  }
}
