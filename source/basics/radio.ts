'use strict';

import { createElement } from '../core';

createElement('radio', {
    template: /*html*/`
<div>
    <span>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <path d="M470.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L192 338.7 425.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/>
        </svg>
    </span>
</div>
<slot></slot>
    `,

    style: /*css*/`
:host {
    --font-color: var(--color-default);
    --border-color: var(--color-default);

    --line-height: calc(var(--size-line) * 1px);
    --font-size: calc(var(--size-font) * 1px);

    --padding-row: calc((var(--size-line) - var(--size-font)) * 0.2px);
}
:host([color="primary"]) {
    --font-color: var(--color-primary);
    --border-color: var(--color-primary);
}
:host([color="success"]) {
    --font-color: var(--color-success);
    --border-color: var(--color-success);
}
:host([color="danger"]) {
    --font-color: var(--color-danger);
    --border-color: var(--color-danger);
}
:host([color="wranning"]) {
    --font-color: var(--color-wranning);
    --border-color: var(--color-wranning);
}

:host {
    display: inline-flex;
    cursor: pointer;
    box-sizing: border-box;
    line-height: var(--line-height);
}
:host > div {
    padding: 0 var(--padding-row);
}
:host > div > span {
    display: inline-block;
    position: relative;
    top: 1px;
    width: var(--font-size);
    height: var(--font-size);
    border-radius: var(--font-size);
    border: 1px solid var(--border-color);
}
:host > div > span > svg {
    position: absolute;
    opacity: 0;
    fill: var(--font-color);
    transition: opacity var(--anim-duration);
}
:host > div[checked] > span > svg {
    opacity: 1;
}
:host > slot {
    display: inline-block;
    color: var(--font-color);
    font-size: var(--font-size);
}
    `,

    attrs: {
        checked(value, legacy) {
            const bool = parseStringToBoolean(value);
            this.data.setProperty('value', bool);
        },
    },

    data: {
        value: false,
    },

    onInit() {
        const $div = this.querySelector('div');
        this.addEventListener('click', () => {
            const bool = this.data.getProperty('value');
            this.data.setProperty('value', !bool);
        });

        this.data.addPropertyEventener('value', (value) => {
            if (value) {
                $div!.setAttribute('checked', '');
            } else {
                $div!.removeAttribute('checked');
            }
            this.dispatch('change');
            this.dispatch('confirm');
        });
    },

    onMounted() {

    },

    onRemoved() {

    },
});

function parseStringToBoolean(str: string) {
    return str === 'true';
}
