import { describe, expect, it } from "vitest";
import {
  contactFormSchema,
  bookingFormSchema,
  loginFormSchema,
  uploadPhotoSchema,
} from "@/lib/validations";

describe("contactFormSchema", () => {
  it("accepts a valid submission", () => {
    const result = contactFormSchema.safeParse({
      name: "Ayesha Khan",
      email: "ayesha@example.com",
      message: "I'd love to book a shoot for next month.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = contactFormSchema.safeParse({
      name: "Ayesha Khan",
      email: "not-an-email",
      message: "I'd love to book a shoot for next month.",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a too-short message", () => {
    const result = contactFormSchema.safeParse({
      name: "Ayesha Khan",
      email: "ayesha@example.com",
      message: "hi",
    });
    expect(result.success).toBe(false);
  });
});

describe("bookingFormSchema", () => {
  const base = {
    name: "Bilal Ahmed",
    email: "bilal@example.com",
    phone: "03001234567",
    eventType: "Wedding",
    eventDate: "2026-12-01",
    message: "Looking for full-day wedding coverage in Lahore.",
  };

  it("accepts a fully valid booking", () => {
    expect(bookingFormSchema.safeParse(base).success).toBe(true);
  });

  it("allows an empty phone number", () => {
    const result = bookingFormSchema.safeParse({ ...base, phone: "" });
    expect(result.success).toBe(true);
  });

  it("rejects a missing event type", () => {
    const result = bookingFormSchema.safeParse({ ...base, eventType: "" });
    expect(result.success).toBe(false);
  });

  it("rejects a missing event date", () => {
    const result = bookingFormSchema.safeParse({ ...base, eventDate: "" });
    expect(result.success).toBe(false);
  });
});

describe("loginFormSchema", () => {
  it("accepts valid owner credentials", () => {
    const result = loginFormSchema.safeParse({
      email: "owner@shammaqbinfaisal.com",
      password: "supersecret",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a short password", () => {
    const result = loginFormSchema.safeParse({
      email: "owner@shammaqbinfaisal.com",
      password: "123",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a malformed email", () => {
    const result = loginFormSchema.safeParse({
      email: "owner@",
      password: "supersecret",
    });
    expect(result.success).toBe(false);
  });
});

describe("uploadPhotoSchema", () => {
  const base = {
    title: "Champagne Light",
    description: "Studio editorial",
    categoryId: "123e4567-e89b-12d3-a456-426614174000",
    isFeatured: true,
    isPublic: true,
    cloudinaryUrl: "https://res.cloudinary.com/demo/image/upload/v1/sample.jpg",
    cloudinaryPublicId: "shammaq-portfolio/sample",
  };

  it("accepts a valid photo payload", () => {
    expect(uploadPhotoSchema.safeParse(base).success).toBe(true);
  });

  it("rejects a non-uuid category id", () => {
    const result = uploadPhotoSchema.safeParse({ ...base, categoryId: "not-a-uuid" });
    expect(result.success).toBe(false);
  });

  it("rejects a missing title", () => {
    const result = uploadPhotoSchema.safeParse({ ...base, title: "" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid cloudinary url", () => {
    const result = uploadPhotoSchema.safeParse({ ...base, cloudinaryUrl: "not-a-url" });
    expect(result.success).toBe(false);
  });
});
