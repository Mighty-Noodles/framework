import { Model } from './Model';

export class User extends Model {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  hash: string;

  static tableName = 'users';
}
