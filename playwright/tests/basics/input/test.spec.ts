import { test, expect } from '@playwright/test';

function sleep() {
    return new Promise((resolve) => {
        setTimeout(resolve, 4000);
    });
}

test.describe('Input', () => {

    test.use({ viewport: { width: 600, height: 1000 } });

    test('Display', async ({ page }) => {
        await page.goto('http://127.0.0.1:3000/basics/input/display.html');

        // TODO 对比图不应该上传 git，暂时不提交
        await expect(page).toHaveScreenshot();
    });

    test('默认参数', async ({ page }) => {
        await page.goto('http://127.0.0.1:3000/basics/input/operation.html');
        const $operation = page.locator('#operation');

        await expect($operation).toHaveAttribute('value', '');
        await expect($operation).toHaveAttribute('placeholder', 'placeholder');
    });

    test('输入 -> 焦点离开', async ({ page }) => {
        await page.goto('http://127.0.0.1:3000/basics/input/operation.html');
        const $operation = page.locator('#operation');
        const $operationEvent = page.locator('#operation-event');

        await $operation.click();
        await page.type('#operation', 'input', {
            delay: 200,
        });
        await $operation.blur();
        await expect($operation).toHaveAttribute('value', 'input');
        await expect($operationEvent).toHaveText('aaaaab');
    });

    test('输入 -> Escape', async ({ page }) => {
        await page.goto('http://127.0.0.1:3000/basics/input/operation.html');
        const $operation = page.locator('#operation');
        const $operationEvent = page.locator('#operation-event');

        await $operation.click();
        await page.type('#operation', 'cancel', {
            delay: 200,
        });
        await page.press('#operation', 'Escape', {
            delay: 200,
        });
        await $operation.blur();
        await expect($operation).toHaveAttribute('value', '');
        await expect($operationEvent).toHaveText('aaaaaac');
    });

    test('输入 -> Enter', async ({ page }) => {
        await page.goto('http://127.0.0.1:3000/basics/input/operation.html');
        const $operation = page.locator('#operation');
        const $operationEvent = page.locator('#operation-event');

        await $operation.click();
        await page.type('#operation', 'enter', {
            delay: 200,
        });
        await page.press('#operation', 'Enter', {
            delay: 200,
        });
        await $operation.blur();
        await expect($operation).toHaveAttribute('value', 'enter');
        await expect($operationEvent).toHaveText('aaaaab');
    });

});

