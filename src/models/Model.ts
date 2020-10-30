import Knex from 'knex';
import { Model } from 'objection';

import { connection } from '../../connection';

const knex = Knex(connection);

Model.knex(knex);

export {
  Model,
  knex,
};
