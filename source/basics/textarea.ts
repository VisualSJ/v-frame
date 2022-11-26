'use strict';

import { createElement, style } from '../core/index.js';

createElement('textarea', {
    template: /*html*/`
<textarea></textarea>
    `,
    style: /*css*/`
${style.hollow}
${style.line}

:host {
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
    resize: none;
}
    `,

    attrs: {
        // size() {},
        // color() {},
        value(value, legacy) {
            const $textarea = this.querySelector('textarea');
            $textarea!.setAttribute('value', value);
            this.data.setProperty('value', value);
        },
        placeholder(value) {
            const $textarea = this.querySelector('textarea');
            $textarea!.setAttribute('placeholder', value);
        },
        readonly(value) {
            const $textarea = this.querySelector('textarea');
            if (value === null) {
                $textarea!.removeAttribute('readonly');
            } else {
                $textarea!.setAttribute('readonly', value);
            }
        },
        disabled(value) {
            const $textarea = this.querySelector('textarea');
            if (value === null) {
                $textarea!.removeAttribute('readonly');
            } else {
                $textarea!.setAttribute('readonly', value);
            }
        },
    },

    data: {
        value: '',
    },

    onInit() {
        const $textarea = this.querySelector('textarea') as HTMLTextAreaElement

        let value = '';

        // ---- TextArea ----
        $textarea!.addEventListener('input', (event) => {
            this.data.setProperty('value', $textarea.value);
            this.dispatch('change');
        });
        $textarea!.addEventListener('change', (event) => {
            value = $textarea.value;
            this.data.setProperty('value', value);
            this.setAttribute('value', value);
            this.dispatch('confirm');
        });
        $textarea!.addEventListener('focus', (event) => {
            value = this.data.getProperty('value');
        });
        $textarea!.addEventListener('keydown', (event) => {
            switch(event.key) {
                case 'Escape': {
                    event.stopPropagation();
                    event.preventDefault();
                    if ($textarea.value !== value) {
                        $textarea.value = value;
                        this.data.setProperty('value', value);
                        this.dispatch('cancel');
                    }
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