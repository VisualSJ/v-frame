'use strict';

const $style = document.createElement('style');
$style.innerHTML = /*css*/`
body {
    --color-default: #333;
    --color-primary: #1677ff;
    --color-success: #00b578;
    --color-danger: #ff3141;
    --color-wranning: #ff8f1f;

    --color-background: #fff;

    --size-line: 24;
    --size-font: 12;

    --anim-duration: 0.3s;
}
`;

document.head.appendChild($style);