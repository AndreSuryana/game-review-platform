import { BadRequestException } from '@nestjs/common';
import {
  ClassConstructor,
  ClassTransformOptions,
  plainToInstance,
} from 'class-transformer';
import { validate } from 'class-validator';

/**
 * Validates and converts a plain object into a DTO instance.
 * If validation fails, it throws an RpcException with INVALID_ARGUMENT status.
 */
export async function validateConvertDto<T, V>(
  cls: ClassConstructor<T>,
  plain: V,
  options?: ClassTransformOptions,
): Promise<T> {
  const instance = plainToInstance(cls, plain, options);
  const errors = await validate(instance as object);

  if (errors.length > 0) {
    const error = errors[0];
    const message = error.constraints[Object.keys(error.constraints)[0]];

    throw new BadRequestException({
      message: message.charAt(0).toUpperCase() + message.substring(1),
    });
  }

  return instance;
}
