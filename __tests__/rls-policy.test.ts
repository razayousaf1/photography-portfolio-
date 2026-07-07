import { describe, expect, it } from "vitest";
import { readFileSync } from "fs";
import path from "path";

const schemaSql = readFileSync(
  path.resolve(__dirname, "../supabase/schema.sql"),
  "utf-8"
);

describe("supabase/schema.sql — Row Level Security", () => {
  it("enables RLS on every public table", () => {
    expect(schemaSql).toMatch(/alter table public\.categories enable row level security/i);
    expect(schemaSql).toMatch(/alter table public\.photos enable row level security/i);
    expect(schemaSql).toMatch(/alter table public\.inquiries enable row level security/i);
  });

  it("allows public read access to categories and public photos only", () => {
    expect(schemaSql).toMatch(/create policy "categories_select_all"/i);
    expect(schemaSql).toMatch(/create policy "photos_select_public"[\s\S]*?using \(is_public = true or public\.is_owner\(\)\)/i);
  });

  it("restricts photo writes (insert/update/delete) to the owner", () => {
    expect(schemaSql).toMatch(/create policy "photos_insert_owner"[\s\S]*?with check \(public\.is_owner\(\)\)/i);
    expect(schemaSql).toMatch(/create policy "photos_update_owner"[\s\S]*?using \(public\.is_owner\(\)\)/i);
    expect(schemaSql).toMatch(/create policy "photos_delete_owner"[\s\S]*?using \(public\.is_owner\(\)\)/i);
  });

  it("restricts category writes to the owner", () => {
    expect(schemaSql).toMatch(/create policy "categories_write_owner"[\s\S]*?using \(public\.is_owner\(\)\)/i);
  });

  it("lets anyone submit an inquiry but only the owner can read them", () => {
    expect(schemaSql).toMatch(/create policy "inquiries_insert_anyone"[\s\S]*?with check \(true\)/i);
    expect(schemaSql).toMatch(/create policy "inquiries_select_owner"[\s\S]*?using \(public\.is_owner\(\)\)/i);
  });

  it("defines is_owner() as a stable, security-definer function", () => {
    expect(schemaSql).toMatch(/create or replace function public\.is_owner\(\)/i);
    expect(schemaSql).toMatch(/security definer stable/i);
  });
});
