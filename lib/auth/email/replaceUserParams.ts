import { User } from '../models/User';

export function replaceUserParams(text: string, user: User): string {
  return text
    .replace(/{USER_FIRST_NAME}/g, user.first_name)
    .replace(/{USER_LAST_NAME}/g, user.last_name)
    .replace(/{USER_FULL_NAME}/g, user.full_name)
    .replace(/{USER_EMAIL}/g, user.email)
    .replace(/{USER_ID}/g, String(user.id));
}
