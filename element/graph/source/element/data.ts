'use strict';

import { PathParamRole, LineInfo, NodeInfo } from '../interface';
import { intersect, getParamElementOffset, generateUUID, queryParamInfo } from './utils';

export class ParamConnectData {
    // 起始点
    x1: number = 0;
    y1: number = 0;

    // 连线结束点
    x2: number = 0;
    y2: number = 0;

    // 起始点开始的线段的朝向
    r1: PathParamRole = 'all';
    // 终点开始的线段的朝向
    r2: PathParamRole = 'all';

    // 当 r1 为全向的时候，起始点优先以横向还是竖向显示
    d1: 0 | 1 = 1;
    // 当 r2 为全向的时候，终点点优先以横向还是竖向显示
    d2: 0 | 1 = 1;

    line: LineInfo;

    private scale: number = 1;
    private $nodeA?: HTMLElement;
    private $nodeB?: HTMLElement;
    private nodeA?: NodeInfo;
    private nodeB?: NodeInfo;

    constructor(line: LineInfo, scale: number, $nodeA?: HTMLElement, $nodeB?: HTMLElement, nodeA?: NodeInfo, nodeB?: NodeInfo) {
        this.line = line;

        this.$nodeA = $nodeA;
        this.$nodeB = $nodeB;
        this.nodeA = nodeA;
        this.nodeB = nodeB;
    }

    /**
     * 将起始点吸附到边框
     */
    snapBorderInput() {
        if (!this.$nodeA || !this.nodeA || !this.nodeB) {
            return;
        }
        let r1 = this.r1;
        if (r1 === 'all') {
            const xd = this.x1 - this.x2;
            const yd = this.y1 - this.y2;
            const tl = Math.abs(xd / yd);
            if (tl <= 1) { // up down
                r1 = yd <= 0 ? 'up' : 'down';
            } else { // left right
                r1 = xd <= 0 ? 'right' : 'left';
            }
        }
        const boundA = this.$nodeA.getBoundingClientRect();
        switch (r1) {
            case 'right':
                this.x1 += boundA.width / 2;
                break;
            case 'left':
                this.x1 -= boundA.width / 2;
                break;
            case 'up':
                this.y1 += boundA.height / 2;
                break;
            case 'down':
                this.y1 -= boundA.height / 2;
                break;
        }
    }
    /**
     * 将结束点吸附到边框
     */
    snapBorderOutput() {
        if (!this.$nodeB || !this.nodeA || !this.nodeB) {
            return;
        }
        const boundB = this.$nodeB.getBoundingClientRect();
        let r2 = this.r2;
        if (r2 === 'all') {
            const xd = this.x1 - this.x2;
            const yd = this.y1 - this.y2;
            const tl = Math.abs(xd / yd);
            if (tl <= 1) { // up down
                r2 = yd <= 0 ? 'up' : 'down';
            } else { // left right
                r2 = xd <= 0 ? 'right' : 'left';
            }
        }
        switch (r2) {
            case 'right':
                this.x2 -= boundB.width / 2;
                break;
            case 'left':
                this.x2 += boundB.width / 2;
                break;
            case 'up':
                this.y2 -= boundB.height / 2;
                break;
            case 'down':
                this.y2 += boundB.height / 2;
                break;
        }
    }

    /**
     * 两点连接计算最短连接线上的两个交点
     */
    shortestInput() {
        if (!this.$nodeA || !this.nodeA || !this.nodeB) {
            return;
        }
        const boundA = this.$nodeA!.getBoundingClientRect();
        boundA.width /= this.scale;
        boundA.height /= this.scale;
        const pa = intersect(this.x1, this.y1, this.x2, this.y2, this.nodeA.position.x - boundA.width / 2, this.nodeA.position.y - boundA.height / 2, boundA.width, boundA.height)!;
        this.x1 = pa[0];
        this.y1 = pa[1];
        this.d1 = pa[2];
    }
    /**
     * 两点连接计算最短连接线上的两个交点
     */
    shortestOutput() {
        if (!this.$nodeB || !this.nodeA || !this.nodeB) {
            return;
        }
        const boundB = this.$nodeB!.getBoundingClientRect();
        boundB.width /= this.scale;
        boundB.height /= this.scale;
        const pb = intersect(this.x2, this.y2, this.x1, this.y1, this.nodeB.position.x - boundB.width / 2, this.nodeB.position.y - boundB.height / 2, boundB.width, boundB.height)!;
        this.x2 = pb[0];
        this.y2 = pb[1];
        this.d2 = pb[2];
    }
}