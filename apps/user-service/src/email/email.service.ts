import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { EMAIL_QUEUE } from './constants/email.constant';
import { EmailTemplateService } from './email-template.service';
import { TokenService } from 'src/token/token.service';

@Injectable()
export class EmailService {
  private readonly logger: Logger = new Logger(EmailService.name, {
    timestamp: true,
  });

  constructor(
    @InjectQueue(EMAIL_QUEUE) private readonly emailQueue: Queue,
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
    private readonly templateService: EmailTemplateService,
  ) {}

  private async queueEmail(
    to: string,
    subject: string,
    template: string,
    placeholders: Record<string, any>,
  ) {
    const emailTemplate = this.templateService.renderTemplate(
      template,
      placeholders,
    );

    await this.emailQueue.add(
      'send-email',
      {
        to,
        subject,
        text: this.templateService.convertHtmlToPlainText(emailTemplate),
        html: emailTemplate,
      },
      {
        attempts: 3, // Retry 3 times on failure
        backoff: 5000, // 5 seconds delay between retries
      },
    );

    this.logger.log(`Email queued for: ${to}, Subject: ${subject}`);
  }

  async sendVerificationEmail(email: string, username: string) {
    try {
      const { token, config } = await this.tokenService.generate(
        { email },
        'emailVerification',
      );
      const verificationLink = this.generateUrlWithQuery(config.url, { token });

      await this.queueEmail(email, 'Verify Your Email', 'email-verification', {
        appName: this.configService.get<string>('app.name'),
        username,
        verificationLink,
        contactSupport: this.configService.get<string>('email.support'),
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
    const { token, config } = await this.tokenService.generate(
      { sub: userId },
      'passwordReset',
    );
    const resetLink = this.generateUrlWithQuery(config.url, { token });

    await this.queueEmail(email, 'Password Reset Request', 'password-reset', {
      appName: this.configService.get<string>('app.name'),
      username,
      resetLink,
      expiresIn: this.formatExpirationTime(config.expiresIn),
      contactSupport: this.configService.get<string>('email.support'),
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
