import nodemailer from 'nodemailer';

const hbs = require('nodemailer-express-handlebars');

require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

const options = {
  viewEngine: {
    extName: '.handlebars',
    layoutsDir: 'templates/',
    defaultLayout: false,
    partialsDir: 'templates/',
  },
  viewPath: 'templates',
  extName: ".handlebars",
};

transporter.use('compile', hbs(options));

module.exports = transporter;

