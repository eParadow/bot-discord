import bcrypt from 'bcrypt';
import { getDatabase } from './connection';
import type { User, UserCreate } from '../types';

const SALT_ROUNDS = 10;

export async function createUser(data: UserCreate): Promise<User> {
  const db = getDatabase();
  
  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
  
  const result = await db('users')
    .insert({
      username: data.username,
      password_hash: passwordHash,
    })
    .returning('id');
  
  const id = result[0].id;
  return (await getUserById(id))!;
}

export async function getUserByUsername(username: string): Promise<User | undefined> {
  const db = getDatabase();
  
  return await db('users')
    .where('username', username)
    .first() as User | undefined;
}

export async function getUserById(id: number): Promise<User | undefined> {
  const db = getDatabase();
  
  return await db('users')
    .where('id', id)
    .first() as User | undefined;
}

export async function verifyPassword(user: User, password: string): Promise<boolean> {
  return await bcrypt.compare(password, user.password_hash);
}
