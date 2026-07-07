import { describe, expect, it, vi, beforeEach } from "vitest";

const requireOwnerMock = vi.fn();
const deleteCloudinaryAssetMock = vi.fn();
const singleMock = vi.fn();
const deleteEqMock = vi.fn();

vi.mock("@/lib/auth", () => ({
  requireOwner: requireOwnerMock,
  UnauthorizedError: class UnauthorizedError extends Error {},
}));

vi.mock("@/lib/cloudinary", () => ({
  deleteCloudinaryAsset: deleteCloudinaryAssetMock,
}));

vi.mock("@/lib/supabase/server", () => ({
  createServiceRoleClient: () => ({
    from: (table: string) => {
      if (table !== "photos") throw new Error(`Unexpected table: ${table}`);
      return {
        select: () => ({
          eq: () => ({
            single: singleMock,
          }),
        }),
        delete: () => ({
          eq: deleteEqMock,
        }),
      };
    },
  }),
}));

describe("DELETE /api/photos/[id]", () => {
  beforeEach(() => {
    requireOwnerMock.mockReset();
    deleteCloudinaryAssetMock.mockReset();
    singleMock.mockReset();
    deleteEqMock.mockReset();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://real-project.supabase.co";
  });

  it("rejects the request when the caller is not the owner", async () => {
    const { UnauthorizedError } = await import("@/lib/auth");
    requireOwnerMock.mockRejectedValue(new UnauthorizedError());

    const { DELETE } = await import("@/app/api/photos/[id]/route");
    const response = await DELETE(new Request("http://localhost/api/photos/abc"), {
      params: { id: "abc" },
    });

    expect(response.status).toBe(401);
    expect(deleteCloudinaryAssetMock).not.toHaveBeenCalled();
  });

  it("deletes the Cloudinary asset and the database row for the owner", async () => {
    requireOwnerMock.mockResolvedValue({ id: "owner-1" });
    singleMock.mockResolvedValue({
      data: { cloudinary_public_id: "shammaq-portfolio/sample" },
      error: null,
    });
    deleteCloudinaryAssetMock.mockResolvedValue(undefined);
    deleteEqMock.mockResolvedValue({ error: null });

    const { DELETE } = await import("@/app/api/photos/[id]/route");
    const response = await DELETE(new Request("http://localhost/api/photos/abc"), {
      params: { id: "abc" },
    });

    expect(response.status).toBe(200);
    expect(deleteCloudinaryAssetMock).toHaveBeenCalledWith("shammaq-portfolio/sample");
    expect(deleteEqMock).toHaveBeenCalledWith("id", "abc");
  });

  it("returns 404 when the photo does not exist", async () => {
    requireOwnerMock.mockResolvedValue({ id: "owner-1" });
    singleMock.mockResolvedValue({ data: null, error: new Error("not found") });

    const { DELETE } = await import("@/app/api/photos/[id]/route");
    const response = await DELETE(new Request("http://localhost/api/photos/missing"), {
      params: { id: "missing" },
    });

    expect(response.status).toBe(404);
  });

  it("still deletes the database row even if Cloudinary cleanup fails", async () => {
    requireOwnerMock.mockResolvedValue({ id: "owner-1" });
    singleMock.mockResolvedValue({
      data: { cloudinary_public_id: "shammaq-portfolio/sample" },
      error: null,
    });
    deleteCloudinaryAssetMock.mockRejectedValue(new Error("Cloudinary is down"));
    deleteEqMock.mockResolvedValue({ error: null });

    const { DELETE } = await import("@/app/api/photos/[id]/route");
    const response = await DELETE(new Request("http://localhost/api/photos/abc"), {
      params: { id: "abc" },
    });

    expect(response.status).toBe(200);
    expect(deleteEqMock).toHaveBeenCalledWith("id", "abc");
  });
});
