import dotenv from "dotenv";
dotenv.config();

import development from "./development";
import staging from "./staging";
import production from "./production";

const NODE_ENV = (process.env.NODE_ENV || "development") as
  | "development"
  | "staging"
  | "production";

const configs = {
  development,
  staging,
  production,
};

const config = configs[NODE_ENV] ?? development;

export default config;
