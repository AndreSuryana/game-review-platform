import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
class Metadata {
  @Prop()
  os: string;

  @Prop()
  deviceType: string;
}

@Schema({ timestamps: true })
export class Session extends Document {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true }) // FIXME: May required to be indexed?
  sessionToken: string;

  @Prop()
  lastActivity: Date;

  @Prop()
  expiresAt: Date;

  @Prop({ required: true })
  ipAddress: string;

  @Prop({ required: true })
  userAgent: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  revokedAt: Date;

  @Prop()
  revokedReason: string;

  @Prop()
  metadata: Metadata;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
