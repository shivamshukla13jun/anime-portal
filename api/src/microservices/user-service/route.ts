import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  updateUser, createUser,
  deleteUser,
  userActivate,
  userBlock,
} from "./user.controller";

import { requirePermission } from "services/roleBaseAccessControl";
import { userRegistrationSchema, userUpdateSchema } from './user.validate';
import { Middleware } from "middlewares";

const router = Router();

// Validation middleware using Yup
const validateUserRegistration = Middleware.requestValidate(userRegistrationSchema);
const validateUserUpdate = Middleware.requestValidate(userUpdateSchema);

router.route("/")
.get( requirePermission("GET","Read All","Users"), getAllUsers)
.post( requirePermission("POST","Create","Users"), validateUserRegistration, createUser);

router.put("/activate/:id", requirePermission("PUT","Activate","Users"), userActivate);
router.route("/block/:id")
.put( requirePermission("PUT","Block","Users"), userBlock);
router.route("/:id")
.get( getUserById)
.put( requirePermission("PUT","Update","Users"), validateUserUpdate, updateUser)
.delete( requirePermission("DELETE","Delete","Users"), deleteUser);

export default router;
