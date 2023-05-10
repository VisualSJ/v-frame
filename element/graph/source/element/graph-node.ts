'use strict';

import { createElement, BaseElement, CustomElementOption } from '@itharbors/ui-core';
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

class GraphNodeOption extends CustomElementOption {
    template = /*html*/``;

    style = /*css*/``;

    attrs = {};

    data = {
        type: '',
        details: {},
        position: { x: 0, y: 0 },
        moveStartPoint: { x: 0, y: 0, pageX: 0, pageY: 0, },
    } as GraphNodeElementData;

    methods = {
        startMove() {
            const $elem = this as unknown as BaseElement;
            $elem.setAttribute('moveing', '');
            let t = false;
            const scale = $elem.data.getProperty('scale');
            const moveStartPoint = $elem.data.getProperty('moveStartPoint') as GraphNodeElementData['moveStartPoint'];
            const mousemove = (event: MouseEvent) => {
                if (!t) {
                    const position = $elem.data.getProperty('position');
                    const scale = $elem.data.getProperty('scale');
                    const moveStartPoint = $elem.data.getProperty('moveStartPoint') as GraphNodeElementData['moveStartPoint'];
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

        hasConnect() {
            const $elem = this as unknown as BaseElement;
            const $graph = $elem.getRootNode();
            // @ts-ignore
            return $graph.host.methods.hasConnect();
        },

        stopConnect() {

        },

        bindDefaultParamEvent() {
            const $elem = this as unknown as BaseElement;
            const $paramList = $elem.querySelectorAll(`v-graph-node-param`);
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
                    // @ts-ignore
                    ($elem.methods as this)
                        .startConnect('', name, paramDirection);
                });
            });
        },

        bindDefaultMoveEvent() {
            const $elem = this as unknown as BaseElement;
            // 拖拽移动
            $elem.addEventListener('mousedown', (event) => {
                event.stopPropagation();
                event.preventDefault();
                //@ts-ignore
                ($elem.methods as this)
                    .startMove();
            });
        },
    }

    onInit(this: BaseElement & this) {
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
export const GraphNodeElement = createElement('graph-node', GraphNodeOption);