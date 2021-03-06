import pg from 'pg';
import dotenv from 'dotenv-safe';

dotenv.config();
pg.defaults.ssl = process.env.DATABASE_USE_SSL !== 'false';

const {
  DATABASE_URL,
  DATABASE_URL_STRING,
  DATABASE_PASSWORD,
  DATABASE_USER,
  DATABASE_PORT,
  DATABASE_NAME,
  DATABASE_TEST_URL,
  NODE_ENV,

  DATABASE_DEV_URL,
} = process.env;

const productionConn = DATABASE_URL_STRING ? DATABASE_URL : {
  host: DATABASE_URL,
  password: DATABASE_PASSWORD,
  user: DATABASE_USER,
  port: DATABASE_PORT,
  database: DATABASE_NAME,
};

export const conn = NODE_ENV === 'test' ? DATABASE_TEST_URL :
                    NODE_ENV === 'e2e' ? DATABASE_TEST_URL :
                    NODE_ENV === 'staging' ? productionConn :
                    NODE_ENV === 'production' ? productionConn :
                    DATABASE_DEV_URL;

export const connection = {
  client: 'pg',
  connection: conn,
};
