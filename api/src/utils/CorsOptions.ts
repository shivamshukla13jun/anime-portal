// Define allowed origins
const allowedOrigins = [
  'http://localhost:5173',  // Allow this URL
  'http://localhost:3000',  // Allow this URL
  'http://192.168.168.96:5173',  // Allow this URL
  'http://192.168.168.96:5174',  // Allow this URL
  'http://192.168.168.96:5175',  // Allow this URL
  'https://.net', // You can add more URLs here
  'https://staging.crm..net', // You can add more URLs here
];
// CORS configuration
const corsOptions = {
  origin: (origin: string, callback: Function) => {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true); // Allow the request
    } else {
      callback(new Error('Not allowed by CORS')); // Block the request
    }
  },
  // origin:"*",
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)

  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed methods
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'companyid', 'isencrypted'], // Allowed headers
};

export { corsOptions }