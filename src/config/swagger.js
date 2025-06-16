import swaggerJSDoc from 'swagger-jsdoc';

// Determine the server URL based on the environment
const serverUrl = process.env.NODE_ENV === 'production'
  ? 'https://your-production-domain.com/api' // Replace with your actual production URL
  : `http://localhost:${process.env.PORT || 3000}/api`;

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'E-commerce API',
      version: '1.0.0',
      description:
        'API documentation for the e-commerce backend, managing products, users, carts, and orders.',
      contact: {
        name: 'Your Name',
        url: 'https://your-website.com', // Optional
        email: 'your.email@example.com',
      },
    },
    servers: [
      {
        url: serverUrl,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
    // This is crucial for documenting protected routes
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT in the format: Bearer {token}',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // IMPORTANT: Adjust this path to match your project's folder structure
  // It should point to where your route files are located.
  apis: ['./src/routes/*.js', './src/models/*.js'], 
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export default swaggerSpec;