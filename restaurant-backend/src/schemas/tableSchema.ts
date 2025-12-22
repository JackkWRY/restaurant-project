import { z } from 'zod';

export const createTableSchema = z.object({
  name: z.string().min(1, "Table name is required").max(50, "Name is too long")
});

export const updateTableSchema = createTableSchema;

export const toggleAvailabilitySchema = z.object({
  isAvailable: z.boolean()
});

export const updateCallStaffSchema = z.object({
  isCalling: z.boolean()
});