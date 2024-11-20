import * as Joi from 'joi';

export const ConfigValidationSchema = Joi.object({
  // Application Configuration
  APP_NAME: Joi.string().default('Game Review Platform'),
  APP_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().integer().min(1).default(5001),
  LOG_LEVEL: Joi.string()
    .valid('debug', 'info', 'warn', 'error')
    .default('info'),

  // Service gRPC Configuration
  GRPC_URL: Joi.string().default('localhost:5041'),
  GRPC_PACKAGE: Joi.string().required(),
  GRPC_PROTO_PATH: Joi.string().required(),

  // Database Configuration (MongoDB)
  DATABASE_HOST: Joi.string().default('localhost'),
  DATABASE_PORT: Joi.number().integer().min(1).default(27017),
  DATABASE_NAME: Joi.string().default('user_service'),
  DATABASE_USER: Joi.string().allow('', null),
  DATABASE_PASSWORD: Joi.string().allow('', null),

  // Redis Configuration
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().integer().min(1).default(6379),
  REDIS_USERNAME: Joi.string().allow('', null),
  REDIS_PASSWORD: Joi.string().allow('', null),
  REDIS_THRESHOLD: Joi.number().integer().min(0).default(5),
  REDIS_DEFAULT_TTL: Joi.number().integer().min(0).default(300),

  // SMTP Configuration
  SMTP_HOST: Joi.string().default('localhost'),
  SMTP_PORT: Joi.number().integer().min(1).default(1025),
  SMTP_USER: Joi.string().allow('', null),
  SMTP_PASS: Joi.string().allow('', null),

  // Session Configuration
  SESSION_SECRET: Joi.string().required(),
  SESSION_EXPIRES_IN: Joi.string()
    .pattern(/^[0-9]+[smhdwMy]$/)
    .default('15m'),

  // Password Reset Token Configuration
  PASS_RESET_SECRET: Joi.string().required(),
  PASS_RESET_EXPIRES_IN: Joi.string()
    .pattern(/^[0-9]+[smhdwMy]$/)
    .default('2m'),
  PASS_RESET_URL: Joi.string()
    .uri()
    .default('http://localhost:5000/user/confirm-reset-password'),

  // Email Verification Token Configuration
  EMAIL_VERIFICATION_SECRET: Joi.string().required(),
  EMAIL_VERIFICATION_EXPIRES_IN: Joi.string()
    .pattern(/^[0-9]+[smhdwMy]$/)
    .default('24h'),
  EMAIL_VERIFICATION_URL: Joi.string()
    .uri()
    .default('http://localhost:5000/user/confirm-email'),

  // Email Address Configuration
  EMAIL_NO_REPLY: Joi.string().email().default('no-reply@email.com'),
  EMAIL_SUPPORT: Joi.string().email().default('support@email.com'),
});
