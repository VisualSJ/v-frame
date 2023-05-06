'use strict';

import { test, expect } from '@playwright/test';

function sleep() {
    return new Promise((resolve) => {
        setTimeout(resolve, 4000);
    });
}

test.describe('NumInput', () => {

    test.use({ viewport: { width: 600, height: 1000 } });

    test('Display', async ({ page }) => {
        await page.goto('http://127.0.0.1:4004/basics/radio/display.html');

        // TODO 对比图不应该上传 git，暂时不提交
        // await expect(page).toHaveScreenshot();
    });

    test('默认参数', async ({ page }) => {
        await page.goto('http://127.0.0.1:4004/basics/radio/operation.html');
        const $operation = page.locator('#operation');

        await expect($operation).toHaveAttribute('checked', '');
    });

    test('输入 -> 焦点离开', async ({ page }) => {
        await page.goto('http://127.0.0.1:4004/basics/radio/operation.html');
        const $operation = page.locator('#operation');
        const $operationEvent = page.locator('#operation-event');

        await $operation.click();
        await expect($operation).not.toHaveAttribute('value', '');
        await expect($operationEvent).toHaveText('ab');
    });

    // test('输入 -> Escape', async ({ page }) => {
    //     await page.goto('http://127.0.0.1:4004/basics/radio/operation.html');
    //     const $operation = page.locator('#operation');
    //     const $operationEvent = page.locator('#operation-event');

    //     await $operation.click();
    //     await page.type('#operation', '10', {
    //         delay: 200,
    //     });
    //     await page.press('#operation', 'Escape', {
    //         delay: 200,
    //     });
    //     await $operation.blur();
    //     await expect($operation).toHaveAttribute('value', '0');
    //     await expect($operationEvent).toHaveText('aac');
    // });

    // test('输入 -> Enter', async ({ page }) => {
    //     await page.goto('http://127.0.0.1:4004/basics/radio/operation.html');
    //     const $operation = page.locator('#operation');
    //     const $operationEvent = page.locator('#operation-event');

    //     await $operation.click();
    //     await page.type('#operation', '10', {
    //         delay: 200,
    //     });
    //     await page.press('#operation', 'Enter', {
    //         delay: 200,
    //     });
    //     await $operation.blur();
    //     await expect($operation).toHaveAttribute('value', '10');
    //     await expect($operationEvent).toHaveText('aab');
    // });

    // test('Readonly -> Enter', async ({ page }) => {
    //     await page.goto('http://127.0.0.1:4004/basics/radio/readonly.html');
    //     const $operation = page.locator('#operation');
    //     const $operationEvent = page.locator('#operation-event');

    //     // ---- 基础测试 ----
    //     // 输入后回车
    //     await $operation.click();
    //     await page.type('#operation', '10', {
    //         delay: 200,
    //     });
    //     await page.press('#operation', 'Enter', {
    //         delay: 200,
    //     });
    //     await expect($operation).toHaveAttribute('value', '0');
    //     await expect($operationEvent).toHaveText('');

    //     // 输入后 esc
    //     await page.type('#operation', '10', {
    //         delay: 200,
    //     });
    //     await page.press('#operation', 'Escape', {
    //         delay: 200,
    //     });
    //     await expect($operation).toHaveAttribute('value', '0');
    //     await expect($operationEvent).toHaveText('');

    //     // 输入后离开焦点
    //     await page.type('#operation', '10', {
    //         delay: 200,
    //     });
    //     await $operation.blur();
    //     await expect($operation).toHaveAttribute('value', '0');
    //     await expect($operationEvent).toHaveText('');

    //     // ---- 动态去掉 readonly ----
    //     await $operation.evaluate((el) => {
    //         el.removeAttribute('readonly');
    //         el.setAttribute('value', '0');
    //     });
    //     await expect($operation).not.toHaveAttribute('readonly', '');
    //     await expect($operation).toHaveAttribute('value', '0');
    //     await $operationEvent.evaluate((el) => {
    //         el.innerHTML = '';
    //     });
    //     await expect($operationEvent).toHaveText('');

    //     // 输入后回车
    //     await $operation.click();
    //     await page.type('#operation', '10', {
    //         delay: 200,
    //     });
    //     await page.press('#operation', 'Enter', {
    //         delay: 200,
    //     });
    //     await expect($operation).toHaveAttribute('value', '10');
    //     await expect($operationEvent).toHaveText('aab');

    //     // 输入后 esc
    //     await page.type('#operation', '10', {
    //         delay: 200,
    //     });
    //     await page.press('#operation', 'Escape', {
    //         delay: 200,
    //     });
    //     await expect($operation).toHaveAttribute('value', '10');
    //     await expect($operationEvent).toHaveText('aabaac');

    //     // 输入后离开焦点
    //     await page.type('#operation', '10', {
    //         delay: 200,
    //     });
    //     await $operation.blur();
    //     await expect($operation).toHaveAttribute('value', '1010');
    //     await expect($operationEvent).toHaveText('aabaacaab');

    //     // ---- 动态加上 readonly ----
    //     await $operation.evaluate((el) => {
    //         el.setAttribute('readonly', '');
    //         el.setAttribute('value', '0');
    //     });
    //     await expect($operation).toHaveAttribute('readonly', '');
    //     await expect($operation).toHaveAttribute('value', '0');
    //     await $operationEvent.evaluate((el) => {
    //         el.innerHTML = '';
    //     });
    //     await expect($operationEvent).toHaveText('');

    //     // 输入后回车
    //     await $operation.click();
    //     await page.type('#operation', '10', {
    //         delay: 200,
    //     });
    //     await page.press('#operation', 'Enter', {
    //         delay: 200,
    //     });
    //     await expect($operation).toHaveAttribute('value', '0');
    //     await expect($operationEvent).toHaveText('');

    //     // 输入后 esc
    //     await page.type('#operation', '10', {
    //         delay: 200,
    //     });
    //     await page.press('#operation', 'Escape', {
    //         delay: 200,
    //     });
    //     await expect($operation).toHaveAttribute('value', '0');
    //     await expect($operationEvent).toHaveText('');

    //     // 输入后离开焦点
    //     await page.type('#operation', '10', {
    //         delay: 200,
    //     });
    //     await $operation.blur();
    //     await expect($operation).toHaveAttribute('value', '0');
    //     await expect($operationEvent).toHaveText('');
    // });

    // test('Disabled -> Enter', async ({ page }) => {
    //     await page.goto('http://127.0.0.1:4004/basics/radio/disabled.html');
    //     const $operation = page.locator('#operation');
    //     const $operationEvent = page.locator('#operation-event');
    //     await $operation.click();

    //     await page.type('#operation', '10', {
    //         delay: 200,
    //     });
    //     await page.press('#operation', 'Enter', {
    //         delay: 200,
    //     });
    //     await expect($operation).toHaveAttribute('value', '0');
    //     await expect($operationEvent).toHaveText('');

    //     await page.type('#operation', '10', {
    //         delay: 200,
    //     });
    //     await page.press('#operation', 'Escape', {
    //         delay: 200,
    //     });
    //     await expect($operation).toHaveAttribute('value', '0');
    //     await expect($operationEvent).toHaveText('');

    //     await page.type('#operation', 'focus', {
    //         delay: 200,
    //     });
    //     await $operation.blur();
    //     await expect($operation).toHaveAttribute('value', '0');
    //     await expect($operationEvent).toHaveText('');
    // });

});

