// Define allowed origins
const allowedOrigins = [
  'http://localhost:5175',  // Allow this URL
  'http://192.168.168.41:5175',  // Allow this URL
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

  methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH'], // Allowed methods
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'companyid', 'isencrypted'], // Allowed headers
};

export { corsOptions }