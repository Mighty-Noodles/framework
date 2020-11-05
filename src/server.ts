import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv-safe';

import { apiRoutes } from './routes/api';
dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors()); // TODO: remove me if not needed
app.use(bodyParser.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ limit: '1mb', extended: true }));

app.use((error, _req, res, _next) => {
  console.error('[ERROR 500]', error);
  return res.status(500).json({ code: 500, status: 'INTERNAL_SERVER_ERROR', message: 'Server error. Please contact the administrator.' });
});

app.use(express.static('public'));
app.use('/api', apiRoutes);

app.all('*', (_req, res) => {
  res.status(404).end();
});

export { app, server };
