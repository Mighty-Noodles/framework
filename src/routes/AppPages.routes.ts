import { Router } from 'express';

const appPage = Router();

appPage.get('/', (_req, res, _next) => res.render('home'));
appPage.get('/app', (_req, res, _next) => res.render('app'));

const appViewPath = './templates/views';

export { appPage, appViewPath };
