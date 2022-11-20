'use strict';

import { createElement } from '../core';

createElement('num-input', {
    template: /*html*/`
<input value="0" />
<div>
    <svg class="add" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
        <path d="M201.4 137.4c12.5-12.5 32.8-12.5 45.3 0l160 160c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L224 205.3 86.6 342.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l160-160z"/>
    </svg>
    <svg class="subtract" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
        <path d="M201.4 137.4c12.5-12.5 32.8-12.5 45.3 0l160 160c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L224 205.3 86.6 342.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l160-160z"/>
    </svg>
</div>
    `,
    style: /*css*/`
:host {
    --font-color: var(--color-default);
    --border-color: var(--color-default);

    --line-height: calc(var(--size-line) * 1px);
    --bar-width: calc(var(--size-line) * 0.5px);
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
    width: 150px;
    display: inline-flex;
    border-radius: 2px;
    height: var(--line-height);
    line-height: var(--line-height);
    border: 1px solid var(--border-color);
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
:host > div {
    display: flex;
    flex-direction: column;
    width: 0;
    opacity: 0;
    border-left: 1px solid var(--border-color);
    transition: width var(--anim-duration), opacity var(--anim-duration);
}
:host(:hover) > div {
    opacity: 1;
    width: var(--bar-width);
}
:host > div > svg {
    flex: 1;
    padding: 2px 0;
    box-sizing: border-box;
    fill: var(--border-color);
    cursor: pointer;
}
:host > div > svg:last-child {
    transform: rotate(180deg);
}
:host > div > svg:hover {
    background: #ccc;
}
    `,

    attrs: {
        // size() {},
        // color() {},
        value(value, legacy) {
            const num = parseStringToNumber(value);
            const $input = this.querySelector('input');
            $input!.setAttribute('value', num + '');
            this.data.setProperty('value', num);
        },
        step(value, legacy) {
            const num = parseStringToNumber(value);
            this.data.setProperty('step', num);
        },
    },

    data: {
        value: 0,
        step: 1,
    },

    onInit() {
        const $input = this.querySelector('input') as HTMLInputElement;
        const $add = this.querySelector('.add') as SVGElement;
        const $subtract = this.querySelector('.subtract') as SVGElement;

        let value = 0;

        $input!.addEventListener('input', (event) => {
            const num = parseStringToNumber($input.value);
            this.data.setProperty('value', num);
            this.dispatch('change');
        });
        $input!.addEventListener('change', (event) => {
            try {
                const num = eval($input.value);
                value = num;
                $input!.value = value + '';
                this.data.setProperty('value', value);
            } catch(error) {
                const num = parseStringToNumber($input.value);
                value = num;
                $input!.value = value + '';
                this.data.setProperty('value', value);
            }
            this.dispatch('confirm');
        });
        $input!.addEventListener('focus', (event) => {
            value = this.data.getProperty('value');
        });
        $input!.addEventListener('keydown', (event) => {
            switch(event.key) {
                // esc 还原正在输入的数据到上一次确认的状态
                case 'Escape': {
                    event.stopPropagation();
                    event.preventDefault();
                    const num = parseStringToNumber($input.value);
                    if (value !== num) {
                        // console.log('cancel', value);
                        $input.value = value + '';
                        this.data.setProperty('value', value);
                        this.dispatch('cancel');
                    }
                }
            }
        });

        $add!.addEventListener('mousedown', (event) => {
            const timer = setInterval(() => {
                const num = this.data.getProperty('value');
                this.data.setProperty('value', num + this.data.stash.step);
            }, 20);
            document.addEventListener('mouseup', () => {
                clearInterval(timer);
            });
        });

        $subtract!.addEventListener('mousedown', (event) => {
            const timer = setInterval(() => {
                const num = this.data.getProperty('value');
                this.data.setProperty('value', num - this.data.stash.step);
            }, 20);
            document.addEventListener('mouseup', () => {
                clearInterval(timer);
            });
        });
    },

    onMounted() {

    },

    onRemoved() {

    },
});

function parseStringToNumber(str: string) {
    const num = parseFloat(str);
    if (isNaN(num)) {
        return 0;
    }
    return num;
}