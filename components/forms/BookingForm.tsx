"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { bookingFormSchema } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const EVENT_TYPES = ["Fashion", "Product", "Corporate", "Wedding", "Commercial", "Other"];

type Values = {
  name: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: string;
  message: string;
};

type FieldErrors = Partial<Record<keyof Values, string>>;

const initialValues: Values = {
  name: "",
  email: "",
  phone: "",
  eventType: "",
  eventDate: "",
  message: "",
};

export function BookingForm() {
  const [values, setValues] = useState<Values>(initialValues);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function update<K extends keyof Values>(key: K, value: Values[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const result = bookingFormSchema.safeParse(values);

    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof Values;
        fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Something went wrong. Please try again.");
      }

      setSubmitted(true);
      toast.success("Inquiry sent — we'll confirm availability shortly.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send inquiry.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="border border-champagne/30 bg-champagne/5 p-8 text-center">
        <p className="font-display text-2xl text-paper">Inquiry received.</p>
        <p className="mt-2 text-sm text-smoke">
          Thank you — we&apos;ll confirm availability for your preferred date
          within 1–2 business days.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Your name"
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={values.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="you@example.com"
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <Label htmlFor="phone">Phone (optional)</Label>
          <Input
            id="phone"
            value={values.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="+92 300 0000000"
            aria-invalid={Boolean(errors.phone)}
          />
          {errors.phone && <p className="mt-1 text-xs text-red-400">{errors.phone}</p>}
        </div>

        <div>
          <Label htmlFor="eventType">Shoot type</Label>
          <Select
            id="eventType"
            value={values.eventType}
            onChange={(e) => update("eventType", e.target.value)}
            aria-invalid={Boolean(errors.eventType)}
          >
            <option value="">Select one...</option>
            {EVENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
          {errors.eventType && <p className="mt-1 text-xs text-red-400">{errors.eventType}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="eventDate">Preferred date</Label>
        <Input
          id="eventDate"
          type="date"
          value={values.eventDate}
          onChange={(e) => update("eventDate", e.target.value)}
          aria-invalid={Boolean(errors.eventDate)}
        />
        {errors.eventDate && <p className="mt-1 text-xs text-red-400">{errors.eventDate}</p>}
      </div>

      <div>
        <Label htmlFor="message">Tell us about the shoot</Label>
        <Textarea
          id="message"
          value={values.message}
          onChange={(e) => update("message", e.target.value)}
          placeholder="Location, headcount, mood board, deadlines — anything helpful."
          aria-invalid={Boolean(errors.message)}
        />
        {errors.message && <p className="mt-1 text-xs text-red-400">{errors.message}</p>}
      </div>

      <Button type="submit" variant="champagne" size="lg" loading={loading} className="w-full sm:w-auto">
        Submit Inquiry
      </Button>
    </form>
  );
}
