import Knex from 'knex';
import _ from 'lodash';
import { migrate } from './migration/migrate';

import dotenv from 'dotenv';

dotenv.config();

const {
  DATABASE_TEST_URL,
} = process.env;

const databaseName: string = _.last(DATABASE_TEST_URL.split('/'));
const connection = _.first(DATABASE_TEST_URL.match(/^postgres:\/\/(\w|:|@)+/));

const knex = Knex({ client: 'pg', connection });

const recreateTestDatabase = async () => {
  await knex.raw(`DROP DATABASE IF EXISTS ${databaseName}`)
    .then(() => console.log(`DROPPED DATABASE ${databaseName}`))
    .catch((e) => console.error(`[ERROR] Dropping database ${databaseName}`, e));

  await knex.raw(`CREATE DATABASE ${databaseName}`)
    .then(() => console.log(`CREATED DATABASE ${databaseName}`))
    .catch((e) => console.error(`[ERROR] Creating database ${databaseName}`, e));
};

recreateTestDatabase()
  .then(() => migrate({
    connection: DATABASE_TEST_URL,
  }))
  .catch((err) => console.error('Error running test:setup', err))
  .finally(() => process.exit());
