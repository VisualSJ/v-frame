'use strict';

import { createElement } from '../core';

createElement('input', {
    template: /*html*/`
<input />
    `,
    style: /*css*/`
:host {
    --font-color: var(--color-default);
    --border-color: var(--color-default);

    --line-height: calc(var(--size-line) * 1px);
    --font-size: calc(var(--size-font) * 1px);

    --padding-row: calc((var(--size-line) - var(--size-font)) * 0.8px);
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
    border-radius: 2px;
    width: 150px;
    border: 1px solid var(--border-color);
    line-height: var(--line-height);
    height: var(--line-height);
    box-sizing: border-box;
}
:host > input {
    border: none;
    outline: none;
    background: none;
    padding: 0;
    width: 0;
    flex: 1;
    font-size: var(--font-size);
    color: var(--font-color);
    margin: 0 var(--padding-row);
}
    `,

    attrs: {
        // size() {},
        // color() {},
        value(value, legacy) {
            const $input = this.querySelector('input');
            $input!.setAttribute('value', value);
            this.data.setProperty('value', value);
        },
        placeholder(value) {
            const $input = this.querySelector('input');
            $input!.setAttribute('placeholder', value);
        },
    },

    data: {
        value: '',
    },

    onInit() {
        const $input = this.querySelector('input') as HTMLInputElement;

        let value = '';

        // ---- Input ----
        $input!.addEventListener('input', (event) => {
            this.data.setProperty('value', $input.value);
            this.dispatch('change');
        });
        $input!.addEventListener('change', (event) => {
            value = $input.value;
            this.data.setProperty('value', value);
            this.dispatch('confirm');
        });
        $input!.addEventListener('focus', (event) => {
            value = this.data.getProperty('value');
        });
        $input!.addEventListener('keydown', (event) => {
            switch(event.key) {
                case 'Escape': {
                    event.stopPropagation();
                    event.preventDefault();
                    if ($input.value !== value) {
                        $input.value = value;
                        this.data.setProperty('value', value);
                        this.dispatch('cancel');
                    }
                }
            }
        });
    },

    onMounted() {

    },

    onRemoved() {

    },
});