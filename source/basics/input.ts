'use strict';

import { createElement, style } from '../core/index.js';

createElement('input', {
    template: /*html*/`
<input />
    `,
    style: /*css*/`
${style.hollow}
${style.line}

:host {
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
        readonly(value) {
            const $input = this.querySelector('input');
            if (value === null) {
                $input!.removeAttribute('readonly');
            } else {
                $input!.setAttribute('readonly', value);
            }
        },
        disabled(value) {
            const $input = this.querySelector('input');
            if (value === null) {
                $input!.removeAttribute('readonly');
            } else {
                $input!.setAttribute('readonly', value);
            }
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
            this.setAttribute('value', value);
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