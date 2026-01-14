// import { RolePermissionService } from "microservices/permission-services/RolePermission.service";
import { createDefaultUsers } from "./deafaultUsers";
import { Role } from "microservices/auth-service/types";
import rolePermissionSeeder from "./rolePermission.seed";
const createDefaultData = async (): Promise<void> => {
    try {
         await rolePermissionSeeder();
         console.log("Starting default data initialization...");
        const adminId = await createDefaultUsers();
        console.log("Default data initialization completed successfully");

    } catch (error) {
        console.error("Error initializing default data:", error);
      
    }
};
export default createDefaultData