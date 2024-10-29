import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(6)
  readonly username: string;

  @IsEmail()
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  readonly passwordSalt: string;

  @IsString()
  @IsNotEmpty()
  readonly passwordHash: string;

  @IsString()
  readonly role: string;
}
