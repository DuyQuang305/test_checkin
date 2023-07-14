import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import passport from 'passport';

import Module from './modules';
import JWTStrategy from './services/passport';
import connect from './common/database';

import swaggerDocs from '../swagger';

dotenv.config();
const app = express();

connect();

// Middleware for all method
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.set('trust proxy', true);
// Use Helmet!
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", process.env.DOMAIN_OPTIONAL],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
  }),
);

//Module init
const initModule = new Module(app);
initModule.main();

// Use passport
JWTStrategy();
app.use(passport.initialize());

// Swagger docs

app.use('/docs', swaggerDocs);

app.listen(parseInt(process.env.PORT) || 3000, () => {
  console.log(
    `Server listening on port http://localhost:${process.env.PORT || 3000}`,
  );
});
