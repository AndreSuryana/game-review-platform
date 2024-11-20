export default () => ({
  app: {
    name: process.env.APP_NAME,
    env: process.env.APP_ENV,
    port: parseInt(process.env.APP_PORT, 10),
    logLevel: process.env.LOG_LEVEL,
  },
  grpc: {
    url: process.env.GRPC_URL,
    package: process.env.GRPC_PACKAGE,
    protoPath: process.env.GRPC_PROTO_PATH,
  },
  database: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT, 10),
    name: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER || null,
    password: process.env.DATABASE_PASSWORD || null,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT, 10),
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD,
    threshold: parseInt(process.env.REDIS_THRESHOLD, 10),
  },
  session: {
    secret: process.env.SESSION_SECRET,
    expiresIn: process.env.SESSION_EXPIRES_IN,
  },
  passwordReset: {
    secret: process.env.PASS_RESET_SECRET,
    expiresIn: process.env.PASS_RESET_EXPIRES_IN,
    url: process.env.PASS_RESET_URL,
  },
  emailVerification: {
    secret: process.env.EMAIL_VERIFICATION_SECRET,
    expiresIn: process.env.EMAIL_VERIFICATION_EXPIRES_IN,
    url: process.env.EMAIL_VERIFICATION_URL,
  },
  smtp: {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  email: {
    support: process.env.EMAIL_SUPPORT,
    noReply: process.env.EMAIL_NO_REPLY,
  },
});
