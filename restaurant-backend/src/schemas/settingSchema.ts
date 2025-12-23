import { z } from 'zod';

export const updateSettingSchema = z.object({
  name: z.string().min(1, "Restaurant name cannot be empty")
});