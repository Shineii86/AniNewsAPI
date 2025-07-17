import { NodeVersion } from '../types';
export type NodeVersionMajor = ReturnType<typeof getOptions>[number]['major'];
export declare const NODE_VERSIONS: NodeVersion[];
declare function getOptions(): NodeVersion[];
export declare function getAvailableNodeVersions(): NodeVersionMajor[];
export declare function getLatestNodeVersion(availableVersions?: NodeVersionMajor[]): NodeVersion;
export declare function getDiscontinuedNodeVersions(): NodeVersion[];
export declare function getSupportedNodeVersion(engineRange: string | undefined, isAuto?: boolean, availableVersions?: NodeVersionMajor[]): Promise<NodeVersion>;
export {};
