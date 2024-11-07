import { IsEmail } from "class-validator";

export class SendEmailVerificationDto {
    @IsEmail()
    readonly email: string;
}