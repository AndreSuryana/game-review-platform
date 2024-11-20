import { Inject, Logger } from '@nestjs/common';
import { Job, Worker } from 'bullmq';
import { EmailConfigService } from './config/email-config.service';
import { ConfigService } from '@nestjs/config';
import { EMAIL_QUEUE } from './constants/email.constant';
import { REDIS_CLIENT } from 'src/redis/constants/redis.constant';
import Redis from 'ioredis';

export class EmailProcessor {
  private readonly logger: Logger = new Logger(EmailProcessor.name, {
    timestamp: true,
  });

  constructor(
    @Inject() private readonly emailConfigService: EmailConfigService,
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
    private readonly configService: ConfigService,
  ) {
    this.initWorker();
  }

  private initWorker() {
    const worker = new Worker(
      EMAIL_QUEUE,
      async (job: Job) => await this.processJob(job),
      { connection: this.redisClient },
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

    // Compose the email
    const transporter = this.emailConfigService.getTransporter();
    const mailOptions = {
      from: this.configService.get<string>('EMAIL_NO_REPLY'),
      to,
      subject,
      text,
      html,
    };

    try {
      await transporter.sendMail(mailOptions);
      this.logger.log(`Email sent to ${to}: ${subject}`);
    } catch (e) {
      this.logger.error('Error sending email:', e);
    }
  }
}
