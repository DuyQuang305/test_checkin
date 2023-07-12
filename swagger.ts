import express from 'express'
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
const router = express.Router();

const options = {
    swaggerDefinition: {
      supportedSubmitMethods: [], 
      securityDefinitions: {
        bearerAuth: {
          type: 'apiKey',
          name: 'Authorization',
          in: 'header',
          description: 'Bearer token for authentication',
        }
      },
      info: {
        title: 'REST - Swagger',
        version: '1.0.0',
        description: 'REST API with Swagger doc',
      },
      schemes: ['http'],
      host: 'localhost:8000',
      basePath: '/',
    },
    apis: [
      './src/modules/auth/controller.ts',
      './src/modules/profile/controller.ts',
      './src/modules/room/controller.ts',
      './src/modules/attendance/controller.ts',
      './src/modules/time/controller.ts',
      './src/modules/statistic/controller.ts',
    ],
  };
  
  
  const swaggerSpec = swaggerJSDoc(options);
  
  router.get('/json', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
  
  router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  
  export default  router;
  