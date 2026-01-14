import { Request } from "express";
import { PipelineStage, Types } from "mongoose";
import { Role, } from "microservices/auth-service/types";

const createdUserPipline = (req: Request,initialmatchStage:Record<string, any>):PipelineStage[] => {
  const currentRole = req.session.user?.role as Role
  const userId=req.session.user?._id
  const oid = (id: any) => new Types.ObjectId(id);
  let matchStage: Record<string, any>={}
  switch (currentRole) {
    case Role.ADMIN:
      matchStage["$or"]=[
        { createdBy: oid(userId) },
        { "createdUser.createdBy": oid(userId) },
      ]
   
    break;
   default:
      // Default for regular users
      matchStage["$or"]=[
        { createdBy: oid(userId) },
      ]
      break;
  }
  return [
    {
      $match:initialmatchStage
    },
    {
      $lookup:{
        from:"users",
        localField:"createdBy",
        pipeline:[
          {
            $project:{
              password:0
            }
          }
        ],
        foreignField:"_id",
        "as":"createdUser"
      }
    },
    {
     $match:matchStage
    }
  ]
};

export { createdUserPipline };
