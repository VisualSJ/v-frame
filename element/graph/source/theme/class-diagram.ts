'use strict';

import '../index';
import { BaseElement } from '@itharbors/ui-core';
import { registerLine, registerNode, registerGraphFilter, registerGraphOption } from '../manager';

function getAngle(x1: number, y1: number, x2: number, y2: number) {
    const deltaX = x2 - x1;
    const deltaY = y2 - y1;
    const angleRadians = Math.atan2(deltaY, deltaX);
    const angleDegrees = angleRadians * 180 / Math.PI;
    return angleDegrees;
}

registerGraphOption('class-diagram', {
    type: 'pure',
    backgroundColor: '#2f2f2f',
});

// 继承、泛化
registerLine('class-diagram', 'inheritance', {
    template: /*svg*/`
        <path d=""></path>
        <polygon points=""></polygon>
    `,
    style: /*css*/`
        g[type="inheritance"] > path, g[type="straight"] > polygon {
            fill: none;
            stroke: #fafafa;
            stroke-width: 1px;
        }
        g[type="inheritance"] > polygon {
            fill: none;
            stroke: #fafafa;
        }
    `,
    updateSVGPath($g, scale, info) {
        const angle = getAngle(info.x1, info.y1, info.x2, info.y2);
        console.log(angle)
        const c1x = info.x2; // 三角形顶点坐标
        const c1y = info.y2;

        const c2x = c1x + 6;
        const c2y = c1y - 10;

        const c3x = c1x - 6;
        const c3y = c1y - 10;

        const b = 10 * Math.cos((180 - angle) * Math.PI / 180);
        const a = 10 * Math.sin(180 - angle);

        const $path = $g.querySelector(`path`)!;
        $path.setAttribute('d', `M${info.x1},${info.y1} L${info.x2 + a},${info.y2 + b}`);

        const $polygon = $g.querySelector(`polygon`)!;
        $polygon.setAttribute('points', `${c1x},${c1y} ${c2x},${c2y} ${c3x},${c3y}`);
        $polygon.setAttribute('style', `transform-origin: ${c1x}px ${c1y}px; transform: rotate(${angle - 90}deg)`);
    },
});

// 成分、组成
registerLine('class-diagram', 'composition', {
    template: /*svg*/`
        <path d=""></path>
        <polygon points=""></polygon>
    `,
    style: /*css*/`
        g[type="composition"] > path, g[type="straight"] > polygon {
            fill: none;
            stroke: #fafafa;
            stroke-width: 1px;
        }
        g[type="composition"] > polygon {
            fill: #fafafa;
        }
    `,
    updateSVGPath($g, scale, info) {
        const angle = getAngle(info.x1, info.y1, info.x2, info.y2);
        const c1x = info.x2; // 三角形顶点坐标
        const c1y = info.y2;

        const c2x = c1x + 6;
        const c2y = c1y - 10;

        const c3x = c1x - 6;
        const c3y = c1y - 10;

        const c4x = c1x;
        const c4y = c1y - 20;
        const $path = $g.querySelector(`path`)!;
        $path.setAttribute('d', `M${info.x1},${info.y1} L${info.x2},${info.y2}`);

        const $polygon = $g.querySelector(`polygon`)!;
        $polygon.setAttribute('points', `${c1x},${c1y} ${c2x},${c2y} ${c4x},${c4y} ${c3x},${c3y}`);
        $polygon.setAttribute('style', `transform-origin: ${c1x}px ${c1y}px; transform: rotate(${angle - 90}deg)`);
    },
});

// 继承、泛化
registerLine('class-diagram', 'aggregation', {
    template: /*svg*/`
        <path d=""></path>
        <polygon points=""></polygon>
    `,
    style: /*css*/`
        g[type="aggregation"] > path, g[type="straight"] > polygon {
            fill: none;
            stroke: #fafafa;
            stroke-width: 1px;
        }
        g[type="aggregation"] > polygon {
            fill: none;
            stroke: #fafafa;
        }
    `,
    updateSVGPath($g, scale, info) {
        const angle = getAngle(info.x1, info.y1, info.x2, info.y2);
        const c1x = info.x2; // 三角形顶点坐标
        const c1y = info.y2;

        const c2x = c1x + 6;
        const c2y = c1y - 10;

        const c3x = c1x - 6;
        const c3y = c1y - 10;

        const c4x = c1x;
        const c4y = c1y - 20;
        const $path = $g.querySelector(`path`)!;
        $path.setAttribute('d', `M${info.x1},${info.y1} L${info.x2},${info.y2}`);

        const $polygon = $g.querySelector(`polygon`)!;
        $polygon.setAttribute('points', `${c1x},${c1y} ${c2x},${c2y} ${c4x},${c4y} ${c3x},${c3y}`);
        $polygon.setAttribute('style', `transform-origin: ${c1x}px ${c1y}px; transform: rotate(${angle - 90}deg)`);
    },
});


// 节点
registerNode('class-diagram', 'class-node', {
    template: /*html*/`
      <header class="class-name"></header>
      <section class="property"></section>
      <section class="function"></section>
    `,

    style: /*css*/`
      :host {
        background: #2b2b2bcc;
        border: 1px solid #333;
        border-radius: 4px;
        color: #ccc;
        transition: box-shadow 0.2s, border 0.2s;
      }
      :host(:hover) {
        border-color: white;
        box-shadow: 0px 0px 14px 2px white;
      }
      header {
        background: #227f9b;
        border-radius: 4px 4px 0 0;
        padding: 4px 10px;
        text-align: center;
      }
      section {
        min-height: 20px;
        border-left: 1px solid #666;
        border-right: 1px solid #666;
        border-bottom: 1px solid #666;
        padding: 4px 0;
      }
      section > div {
        padding: 2px 10px;
      }
    `,

    onInit(details) {
        const $elem = this as unknown as BaseElement;
        $elem.querySelector('.class-name')!.innerHTML = details.name;

        const updateHTML = (type: string, list: string[]) => {
            let HTML = ``;
            for (const item of list) {
            HTML += `<div>${item}</div>`;
            }
            $elem.querySelector(`.${type}`)!.innerHTML = HTML;
        }
        $elem.data.addPropertyListener('details', (details) => {
            updateHTML('property', details.property);
        });
        updateHTML('property', details.property);

        $elem.data.addPropertyListener('details', (details) => {
            updateHTML('function', details.function);
        });
        updateHTML('function', details.function);

        $elem.addEventListener('connect-line', (event: any) => {
            event.stopPropagation();
            event.preventDefault();
            const { node, param, paramDirection } = event.detail;
            // @ts-ignore
            $elem.methods
                .startConnect('curve', param, paramDirection);
        });
    },
  });