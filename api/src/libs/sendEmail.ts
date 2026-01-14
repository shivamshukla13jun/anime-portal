import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
     secure: Number(process.env.EMAIL_PORT) === 465, // ← ✅ Fix here

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    
    },
});

const sendEmail = async (to: string, subject: string, html: string, attachments?: Array<{filename: string, path: string,content:Buffer}>) => {
    try {
        console.log("email sent  to",to)
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            html,
            attachments
        };

        await transporter.sendMail(mailOptions);
        console.info('Email sent successfully');
    } catch (error) {
        console.warn('Error sending email:', error);
        // throw new AppError("Email Could Not be Sent",400);
    }
};
export default sendEmail