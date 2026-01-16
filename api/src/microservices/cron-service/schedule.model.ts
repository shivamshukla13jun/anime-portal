import mongoose, { Document, Schema } from 'mongoose';

export interface ICronSchedule extends Document {
  jobName: string;
  cronExpression: string;
  interval: 'minutes' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'custom';
  customInterval?: number; // For minutes/hours
  hour?: number; // For daily/weekly/monthly (0-23)
  minute?: number; // For daily/weekly/monthly (0-59)
  dayOfWeek?: number; // For weekly (0-6, 0=Sunday)
  dayOfMonth?: number; // For monthly (1-31)
  isActive: boolean;
  description: string;
  lastRun?: Date;
  nextRun?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const cronScheduleSchema = new Schema<ICronSchedule>({
  jobName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  cronExpression: {
    type: String,
    required: true,
    trim: true,
  },
  interval: {
    type: String,
    required: true,
    enum: ['minutes', 'hourly', 'daily', 'weekly', 'monthly', 'custom'],
  },
  customInterval: {
    type: Number,
    min: 1,
    max: 1440, // Max 24 hours in minutes
  },
  hour: {
    type: Number,
    min: 0,
    max: 23,
  },
  minute: {
    type: Number,
    min: 0,
    max: 59,
  },
  dayOfWeek: {
    type: Number,
    min: 0,
    max: 6,
  },
  dayOfMonth: {
    type: Number,
    min: 1,
    max: 31,
  },
  isActive: {
    type: Boolean,
    required: true,
    default: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  lastRun: {
    type: Date,
  },
  nextRun: {
    type: Date,
  },
}, {
  timestamps: true,
});

cronScheduleSchema.index({ jobName: 1 }, { unique: true });
cronScheduleSchema.index({ isActive: 1 });

const CronSchedule = mongoose.model<ICronSchedule>('CronSchedule', cronScheduleSchema);
export default CronSchedule;
