'use strict';

import { createElement, style } from '../core/index.js';

createElement('switch', {
    template: /*html*/`
<div>
    <span class="flag">
        <span></span>
    </span>
</div>
<slot></slot>
    `,

    style: /*css*/`
${style.hollow}
${style.line}

:host {
    --bar-height: calc(var(--size-line) * 0.8px);
    --bar-width: calc(var(--size-line) * 1.4px);
    --bar-offset: calc(var(--size-line) * 0.6px);
    --slider-background: var(--color-default);

    cursor: pointer;
    box-sizing: border-box;
    line-height: var(--line-height);
}
:host > div {
    line-height: var(--line-height);
    font-size: var(--font-size);
    padding: 0 var(--padding-row);
}
:host > div > span {
    display: inline-block;
    position: relative;
    top: 1px;
    height: var(--bar-height);
    width: var(--bar-width);
    border-radius: var(--bar-width);
    box-shadow: inset 0px 0px 1px #666;
    transition: background-color 0.3s;
    background-color: var(--button-color);
}
:host > div > span > span {
    position: absolute;
    left: 0;
    display: inline-block;
    height: var(--bar-height);
    width: var(--bar-height);
    border-radius: var(--bar-height);
    box-shadow: inset 0px 0px 1px #666;
    transition: left 0.3s;
    background-color: var(--slider-background);
}
:host > div > span[checked] {
    background-color: var(--font-color);
}
:host > div > span[checked] > span {
    left: var(--bar-offset);
}
:host > slot {
    display: inline-block;
    line-height: var(--line-height);
    font-size: var(--font-size);
    color: var(--font-color);
}
    `,

    attrs: {
        value(value) {
            if (value === null || value === 'false') {
                this.setProperty('value', false);
            } else {
                this.setProperty('value', true);
            }
        },
    },

    data: {
        value: false,
    },

    onInit() {
        this.addEventListener('click', () => {
            const bool = this.data.getProperty('value');
            this.data.setProperty('value', !bool);
        });

        const $flag = this.querySelector('.flag');
        this.data.addPropertyEventener('value', (value) => {
            if (value) {
                $flag!.setAttribute('checked', '');
            } else {
                $flag!.removeAttribute('checked');
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