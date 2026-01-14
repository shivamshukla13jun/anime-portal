import { Role } from "microservices/auth-service/types";
import User from "models/user.model";
import { Types } from "mongoose";
export const defaultAdmin = (superAdminId:Types.ObjectId)=>{
    return {
        name: 'Admin',
        email: 'shivamshukla@winggs.com',
        password: '12345678',
        role: Role.ADMIN,
        createdBy: superAdminId,
        updatedBy: superAdminId,
    }
}
export const defaultSuperAdmin = ()=>{
    return {
        name: 'Super Admin',
        email: 'superadmin@gmail.com',
        password: '12345678',
        role: Role.SUPERADMIN,
    }
}

/**
 * Creates default super admin and admin users if they don't exist
 * @returns Promise that resolves with the super admin ID
 */
const createDefaultUsers = async (): Promise<string> => {
   return new Promise<string>(async (resolve, reject) => {
     try {
        // Handle super admin
        const defaultSuperAdminData = defaultSuperAdmin();
        let superAdmin = await User.findOne({ role: Role.SUPERADMIN });

        if (superAdmin) {
            console.info("Super admin already exists, updating...");
            await superAdmin.set(defaultSuperAdminData).save();
        } else {
            console.info("Creating super admin...");
            superAdmin = await User.create(defaultSuperAdminData);
            console.info("Super admin created successfully");
        }

        if (!superAdmin) {
            throw new Error("Failed to create/update super admin");
        }

        // Handle admin user
        let admin = await User.findOne({ 
            role: Role.ADMIN, 
            createdBy: superAdmin._id 
        });

        const adminData = defaultAdmin(superAdmin._id);
        
        if (admin) {
            console.info("Admin already exists, updating...");
            await admin.set(adminData).save();
        } else {
            console.info("Creating admin user...");
            admin = await User.create(adminData);
            console.info("Admin user created successfully");
        }
        resolve(superAdmin._id.toString())
     } catch (error) {
        console.error("Error in createDefaultUsers:", error);
        reject(error);
    }
   })
};


export { createDefaultUsers };
