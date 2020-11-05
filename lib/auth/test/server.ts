import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';

import { authRoutes } from '@auth/routes/Auth.routes';
import { profileRoutes } from '@auth/routes/Profile.routes';

const dotenv = require('dotenv'); // eslint-disable-line
dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(bodyParser.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ limit: '1mb', extended: true }));

app.use((error, _req, res, _next) => {
  console.error('[ERROR 500]', error);
  return res.status(500).json({ code: 500, status: 'INTERNAL_SERVER_ERROR', message: 'Server error. Please contact the administrator.' });
});

app.use(express.static('public'));
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);

app.all('*', (_req, res) => {
  res.status(404).end();
});

export { app, server };
