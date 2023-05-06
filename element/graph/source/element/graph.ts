'use strict';

import { createElement, BaseElement, style } from '@itharbors/ui-core';

import { NodeInfo, LineInfo, ParamConnectData, GraphOption } from '../interface';
import { intersect, getParamElementOffset, generateUUID, queryParamInfo } from './utils';
import { queryLine, queryGraphFliter, queryGraphOption } from '../manager';

const nodeToElem: WeakMap<NodeInfo, HTMLElement> = new WeakMap();

const graphUtils = {

    resizeCanvas($elem: BaseElement, $canvas: HTMLCanvasElement, box: {width: number, height: number}) {
        $canvas.setAttribute('width', box.width + '');
        $canvas.setAttribute('height', box.height + '');

        const calibration = $elem.data.getProperty('calibration') as { x: number, y: number, };
        calibration.x = box.width / 2;
        calibration.y = box.height / 2;
        $elem.data.emitProperty('calibration', calibration, calibration);
    },

    renderMesh($elem: BaseElement, ctx: CanvasRenderingContext2D, box: {width: number, height: number}, offset: {x: number, y: number}, scale: number, option: GraphOption) {
        $elem.setAttribute('style', `--background-color: ${option.backgroundColor};`);
        const step = (option.meshSize || 50) * scale;

        ctx.clearRect(0, 0, box.width, box.height);
        if (option.type === 'mesh') {
            const center = {
                x: Math.round(box.width / 2) + 0.5 + offset.x,
                y: Math.round(box.height / 2) + 0.5 + offset.y,
            };

            if (option.originPoint) {
                ctx.beginPath();
                ctx.fillStyle = option.originColor || '#ccc';
                ctx.arc(center.x, center.y, 5 * scale, 0, 2 * Math.PI, true);
                ctx.fill();
                ctx.closePath();
            }

            ctx.beginPath();
    
            ctx.lineWidth = 1;
    
            ctx.fill();

            ctx.moveTo(center.x, 0);
            ctx.lineTo(center.x, box.height);
    
            ctx.moveTo(0, center.y);
            ctx.lineTo(box.width, center.y);
    
            ctx.closePath();
            ctx.strokeStyle = option.originColor || '#ccc';
            ctx.lineWidth = 1;
            ctx.stroke();
    
            ctx.beginPath();
    
            let x = center.x;
            do {
                x = x - step;
                ctx.moveTo(x, 0);
                ctx.lineTo(x, box.height);
            } while (x > 0);
    
            x = center.x;
            do {
                x = x + step;
                ctx.moveTo(x, 0);
                ctx.lineTo(x, box.height);
            } while (x < box.width);
    
            let y = center.y;
            do {
                y = y - step;
                ctx.moveTo(0, y);
                ctx.lineTo(box.width, y);
            } while (y > 0);
    
            y = center.y;
            do {
                y = y + step;
                ctx.moveTo(0, y);
                ctx.lineTo(box.width, y);
            } while (y < box.height);
    
            ctx.closePath();
            ctx.strokeStyle =  option.meshColor || '#666';
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    },

    renderNodes($elem: BaseElement, offset: {x: number, y: number}, scale: number) {
        const $nodes = $elem.querySelectorAll('#nodes > v-graph-node');
        const nodes = $elem.data.getProperty('nodes') as { [key: string]: NodeInfo | undefined  };
        const graphType = $elem.data.getAttribute('type') || 'default';

        const $root = $elem.querySelector('#nodes')!;
        // $root.setAttribute('style', `--offset-x: ${offset.x}px; --offset-y: ${offset.y}px; --scale: ${scale};`);

        const refreshFlag = new Set();
        // 循环已有的 HTML 节点
        for (let i = 0; i < $nodes.length; i++) {
            const $node = $nodes[i] as BaseElement;
            const uuid = $node.getAttribute('node-uuid') || '';
            const node = nodes[uuid];

            refreshFlag.add(uuid);
            if (!node) {
                // 删除数据不存在的 HTML 节点
                $node.remove();
            } else {
                // 更新已存在的节点内的数据
                $node.data.setAttribute('node-uuid', uuid);
                $node.data.setProperty('scale', scale);
                $node.data.setProperty('graphType', graphType);
                $node.data.setProperty('type', node.type);
                $node.data.setProperty('position', node.position);
                $node.data.setProperty('details', node.details);
            }
        }

        // 循环 nodes 数据，新增数据的话，创建新节点
        for (const uuid in nodes) {
            const node = nodes[uuid];
            if (!node || refreshFlag.has(uuid)) {
                continue;
            }
            const $node = document.createElement('v-graph-node') as BaseElement;

            // 关联数据
            nodeToElem.set(node, $node);

            $node.data.setAttribute('node-uuid', uuid);
            $node.data.setProperty('scale', scale);
            $node.data.setProperty('graphType', graphType);
            $node.data.setProperty('type', node.type);
            $node.data.setProperty('position', node.position);
            $node.data.setProperty('details', node.details);

            $node.data.addPropertyListener('position', (reOffset) => {
                node.position = reOffset;
                const scale = $elem.data.getProperty('scale');
                this.renderNodes($elem, offset, scale);
                this.renderLines($elem, offset, scale);
            });

            $root.appendChild($node);
        }
    },

    renderLine(graphType: string, $line: SVGGElement, line: LineInfo, nodes: { [key: string]: NodeInfo | undefined }, scale: number) {
        const nodeA = line.input.__fake || nodes[line.input.node];
        const nodeB = line.output.__fake || nodes[line.output.node];

        if (!nodeA || !nodeB) {
            return;
        }

        const $nodeA = nodeToElem.get(nodeA);
        const $nodeB = nodeToElem.get(nodeB);

        const d: ParamConnectData = {
            x1: nodeA.position.x,
            y1: nodeA.position.y,
            x2: nodeB.position.x,
            y2: nodeB.position.y,

            r1: 'all',
            r2: 'all',

            d1: 1,
            d2: 1,
        };

        let flagA = false;
        if ($nodeA && line.input.param) {
            const offset = getParamElementOffset($nodeA, `v-graph-node-param[name="${line.input.param}"]`, scale);
            if (offset) {
                flagA = true;
                d.x1 += offset.x;
                d.y1 += offset.y;
                d.r1 = offset.role;
            }
        } 
        
        if ($nodeA && flagA === false) {
            const boundA = $nodeA!.getBoundingClientRect();
            boundA.width /= scale;
            boundA.height /= scale;
            const pa = intersect(d.x1, d.y1, d.x2, d.y2, nodeA.position.x - boundA.width / 2, nodeA.position.y - boundA.height / 2, boundA.width, boundA.height)!;
            d.x1 = pa[0];
            d.y1 = pa[1];
            d.d1 = pa[2];
        }

        let flagB = false;
        if ($nodeB && line.output.param) {
            const offset = getParamElementOffset($nodeB, `v-graph-node-param[name="${line.output.param}"]`, scale);
            if (offset) {
                flagB = true;
                d.x2 += offset.x;
                d.y2 += offset.y;
                d.r2 = offset.role;
            }
        }
        
        if ($nodeB && flagB === false) {
            const boundB = $nodeB!.getBoundingClientRect();
            boundB.width /= scale;
            boundB.height /= scale;
            const pb = intersect(d.x2, d.y2, d.x1, d.y1, nodeB.position.x - boundB.width / 2, nodeB.position.y - boundB.height / 2, boundB.width, boundB.height)!;
            d.x2 = pb[0];
            d.y2 = pb[1];
            d.d2 = pb[2];
        }

        const lineAdapter = queryLine(graphType, line.type);
        lineAdapter.updateSVGPath($line, 1, d);
    },

    renderLines($elem: BaseElement, offset: {x: number, y: number }, scale: number) {
        const graphType = $elem.data.getAttribute('type') || 'default';
        const lines = $elem.data.getProperty('lines') as { [key: string]: LineInfo | undefined  };
        const nodes = $elem.data.getProperty('nodes') as { [key: string]: NodeInfo | undefined  };
        const $lines = $elem.querySelectorAll('#lines > g[line-uuid]');
        const $root = $elem.querySelector('#lines')!;

        const refreshFlag = new Set();
        for (let i = 0; i < $lines.length; i++) {
            const $line = $lines[i] as SVGPathElement;
            const uuid = $line.getAttribute('line-uuid') || '';
            const line = lines[uuid];

            refreshFlag.add(uuid);
            if (!line) {
                // 删除数据不存在的 HTML 节点
                $line.remove();
            } else {
                // 更新已存在的节点内的数据
                $line.setAttribute('line-uuid', uuid);
                this.renderLine(graphType, $line, line, nodes, scale);
            }
        }
        
        
        // 循环 nodes 数据，新增数据的话，创建新节点
        for (const uuid in lines) {
            const line = lines[uuid];
            if (!line || refreshFlag.has(uuid)) {
                continue;
            }
            const $line = document.createElementNS('http://www.w3.org/2000/svg', 'g') as SVGGElement;
            $line.setAttribute('line-uuid', uuid);
            const lineAdapter = queryLine(graphType, line.type);

            const $style = $elem.querySelector(`style[line-type="${line.type}"]`);
            if (!$style) {
                const $style = document.createElement('style');
                $style.innerHTML = lineAdapter.style;
                $elem.shadowRoot.appendChild($style);
            }

            $line.setAttribute('type', line.type);
            $line.innerHTML = lineAdapter.template;
            this.renderLine(graphType, $line, line, nodes, scale);
            $root.appendChild($line);
        }
    },

    bindEventListener($elem: BaseElement) {
        // 阻止右键菜单
        $elem.addEventListener('contextmenu', (event) => {
            event.stopPropagation();
            event.preventDefault();
        });

        // 拖拽移动
        $elem.addEventListener('mousedown', (event) => {
            event.stopPropagation();
            event.preventDefault();

            const offset = $elem.data.getProperty('offset');
            if (event.button !== 2) {
                return;
            }
            const start = {
                x: offset.x,
                y: offset.y,
            };
            const point = {
                x: event.pageX,
                y: event.pageY,
            };

            const mousemove = (event: MouseEvent) => {
                start.x = event.pageX - point.x;
                start.y = event.pageY - point.y;
                const reOffset = {
                    x: offset.x + start.x,
                    y: offset.y + start.y,
                };
                $elem.data.setProperty('offset', reOffset);
            }
            const mouseup = () => {
                offset.x = offset.x + start.x;
                offset.y = offset.y + start.y;
                start.x = 0;
                start.y = 0;
                document.removeEventListener('mousemove', mousemove);
                document.removeEventListener('moveup', mouseup);
            }
            document.addEventListener('mousemove', mousemove);
            document.addEventListener('mouseup', mouseup);
        });

        // 鼠标滚轮
        $elem.addEventListener('wheel', (event) => {
            event.stopPropagation();
            event.preventDefault();
            const delta = event.deltaY / 100;
            let scale = $elem.data.getProperty('scale');
            scale += delta;
            $elem.data.setProperty('scale', Math.min(2, Math.max(0.2, scale)));
        });
    },
};

export const GraphElement = createElement('graph', {
    template: /*html*/`
<canvas id="meshes"></canvas>
<div id="dom-box">
    <svg id="lines"></svg>
    <div id="nodes"></div>
</div>
    `,

    style: /*css*/`
${style.solid}
${style.line}
:host {
    --background-color: #1f1f1f;

    display: block;

    border-radius: calc(var(--size-radius) * 1px);
    border: 1px solid var(--border-color);
    box-sizing: border-box;
    background-color: var(--background-color);

    position: relative;

    --offset-x: 0;
    --offset-y: 0;
}
#meshes {
    width: 100%;
    height: 100%;
    position: absolute;
}
#dom-box {
    position: relative;
    height: 100%;
    width: 100%;
    transform: translate(var(--offset-x), var(--offset-y)) scale(var(--scale));
}
#nodes {
    width: 100%;
    height: 100%;
    position: absolute;
}
#lines {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 50%;
    left: 50%;
    overflow: visible;
}

v-graph-node {
    position: absolute;
    top: 50%;
    left: 50%;
    transform-origin: center center;
    transform: translateX(-50%) translateX(var(--offset-x)) translateY(-50%) translateY(var(--offset-y));
}
v-graph-node[moveing] {
    z-index: 999;
}
    `,

    attrs: {
        type(value) {

        },
    },

    data: {
        // 中心偏移量，记录的是节点坐标系内的偏移量
        offset: { x: 0, y: 0, },
        // 记录节点坐标系与 html 坐标系的偏差
        calibration: { x: 0, y: 0, },

        // 缩放比例
        scale: 0,
        nodes: [],
        lines: [],
    },

    methods: {
        /**
         * 创建一个 node
         * @param info 
         */
        createNode(info: NodeInfo) {},
        /**
         * 创建一条连接线
         * @param info 
         */
        createLine(info: LineInfo) {},

        /**
         * 开始移动一个节点
         * @param nodeUUID 
         */
        startMoveNode(nodeUUID: string) {

        },
        /**
         * 停止移动一个节点
         * 或者停止移动正在移动的节点
         * @param nodeUUID 
         */
        stopMoveNode(nodeUUID?: string) {
            
        },

        startConnect(lineType: LineInfo['type'], nodeUUID: string, paramName?: string, paramDirection?: 'input' | 'output') {
            const $elem = this as unknown as BaseElement;
            const lines = $elem.data.getProperty('lines') as { [key: string]: LineInfo | undefined  };
            const nodes = $elem.data.getProperty('nodes') as { [key: string]: NodeInfo | undefined  };
            const graphType = $elem.data.getAttribute('type') || 'default';
            if (lines['connect-param-line']) {
                const line = lines['connect-param-line'];
                // @ts-ignore
                type a = typeof this;
                ($elem as unknown as {methods: a}).methods.stopConnect();
                let dt: 'input' | 'output' = 'output';
                if (paramDirection === 'output') {
                    dt = 'input';
                }
                if (line[dt].__fake) {
                    delete line[dt].__fake;
                    const uuid = generateUUID();
                    line[dt].node = nodeUUID;
                    line[dt].param = paramName;
                    const lineFilter = queryGraphFliter(graphType, 'lineFilter');
                    const input = queryParamInfo($elem, line.input.node, line.input.param);
                    const output = queryParamInfo($elem, line.output.node, line.output.param);
                    if (lineFilter!(nodes, lines, line, input, output)) {
                        lines[uuid] = line;
                    }
                }
                $elem.data.emitProperty('lines', lines, lines);
                return;
            }
            const line: LineInfo = {
                type: lineType,
                details: {},
                input: { node: '', },
                output: { node: '', },
            };
            const fake = {
                type: 'xx',
                position: { x: 0, y: 0 },
                details: {},
            };
            if (paramDirection === 'input') {
                line.output.node = nodeUUID;
                line.output.param = paramName;
                line.input.__fake = fake
            } else if (paramDirection === 'output') {
                line.input.node = nodeUUID;
                line.input.param = paramName;
                line.output.__fake = fake;
            } else {
                line.input.node = nodeUUID;
                line.output.__fake = fake;
            }

            lines['connect-param-line'] = line;
            $elem.addEventListener('mousemove', (event) => {
                const calibration = $elem.data.getProperty('calibration');
                const scale = $elem.data.getProperty('scale');
                const offset = $elem.data.getProperty('offset');
                fake.position.x =  (event.clientX - calibration.x - offset.x) / scale;
                fake.position.y =  (event.clientY - calibration.y - offset.y) / scale;
                $elem.data.emitProperty('lines', lines, lines);
            });
        },

        stopConnect() {
            const $elem = this as unknown as BaseElement;
            const lines = $elem.data.getProperty('lines');
            delete lines['connect-param-line'];
            $elem.data.emitProperty('lines', lines, lines);
        },
    },

    onInit() {
        graphUtils.bindEventListener(this);

        // 初始化数据
        const $canvas = this.querySelector('canvas')! as HTMLCanvasElement;
        const ctx = $canvas.getContext('2d')!;

        const refresh = () => {
            const box = this.getBoundingClientRect();
            const offset = this.data.getProperty('offset');
            const scale = this.data.getProperty('scale');
            // const option = this.data.getProperty('option');
            const graphType = this.data.getAttribute('type') || 'default';
            const option = queryGraphOption(graphType);
            graphUtils.resizeCanvas(this, $canvas, box);
            graphUtils.renderMesh(this, ctx, box, offset, scale, option);
            graphUtils.renderNodes(this, offset, scale);
            graphUtils.renderLines(this, offset, scale);
        }

        const $domBox = this.querySelector('#dom-box')!;
        // 监听数据变化
        this.data.addPropertyListener('scale', (scale) => {
            const offset = this.data.getProperty('offset');
            $domBox.setAttribute('style', `--offset-x: ${offset.x}px; --offset-y: ${offset.y}px; --scale: ${scale};`);
            refresh();
        });
        let lock = false;
        this.data.addPropertyListener('offset', (offset) => {
            if (lock) {
                return;
            }
            requestAnimationFrame(() => {
                const scale = this.data.getProperty('scale');
                $domBox.setAttribute('style', `--offset-x: ${offset.x}px; --offset-y: ${offset.y}px; --scale: ${scale};`);
    
                const graphType = this.data.getAttribute('type') || 'default';
                const option = queryGraphOption(graphType);
                const box = this.getBoundingClientRect();
                graphUtils.renderMesh(this, ctx, box, offset, scale, option);
            });

        });
        this.data.addPropertyListener('option', (option) => {
            const box = this.getBoundingClientRect();
            const offset = this.data.getProperty('offset');
            const scale = this.data.getProperty('scale');
            graphUtils.renderMesh(this, ctx, box, offset, scale, option);
        });
        this.data.addPropertyListener('nodes', (nodes) => {
            const offset = this.data.getProperty('offset');
            const scale = this.data.getProperty('scale');
            graphUtils.renderNodes(this, offset, scale);
        });
        this.data.addPropertyListener('lines', (lines) => {
            const offset = this.data.getProperty('offset');
            const scale = this.data.getProperty('scale');
            graphUtils.renderLines(this, offset, scale);
        });

        // 拖拽参数连线
        this.shadowRoot.addEventListener('start-connect-node', (event: any) => {
            event.stopPropagation();
            event.preventDefault();
            const { node, param, paramDirection, lineType } = event.detail;
            this.methods.startConnect(lineType, node, param, paramDirection);
        });

        this.shadowRoot.addEventListener('mousedown', () => {
            this.methods.stopConnect();
        });
    },

    onMounted() {

    },

    onRemoved() {

    },
});
