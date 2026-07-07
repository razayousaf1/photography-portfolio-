import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name.").max(100),
  email: z.string().trim().email("Enter a valid email address."),
  message: z
    .string()
    .trim()
    .min(10, "Tell us a little more — at least 10 characters.")
    .max(2000),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

export const bookingFormSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name.").max(100),
  email: z.string().trim().email("Enter a valid email address."),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number.")
    .max(20)
    .optional()
    .or(z.literal("")),
  eventType: z.string().trim().min(1, "Select what this shoot is for."),
  eventDate: z.string().trim().min(1, "Choose a preferred date."),
  message: z
    .string()
    .trim()
    .min(10, "Add a few details about the shoot — at least 10 characters.")
    .max(2000),
});

export type BookingFormValues = z.infer<typeof bookingFormSchema>;

export const loginFormSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;

export const uploadPhotoSchema = z.object({
  title: z.string().trim().min(2, "Give this photo a title.").max(150),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  categoryId: z.string().uuid("Choose a category."),
  isFeatured: z.boolean().default(false),
  isPublic: z.boolean().default(true),
  cloudinaryUrl: z.string().url(),
  cloudinaryPublicId: z.string().min(1),
});

export type UploadPhotoValues = z.infer<typeof uploadPhotoSchema>;
