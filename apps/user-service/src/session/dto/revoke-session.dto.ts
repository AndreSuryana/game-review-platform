import { IsNotEmpty, IsString } from 'class-validator';

export class RevokeSessionDto {
  @IsString()
  @IsNotEmpty()
  readonly sessionToken: string;

  @IsString()
  @IsNotEmpty()
  readonly reason: string;
}
