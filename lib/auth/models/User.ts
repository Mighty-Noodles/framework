import _ from 'lodash';
import { Model } from '../../db/Model';

interface UserJson {
  id: number;
  email: string;
  first_name: string;
  last_name?: string;
}

export class User extends Model {
  id: number;
  email: string;
  first_name: string;
  last_name?: string;
  metadata?: Record<string, unknown>;

  confirmed: boolean;
  created_at: Date;

  hash: string;

  static tableName = 'users';

  toJson(): UserJson {
    return _.pick(this, 'id', 'email', 'first_name', 'last_name');
  }

  get full_name(): string {
    return this.last_name ? `${this.first_name} ${this.last_name}` : this.first_name;
  }
}
