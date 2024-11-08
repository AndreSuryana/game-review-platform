import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { v4 as uuidv4 } from 'uuid';
import { hash } from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { RedisConfig } from 'src/config/redis.config';
import { REDIS_CLIENT } from 'src/redis/constants/redis.constant';
import Redis from 'ioredis';
import { RevokeReason } from './enums/revoke-reason.enum';

@Injectable()
export class SessionService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(REDIS_CLIENT) private readonly redisClient: Redis,
  ) {}

  private readonly logger: Logger = new Logger(SessionService.name, {
    timestamp: true,
  });

  async generateToken(
    userId: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<string> {
    const jti = uuidv4();
    const payload = { sub: userId, jti };
    const token = await this.jwtService.signAsync(payload);
    this.logger.debug(
      `Created session info: ip=${ipAddress}, userAgent=${userAgent}`,
    );

    await this.cacheSessionToken(token, ipAddress, userAgent);

    return token;
  }

  async verifyToken(token: string): Promise<any> {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      const cacheKey = `session:${payload.jti}`;

      // Check for token revocation
      const revokedAt = await this.redisClient.hget(
        cacheKey,
        'revoke.timestamp',
      );
      this.logger.debug(`Revoked at: `, revokedAt);
      if (revokedAt) {
        const revokedReason = await this.redisClient.hget(
          cacheKey,
          'revoke.reason',
        );
        throw new UnauthorizedException(
          `This session has been revoked. Reason: '${revokedReason}'`,
        );
      }

      return payload;
    } catch (e) {
      if (e instanceof UnauthorizedException) {
        // Re-throw revoked exceptions directly
        throw e;
      }

      this.logger.error(`Error verifying session token: ${e.message}`, e.stack);
      throw new UnauthorizedException('Invalid or expired session token');
    }
  }

  async revoke(token: string, reason: RevokeReason): Promise<void> {
    const payload = await this.jwtService.decode(token);
    const cacheKey = `session:${payload.jti}`;

    await this.redisClient.hset(
      cacheKey,
      'revoke.timestamp',
      Date.now() / 1000,
    );
    await this.redisClient.hset(cacheKey, 'revoke.reason', reason);
  }

  async cacheSessionToken(
    token: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    const payload = await this.jwtService.decode(token);

    if (
      !payload ||
      !payload.jti ||
      !payload.sub ||
      !payload.iat ||
      !payload.exp
    ) {
      throw new Error('Invalid JWT payload structure');
    }

    // Set cached data in the Redis hash
    const cacheKey = `session:${payload.jti}`;
    const hashedToken = await hash(token, 10);

    await this.redisClient.hmset(cacheKey, {
      userId: payload.sub,
      ipAddress: ipAddress || '',
      userAgent: userAgent || '',
      hashedToken,
      expiredAt: payload.exp.toString(),
    });

    // Calculate TTL using the payload `iat` and `exp` with added threshold time (in seconds)
    const { threshold } = this.configService.get<RedisConfig>('redis');
    const ttl = payload.exp - payload.iat + threshold;

    await this.redisClient.expire(cacheKey, ttl);
    this.logger.debug(`Session token cached: ${cacheKey}`);
  }
}
