import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import * as crypto from 'crypto';
import { Session } from './schemas/session.schema';
import { ConfigService } from '@nestjs/config';
import { SessionConfig } from 'src/config/session.config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RevokeSessionDto } from './dto/revoke-session.dto';
import { RenewSessionDto } from './dto/renew-session.dto';
import { RevokeReason } from './enums/revoke-reason.enum';

@Injectable()
export class SessionService {
  private readonly HMAC_ALGORITHM: string = 'sha256';

  private readonly hmacSecret: string;
  private readonly expiresIn: number;

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Session.name) private readonly sessionModel: Model<Session>,
  ) {
    const sessionConfig = configService.get<SessionConfig>('session');
    this.hmacSecret = sessionConfig.secret;
    this.expiresIn = sessionConfig.expiresIn * 1000; // Convert into milliseconds
  }

  private readonly logger: Logger = new Logger(SessionService.name, {
    timestamp: true,
  });

  async createSession(
    userId: string,
    ipAddress: string,
    userAgent: string,
  ): Promise<Session> {
    // Generate a secure session token
    const sessionToken = this.generateSecureSessionToken();

    // Define session expiration
    const expiresAt = new Date(Date.now() + this.expiresIn);
    const lastActivity = new Date();

    // Populate and save the session
    const session = new this.sessionModel({
      userId,
      sessionToken,
      lastActivity,
      expiresAt,
      ipAddress,
      userAgent,
    });
    session.save();

    // TODO: Store session in Redis for quick access

    return session;
  }

  async validateSession(token: string): Promise<boolean> {
    // Decode the token and split it into sessionId and hmacDigest
    const decodedToken = Buffer.from(token, 'base64url').toString('utf-8');
    const [sessionId, providedHmacDigest] = decodedToken.split('.');

    // Recompute the HMAC digest
    const hmac = crypto.createHmac(this.HMAC_ALGORITHM, this.hmacSecret);
    hmac.update(sessionId);
    const expectedHmacDigest = hmac.digest('hex');

    // Compare HMAC digests
    if (expectedHmacDigest !== providedHmacDigest) {
      this.logger.error('Invalid session token');
      return false;
    }

    // If everything checks out, the session is valid
    return true;
  }

  async findSession(token: string): Promise<Session> {
    // TODO: Search in Redis first, if not exists try to search in Session collection

    const session = await this.sessionModel.findOne({
      $and: [{ sessionToken: token }, { isActive: true }],
    });

    return session || null;
  }

  async updateActivity(token: string): Promise<void> {
    const session = await this.findSession(token);
    if (!session) {
      throw new NotFoundException('Session is inactive or does not exist');
    }

    const lastActivity = Date.now();
    const expiresAt = lastActivity + this.expiresIn;

    await session.updateOne({ lastActivity, expiresAt });

    // TODO: Update the session in Redis
  }

  async invalidate(token: string): Promise<void> {
    const session = await this.findSession(token);
    if (!session) {
      throw new NotFoundException('Session is inactive or does not exist');
    }

    await session.updateOne({ isActive: false });

    // TODO: Remove the session from Redis
  }

  async renewSession(renewSessionDto: RenewSessionDto): Promise<Session> {
    const { sessionToken } = renewSessionDto;

    const oldSession = await this.findSession(sessionToken);
    if (!oldSession) {
      throw new NotFoundException('Session is inactive or does not exist');
    }

    const newSession = await this.createSession(
      oldSession.userId,
      oldSession.ipAddress,
      oldSession.userAgent,
    );

    this.revoke({ sessionToken: oldSession.sessionToken, reason: RevokeReason.NewTokenRequested });

    return newSession;
  }

  async revoke(revokeSessionDto: RevokeSessionDto): Promise<void> {
    const { sessionToken, reason } = revokeSessionDto;

    const session = await this.findSession(sessionToken);
    if (!session) {
      throw new NotFoundException('Session is inactive or does not exist');
    }

    await session.updateOne({
      isActive: false,
      revokedAt: Date.now(),
      revokedReason: reason,
    });

    // TODO: Update the session in Redis
  }

  async delete(token: string): Promise<void> {
    await this.sessionModel.findOneAndDelete({ sessionToken: token });
  }

  private generateSecureSessionToken(): string {
    // Generate a random 32-byte session ID
    const sessionId = crypto.randomBytes(32).toString('hex');

    // Generate HMAC signature using SHA-256 and the secret key
    const hmac = crypto.createHmac(this.HMAC_ALGORITHM, this.hmacSecret);
    hmac.update(sessionId);
    const hmacDigest = hmac.digest('hex');

    // Concatenate sessionId and HMAC digest
    const token = Buffer.from(`${sessionId}.${hmacDigest}`);

    return token.toString('base64url'); // URL-safe encoding
  }
}
