const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Atlanticfrewaycard API',
      version: '1.0.0',
      description: 'Unified card platform API combining business expense management and personal virtual cards',
      contact: {
        name: 'API Support',
        email: 'support@atlanticfrewaycard.com'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/api/v1',
        description: 'Development server'
      },
      {
        url: 'https://api.atlanticfrewaycard.com/api/v1',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./src/routes/*.js', './src/routes/v1/*.js']
};

const specs = swaggerJsdoc(options);

module.exports = { specs, swaggerUi };
