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
        title: 'Attendance App API',
        version: '1.0.0',
        description: 'An attendance application for students to mark attendance each class',
      },
      schemes: ['http', 'https'],
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
  