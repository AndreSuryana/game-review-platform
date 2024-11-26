import { Address } from '../schemas/address.schema';
import { Preferences } from '../schemas/preferences.schema';

export class CreateProfileDto {
  firstName?: string;
  lastName?: string;
  bio?: string | undefined;
  address?: Address | undefined;
  preferences?: Preferences | undefined;
}
