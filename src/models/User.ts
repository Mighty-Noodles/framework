import _ from 'lodash';
import { Model } from './Model';

export class User extends Model {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  hash: string;

  static tableName = 'users';

  toJson(): Omit<User, 'hash'> {
    return _.omit(this, 'hash');
  }
}
