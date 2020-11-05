import { User } from "@auth/models/User"

export function replaceUserParams(text: string, user: User): string {
  return text
    .replace(/{FIRST_NAME}/g, user.first_name)
    .replace(/{LAST_NAME}/g, user.last_name)
    .replace(/{USER_EMAIL}/g, user.email);
}
