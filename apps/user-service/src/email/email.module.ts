import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailProcessor } from './email.processor';
import { BullModule } from '@nestjs/bullmq';
import Redis from 'ioredis';
import { REDIS_CLIENT } from 'src/redis/constants/redis.constant';
import { RedisModule } from 'src/redis/redis.module';
import { EmailConfigService } from './config/email-config.service';
import { EMAIL_QUEUE } from './constants/email.constant';
import { EmailTemplateService } from './email-template.service';
import { TokenModule } from 'src/token/token.module';

@Module({
  imports: [
    RedisModule,
    BullModule.registerQueueAsync({
      name: EMAIL_QUEUE,
      imports: [RedisModule],
      useFactory: async (redisClient: Redis) => ({
        connection: redisClient,
      }),
      inject: [REDIS_CLIENT],
    }),
    TokenModule,
  ],
  providers: [
    EmailService,
    EmailProcessor,
    EmailConfigService,
    EmailTemplateService,
  ],
  exports: [EmailService],
})
export class EmailModule {}
