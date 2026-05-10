import { describe, it, expect, vi } from "vitest";
import { updateProfileAction } from "@/src/actions/user-actions";
import * as authLib from "@/src/lib/auth";
import * as userService from "@/src/services/user-service";
import * as cache from "next/cache";

vi.mock("@/src/lib/auth", () => ({
  auth: vi.fn(),
}));

vi.mock("@/src/services/user-service", () => ({
  updateUserProfile: vi.fn().mockResolvedValue({}),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("user-actions", () => {
  it("should fail if not authorized", async () => {
    vi.spyOn(authLib, "auth").mockResolvedValue(null);
    const fd = new FormData();
    const result = await updateProfileAction(fd);
    expect(result.success).toBe(false);
    expect(result.error).toBe("Unauthorized");
  });

  it("should succeed with valid data", async () => {
    vi.spyOn(authLib, "auth").mockResolvedValue({
      user: { id: "1" },
    } as unknown as Awaited<ReturnType<typeof authLib.auth>>);
    const fd = new FormData();
    fd.set("name", "New Name");
    fd.set("bio", "New Bio");

    const result = await updateProfileAction(fd);
    expect(result.success).toBe(true);
    expect(userService.updateUserProfile).toHaveBeenCalled();
    expect(cache.revalidatePath).toHaveBeenCalled();
  });

  it("should catch errors", async () => {
    vi.spyOn(authLib, "auth").mockResolvedValue({
      user: { id: "1" },
    } as unknown as Awaited<ReturnType<typeof authLib.auth>>);
    vi.spyOn(userService, "updateUserProfile").mockRejectedValue(
      new Error("DB error"),
    );
    const fd = new FormData();
    fd.set("name", "New Name");
    const result = await updateProfileAction(fd);
    expect(result.success).toBe(false);
    expect(result.error).toBe("DB error");
  });
});
