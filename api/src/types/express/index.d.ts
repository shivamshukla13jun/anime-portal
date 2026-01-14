
import { File as MulterFile } from "multer";
import { ActionType, ResourceType } from "services/roleBaseAccessControl";

// Extend the Response.locals interface to include userId
declare global {
  namespace Express {
    interface Locals {
      userId: ObjectId;
      user: IUserDocument; // Attach user to request object
    }
     interface Request {
      file?: MulterFile;
      files?: MulterFile[] | { [fieldname: string]: MulterFile[] };
    }


  }
}
