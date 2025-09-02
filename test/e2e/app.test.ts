import { setup, createPage } from "@nuxt/test-utils/e2e";
import { describe, it, expect } from "vitest";

describe("App", async () => {
  await setup({
    host: "http://localhost:3000",
  });

  it("should render", async () => {
    const page = await createPage("/");
    expect(await page.getByTestId("diveco-button").isVisible()).toBe(true);
  });

  it("should navigate to the login page", async () => {
    const page = await createPage("/");
    await page.getByTestId("diveco-button").click();
  });
});
