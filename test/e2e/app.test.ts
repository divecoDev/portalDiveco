import { setup, $fetch } from "@nuxt/test-utils/e2e";
import { describe, it, expect } from "vitest";

describe("App", async () => {
  await setup({
    host: "http://localhost:3000",
  });

  it("should render", async () => {
    const page = await $fetch("/");
    expect(page).toContain("DIVECO");
  });
});
