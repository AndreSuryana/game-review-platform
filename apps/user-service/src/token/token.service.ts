import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { hash } from 'bcrypt';
import { TokenConfig } from '../config/token.config';

@Injectable()
export class TokenService {
  private readonly logger: Logger = new Logger(TokenService.name, {
    timestamp: true,
  });

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async generate(
    payload: Record<string, any>,
    config: TokenConfig,
  ): Promise<string>;
  async generate(
    payload: Record<string, any>,
    configKey: string,
  ): Promise<{ token: string; config: TokenConfig }>;

  async generate(
    payload: Record<string, any>,
    configOrKey: TokenConfig | string,
  ): Promise<string | { token: string; config: TokenConfig }> {
    if (typeof configOrKey === 'string') {
      const config = this.getTokenConfig(configOrKey);
      return {
        token: await this.jwtService.signAsync(payload, {
          secret: config.secret,
          expiresIn: config.expiresIn,
        }),
        config,
      };
    } else {
      return this.jwtService.signAsync(payload, {
        secret: configOrKey.secret,
        expiresIn: configOrKey.expiresIn,
      });
    }
  }

  async verify(token: string, configKey: string): Promise<any> {
    const config = this.getTokenConfig(configKey);
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: config.secret,
      });
    } catch (e) {
      this.logger.error(`Error verifying token: ${e.message}`, e.stack);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async decode(token: string): Promise<any> {
    try {
      return await this.jwtService.decode(token);
    } catch (e) {
      this.logger.error(`Error verifying token: ${e.message}`, e.stack);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async hashToken(token: string): Promise<string> {
    return hash(token, 10);
  }

  private getTokenConfig(configKey: string): TokenConfig {
    const config = this.configService.get<TokenConfig>(configKey);
    if (!config) {
      throw new Error(`${configKey} JWT configuration is missing`);
    }
    return config;
  }
}
