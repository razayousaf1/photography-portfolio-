import "server-only";
import { createClient } from "@/lib/supabase/server";

export class UnauthorizedError extends Error {
  constructor(message = "You must be signed in as the owner to do this.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/**
 * Confirms the current request is authenticated as the site owner.
 * Throws UnauthorizedError otherwise. This is defense-in-depth alongside
 * Supabase Row Level Security — RLS is the source of truth for data
 * access, this just lets API routes fail fast with a clean 401/403.
 */
export async function requireOwner() {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    throw new UnauthorizedError("You must be signed in to do this.");
  }

  const ownerEmail = process.env.OWNER_EMAIL;
  if (ownerEmail && data.user.email !== ownerEmail) {
    throw new UnauthorizedError("Only the site owner can do this.");
  }

  return data.user;
}
