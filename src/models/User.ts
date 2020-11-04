import _ from 'lodash';
import { Model } from './Model';

export class User extends Model {
  id: number;
  email: string;
  first_name: string;
  last_name: string;

  confirmed: boolean;
  created_at: Date;
  hash: string;

  static tableName = 'users';

  toJson(): Pick<User, 'id' | 'email' | 'first_name' | 'last_name'> {
    return _.pick(this, 'id', 'email', 'first_name', 'last_name');
  }
}
