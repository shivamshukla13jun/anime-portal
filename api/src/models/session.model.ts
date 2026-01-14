// models/Session.ts
import config from "config";
import mongoose, { Schema, Document } from 'mongoose';

export interface ISession extends Document {
  expires: Date;
  session: {
    userId?: string;
    key: string;
    iv: string;
    createdAt?: number;
    [key: string]: any;
  };
}

const sessionSchema = new Schema<ISession>({
  expires: { type: Date, required: true, index: { expireAfterSeconds:config.sessionExpireTime} },
  session: { type: Schema.Types.Mixed, required: true }
}, {
  collection: 'sessions',
  versionKey: false
});

const SessionModal = mongoose.model<ISession>('Session', sessionSchema);

export default SessionModal;