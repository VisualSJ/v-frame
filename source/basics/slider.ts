'use strict';

import { createElement, style } from '../core/index.js';

createElement('slider', {
    template: /*html*/`
<span class="slideway">
    <span>
        <span class="block"></span>
    </span>
</span>
    `,

    style: /*css*/`
${style.solid}
${style.line}

:host {
    --slideway-width: calc(var(--size-font) * 0.5px);
    --slideway-background-color: var(--color-default);
    --slider-block: calc(var(--size-font) * 1.4px);

    width: 150px;
    height: var(--line-height);
}
.slideway {
    flex: 1;
    height: var(--slideway-width);
    background: var(--slideway-background-color);
    margin: auto;
    border-radius: var(--slideway-width);
    box-shadow: inset 0px 0px 1px #666;
    padding-right: var(--slider-block);
    display: flex;
}
.slideway > span {
    flex: 1;
    position: relative;
}
.block {
    position: absolute;
    box-shadow: inset 0px 0px 1px #666;
    width: var(--slider-block);
    height: var(--slider-block);
    border-radius: var(--slider-block);
    background: var(--background-color);
    top: calc((var(--slider-block) - var(--slideway-width)) * -0.5);
    cursor: pointer;
}
    `,

    attrs: {
        value(value, legacy) {

        },
        readonly(value, legacy) {

        },
        disabled(value, legacy) {

        },
        step(value, legacy) {

        },
        min(value, legacy) {

        },
        max(value, legacy) {

        },
    },

    data: {
        min: 0,
        max: 100,
        step: 1,
    },

    onInit() {

    },

    onMounted() {

    },

    onRemoved() {

    },
});