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

    // Register hooks
    worker.on('completed', this.onCompleted.bind(this));
    worker.on('failed', this.onFailed.bind(this));
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
      throw e; // Throw the exception to allow retry
    }
  }

  private onCompleted(job: Job) {
    this.logger.log(`Email job ${job.id} has been completed!`);
  }

  private onFailed(job: Job, err: Error) {
    this.logger.error(`Email job ${job?.id} has failed on attempt ${job.attemptsMade}: ${err.message}`);

    // Check if job has exhausted all attempts
    if (job.attemptsMade >= job.opts.attempts) {
      this.logger.warn(
        `Max attempts reached for job ${job.id}. Storing in failed emails.`,
      );
      // TODO: Save failed email to the database or log for manual retries
    }
  }
}
