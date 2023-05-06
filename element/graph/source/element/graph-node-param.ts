'use strict';

import { createElement, BaseElement, style } from '@itharbors/ui-core';

export const GraphNodeParamElement = createElement('graph-node-param', {
    template: /*html*/`<slot></slot>`,
    style: /*css*/`
:host { display: block; position: relative; }
    `,

    attrs: {},

    data: {} as {},

    methods: {},

    onInit() {
        // 开始连接其他参数
        this.addEventListener('mousedown', (event) => {
            event.stopPropagation();
            event.preventDefault();

            const name = this.data.getAttribute('name');
            if (!name) {
                return;
            }
            const paramDirection = this.data.getAttribute('direction');
            if (paramDirection !== 'input' && paramDirection !== 'output') {
                return;
            }
            const custom = new CustomEvent('connect-line', {
                bubbles: true,
                cancelable: true,
                detail: {
                    param: name,
                    paramDirection,
                },
            });
            this.dispatchEvent(custom);
        });
    },

    onMounted() {

    },

    onRemoved() {

    },
});