import path from "path";

export const sessionExpireTime = 365 * 24 * 60 * 60 * 1000; // 365 days in ms
export const UPLOAD_BASE_DIR = path.join(process.cwd(), "uploads");

export default {
  NODE_ENV: "development",

  PORT: 4000,

  JWT_SECRET: "defaultSecret",
  REFRESH_TOKEN_SECRET: "defaultSecret",
  JWT_EXPIRE: "1h",

  MONGO_URI: "",
  FRONTEND_URL: "",

  isProduction: false,
  fullurl: "",

  // Redis
  REDIS_HOST: "127.0.0.1",
  REDIS_PORT: "6379",
  REDIS_PASSWORD: "",
  REDIS_UERNAME: "default",

  // RabbitMQ
  RABBITMQ_URL: "",
  RABBITMQ_HOST: "localhost",
  RABBITMQ_PORT: "5672",
  RABBITMQ_USERNAME: "guest",
  RABBITMQ_PASSWORD: "guest",

  ALL_DIRECTORY_LIST: [UPLOAD_BASE_DIR],
};
