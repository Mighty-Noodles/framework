import pg from 'pg';
import dotenv from 'dotenv-safe';

dotenv.config();
pg.defaults.ssl = process.env.DATABASE_USE_SSL !== 'false';

const {
  DATABASE_URL,
  DATABASE_PASSWORD,
  DATABASE_USER,
  DATABASE_PORT,
  DATABASE_NAME,
  DATABASE_TEST_URL,
  NODE_ENV,

  DATABASE_DEV_URL,
} = process.env;

const productionConn = DATABASE_PASSWORD && DATABASE_USER ? {
  host: DATABASE_URL,
  password: DATABASE_PASSWORD,
  user: DATABASE_USER,
  port: DATABASE_PORT,
  database: DATABASE_NAME,
}: DATABASE_URL;

export const conn = NODE_ENV === 'test' ? DATABASE_TEST_URL :
                    NODE_ENV === 'staging' ? productionConn :
                    NODE_ENV === 'production' ? productionConn :
                    DATABASE_DEV_URL;

export const connection = {
  client: 'pg',
  connection: conn,
};
