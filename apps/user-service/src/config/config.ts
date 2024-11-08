export default () => ({
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5001,
  logLevel: process.env.LOG_LEVEL || 'info',
  grpc: {
    url: process.env.GRPC_URL || 'localhost:5041',
    package: process.env.GRPC_PACKAGE,
    protoPath: process.env.PROTO_PATH,
  },
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT, 10) || '27017',
    name: process.env.DATABASE_NAME || 'user_service',
    user: process.env.DATABASE_USER || '',
    password: process.env.DATABASE_PASSWORD || '',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    threshold: parseInt(process.env.REDIS_THRESHOLD, 10) || 5,
  },
  session: {
    secret: process.env.SESSION_SECRET,
    expiresIn: process.env.SESSION_EXPIRES_IN || '15m',
  },
  passwordReset: {
    secret: process.env.PASS_RESET_SECRET,
    expiresIn: process.env.PASS_RESET_EXPIRES_IN || '15m',
    url: process.env.PASS_RESET_URL || 'localhost',
  },
  emailVerification: {
    secret: process.env.EMAIL_VERIFICATION_SECRET,
    expiresIn: process.env.EMAIL_VERIFICATION_EXPIRES_IN || '24h',
    url: process.env.EMAIL_VERIFICATION_URL || 'localhost',
  },
});
