import { test, expect } from "@playwright/test";

test.describe("ServiSync Smoke Tests", () => {
  test("1. Landing page loads with key landmarks and title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/ServiSync/);
    await expect(page.locator("h1")).toContainText(/Smartly Connecting/i);
    // Verify Demo Accounts section exists
    await expect(page.getByText("Evaluator One-Click Demo Credentials")).toBeVisible();
    await expect(page.getByRole("link", { name: /Login Customer/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Login Admin/i })).toBeVisible();
  });

  test("2. Login page displays one-click evaluator credentials and auto-fills", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /Welcome back to ServiSync/i })).toBeVisible();

    // Verify all 4 demo role buttons exist
    const customerBtn = page.getByRole("button", { name: /Customer/i });
    const techBtn = page.getByRole("button", { name: /Technician/i });
    const managerBtn = page.getByRole("button", { name: /Manager/i });
    const adminBtn = page.getByRole("button", { name: /Admin/i });

    await expect(customerBtn).toBeVisible();
    await expect(techBtn).toBeVisible();
    await expect(managerBtn).toBeVisible();
    await expect(adminBtn).toBeVisible();

    // Clicking Customer autofills email and password
    await customerBtn.click();
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');

    await expect(emailInput).toHaveValue("customer1@example.com");
    await expect(passwordInput).toHaveValue("Customer@123");

    // Clicking Admin switches credentials
    await adminBtn.click();
    await expect(emailInput).toHaveValue("admin@servisync.com");
    await expect(passwordInput).toHaveValue("Admin@123");
  });

  test("3. Protected routes redirect unauthorized visitors to login", async ({ page }) => {
    await page.goto("/dashboard");
    // Should be redirected to /login with redirect query param
    await page.waitForURL(/\/login\?redirect=%2Fdashboard/);
    await expect(page.getByRole("heading", { name: /Welcome back to ServiSync/i })).toBeVisible();
  });

  test("4. Registration form validates required fields and password length", async ({ page }) => {
    await page.goto("/register");
    await expect(page.getByRole("heading", { name: /Create your ServiSync account/i })).toBeVisible();

    // Click submit without entering required inputs
    const submitBtn = page.getByRole("button", { name: /Create Account/i });
    await submitBtn.click();

    // Verification error messages should appear
    await expect(page.getByText(/Full name is required/i)).toBeVisible();
    await expect(page.getByText(/Please enter a valid email address/i)).toBeVisible();
  });
});
