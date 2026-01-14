import mongoose from 'mongoose';
import config from 'config';
const connectDB = async () => {
return new Promise<void>((resolve, reject) => {
    mongoose.connect(config.MONGO_URI as string)
    .then(() => {
        console.log('MongoDB connected');
        resolve();
    })
    .catch((error) => {
        console.warn('MongoDB connection error:', error);
        reject(error);
    });
});
};

export default connectDB;
