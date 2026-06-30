import { test, expect } from '@playwright/test';

test.describe('Auth — Testes E2E', () => {
  test('deve carregar a página de login com formulário visível', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/CodeLab/);
    await expect(page.locator('#form-entrar')).toBeVisible();
    await expect(page.locator('#form-entrar input[name="email"]')).toBeVisible();
    await expect(page.locator('#form-entrar input[name="password"]')).toBeVisible();
    await expect(page.locator('#form-entrar button[type="submit"]')).toBeVisible();
  });

  test('deve redirecionar para / quando as senhas não coincidem no cadastro', async ({ page }) => {
    await page.goto('/');

    await page.click('#tab-cadastrar');
    await expect(page.locator('#form-cadastrar')).toBeVisible();

    await page.fill('#form-cadastrar input[name="name"]', 'Usuario Teste');
    await page.fill('#form-cadastrar input[name="email"]', 'teste@email.com');
    await page.fill('#form-cadastrar input[name="password"]', '123456');
    await page.fill('#form-cadastrar input[name="confirmPassword"]', '999999');
    await page.click('#form-cadastrar button[type="submit"]');

    await expect(page).toHaveURL('/');
  });

  test('deve permanecer em / quando credenciais de login forem inválidas', async ({ page }) => {
    await page.goto('/');

    await page.fill('#form-entrar input[name="email"]', 'naoexiste@email.com');
    await page.fill('#form-entrar input[name="password"]', 'senhaerrada');
    await page.click('#form-entrar button[type="submit"]');

    await expect(page).toHaveURL('/');
  });
});
