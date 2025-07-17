/// <reference types="node" />
import type { Config, Env, Files, FunctionFramework } from './types';
export type LambdaOptions = LambdaOptionsWithFiles | LambdaOptionsWithZipBuffer;
export type LambdaArchitecture = 'x86_64' | 'arm64';
export interface LambdaOptionsBase {
    handler: string;
    runtime: string;
    architecture?: LambdaArchitecture;
    memory?: number;
    maxDuration?: number;
    environment?: Env;
    allowQuery?: string[];
    regions?: string[];
    supportsMultiPayloads?: boolean;
    supportsWrapper?: boolean;
    supportsResponseStreaming?: boolean;
    /**
     * @deprecated Use the `supportsResponseStreaming` property instead.
     */
    experimentalResponseStreaming?: boolean;
    operationType?: string;
    framework?: FunctionFramework;
}
export interface LambdaOptionsWithFiles extends LambdaOptionsBase {
    files: Files;
    experimentalAllowBundling?: boolean;
}
/**
 * @deprecated Use `LambdaOptionsWithFiles` instead.
 */
export interface LambdaOptionsWithZipBuffer extends LambdaOptionsBase {
    /**
     * @deprecated Use `files` property instead.
     */
    zipBuffer: Buffer;
}
interface GetLambdaOptionsFromFunctionOptions {
    sourceFile: string;
    config?: Pick<Config, 'functions'>;
}
export declare class Lambda {
    type: 'Lambda';
    /**
     * This is a label for the type of Lambda a framework is producing.
     * The value can be any string that makes sense for a given framework.
     * Examples: "API", "ISR", "SSR", "SSG", "Render", "Resource"
     */
    operationType?: string;
    files?: Files;
    handler: string;
    runtime: string;
    architecture?: LambdaArchitecture;
    memory?: number;
    maxDuration?: number;
    environment: Env;
    allowQuery?: string[];
    regions?: string[];
    /**
     * @deprecated Use `await lambda.createZip()` instead.
     */
    zipBuffer?: Buffer;
    supportsMultiPayloads?: boolean;
    supportsWrapper?: boolean;
    supportsResponseStreaming?: boolean;
    framework?: FunctionFramework;
    experimentalAllowBundling?: boolean;
    constructor(opts: LambdaOptions);
    createZip(): Promise<Buffer>;
    /**
     * @deprecated Use the `supportsResponseStreaming` property instead.
     */
    get experimentalResponseStreaming(): boolean | undefined;
    set experimentalResponseStreaming(v: boolean | undefined);
}
/**
 * @deprecated Use `new Lambda()` instead.
 */
export declare function createLambda(opts: LambdaOptions): Promise<Lambda>;
export declare function createZip(files: Files): Promise<Buffer>;
export declare function getLambdaOptionsFromFunction({ sourceFile, config, }: GetLambdaOptionsFromFunctionOptions): Promise<Pick<LambdaOptions, 'memory' | 'maxDuration'>>;
export {};
