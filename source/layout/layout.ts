'use strict';

import { createElement } from '../core';

createElement('layout', {
    template: /*html*/`
<slot></slot>
    `,

    style: /*css*/`
:host {
    display: block;
    --space-column: 4px;
    --space-row: 4px;
}
:host > slot {
    display: flex;
}
:host > slot > * {
    margin-bottom: var(--space-row);
    margin-right: var(--space-column);
}
:host > slot > *:last-child {
    margin-bottom: 0;
    margin-right: 0;
}

:host([direction="row"]) > slot {
    flex-direction: row;
}

:host([direction="column"]) > slot {
    flex-direction: column;
}
    `,

    attrs: {
        /**
         * row 横向布局
         * column 纵向布局
         */
        // direction() {}
    },

    data: {},

    onInit() {

    },

    onMounted() {

    },

    onRemoved() {

    },
});