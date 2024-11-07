import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { hash } from 'bcrypt';
import { PasswordResetConfig } from 'src/config/password-reset.config';

@Injectable()
export class PasswordResetJwtService {
    private jwtService: JwtService;

    constructor(private readonly configService: ConfigService) {
        const config = this.configService.get<PasswordResetConfig>('passwordReset');
        if (!config?.secret || !config?.expiresIn) {
            throw new Error('Password reset JWT configuration is missing');
        }
        this.jwtService = new JwtService({
            secret: config.secret,
            signOptions: { expiresIn: config.expiresIn },
        });
    }

    async generateToken(userId: string): Promise<string> {
        const payload = { sub: userId };
        return this.jwtService.signAsync(payload);
    }

    async verifyToken(token: string): Promise<any> {
        try {
            return await this.jwtService.verifyAsync(token);
        } catch (e) {
            throw new UnauthorizedException('Invalid or expired password reset token');
        }
    }

    async hashToken(token: string): Promise<string> {
        return hash(token, 10);
    }
}
