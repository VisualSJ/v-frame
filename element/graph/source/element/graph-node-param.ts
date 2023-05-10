'use strict';

import { createElement, BaseElement, style, CustomElementOption } from '@itharbors/ui-core';

class GraphNodeParamOption extends CustomElementOption {
    template = /*html*/`<slot></slot>`;
    style = /*css*/`:host { display: block; position: relative; }`;
    attrs = {};
    data = {};
    methods = {};
    onInit(this: BaseElement & this) {}
}

export const GraphNodeParamElement = createElement('graph-node-param', GraphNodeParamOption);
