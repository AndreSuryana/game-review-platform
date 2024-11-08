import { Provider } from '@nestjs/common';
import { REDIS_CLIENT } from '../constants/redis.constant';
import { ConfigService } from '@nestjs/config';
import { RedisConfig } from 'src/config/redis.config';
import Redis from 'ioredis';

export const RedisProvider: Provider = {
  provide: REDIS_CLIENT,
  useFactory: (configService: ConfigService) => {
    const redisConfig = configService.get<RedisConfig>('redis');
    return new Redis({
      host: redisConfig.host,
      port: redisConfig.port,
      username: redisConfig.username,
      password: redisConfig.password,
    });
  },
  inject: [ConfigService],
};
