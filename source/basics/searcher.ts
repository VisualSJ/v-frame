'use strict';

import { createElement } from '../core';

createElement('searcher', {
    template: /*html*/`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
    <path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352c79.5 0 144-64.5 144-144s-64.5-144-144-144S64 128.5 64 208s64.5 144 144 144z"/>
</svg>
<input />
    `,

    style: /*css*/`
:host {
    --font-color: var(--color-default);
    --border-color: var(--color-default);

    --line-height: calc(var(--size-line) * 1px);
    --font-size: calc(var(--size-font) * 1px);
}

:host {
    width: 250px;
    display: inline-flex;
}
:host > svg {
    width: var(--font-size);
}
:host > input {
    border: none;
    outline: none;
    background: none;
    flex: 1;
    width: var(--font-size);
}
    `,

    attrs: {
        value() {

        },
        placeholder(value) {
            const $input = this.querySelector('input');
            $input?.setAttribute('placeholder', value);
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