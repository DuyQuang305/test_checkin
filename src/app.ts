import express from 'express';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cors from 'cors';

import Module from './modules';
import connect from './common/database';
import swaggerDocs from './common/swagger';

const passportLocal = require('./services/passport');
const passportFacebook = require('./services/passportFacebook')
const passportGoogle = require('./services/passportGoogle')
const session = require('express-session');

const cookieParser = require('cookie-parser');

const app = express();

connect();

// Middleware for all method
app.use(cookieParser());
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

app.use(session({
  secret: '122323232',
  resave: false,
  saveUninitialized: false
}));

app.use(passportLocal.initialize());
app.use(passportFacebook.initialize());
app.use(passportGoogle.initialize());

// Swagger docs

app.use('/docs', swaggerDocs);

app.listen(parseInt(process.env.PORT) || 3000, () => {
  console.log(
    `Server listening on port http://localhost:${process.env.PORT || 3000}`,
  );
});
