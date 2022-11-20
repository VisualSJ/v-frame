'use strict';

import './theme';
import { BaseElement } from './element';

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
