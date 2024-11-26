import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Notification } from './notification.schema';

@Schema()
export class Preferences {
  @Prop({ length: 2, default: 'en' })
  language: string;

  @Prop({ type: [Notification], default: [] })
  notifications: Notification[];
}

export const PreferencesSchema = SchemaFactory.createForClass(Preferences);
