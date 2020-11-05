import Knex from 'knex';
import { Model } from 'objection';

import { connection } from '@db/connection.config';

const knex = Knex(connection);

Model.knex(knex);

export {
  Model,
  knex,
};
