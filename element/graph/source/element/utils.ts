'use strict';

import type { PathParamRole } from '../interface';

export function generateUUID() {
    return 't_' + Date.now();
}

/**
 * 检测一条线和一个矩形相交的点
 * 返回他们相交的点坐标，以及该点的朝向 [x, y, d];
 * @param x1 线段起始点的 x 坐标
 * @param y1 线段起始点的 y 坐标
 * @param x2 线段终点的 x 坐标
 * @param y2 线段终点的 y 坐标
 * @param x3 矩形的左上角 x 坐标
 * @param y3 矩形的左上角 y 坐标
 * @param w 矩形的宽度
 * @param h 矩形的高度
 * @returns [number, number, 0 | 1];
 */
export function intersect(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, w: number, h: number): [number, number, 0 | 1] {
    // 计算矩形的四个顶点坐标
    const x4 = x3 + w;
    const y4 = y3 + h;

    const xa = (y4 - y1) / (y2 - y1) * (x2 - x1) + x1;
    if (xa > x4 || xa < x3) {
        const ya = (x4 - x1) / (x2 - x1) * (y2 - y1) + y1;
        if (x2 > x1) {
            return [x4, ya, 0];
        } else {
            return [x3, y4 - ya + y3, 0];
        }
    } else {
        if (y2 > y1) {
            return [xa, y4, 1];
        } else {
            return [x4 - xa + x3, y3, 1];
        }
    }
}

/**
 * 获取一个 param 元素相对 node 的偏移坐标
 * @param $node 
 * @param selector 
 * @param scale 
 * @returns 
 */
export function getParamElementOffset($node: HTMLElement, selector: string, scale: number) {
    const $param = $node.querySelector(selector);
    if (!$param) {
        return null;
    }
    const nodeBBound = $node.getBoundingClientRect();
    const paramBBound = $param.getBoundingClientRect();
    return {
        x: ((paramBBound.width / 2 + paramBBound.x) - (nodeBBound.width / 2 + nodeBBound.x)) / scale,
        y: ((paramBBound.height / 2 + paramBBound.y) - (nodeBBound.height / 2 + nodeBBound.y)) / scale,
        role: $param.getAttribute('role') as PathParamRole,
    };
}

export function queryParamInfo($root: HTMLElement, node: string, param?: string) {
    const $node = $root.querySelector(`#nodes > v-graph-node[node-uuid="${node}"]`);
    if (!$node) {
        return;
    }
    const $param = $node.querySelector(`v-graph-node-param[name="${param}"]`);
    if (!$param) {
        return;
    }
    return {
        direction: $param.getAttribute('direction'),
        type: $param.getAttribute('type'),
        name: $param.getAttribute('name'),
        role: $param.getAttribute('role'),
    };
}