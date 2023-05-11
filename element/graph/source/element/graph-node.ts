'use strict';

import type { GraphElement } from './graph';
import { registerElement, BaseElement } from '@itharbors/ui-core';
import { queryNode } from '../manager';

type GraphNodeElementData = {
    scale: number;
    // 图类型
    graphType: string;
    // 类型
    type: string;
    // 附加描述信息
    details: { [key: string]: any };
    // 节点所在的坐标
    position: { x: number, y: number };

    // 拖拽过程中需要使用的临时变量，拖拽
    moveStartPoint: { x: number, y: number, pageX: number, pageY: number };
};

export class GraphNodeElement extends BaseElement {
    get HTMLTemplate() {
        return /*html*/``;
    }

    get HTMLStyle() {
        return /*css*/``;
    }

    get defaultData(): GraphNodeElementData {
        return {
            scale: 1,
            graphType: '',
            type: '',
            details: {},
            position: { x: 0, y: 0 },
            moveStartPoint: { x: 0, y: 0, pageX: 0, pageY: 0, },
        };
    }

    /**
     * 开始拖拽节点
     * 运行后，节点开始随着鼠标移动
     * 直到执行 stopMove 或者点击一下页面
     */
    startMove() {
        this.setAttribute('moveing', '');
        let t = false;
        const scale = this.data.getProperty('scale');
        const moveStartPoint = this.data.getProperty('moveStartPoint') as GraphNodeElementData['moveStartPoint'];
        const mousemove = (event: MouseEvent) => {
            if (!t) {
                const position = this.data.getProperty('position');
                const scale = this.data.getProperty('scale');
                const moveStartPoint = this.data.getProperty('moveStartPoint') as GraphNodeElementData['moveStartPoint'];
                moveStartPoint.x = position.x * scale;
                moveStartPoint.y = position.y * scale;
                moveStartPoint.pageX = event.pageX;
                moveStartPoint.pageY = event.pageY;
                t = true;
            }

            const offset = {
                x: event.pageX - moveStartPoint.pageX,
                y: event.pageY - moveStartPoint.pageY,
            };
            const reOffset = {
                x: (moveStartPoint.x + offset.x) / scale,
                y: (moveStartPoint.y + offset.y) / scale,
            };
            this.data.setProperty('position', reOffset);
        }
        const mouseup = (event: MouseEvent) => {
            const offset = {
                x: event.pageX - moveStartPoint.pageX,
                y: event.pageY - moveStartPoint.pageY,
            };
            const reOffset = {
                x: (moveStartPoint.x + offset.x) / scale,
                y: (moveStartPoint.y + offset.y) / scale,
            };
            this.data.setProperty('position', reOffset);
            stopmove();
        }
        const stopmove = () => {
            document.removeEventListener('mousemove', mousemove);
            document.removeEventListener('mouseup', mouseup);
            document.removeEventListener('stop-move-graph-node', stopmove);
            this.removeAttribute('moveing');
        };
        document.addEventListener('mousemove', mousemove);
        document.addEventListener('mouseup', mouseup);
        document.addEventListener('stop-move-graph-node', stopmove);
    }

    /**
     * 停止拖拽
     * 在没有开始拖拽的时候执行无效
     */
    stopMove() {
        const custom = new CustomEvent('stop-move-graph-node');
        document.dispatchEvent(custom);
    }

    /**
     * 开始连接其他节点
     * 运行后，连接线从起始位置到鼠标位置结束
     * 直到另一个节点上触发 startConnect，或者在空白区域点击
     * @param type 
     * @param param 
     * @param paramDirection 
     * @returns 
     */
    startConnect(type: string, param?: string, paramDirection?: 'input' | 'output') {
        const uuid = this.data.getAttribute('node-uuid');
        if (!uuid) {
            return;
        }

        const custom = new CustomEvent('start-connect-node', {
            bubbles: true,
            cancelable: true,
            detail: {
                lineType: type,
                node: uuid,
                param: param,
                paramDirection: paramDirection,
            },
        });
        this.dispatchEvent(custom);
    }

    /**
     * 判断当前是否在连接过程中
     * @returns 
     */
    hasConnect() {
        const $graph = this.getRootNode() as ShadowRoot;
        return ($graph.host as GraphElement).hasConnect();
    }

    /**
     * 停止连接动作
     * 没有开始连接的时候执行无效
     */
    stopConnect() {

    }

    /**
     * 绑定默认的参数连接事件
     */
    bindDefaultParamEvent() {
        const $paramList = this.querySelectorAll(`v-graph-node-param`);
        Array.prototype.forEach.call($paramList, ($param) => {
            $param.addEventListener('mousedown', (event: MouseEvent) => {
                event.stopPropagation();
                event.preventDefault();

                const name = $param.getAttribute('name');
                if (!name) {
                    return;
                }
                const paramDirection = $param.getAttribute('direction');
                if (paramDirection !== 'input' && paramDirection !== 'output') {
                    return;
                }
                this.startConnect('', name, paramDirection);
            });
        });
    }

    /**
     * 绑定默认的鼠标点击后移动事件
     */
    bindDefaultMoveEvent() {
        // 拖拽移动
        this.addEventListener('mousedown', (event) => {
            event.stopPropagation();
            event.preventDefault();
            this.startMove();
        });
    }

    onInit() {
        this.data.addPropertyListener('type', (type, legacy) => {
            const graphType = this.data.getProperty('graphType');
            const panel = queryNode(graphType, type);

            if (panel) {
                this.shadowRoot.innerHTML = `<style>\n${panel.style}\n</style>\n${panel.template}`;
            }
        });

        this.data.addPropertyListener('details', (details) => {
            const type = this.data.getProperty('type');
            const graphType = this.data.getProperty('graphType');
            const panel = queryNode(graphType, type);
            panel.onInit.call(this, details);
        });

        this.data.addPropertyListener('position', (position, legacy) => {
            this.setAttribute('style', `--offset-x: ${position.x}px; --offset-y: ${position.y}px;`);
        });
    }
}
registerElement('graph-node', GraphNodeElement);
