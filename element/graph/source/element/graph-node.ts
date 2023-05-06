'use strict';

import { createElement, BaseElement, style } from '@itharbors/ui-core';
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

export const GraphNodeElement = createElement('graph-node', {
    template: /*html*/``,
    style: /*css*/``,

    attrs: {},

    data: {
        type: '',
        details: {},
        position: { x: 0, y: 0 },

        moveStartPoint: { x: 0, y: 0, pageX: 0, pageY: 0 },
    } as GraphNodeElementData,

    methods: {
        startMove() {
            const $elem = this as unknown as BaseElement;
            $elem.setAttribute('moveing', '');
            const scale = $elem.data.getProperty('scale');
            const moveStartPoint = $elem.data.getProperty('moveStartPoint') as GraphNodeElementData['moveStartPoint'];
            const mousemove = (event: MouseEvent) => {
                const offset = {
                    x: event.pageX - moveStartPoint.pageX,
                    y: event.pageY - moveStartPoint.pageY,
                };
                const reOffset = {
                    x: (moveStartPoint.x + offset.x) / scale,
                    y: (moveStartPoint.y + offset.y) / scale,
                };
                $elem.data.setProperty('position', reOffset);
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
                $elem.data.setProperty('position', reOffset);
                stopmove();
            }
            const stopmove = () => {
                document.removeEventListener('mousemove', mousemove);
                document.removeEventListener('mouseup', mouseup);
                document.removeEventListener('stop-move-graph-node', stopmove);
                $elem.removeAttribute('moveing');
            };
            document.addEventListener('mousemove', mousemove);
            document.addEventListener('mouseup', mouseup);
            document.addEventListener('stop-move-graph-node', stopmove);
        },
        stopMove() {
            const custom = new CustomEvent('stop-move-graph-node');
            document.dispatchEvent(custom);
        },

        startConnect(type: string, param?: string, paramDirection?: string) {
            const $elem = this as unknown as BaseElement;
            const uuid = $elem.data.getAttribute('node-uuid');
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
                    paramDirection,
                },
            });
            $elem.dispatchEvent(custom);
        },

        stopConnect() {

        },
    },

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

        // 拖拽移动
        this.addEventListener('mousedown', (event) => {
            event.stopPropagation();
            event.preventDefault();

            const position = this.data.getProperty('position');
            const scale = this.data.getProperty('scale');
            const moveStartPoint = this.data.getProperty('moveStartPoint') as GraphNodeElementData['moveStartPoint'];
            moveStartPoint.x = position.x * scale;
            moveStartPoint.y = position.y * scale;
            moveStartPoint.pageX = event.pageX;
            moveStartPoint.pageY = event.pageY;
            this.methods.startMove();
        });

        this.shadowRoot.addEventListener('connect-line', (event: any) => {
            event.stopPropagation();
            event.preventDefault();
            const $elem = this as unknown as BaseElement;
            const uuid = $elem.data.getAttribute('node-uuid');
            if (!uuid) {
                return;
            }
            const { param, paramDirection } = event.detail;
            const custom = new CustomEvent('connect-line', {
                bubbles: false,
                cancelable: true,
                detail: {
                    node: uuid,
                    param,
                    paramDirection,
                },
            });
            $elem.dispatchEvent(custom);
        });
    },

    onMounted() {

    },

    onRemoved() {

    },
});