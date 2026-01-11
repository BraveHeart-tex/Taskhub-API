import { z } from 'zod';
import {
  MAX_FULL_NAME_LENGTH,
  MAX_PASSWORD_LENGTH,
  MIN_FULL_NAME_LENGTH,
  MIN_PASSWORD_LENGTH,
} from '@/domain/auth/auth.constants';

export const loginBodySchema = z.object({
  email: z.email(),
  password: z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH),
});

export const authenticatedUserSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  createdAt: z.iso.datetime(),
  fullName: z.string().min(MIN_FULL_NAME_LENGTH).max(MAX_FULL_NAME_LENGTH),
});

export const signUpBodySchema = z.object({
  email: z.email(),
  password: z.string().min(MIN_PASSWORD_LENGTH).max(MAX_PASSWORD_LENGTH),
  fullName: z.string().min(MIN_FULL_NAME_LENGTH).max(MAX_FULL_NAME_LENGTH),
});
