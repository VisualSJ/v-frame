'use strict';

import { GraphNodeElement } from ".";

export interface SelectNodeDetail {
    target: GraphNodeElement;
}

export interface UnselectNodeDetail {
    target: GraphNodeElement;
}

export interface ClearSelectNodeDetail {
    
}

export interface MoveNodeDetail {
    
}


export interface InterruptMoveNodeDetail {
    
}

export interface ConnectNodeDetail {
    lineType: string;
    node: string;
    param?: string;
    paramDirection?: 'input' | 'output';
    details?: { [key: string]: any };
}

export interface InterruptConnectNodeDetail {
    
}


/////

export interface SelectLineDetail {
    target: SVGGElement;
}

export interface UnselectLineDetail {
    target: SVGGElement;
}
