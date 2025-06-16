// config/swagger.js
import swaggerJSDoc from 'swagger-jsdoc';

// The base URL will be dynamically set by Render in production
const serverUrl = process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 3000}`;

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AutoHeaven E-commerce API (Live)',
      version: '1.0.0',
      description: 'Live API documentation for the AutoHeaven e-commerce backend.',
      // ... your other info
    },
    servers: [
      {
        url: `${serverUrl}/api`, // We append /api to match your route structure
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
    // ... your components and security sections remain the same
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // Make sure this path is correct for your project structure
  apis: ['./src/routes/*.js', './src/models/*.js'],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export default swaggerSpec;