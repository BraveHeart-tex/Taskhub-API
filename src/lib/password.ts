import { hash, type Options, verify } from '@node-rs/argon2';

const defaultOptions: Options = {
  memoryCost: 19456,
  timeCost: 2,
  outputLen: 32,
  parallelism: 1,
};

export async function hashPassword(password: string) {
  return hash(password, defaultOptions);
}

export async function verifyPassword(hash: string, password: string) {
  return verify(hash, password, defaultOptions);
}
