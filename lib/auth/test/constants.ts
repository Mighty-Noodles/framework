import jwt from 'jsonwebtoken';
import { User } from '../models/User';

export const generateJwt = (user: User): string => {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET)
};

export const PASSWORD_HASH = '$2b$10$b9S37aFHHikiGyISBZC/buN5Y.W1TTaevt3C8JKf1/Ukg5OjKBEY.'; // 123456
export const jwtHeader = (user: User): string => `JWT ${generateJwt(user)}`;
