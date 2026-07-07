import { describe, expect, it, vi, beforeEach } from "vitest";

const getUserMock = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: () => ({
    auth: { getUser: getUserMock },
  }),
}));

describe("requireOwner", () => {
  beforeEach(() => {
    getUserMock.mockReset();
    process.env.OWNER_EMAIL = "owner@shammaqbinfaisal.com";
  });

  it("resolves with the user when they are signed in as the owner", async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: "user-1", email: "owner@shammaqbinfaisal.com" } },
      error: null,
    });

    const { requireOwner } = await import("@/lib/auth");
    const user = await requireOwner();
    expect(user.email).toBe("owner@shammaqbinfaisal.com");
  });

  it("throws UnauthorizedError when nobody is signed in", async () => {
    getUserMock.mockResolvedValue({ data: { user: null }, error: null });

    const { requireOwner, UnauthorizedError } = await import("@/lib/auth");
    await expect(requireOwner()).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("throws UnauthorizedError when signed in as someone other than the owner", async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: "user-2", email: "someone-else@example.com" } },
      error: null,
    });

    const { requireOwner, UnauthorizedError } = await import("@/lib/auth");
    await expect(requireOwner()).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("throws UnauthorizedError when Supabase returns an auth error", async () => {
    getUserMock.mockResolvedValue({
      data: { user: null },
      error: new Error("Session expired"),
    });

    const { requireOwner, UnauthorizedError } = await import("@/lib/auth");
    await expect(requireOwner()).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it("allows any signed-in user when OWNER_EMAIL is unset (single-owner projects)", async () => {
    delete process.env.OWNER_EMAIL;
    getUserMock.mockResolvedValue({
      data: { user: { id: "user-3", email: "anyone@example.com" } },
      error: null,
    });

    const { requireOwner } = await import("@/lib/auth");
    await expect(requireOwner()).resolves.toBeTruthy();
  });
});
