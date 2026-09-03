import {
	userCpfSchema,
	userPasswordSchema,
} from '@Domains/users-management/public';
import { t } from 'elysia';

export const loginSchema = t.Object({
	cpf: userCpfSchema,
	password: userPasswordSchema,
});
