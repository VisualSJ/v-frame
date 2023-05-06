'use strict';

class VirtualHTMLElement {
    tagName: string;

    constructor(name: string) {
        this.tagName = name;
    }

    querySelector(selector: string) {

    }

    appendChild(elem: VirtualHTMLElement) {

    }

    setAttribute(key: string, value: string) {

    }

    setProperty(key: string, value: any) {

    }

    addEventListener(name: string, handle: Function) {

    }
}

export const createHTMLElement = function (name): VirtualHTMLElement {
    return new VirtualHTMLElement(name);
}
