import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class UserCredentialsDto {
  @ValidateIf((o) => !o.email) // Only validate if email is not provided
  @IsString()
  @MinLength(6)
  readonly username?: string = null;

  @ValidateIf((o) => !o.username) // Only validate if username is not provided
  @IsEmail()
  readonly email?: string = null;

  @IsNotEmpty()
  readonly password: string;
}
