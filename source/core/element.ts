'use strict';

/**
 * 框架基础元素
 * 其他元素都继承自这个元素，职责包含：
 *   1. 管理定义生命周期函数
 *   2. 数据管理（data、attribute）
 */
export class BaseElement extends HTMLElement {
    /**
     * @description 监听 attribute 修改
     */
    static get observedAttributes(): string[] {
        return [];
    }

    protected HTMLTemplate: string = '';
    protected HTMLStyle: string = '';

    querySelector(selector: string) {
        return this.shadowRoot.querySelector(selector);
    }

    dispatch(eventName: string, options?: EventInit) {
        const targetOptions = {
            bubbles: true,
            cancelable: true,
        };
        if (options) {
            Object.assign(targetOptions, options);
        }
        const event = new CustomEvent(eventName, targetOptions);
        this.dispatchEvent(event);
    }

    protected initialize() {
        this.shadowRoot.innerHTML = `<style>${this.HTMLStyle}</style>${this.HTMLTemplate}`;
        this.onInit();
        if (this.isConnected) {
            this.onMounted();
        }
    }

    protected onInit() {};
    protected onMounted() {};
    protected onRemoved() {};

    public data = new DataManager(this);

    public shadowRoot!: ShadowRoot;

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    attributeChangedCallback(key: string, legacy: string, value: string) {
        this.data.emitAttribute(key, value, legacy);
    }

    connectedCallback() {
        this.onMounted();
    }

    distconnectedCallback() {
        this.onRemoved();
    }
}

class DataManager {
    private root: BaseElement;
    constructor(root: BaseElement) {
        this.root = root;
    }

    stash: { [key: string]: any } = {};
    private propertyEventMap: { [key: string]: ((value: any, legacy: any) => void)[]} = {};
    touchProperty(key: string) {
        const legacy = this.getProperty(key);
        this.emitProperty(key, legacy, legacy);
    }
    getProperty(key: string) {
        return this.stash[key];
    }
    setProperty(key: string, value: any) {
        const legacy = this.stash[key];
        if (this.stash[key] === value) {
            return;
        }
        this.stash[key] = value;
        this.emitProperty(key, value, legacy);
    }
    addPropertyEventener(key: string, handle: (value: any, legacy: any) => void) {
        const list = this.propertyEventMap[key] = this.propertyEventMap[key] || [];
        list.push(handle);
    }
    emitProperty(key: string, value: any, legacy: any) {
        const list = this.propertyEventMap[key];
        if (!list) {
            return;
        }
        list.forEach((func) => {
            func.call(this.root, value, legacy);
        });
    }

    private attributeEventMap: { [key: string]: ((value: any, legacy: any) => void)[]} = {};
    touchAttribute(key: string) {
        const legacy = this.getAttribute(key);
        this.emitAttribute(key, legacy, legacy);
    }
    getAttribute(key: string) {
        return this.root.getAttribute(key) || '';
    }
    setAttribute(key: string, value: string) {
        const legacy = this.getAttribute(key);
        this.root.setAttribute(key, value);
        this.emitAttribute(key, value, legacy);
    }
    addAttributeEventener(key: string, handle: (value: string, legacy: string) => void) {
        const list = this.attributeEventMap[key] = this.attributeEventMap[key] || [];
        list.push(handle);
    }
    emitAttribute(key: string, value: string, legacy: string) {
        const list = this.attributeEventMap[key];
        if (!list) {
            return;
        }
        list.forEach((func) => {
            func.call(this.root, value, legacy);
        });
    }

    // setSchema(schema: any) {}
}
