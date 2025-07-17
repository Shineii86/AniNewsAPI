import type { File, HasField, Chain } from './types';
import { Lambda } from './lambda';
interface PrerenderOptions {
    expiration: number | false;
    lambda?: Lambda;
    fallback: File | null;
    group?: number;
    bypassToken?: string | null;
    allowQuery?: string[];
    allowHeader?: string[];
    initialHeaders?: Record<string, string>;
    initialStatus?: number;
    passQuery?: boolean;
    sourcePath?: string;
    experimentalBypassFor?: HasField;
    experimentalStreamingLambdaPath?: string;
    chain?: Chain;
}
export declare class Prerender {
    type: 'Prerender';
    expiration: number | false;
    lambda?: Lambda;
    fallback: File | null;
    group?: number;
    bypassToken: string | null;
    allowQuery?: string[];
    allowHeader?: string[];
    initialHeaders?: Record<string, string>;
    initialStatus?: number;
    passQuery?: boolean;
    sourcePath?: string;
    experimentalBypassFor?: HasField;
    experimentalStreamingLambdaPath?: string;
    chain?: Chain;
    constructor({ expiration, lambda, fallback, group, bypassToken, allowQuery, allowHeader, initialHeaders, initialStatus, passQuery, sourcePath, experimentalBypassFor, experimentalStreamingLambdaPath, chain, }: PrerenderOptions);
}
export {};
