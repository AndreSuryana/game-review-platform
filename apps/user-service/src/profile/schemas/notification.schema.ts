import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema()
export class Notification {
  @Prop()
  channel: string;

  @Prop({ type: mongoose.Schema.Types.Boolean })
  enabled: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
