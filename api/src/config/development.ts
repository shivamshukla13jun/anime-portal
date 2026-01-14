import defaultConfig, { UPLOAD_BASE_DIR, sessionExpireTime } from "./default";

export default {
  ...defaultConfig,

  NODE_ENV: "development",
  isProduction: false,

  PORT: Number(process.env.PORT) || defaultConfig.PORT,

  JWT_SECRET: process.env.JWT_SECRET || defaultConfig.JWT_SECRET,
  REFRESH_TOKEN_SECRET:
    process.env.REFRESH_TOKEN_SECRET || defaultConfig.REFRESH_TOKEN_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRE || defaultConfig.JWT_EXPIRE,

  MONGO_URI: process.env.MONGO_URI || "",
  FRONTEND_URL: process.env.FRONTEND_URL || "",

  fullurl: process.env.DEVELOPMENTURL || "",

  REDIS_HOST: process.env.REDIS_HOST || defaultConfig.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT || defaultConfig.REDIS_PORT,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD || defaultConfig.REDIS_PASSWORD,
  REDIS_UERNAME: process.env.REDIS_UERNAME || defaultConfig.REDIS_UERNAME,

  RABBITMQ_URL: process.env.RABBITMQ_URL || defaultConfig.RABBITMQ_URL,
  RABBITMQ_HOST: process.env.RABBITMQ_HOST || defaultConfig.RABBITMQ_HOST,
  RABBITMQ_PORT: process.env.RABBITMQ_PORT || defaultConfig.RABBITMQ_PORT,
  RABBITMQ_USERNAME:
    process.env.RABBITMQ_USERNAME || defaultConfig.RABBITMQ_USERNAME,
  RABBITMQ_PASSWORD:
    process.env.RABBITMQ_PASSWORD || defaultConfig.RABBITMQ_PASSWORD,

  UPLOAD_BASE_DIR,
  sessionExpireTime,
};
