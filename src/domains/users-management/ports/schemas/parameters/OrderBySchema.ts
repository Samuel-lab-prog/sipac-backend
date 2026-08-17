import { t } from 'elysia';
export const orderUsersBySchema = t.UnionEnum(['nickname', 'createdAt', 'id']);
