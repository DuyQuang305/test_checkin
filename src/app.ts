import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';
import passport from 'passport';

import Module from './modules';
import JWTStrategy from './services/jwtStrategy';
import connect from './common/database';
import error from './middlewares/error';

dotenv.config();
const app = express();

connect();

// Middleware for all method
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/uploads', express.static('uploads'));

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

// Use middleware error handler
app.use(error);

app.listen(parseInt(process.env.PORT) || 3000, () => {
  console.log(`Server listening on port ${process.env.PORT || 3000}`);
});
