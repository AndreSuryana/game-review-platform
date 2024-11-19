import { InjectQueue } from '@nestjs/bullmq';
import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import { AuthService } from 'src/auth/auth.service';
import { EmailVerificationConfig } from 'src/config/email-verification.config';
import { PasswordResetConfig } from 'src/config/password-reset.config';
import { EMAIL_QUEUE } from './constants/email.constant';

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
  ) {}

  async sendVerificationEmail(email: string) {
    const config =
      this.configService.get<EmailVerificationConfig>('emailVerification');

    const token = await this.authService.generateEmailVerificationToken(email);
    const verificationLink = this.generateUrlWithQuery(config.url, { token });

    await this.emailQueue.add('send-email', {
      to: email,
      subject: 'Verify Your Email',
      text: `Hello,\n\nPlease click the link below to verify your email address:\n\n${verificationLink}\n\nIf you did not request this email, you can safely ignore it.\n\nThank you,\nGame Review Platform Team`,
      html: `
        <p>Hello,</p>
        <p>Please click the link below to verify your email address:</p>
        <p>
          <a href="${verificationLink}">Verify Your Email</a>
        </p>
        <p>If you did not request this email, you can safely ignore it.</p>
        <p>Thank you,<br>Game Review Platform Team</p>
      `,
    });

    this.logger.debug(`Verification email queued for: ${email}`);
  }

  async sendPasswordResetEmail(userId: string, email: string) {
    const config = this.configService.get<PasswordResetConfig>('passwordReset');

    const token = await this.authService.generatePasswordResetToken(userId);
    const passwordResetLink = this.generateUrlWithQuery(config.url, { token });

    await this.emailQueue.add('send-email', {
      to: email,
      subject: 'Password Reset Request',
      text: `Hello,\n\nWe received a request to reset your password. If this was you, please click the link below to reset your password:\n\n${passwordResetLink}\n\nIf you did not request a password reset, you can safely ignore this email.\n\nThank you,\nGame Review Platform Team`,
      html: `
        <p>Hello,</p>
        <p>We received a request to reset your password. If this was you, please click the link below to reset your password:</p>
        <p>
          <a href="${passwordResetLink}">Reset Your Password</a>
        </p>
        <p>If you did not request a password reset, you can safely ignore this email.</p>
        <p>Thank you,<br>Game Review Platform Team</p>
      `,
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
}
