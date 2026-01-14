


import { Router } from "express";
import fs from "fs";
import path from "path";
import { Middleware } from "middlewares";
import config from "config";

const  { isProduction }=config
const rootRouter = Router();

// apply global middleware
rootRouter.use(Middleware.encryptResponseMiddleware);
rootRouter.use(Middleware.decryptDataMiddleware);

// Path to microservices folder
const microservicesDir = path.join(__dirname, "../microservices");

// Array to track microservices missing config.json
const missingConfigs: string[] = [];

fs.readdirSync(microservicesDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .forEach(dirent => {
    const servicePath = path.join(microservicesDir, dirent.name);
    const configPath = path.join(servicePath, "config.json");
    const routeTsPath = path.join(servicePath, "route.ts");
    const routeJsPath = path.join(servicePath, "route.js");

    try {
      if (!fs.existsSync(configPath)) {
        missingConfigs.push(dirent.name);
        return;
      }

      const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      const baseUrl = config.baseUrl || `/api/${dirent.name}`;
      let routesModule;
      if(isProduction){
      if (fs.existsSync(routeJsPath)) {
        routesModule = require(routeJsPath).default;
      } else {
        console.warn(`⚠️ No route file found for ${dirent.name}`);
        return;
      }

      if (routesModule) {
        rootRouter.use(baseUrl, routesModule);
        console.log(`✅ Loaded ${dirent.name} on ${baseUrl}`);
      }
      }
      else if(!isProduction){
      if (fs.existsSync(routeTsPath)) {
        routesModule = require(routeTsPath).default;
      } else if (fs.existsSync(routeJsPath)) {
        routesModule = require(routeJsPath).default;
      } else {
        console.warn(`⚠️ No route file found for ${dirent.name}`);
        return;
      }

      if (routesModule) {
        rootRouter.use(baseUrl, routesModule);
        console.log(`✅ Loaded ${dirent.name} on ${baseUrl}`);
      }
    }

    } catch (error) {
      console.error(`❌ Failed to load ${dirent.name}:`, error);
    }
  });

// 🔹 Log missing configs after scanning all services
if (missingConfigs.length > 0) {
  console.warn("\n⚠️ The following microservices are missing config.json:");
  missingConfigs.forEach(name => console.warn(` - ${name}`));
} else {
  console.log("\n✅ All microservices have config.json files.");
}

export default rootRouter;
