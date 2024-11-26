import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class Address {
  @Prop()
  street: string;

  @Prop()
  city: string;

  @Prop()
  state: string;

  @Prop()
  zipCode: string;

  @Prop({ length: 3 })
  country: string;
}

export const AddressSchema = SchemaFactory.createForClass(Address);
