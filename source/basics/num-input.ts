'use strict';

import { createElement, style } from '../core/index.js';

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
${style.hollow}
${style.line}

:host {
    width: 150px;
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
            const num = parseStringToNumber(value, this.data.stash.min, this.data.stash.max);
            const $input = this.querySelector('input');
            $input!.setAttribute('value', num + '');
            this.data.setProperty('value', num);
        },
        readonly(value, legacy) {
            const $input = this.querySelector('input');
            if (value === null) {
                $input!.removeAttribute('readonly');
            } else {
                $input!.setAttribute('readonly', value);
            }
        },
        disabled(value, legacy) {
            const $input = this.querySelector('input');
            if (value === null) {
                $input!.removeAttribute('readonly');
            } else {
                $input!.setAttribute('readonly', value);
            }
        },
        step(value, legacy) {
            const num = parseStringToNumber(value);
            this.data.setProperty('step', num);
        },
        min(value, legacy) {
            const num = parseStringToNumber(value);
            this.data.setProperty('min', num);
        },
        max(value, legacy) {
            const num = parseStringToNumber(value);
            this.data.setProperty('max', num);
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
            const num = parseStringToNumber($input.value, this.data.stash.min, this.data.stash.max);
            this.data.setProperty('value', num);
            this.dispatch('change');
        });
        $input!.addEventListener('change', (event) => {
            try {
                const num = eval($input.value);
                value = num;
                $input!.value = value + '';
                this.data.setProperty('value', value);
                this.setAttribute('value', value.toString());
            } catch(error) {
                const num = parseStringToNumber($input.value, this.data.stash.min, this.data.stash.max);
                value = num;
                $input!.value = value + '';
                this.data.setProperty('value', value);
                this.setAttribute('value', value.toString());
            }
            this.dispatch('confirm');
        });
        $input!.addEventListener('focus', (event) => {
            value = this.data.getProperty('value');
        });

        let timer: number | null | NodeJS.Timer = null;
        const addition = () => {
            const exec = () => {
                const legacy = this.data.getProperty('value');
                const num = legacy + this.data.stash.step;
                this.data.setProperty('value', num);
                $input.value = num.toString();
            }
            exec();
            (timer !== null) && clearInterval(timer);
            timer = setInterval(() => {
                (timer !== null) && clearInterval(timer);
                timer = setInterval(() => {
                    exec();
                }, 40);
            }, 500);
        }

        const subtraction = () => {
            const exec = () => {
                const legacy = this.data.getProperty('value');
                const num = legacy - this.data.stash.step;
                this.data.setProperty('value', num);
                $input.value = num.toString();
            }
            exec();
            (timer !== null) && clearInterval(timer);
            timer = setInterval(() => {
                (timer !== null) && clearInterval(timer);
                timer = setInterval(() => {
                    exec();
                }, 40);
            }, 500);
        }

        $input!.addEventListener('keydown', (event) => {
            if (
                this.hasAttribute('readonly') ||
                this.hasAttribute('disabled')
            ) {
                event.stopPropagation();
                event.preventDefault();
                return;
            }
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
                    break;
                }
                case 'ArrowUp': {
                    event.stopPropagation();
                    event.preventDefault();
                    addition();
                    break;
                }
                case 'ArrowDown': {
                    event.stopPropagation();
                    event.preventDefault();
                    subtraction();
                    break;
                }
            }
        });
        $input!.addEventListener('keyup', (event) => {
            (timer !== null) && clearInterval(timer);
        });
        $input!.addEventListener('blur', () => {
            (timer !== null) && clearInterval(timer);
        });

        $add!.addEventListener('mousedown', (event) => {
            event.stopPropagation();
            event.preventDefault();
            if (
                this.hasAttribute('readonly') ||
                this.hasAttribute('disabled')
            ) {
                return;
            }
            addition();
            document.addEventListener('mouseup', () => {
                (timer !== null) && clearInterval(timer);
            });
        });

        $subtract!.addEventListener('mousedown', (event) => {
            event.stopPropagation();
            event.preventDefault();
            if (
                this.hasAttribute('readonly') ||
                this.hasAttribute('disabled')
            ) {
                return;
            }
            subtraction();
            document.addEventListener('mouseup', () => {
                (timer !== null) && clearInterval(timer);
            });
        });
    },

    onMounted() {

    },

    onRemoved() {

    },
});

function parseStringToNumber(str: string, min?: number, max?: number) {
    let num = parseFloat(str);
    if (isNaN(num)) {
        return 0;
    }
    if (min !== undefined) {
        num = Math.max(num, min);
    }
    if (max !== undefined) {
        num = Math.min(num, max);
    }
    return num;
}