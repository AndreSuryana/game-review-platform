import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { hash } from 'bcrypt';
import { EmailVerificationConfig } from 'src/config/email-verification.config';

@Injectable()
export class EmailVerificationJwtService {
    private jwtService: JwtService;

    constructor(private readonly configService: ConfigService) {
        const config = this.configService.get<EmailVerificationConfig>('emailVerification');
        if (!config?.secret || !config?.expiresIn) {
            throw new Error('Email verification JWT configuration is missing');
        }
        this.jwtService = new JwtService({
            secret: config.secret,
            signOptions: { expiresIn: config.expiresIn },
        });
    }

    async generateToken(userId: string, email: string): Promise<string> {
        const payload = { sub: userId, email };
        return this.jwtService.signAsync(payload);
    }

    async verifyToken(token: string): Promise<any> {
        try {
            return await this.jwtService.verifyAsync(token);
        } catch (e) {
            throw new UnauthorizedException('Invalid or expired email verification token');
        }
    }

    async hashToken(token: string): Promise<string> {
        return hash(token, 10);
    }
}
