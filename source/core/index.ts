'use strict';

import './theme.js';
import { BaseElement } from './element.js';

interface IFrameOptions {
    template: string;
    style: string;

    attrs: {
        [key: string]: (this: BaseElement, value: string, legacy: string) => void;
    },

    data: {
        [key: string]: string | number | boolean | object;
    },

    onInit(this: BaseElement): void;
    onMounted(this: BaseElement): void;
    onRemoved(this: BaseElement): void;
}

export function createElement(name: string, options: IFrameOptions) {

    class CustomElement extends BaseElement {
        static get observedAttributes(): string[] {
            return Object.keys(options.attrs);
        }
    
        protected HTMLTemplate: string = options.template;
        protected HTMLStyle: string = options.style;
    
        constructor() {
            super();
            this.initialize();

            for (let key in options.attrs) {
                this.data.addAttributeEventener(key, options.attrs[key]);
            }
            this.data.stash = JSON.parse(JSON.stringify(options.data));
        }
    
        protected onInit() {
            options.onInit.call(this);
        };
    
        protected onMounted() {
            options.onMounted.call(this);
        };
    
        protected onRemoved() {
            options.onRemoved.call(this);
        };
    
    }

    window.customElements.define(`v-${name}`, CustomElement);
}

export const style = {
    /**
     * 实心样式
     */
    solid: /*css*/`
    :host {
        --background-color: var(--color-default);
        --font-color: var(--color-default-contrast);
        --border-color: var(--color-default-line);
    }
    :host([color="primary"]) {
        --background-color: var(--color-primary);
        --font-color: var(--color-primary-contrast);
        --border-color: var(--color-primary-line);
    }
    :host([color="success"]) {
        --background-color: var(--color-success);
        --font-color: var(--color-success-contrast);
        --border-color: var(--color-success-line);
    }
    :host([color="danger"]) {
        --background-color: var(--color-danger);
        --font-color: var(--color-danger-contrast);
        --border-color: var(--color-danger-line);
    }
    :host([color="wranning"]) {
        --background-color: var(--color-wranning);
        --font-color: var(--color-wranning-contrast);
        --border-color: var(--color-wranning-line);
    }
    :host([disabled]) {
        opacity: 0.4;
    }
    :host([disabled]), :host([readonly]) {
        cursor: not-allowed;
    }
    `,

    /**
     * 空心样式
     */
    hollow: /*css*/`
    :host {
        --background-color: transparent;
        --font-color: var(--color-default-contrast);
        --border-color: var(--color-default-line);
    }
    :host([color="primary"]) {
        --font-color: var(--color-primary);
        --border-color: var(--color-primary-line);
    }
    :host([color="success"]) {
        --font-color: var(--color-success);
        --border-color: var(--color-success-line);
    }
    :host([color="danger"]) {
        --font-color: var(--color-danger);
        --border-color: var(--color-danger-line);
    }
    :host([color="wranning"]) {
        --font-color: var(--color-wranning);
        --border-color: var(--color-wranning-line);
    }
    :host([disabled]) {
        opacity: 0.4;
    }
    :host([disabled]), :host([readonly]) {
        cursor: not-allowed;
    }
    `,
    
    line: /*css*/`
    :host {
        display: inline-flex;
    
        --line-height: calc(var(--size-line) * 1px);
        --font-size: calc(var(--size-font) * 1px);
    
        --padding-row: calc((var(--size-line) - var(--size-font)) * 0.8px);
        --padding-column: calc((var(--size-line) - var(--size-font)) * 0.2px);
    }
    `,
};
