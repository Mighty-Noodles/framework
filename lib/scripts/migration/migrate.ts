import pgMigrate from 'node-pg-migrate';
import dotenv from 'dotenv-safe';

import { conn } from '@db/connection.config';

dotenv.config();

const {
  NODE_ENV,
} = process.env;

export interface MigrationProps {
  connection?: string | Record<string, unknown>;
  schema?: string;
  direction?: 'up' | 'down';
  count?: number;
}
export const migrate = ({ connection, schema, direction, count }: MigrationProps): Promise<any> => {
  console.log('- Running Migrate Up on', NODE_ENV || 'default');

  if (direction === 'down') {
    count = count || 1;
  }

  return pgMigrate({
    databaseUrl: connection || conn,
    count: count || Infinity,
    createSchema: true,
    schema,
    direction: direction || 'up',
    migrationsTable: 'pgmigration',
    dir: `${process.cwd()}/migrations`,
  })
  .catch(err => console.log('Error running Migrate Up', err));
};
