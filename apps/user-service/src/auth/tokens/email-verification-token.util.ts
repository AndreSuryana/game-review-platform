import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { hash } from "bcrypt";

@Injectable()
export class EmailVerificationTokenUtil {
    constructor(private readonly jwtService: JwtService) { }

    async generateToken(userId: string, email: string): Promise<string> {
        const payload = { sub: userId, email: email };
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