import express from 'express'
import swaggerUi from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';
const router = express.Router();

const options = {
    swaggerDefinition: {
      info: {
        title: 'REST - Swagger',
        version: '1.0.0',
        description: 'REST API with Swagger doc',
      },
      tags: [
        {
          name: 'Auth',
          description: 'Auth API',
        },
      ],
      schemes: ['http'],
      host: 'localhost:8000',
      basePath: '/',
    },
    apis: ['./src/modules/auth/controller.ts'],
  };
  
  
  const swaggerSpec = swaggerJSDoc(options);
  
  router.get('/json', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
  
  router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  
  export default  router;
  