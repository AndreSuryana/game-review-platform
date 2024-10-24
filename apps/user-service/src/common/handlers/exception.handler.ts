import { Status } from '@grpc/grpc-js/build/src/constants';
import { HttpException, HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { ValidationError } from 'class-validator';

// Mapping between HTTP status codes and gRPC status codes
const HttpStatusCode: Record<number, number> = {
  [HttpStatus.BAD_REQUEST]: Status.INVALID_ARGUMENT, // 400
  [HttpStatus.UNAUTHORIZED]: Status.UNAUTHENTICATED, // 401
  [HttpStatus.FORBIDDEN]: Status.PERMISSION_DENIED, // 403
  [HttpStatus.NOT_FOUND]: Status.NOT_FOUND, // 404
  [HttpStatus.METHOD_NOT_ALLOWED]: Status.CANCELLED, // 405
  [HttpStatus.CONFLICT]: Status.ALREADY_EXISTS, // 409
  [HttpStatus.REQUEST_TIMEOUT]: Status.DEADLINE_EXCEEDED, // 408
  [HttpStatus.GONE]: Status.ABORTED, // 410
  [HttpStatus.PRECONDITION_FAILED]: Status.FAILED_PRECONDITION, // 412
  [HttpStatus.PAYLOAD_TOO_LARGE]: Status.OUT_OF_RANGE, // 413
  [HttpStatus.UNSUPPORTED_MEDIA_TYPE]: Status.FAILED_PRECONDITION, // 415
  [HttpStatus.I_AM_A_TEAPOT]: Status.UNKNOWN, // 418
  [HttpStatus.UNPROCESSABLE_ENTITY]: Status.INVALID_ARGUMENT, // 422
  [HttpStatus.TOO_MANY_REQUESTS]: Status.RESOURCE_EXHAUSTED, // 429
  [HttpStatus.INTERNAL_SERVER_ERROR]: Status.INTERNAL, // 500
  [HttpStatus.NOT_IMPLEMENTED]: Status.UNIMPLEMENTED, // 501
  [HttpStatus.BAD_GATEWAY]: Status.UNAVAILABLE, // 502
  [HttpStatus.SERVICE_UNAVAILABLE]: Status.UNAVAILABLE, // 503
  [HttpStatus.GATEWAY_TIMEOUT]: Status.DEADLINE_EXCEEDED, // 504
  [HttpStatus.HTTP_VERSION_NOT_SUPPORTED]: Status.UNAVAILABLE, // 505
};

/**
 * Handles errors and maps HTTP exception to gRPC exceptions.
 * Also supports detailed validation errors and unexpected error handling.
 *
 * @param {any} e - The error to handle.
 * @returns {RpcException} - The mapped RpcException with appropriate gRPC status code.
 */
export function handleError(e: any): RpcException {
  let code = Status.INTERNAL; // Default to internal error
  let message = 'An internal server error occurred'; // Default error message

  if (e instanceof RpcException) {
    return e;
  } else if (e instanceof HttpException) {
    // If it's an HttpException, map the HTTP status code to gRPC status
    const statusCode = e.getStatus();
    code = HttpStatusCode[statusCode] || Status.INTERNAL;

    // Extract the response message from HttpException
    const errorResponse = e.getResponse();
    message =
      typeof errorResponse === 'string'
        ? errorResponse
        : (errorResponse as any).message || e.message;
  } else if (Array.isArray(e) && e.length > 0 && isValidationError(e[0])) {
    // Handle validation errors from class-validator
    const validationError = e[0] as ValidationError; // Get the first validation error

    // Extract the first constraint violation message
    const constraintMessage = validationError.constraints
      ? Object.values(validationError.constraints)[0]
      : 'Validation failed';

    message = `${validationError.property}: ${constraintMessage.charAt(0).toUpperCase()}${constraintMessage.slice(1)}`;
    code = Status.INVALID_ARGUMENT; // Validation errors are invalid arguments
  } else if (e instanceof Error) {
    // Handle general application or system errors (e.g., TypeError)
    message = e.message || message;
  }

  return new RpcException({
    code: code,
    message: message,
  });
}

/**
 * Type guard function to check if an error is a class-validator ValidationError.
 *
 * @param {any} error - The error to check.
 * @returns {boolean} - True if the error is a ValidationError, otherwise false.
 */
function isValidationError(error: any): error is ValidationError {
  return (
    error &&
    typeof error === 'object' &&
    'constraints' in error &&
    'property' in error
  );
}
