'use strict';

import { registerElement, BaseElement, style } from '@itharbors/ui-core';

import { ParamConnectData } from './data';

import { NodeInfo, LineInfo, GraphOption } from '../interface';
import { getParamElementOffset, generateUUID, queryParamInfo } from './utils';
import { queryLine, queryGraphFliter, queryGraphOption } from '../manager';

import type { GraphNodeElement } from './graph-node';

const nodeToElem: WeakMap<NodeInfo, GraphNodeElement> = new WeakMap();

const graphUtils = {

    resizeCanvas($elem: GraphElement, $canvas: HTMLCanvasElement, box: {width: number, height: number}) {
        $canvas.setAttribute('width', box.width + '');
        $canvas.setAttribute('height', box.height + '');

        const calibration = $elem.data.getProperty('calibration');
        calibration.x = box.width / 2;
        calibration.y = box.height / 2;
        $elem.data.emitProperty('calibration', calibration, calibration);
    },

    renderMesh($elem: GraphElement, ctx: CanvasRenderingContext2D, box: {width: number, height: number}, offset: {x: number, y: number}, scale: number, option: GraphOption) {
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

    renderNodes($elem: GraphElement, offset: {x: number, y: number}, scale: number) {
        const $nodes = $elem.querySelectorAll('#nodes > v-graph-node');
        const nodes = $elem.data.getProperty('nodes');
        const graphType = $elem.data.getAttribute('type') || 'default';

        const $root = $elem.querySelector('#nodes')!;

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
            const $node = document.createElement('v-graph-node') as GraphNodeElement;

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

    renderLine(graphType: string, $line: SVGGElement, line: LineInfo, lines: { [key: string]: LineInfo | undefined }, nodes: { [key: string]: NodeInfo | undefined }, scale: number) {
        const nodeA = line.input.__fake || nodes[line.input.node];
        const nodeB = line.output.__fake || nodes[line.output.node];

        if (!nodeA || !nodeB) {
            return;
        }

        const $nodeA = nodeToElem.get(nodeA);
        const $nodeB = nodeToElem.get(nodeB);

        const d = new ParamConnectData(line, scale, $nodeA, $nodeB, nodeA, nodeB);
        d.x1 = nodeA.position.x;
        d.y1 = nodeA.position.y;
        d.x2 = nodeB.position.x;
        d.y2 = nodeB.position.y;

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

        const lineAdapter = queryLine(graphType, line.type);
        lineAdapter.updateSVGPath($line, scale, d, line, lines);
    },

    renderLines($elem: GraphElement, offset: {x: number, y: number }, scale: number) {
        const graphType = $elem.data.getAttribute('type') || 'default';
        const lines = $elem.data.getProperty('lines');
        const nodes = $elem.data.getProperty('nodes');
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
                this.renderLine(graphType, $line, line, lines, nodes, scale);
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

            $line.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();

                const custom = new CustomEvent('select-line', {
                    bubbles: true,
                    cancelable: true,
                    detail: {},
                });
                $line.dispatchEvent(custom);
            });

            const $style = $elem.querySelector(`style[line-type="${line.type}"]`);
            if (!$style) {
                const $style = document.createElement('style');
                $style.setAttribute('line-type', line.type);
                $style.innerHTML = lineAdapter.style;
                $elem.shadowRoot.appendChild($style);
            }

            $line.setAttribute('type', line.type);
            $line.innerHTML = lineAdapter.template;
            this.renderLine(graphType, $line, line, lines, nodes, scale);
            $root.appendChild($line);
        }
    },

    bindEventListener($elem: GraphElement) {
        // 阻止右键菜单
        $elem.addEventListener('contextmenu', (event) => {
            event.stopPropagation();
            event.preventDefault();
        });

        function selectLine($g: SVGGElement) {
            $g.setAttribute('selected', '');
            $elem.__selectLines__.add($g);
        }
        function unselectLine($g: SVGGElement) {
            if ($g.hasAttribute('selected')) {
                $g.removeAttribute('selected');
                $elem.__selectLines__.delete($g);
            }
        }
        $elem.shadowRoot.addEventListener('select-line', (event) => {
            // 取消 node 选中状态
            const nodes = $elem.getProperty('nodes') as { [key: string]: NodeInfo | undefined, };
            for (let id in nodes) {
                const node = nodes[id]!;
                const $node = nodeToElem.get(node);
                if ($node) {
                    $node.setProperty('selected', false);
                }
            }

            if (!(event as MouseEvent).metaKey && !(event as MouseEvent).ctrlKey) {
                $elem.clearAllSelected();
            }
            selectLine(event.target as SVGGElement);
        });

        // 处理选中状态，交给 node 自己控制
        $elem.shadowRoot.addEventListener('click', (event) => {
            const $node = event.target as GraphNodeElement;
            if ($node.tagName !== 'V-GRAPH-NODE') {
                return;
            }

            const nodes = $elem.getProperty('nodes') as { [key: string]: NodeInfo | undefined, };

            // 取消 line 选中状态
            $elem.clearAllSelected();

            if (!(event as MouseEvent).metaKey && !(event as MouseEvent).ctrlKey) {
                for (let id in nodes) {
                    const node = nodes[id]!;
                    const $node = nodeToElem.get(node);
                    if ($node) {
                        $node.setProperty('selected', false);
                    }
                }
            }
            const selected = $node.getProperty('selected');
            $node.setProperty('selected', !selected);
        });

        $elem.addEventListener('mousedown', (event) => {
            if ($elem.hasConnect()) {
                $elem.stopConnect();
                return;
            }
            switch (event.button) {
                // 框选
                case 0: {
                    // event.stopPropagation();
                    // event.preventDefault();

                    const selectBox = $elem.data.getProperty('selectBox');
                    const offset = $elem.data.getProperty('offset');
                    const startPoint = {
                        x: event.pageX,
                        y: event.pageY,
                    };
                    selectBox.x = event.offsetX;
                    selectBox.y = event.offsetY;

                    const mousemove = (event: MouseEvent) => {
                        const scale = $elem.data.getProperty('scale');
                        const point = {
                            x: event.pageX - startPoint.x,
                            y: event.pageY - startPoint.y,
                        }

                        const reSelectBox = {
                            x: selectBox.x,
                            y: selectBox.y,
                            w: point.x,
                            h: point.y,
                        };
                        if (reSelectBox.w < 0) {
                            reSelectBox.x += reSelectBox.w;
                            reSelectBox.w = -reSelectBox.w;
                        }
                        if (reSelectBox.h < 0) {
                            reSelectBox.y += reSelectBox.h;
                            reSelectBox.h = -reSelectBox.h;
                        }

                        $elem.data.setProperty('selectBox', reSelectBox);
                    }
                    const mouseup = () => {
                        document.removeEventListener('mousemove', mousemove);
                        document.removeEventListener('mouseup', mouseup);
                        const reSelectBox = { x: 0, y: 0, w: 0, h: 0 };
                        $elem.data.setProperty('selectBox', reSelectBox);
                    }
                    document.addEventListener('mousemove', mousemove);
                    document.addEventListener('mouseup', mouseup);
                    break;
                }

                // 拖拽移动整个画布
                case 1:
                case 2: {
                    event.stopPropagation();
                    event.preventDefault();
    
                    const offset = $elem.data.getProperty('offset');
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
                    break;
                }

            }
            
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

export class GraphElement extends BaseElement {
    get HTMLTemplate() {
        return /*html*/`
<canvas id="meshes"></canvas>
<div id="dom-box">
    <svg id="lines"></svg>
    <div id="nodes"></div>
</div>
<div class="select-box"></div>
`;
    } 

    get HTMLStyle() {
        return /*css*/`
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
v-graph-node[moving] {
    z-index: 999;
}

.select-box {
    position: absolute;
    background: white;
    opacity: 0.3;
    width: 0;
    height: 0;
    top: 0;
    left: 0;
}
        `;
    }

    get defaultData(): {
        offset: { x: number, y: number, };
        calibration: { x: number, y: number, };
        selectBox: { x: number, y: number, w: number, h: number, };
        scale: number;
        nodes: { [key: string]: NodeInfo | undefined, };
        lines: { [key: string]: LineInfo | undefined, };
    } {
        return {
            // 中心偏移量，记录的是节点坐标系内的偏移量
            offset: { x: 0, y: 0, },
            // 记录节点坐标系与 HTML 坐标系的偏差
            calibration: { x: 0, y: 0, },
            // 框选区域，记录的坐标是 HTML 坐标
            selectBox: { x: 0, y: 0, w: 0, h: 0, },
    
            // 缩放比例
            scale: 1,
            nodes: {},
            lines: {},
        };
    }

    __selectLines__: Set<SVGGElement> = new Set;

    /**
     * 生成一个 node 数据
     * @param type
     */
    generateNode(type?: string): NodeInfo {
        return {
            type: type || 'unknown',
            position: { x: 0, y: 0 },
            details: {},
        };
    }

    /**
     * 生成一个 line 数据
     * @param type
     */
    generateLine(type?: string, details?: { [key: string]: any }): LineInfo {
        return {
            type: type || 'straight',
            details: details || {},
            input: {
                node: '',
            },
            output: {
                node: '',
            },
        };
    }
    /**
     * 添加一个 node 数据
     * @param node 
     * @param id 
     */
    addNode(node: NodeInfo, id?: string) {
        const uuid: string = id || generateUUID();
        const nodes = this.getProperty('nodes') as { [key: string]: NodeInfo | undefined, };
        nodes[uuid] = node;
        this.data.emitProperty('nodes', nodes, nodes);
    }

    /**
     * 添加一个 line 数据
     * @param line 
     * @param id 
     */
    addLine(line: LineInfo, id?: string) {
        const lines = this.getProperty('lines') as { [key: string]: LineInfo | undefined  };
        const nodes = this.data.getProperty('nodes');
        const graphType = this.data.getAttribute('type') || 'default';
        const lineFilter = queryGraphFliter(graphType, 'lineFilter');
        const input = queryParamInfo(this, line.input.node, line.input.param);
        const output = queryParamInfo(this, line.output.node, line.output.param);
        if (lineFilter!(nodes, lines, line, input, output)) {
            lines[id || generateUUID()] = line;
            this.data.emitProperty('lines', lines, lines);
        }
    }

    /**
     * 获取一个节点
     * @param id 
     * @returns 
     */
    getNode(id: string) {
        const nodes = this.data.getProperty('nodes');
        return nodes[id];
    }

    /**
     * 获取一个线段
     * @param id 
     * @returns 
     */
    getLine(id: string) {
        const lines = this.data.getProperty('lines');
        return lines[id];
    }

    /**
     * 删除一个 Node
     * @param id 
     */
    removeNode(id: string) {
        const nodes = this.getProperty('nodes');
        delete nodes[id];
        this.data.emitProperty('nodes', nodes, nodes);
    }

    /**
     * 删除一条连接线
     * @param id 
     */
    removeLine(id: string) {
        const lines = this.getProperty('lines');
        delete lines[id];
        this.data.emitProperty('lines', lines, lines);
    }

    clearAllSelected() {
        this.__selectLines__.forEach(($g) => {
            if ($g.hasAttribute('selected')) {
                $g.removeAttribute('selected');
                this.__selectLines__.delete($g);
            }
        });

        // const nodes = this.getProperty('nodes') as { [key: string]: NodeInfo | undefined, };
        // for (let id in nodes) {
        //     const node = nodes[id]!;
        //     const $node = nodeToElem.get(node);
        //     if ($node) {
        //         $node.setProperty('selected', false);
        //     }
        // }
    }

    __connect__event__: any;

    /**
     * 开始连接节点/参数
     * @param lineType 
     * @param nodeUUID 
     * @param paramName 
     * @param paramDirection 
     * @returns 
     */
    startConnect(lineType: LineInfo['type'], nodeUUID: string, paramName?: string, paramDirection?: 'input' | 'output', details?: { [key: string]: any }) {
        const lines = this.data.getProperty('lines') as { [key: string]: LineInfo | undefined, };
        const nodes = this.data.getProperty('nodes') as { [key: string]: NodeInfo | undefined, };
        let line = this.getLine('connect-param-line');
        // 如果已经有线段了，说明是连接第二个点
        if (line) {
            this.stopConnect();
            let dt: 'input' | 'output' = 'output';
            if (paramDirection === 'output') {
                dt = 'input';
            }
            if (line[dt].__fake) {
                delete line[dt].__fake;
                line[dt].node = nodeUUID;
                line[dt].param = paramName;
                this.addLine(line);
            } else {
                this.data.emitProperty('lines', lines, lines);
            }
            return;
        }
        line = this.generateLine(lineType);
        const fake = this.generateNode();
        const calibration = this.data.getProperty('calibration');
        const offset = this.data.getProperty('offset');
        if (paramDirection === 'input') {
            line.output.node = nodeUUID;
            line.output.param = paramName;
            const nodeE = nodes[line.output.node];
            if (nodeE) {
                fake.position.x = nodeE.position.x + 1;
                fake.position.y = nodeE.position.y + 1;
            }
            line.input.__fake = fake
        } else if (paramDirection === 'output') {
            line.input.node = nodeUUID;
            line.input.param = paramName;
            const nodeE = nodes[line.input.node];
            if (nodeE) {
                fake.position.x = nodeE.position.x + 1;
                fake.position.y = nodeE.position.y + 1;
            }
            line.output.__fake = fake;
        } else {
            line.input.node = nodeUUID;
            const nodeE = nodes[line.input.node];
            if (nodeE) {
                fake.position.x = nodeE.position.x + 1;
                fake.position.y = nodeE.position.y + 1;
            }
            line.output.__fake = fake;
        }
        // 绕过线段检查
        lines['connect-param-line'] = line;
        this.data.emitProperty('lines', lines, lines);
        this.__connect__event__ = (event: MouseEvent) => {
            const scale = this.data.getProperty('scale');
            fake.position.x =  (event.offsetX - calibration.x - offset.x) / scale;
            fake.position.y =  (event.offsetY - calibration.y - offset.y) / scale;
            this.data.emitProperty('lines', lines, lines);
        };
        this.addEventListener('mousemove', this.__connect__event__);
    }

    /**
     * 是否正在连接动作中
     * @returns 
     */
    hasConnect() {
        const lines = this.data.getProperty('lines');
        return !!this.getLine('connect-param-line');
    }

    /**
     * 中断连接动作
     */
    stopConnect() {
        const lines = this.data.getProperty('lines');
        delete lines['connect-param-line'];
        this.data.emitProperty('lines', lines, lines);
        this.removeEventListener('mousemove', this.__connect__event__);
    }

    onInit() {
        graphUtils.bindEventListener(this);

        // 初始化数据
        const $canvas = this.querySelector('canvas')! as HTMLCanvasElement;
        const ctx = $canvas.getContext('2d')!;

        const refresh = () => {
            const box = this.getBoundingClientRect();
            const offset = this.data.getProperty('offset');
            const scale = this.data.getProperty('scale');
            const graphType = this.data.getAttribute('type') || 'default';
            const option = queryGraphOption(graphType);
            graphUtils.resizeCanvas(this, $canvas, box);
            graphUtils.renderMesh(this, ctx, box, offset, scale, option);
            graphUtils.renderNodes(this, offset, scale);
            graphUtils.renderLines(this, offset, scale);
        }

        const $domBox = this.querySelector('#dom-box')!;
        // 监听 scale 变化
        this.data.addPropertyListener('scale', (scale) => {
            const offset = this.data.getProperty('offset');
            $domBox.setAttribute('style', `--offset-x: ${offset.x}px; --offset-y: ${offset.y}px; --scale: ${scale};`);
            refresh();
        });

        // 监听 offset 变化
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

        // 监听 option 变化
        this.data.addPropertyListener('option', (option) => {
            const box = this.getBoundingClientRect();
            const offset = this.data.getProperty('offset');
            const scale = this.data.getProperty('scale');
            graphUtils.renderMesh(this, ctx, box, offset, scale, option);
        });

        // 监听 nodes 变化
        this.data.addPropertyListener('nodes', (nodes) => {
            const offset = this.data.getProperty('offset');
            const scale = this.data.getProperty('scale');
            graphUtils.renderNodes(this, offset, scale);
        });

        // 监听 lines 变化
        this.data.addPropertyListener('lines', (lines) => {
            const offset = this.data.getProperty('offset');
            const scale = this.data.getProperty('scale');
            graphUtils.renderLines(this, offset, scale);
        });

        // 监听 selectBox 变化，框选检测
        const $selectBox = this.querySelector('.select-box')!;
        this.data.addPropertyListener('selectBox', (selectBox) => {
            // 设置遮罩
            $selectBox.setAttribute('style', `top: ${selectBox.y}px; left: ${selectBox.x}px; width: ${selectBox.w}px; height: ${selectBox.h}px;`);

            const nodes = this.data.getProperty('nodes') as { [key: string]: NodeInfo | undefined, };

            if (
                selectBox.x === 0 &&
                selectBox.y === 0 &&
                selectBox.w === 0 &&
                selectBox.h === 0
            ) {
                return;
            }

            this.clearAllSelected();

            const selectBoxBoundingClientRect = $selectBox.getBoundingClientRect();
            for (let key in nodes) {
                const node = nodes[key]!;
                const $node = nodeToElem.get(node)!;
                const nodeBoundingClientRect = $node.getBoundingClientRect();

                if (
                    selectBoxBoundingClientRect.left < nodeBoundingClientRect.right &&
                    selectBoxBoundingClientRect.right > nodeBoundingClientRect.left &&
                    selectBoxBoundingClientRect.top < nodeBoundingClientRect.bottom &&
                    selectBoxBoundingClientRect.bottom > nodeBoundingClientRect.top
                ) {
                    $node.setProperty('selected', true);
                    continue;
                }
                $node.setProperty('selected', false);
            }
        });

        // 拖拽参数连线
        this.shadowRoot.addEventListener('start-connect-node', (event: any) => {
            event.stopPropagation();
            event.preventDefault();
            const { node, param, paramDirection, lineType, details } = event.detail;
            this.startConnect(lineType, node, param, paramDirection, details);
        });

        requestAnimationFrame(() => {
            refresh();
        });
    }
}
registerElement('graph', GraphElement);
