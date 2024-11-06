import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { hash } from "bcrypt";

@Injectable()
export class PasswordResetTokenUtil {
    constructor(private readonly jwtService: JwtService) { }

    async generateToken(userId: string): Promise<string> {
        // const { secret, expiresIn } = this.configService.get<PasswordResetConfig>('passwordReset');
        const payload = { sub: userId };
        return this.jwtService.signAsync(payload);
    }

    async hashToken(token: string): Promise<string> {
        return hash(token, 10);
    }

    async verifyToken(token: string): Promise<any> {
        try {
            return await this.jwtService.verifyAsync(token);
        } catch (e) {
            throw new UnauthorizedException('Invalid or expired password reset token');
        }
    }
}