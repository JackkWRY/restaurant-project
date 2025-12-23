import { z } from 'zod';

export const checkoutSchema = z.object({
  tableId: z.coerce.number().positive("Table ID is required"),
  paymentMethod: z.string().optional().default('CASH')
});