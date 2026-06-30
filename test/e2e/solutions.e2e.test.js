import { test, expect } from '@playwright/test';

test.describe('Solutions — Testes E2E', () => {
  test('deve carregar o dashboard com a listagem de desafios', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page).toHaveTitle(/CodeLab/);
    await expect(page.locator('.card, .challenge-card, [class*="card"]').first()).toBeVisible();
  });

  test('deve redirecionar para login ao tentar acessar um desafio sem autenticação', async ({ page }) => {
    await page.goto('/desafio/1');

    await expect(page).toHaveURL('/');
  });

  test('deve redirecionar para login ao tentar acessar Meus Desafios sem autenticação', async ({ page }) => {
    await page.goto('/desafio/meus');

    await expect(page).toHaveURL('/');
  });
});
