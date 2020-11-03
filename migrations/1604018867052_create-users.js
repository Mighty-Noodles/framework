/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.createTable('users', {
    id: 'id',
    email: { type: 'varchar(255)', notNull: true, unique: true },
    first_name: { type: 'varchar(255)', notNull: true },
    last_name: { type: 'varchar(255)' },
    hash: { type: 'varchar(255)' },

    created_at: { type: 'timestamptz', notNull: true, default: 'NOW()' },
  });
};

exports.down = pgm => {
  pgm.dropTable('users');
};
