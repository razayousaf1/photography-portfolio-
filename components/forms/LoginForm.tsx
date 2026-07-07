"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { loginFormSchema } from "@/lib/validations";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

type FieldErrors = Partial<Record<"email" | "password", string>>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectedFrom = searchParams.get("redirectedFrom") || "/admin";

  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    const result = loginFormSchema.safeParse(values);
    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof FieldErrors;
        fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword(result.data);

      if (error) {
        setFormError(error.message);
        return;
      }

      toast.success("Welcome back.");
      router.push(redirectedFrom);
      router.refresh();
    } catch {
      setFormError("Could not reach the authentication service. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6" noValidate>
      <div className="flex items-center gap-2 text-champagne">
        <Lock size={16} />
        <p className="font-mono text-xs uppercase tracking-widest2">Owner Access</p>
      </div>

      {formError && (
        <div
          role="alert"
          className="border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300"
        >
          {formError}
        </div>
      )}

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
          placeholder="owner@shammaqbinfaisal.com"
          aria-invalid={Boolean(errors.email)}
        />
        {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
      </div>

      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          value={values.password}
          onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))}
          placeholder="••••••••"
          aria-invalid={Boolean(errors.password)}
        />
        {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
      </div>

      <Button type="submit" variant="champagne" size="lg" loading={loading} className="w-full">
        Sign In
      </Button>
    </form>
  );
}
