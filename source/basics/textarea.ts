'use strict';

import { createElement } from '../core';

createElement('textarea', {
    template: /*html*/`
<textarea></textarea>
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
}
:host > textarea {
    border: none;
    outline: none;
    background: none;
    padding: 0;
    width: 0;
    flex: 1;
    font-size: var(--font-size);
    color: var(--font-color);
    margin: 0 var(--padding-row);
    line-height: var(--line-height);
}
    `,

    attrs: {
        // size() {},
        // color() {},
        value(value, legacy) {
            this.data.setProperty('value', value);
        },
    },

    data: {
        value: '',
    },

    onInit() {
        const $textarea = this.querySelector('textarea') as HTMLTextAreaElement

        const cache = {
            value: '',
        };

        // ---- TextArea ----
        $textarea!.addEventListener('input', (event) => {
            this.data.setProperty('value', $textarea.value);
        });
        $textarea!.addEventListener('change', (event) => {
            cache.value = $textarea.value;
            this.dispatch('confirm');
        });
        $textarea!.addEventListener('focus', (event) => {
            cache.value = $textarea.value;
        });
        $textarea!.addEventListener('blur', (event) => {
            cache.value = '';
            this.dispatch('confirm');
        });
        $textarea!.addEventListener('keydown', (event) => {
            switch(event.key) {
                case 'Escape': {
                    this.data.setProperty('value', cache.value);
                    this.dispatch('cancel');
                }
            }
        });

        this.data.addPropertyEventener('value', (value, legacy) => {
            $textarea.value = value;
            this.dispatch('change');
        });
    },

    onMounted() {

    },

    onRemoved() {

    },
});