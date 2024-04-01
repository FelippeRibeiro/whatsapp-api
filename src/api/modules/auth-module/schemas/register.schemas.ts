import z from 'zod';

export const registerBody = z.object({
  name: z.string(),
  email: z.string(),
  telefone: z
    .string()
    .max(13)
    .min(10)
    .refine((arg) => (arg.split('').some((n) => isNaN(Number(n))) ? false : true), {
      message: 'Número inválido',
    }),
});
