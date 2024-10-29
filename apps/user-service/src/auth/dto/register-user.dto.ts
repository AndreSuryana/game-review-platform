import {
  IsEmail,
  IsString,
  IsStrongPassword,
  MinLength,
} from 'class-validator';

export class RegisterUserDto {
  @IsString()
  @MinLength(6)
  readonly username: string;

  @IsEmail()
  readonly email: string;

  @IsStrongPassword()
  readonly password: string;
}
