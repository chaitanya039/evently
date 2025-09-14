import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  date: z.string().datetime(),
  location: z.string().min(3),
  capacity: z.number().int().positive(),
  price: z.number().positive(),
});

export const updateEventSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  date: z.string().datetime().optional(),
  location: z.string().min(3).optional(),
  capacity: z.number().int().positive().optional(),
  price: z.number().positive().optional(),
});