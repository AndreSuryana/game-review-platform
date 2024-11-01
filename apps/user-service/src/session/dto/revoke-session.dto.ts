import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { RevokeReason } from '../enums/revoke-reason.enum';

export class RevokeSessionDto {
  @IsString()
  @IsNotEmpty()
  readonly sessionToken: string;

  @IsNotEmpty()
  @IsEnum(RevokeReason)
  readonly reason: RevokeReason;
}
