import { Inject, Logger } from '@nestjs/common';
import { Job, Worker } from 'bullmq';
import { EmailConfigService } from './config/email-config.service';
import { ConfigService } from '@nestjs/config';
import { EMAIL_QUEUE } from './constants/email.constant';

export class EmailProcessor {
  private readonly logger: Logger = new Logger(EmailProcessor.name, {
    timestamp: true,
  });

  constructor(
    @Inject() private readonly emailConfigService: EmailConfigService,
    private readonly configService: ConfigService,
  ) {
    this.initWorker();
  }

  private initWorker() {
    const worker = new Worker(
      EMAIL_QUEUE,
      async (job: Job) => {
        await this.processJob(job);
      },
      {
        connection: {
          host: 'localhost',
          port: 6379,
        },
      },
    );

    worker.on('completed', (job) => {
      this.logger.log(`Job ${job.id} has been completed!`);
    });

    worker.on('failed', (job, err) => {
      this.logger.error(`Job ${job?.id} has failed: ${err.message}`);
    });
  }

  async processJob(job: Job) {
    const { to, subject, text, html } = job.data;

    if (!to) {
      throw new Error('Email address is required');
    }

    // Logging
    this.logger.debug(`Sending email to ${to}`);
    this.logger.debug(`Subject: ${subject}`);
    this.logger.debug(`Text: ${text}`);

    // Compose the email
    const transporter = this.emailConfigService.getTransporter();
    const mailOptions = {
      from: `"${this.configService.get<string>('SMTP_FROM_NAME')}" <${this.configService.get<string>('SMTP_FROM_EMAIL')}>`,
      to,
      subject,
      text,
      html,
    };

    try {
      await transporter.sendMail(mailOptions);
      this.logger.log(`Email sent to ${to}`);
    } catch (e) {
      this.logger.error('Error sending email:', e);
    }
  }
}
