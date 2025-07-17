var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// ../../node_modules/.pnpm/content-type@1.0.5/node_modules/content-type/index.js
var require_content_type = __commonJS({
  "../../node_modules/.pnpm/content-type@1.0.5/node_modules/content-type/index.js"(exports) {
    "use strict";
    var PARAM_REGEXP = /; *([!#$%&'*+.^_`|~0-9A-Za-z-]+) *= *("(?:[\u000b\u0020\u0021\u0023-\u005b\u005d-\u007e\u0080-\u00ff]|\\[\u000b\u0020-\u00ff])*"|[!#$%&'*+.^_`|~0-9A-Za-z-]+) */g;
    var TEXT_REGEXP = /^[\u000b\u0020-\u007e\u0080-\u00ff]+$/;
    var TOKEN_REGEXP = /^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/;
    var QESC_REGEXP = /\\([\u000b\u0020-\u00ff])/g;
    var QUOTE_REGEXP = /([\\"])/g;
    var TYPE_REGEXP = /^[!#$%&'*+.^_`|~0-9A-Za-z-]+\/[!#$%&'*+.^_`|~0-9A-Za-z-]+$/;
    exports.format = format;
    exports.parse = parse;
    function format(obj) {
      if (!obj || typeof obj !== "object") {
        throw new TypeError("argument obj is required");
      }
      var parameters = obj.parameters;
      var type = obj.type;
      if (!type || !TYPE_REGEXP.test(type)) {
        throw new TypeError("invalid type");
      }
      var string = type;
      if (parameters && typeof parameters === "object") {
        var param;
        var params = Object.keys(parameters).sort();
        for (var i = 0; i < params.length; i++) {
          param = params[i];
          if (!TOKEN_REGEXP.test(param)) {
            throw new TypeError("invalid parameter name");
          }
          string += "; " + param + "=" + qstring(parameters[param]);
        }
      }
      return string;
    }
    function parse(string) {
      if (!string) {
        throw new TypeError("argument string is required");
      }
      var header = typeof string === "object" ? getcontenttype(string) : string;
      if (typeof header !== "string") {
        throw new TypeError("argument string is required to be a string");
      }
      var index = header.indexOf(";");
      var type = index !== -1 ? header.slice(0, index).trim() : header.trim();
      if (!TYPE_REGEXP.test(type)) {
        throw new TypeError("invalid media type");
      }
      var obj = new ContentType(type.toLowerCase());
      if (index !== -1) {
        var key;
        var match;
        var value;
        PARAM_REGEXP.lastIndex = index;
        while (match = PARAM_REGEXP.exec(header)) {
          if (match.index !== index) {
            throw new TypeError("invalid parameter format");
          }
          index += match[0].length;
          key = match[1].toLowerCase();
          value = match[2];
          if (value.charCodeAt(0) === 34) {
            value = value.slice(1, -1);
            if (value.indexOf("\\") !== -1) {
              value = value.replace(QESC_REGEXP, "$1");
            }
          }
          obj.parameters[key] = value;
        }
        if (index !== header.length) {
          throw new TypeError("invalid parameter format");
        }
      }
      return obj;
    }
    function getcontenttype(obj) {
      var header;
      if (typeof obj.getHeader === "function") {
        header = obj.getHeader("content-type");
      } else if (typeof obj.headers === "object") {
        header = obj.headers && obj.headers["content-type"];
      }
      if (typeof header !== "string") {
        throw new TypeError("content-type header is missing from object");
      }
      return header;
    }
    function qstring(val) {
      var str = String(val);
      if (TOKEN_REGEXP.test(str)) {
        return str;
      }
      if (str.length > 0 && !TEXT_REGEXP.test(str)) {
        throw new TypeError("invalid parameter value");
      }
      return '"' + str.replace(QUOTE_REGEXP, "\\$1") + '"';
    }
    function ContentType(type) {
      this.parameters = /* @__PURE__ */ Object.create(null);
      this.type = type;
    }
  }
});

// ../../node_modules/.pnpm/cookie@0.4.0/node_modules/cookie/index.js
var require_cookie = __commonJS({
  "../../node_modules/.pnpm/cookie@0.4.0/node_modules/cookie/index.js"(exports) {
    "use strict";
    exports.parse = parse;
    exports.serialize = serialize;
    var decode = decodeURIComponent;
    var encode = encodeURIComponent;
    var pairSplitRegExp = /; */;
    var fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;
    function parse(str, options) {
      if (typeof str !== "string") {
        throw new TypeError("argument str must be a string");
      }
      var obj = {};
      var opt = options || {};
      var pairs = str.split(pairSplitRegExp);
      var dec = opt.decode || decode;
      for (var i = 0; i < pairs.length; i++) {
        var pair = pairs[i];
        var eq_idx = pair.indexOf("=");
        if (eq_idx < 0) {
          continue;
        }
        var key = pair.substr(0, eq_idx).trim();
        var val = pair.substr(++eq_idx, pair.length).trim();
        if ('"' == val[0]) {
          val = val.slice(1, -1);
        }
        if (void 0 == obj[key]) {
          obj[key] = tryDecode(val, dec);
        }
      }
      return obj;
    }
    function serialize(name, val, options) {
      var opt = options || {};
      var enc = opt.encode || encode;
      if (typeof enc !== "function") {
        throw new TypeError("option encode is invalid");
      }
      if (!fieldContentRegExp.test(name)) {
        throw new TypeError("argument name is invalid");
      }
      var value = enc(val);
      if (value && !fieldContentRegExp.test(value)) {
        throw new TypeError("argument val is invalid");
      }
      var str = name + "=" + value;
      if (null != opt.maxAge) {
        var maxAge = opt.maxAge - 0;
        if (isNaN(maxAge))
          throw new Error("maxAge should be a Number");
        str += "; Max-Age=" + Math.floor(maxAge);
      }
      if (opt.domain) {
        if (!fieldContentRegExp.test(opt.domain)) {
          throw new TypeError("option domain is invalid");
        }
        str += "; Domain=" + opt.domain;
      }
      if (opt.path) {
        if (!fieldContentRegExp.test(opt.path)) {
          throw new TypeError("option path is invalid");
        }
        str += "; Path=" + opt.path;
      }
      if (opt.expires) {
        if (typeof opt.expires.toUTCString !== "function") {
          throw new TypeError("option expires is invalid");
        }
        str += "; Expires=" + opt.expires.toUTCString();
      }
      if (opt.httpOnly) {
        str += "; HttpOnly";
      }
      if (opt.secure) {
        str += "; Secure";
      }
      if (opt.sameSite) {
        var sameSite = typeof opt.sameSite === "string" ? opt.sameSite.toLowerCase() : opt.sameSite;
        switch (sameSite) {
          case true:
            str += "; SameSite=Strict";
            break;
          case "lax":
            str += "; SameSite=Lax";
            break;
          case "strict":
            str += "; SameSite=Strict";
            break;
          case "none":
            str += "; SameSite=None";
            break;
          default:
            throw new TypeError("option sameSite is invalid");
        }
      }
      return str;
    }
    function tryDecode(str, decode2) {
      try {
        return decode2(str);
      } catch (e) {
        return str;
      }
    }
  }
});

// src/serverless-functions/helpers-web.ts
var helpers_web_exports = {};
__export(helpers_web_exports, {
  createWebExportsHandler: () => createWebExportsHandler
});
import { buildToNodeHandler } from "@edge-runtime/node-utils";
function addDuplexToInit(init2) {
  if (typeof init2 === "undefined" || typeof init2 === "object") {
    return { duplex: "half", ...init2 };
  }
  return init2;
}
function defaultHttpHandler(_, res) {
  res.statusCode = 405;
  res.end();
}
var createWebExportsHandler;
var init_helpers_web = __esm({
  "src/serverless-functions/helpers-web.ts"() {
    "use strict";
    createWebExportsHandler = (awaiter) => {
      const webHandlerToNodeHandler = buildToNodeHandler(
        {
          Headers,
          ReadableStream,
          // @ts-expect-error Property 'duplex' is missing in type 'Request'
          Request: class extends Request {
            constructor(input, init2) {
              super(input, addDuplexToInit(init2));
            }
          },
          Uint8Array,
          // @ts-expect-error Property 'waitUntil' is missing in type 'FetchEvent'
          FetchEvent: class {
            constructor() {
              this.waitUntil = (promise) => awaiter.waitUntil(promise);
            }
          }
        },
        { defaultOrigin: "https://vercel.com" }
      );
      function getWebExportsHandler(listener, methods) {
        const handlerByMethod = {};
        for (const key of methods) {
          handlerByMethod[key] = typeof listener[key] !== "undefined" ? webHandlerToNodeHandler(listener[key]) : defaultHttpHandler;
        }
        return (req, res) => {
          const method = req.method ?? "GET";
          handlerByMethod[method](req, res);
        };
      }
      return getWebExportsHandler;
    };
  }
});

// src/dev-server.mts
import { join } from "path";

// src/edge-functions/edge-wasm-plugin.mts
import { createHash } from "crypto";
import { promises as fs } from "fs";
var WasmAssets = class {
  constructor() {
    this.assets = /* @__PURE__ */ new Map();
  }
  /**
   * Declare a WebAssembly binding
   */
  async declare(filePath) {
    const hash = sha1(await fs.readFile(filePath));
    const name = `wasm_${hash}`;
    this.assets.set(name, filePath);
    return name;
  }
  /**
   * Get an object with the context needed to execute the code
   * built with the plugin
   */
  async getContext() {
    const promises = [];
    const context = {};
    for (const [name, filePath] of this.assets) {
      promises.push(
        (async () => {
          const bytes = await fs.readFile(filePath);
          context[name] = await WebAssembly.compile(bytes);
        })()
      );
    }
    await Promise.all(promises);
    return context;
  }
  /**
   * Allow to iterate easily
   */
  [Symbol.iterator]() {
    return this.assets[Symbol.iterator]();
  }
};
function createEdgeWasmPlugin() {
  const wasmAssets = new WasmAssets();
  const plugin = {
    name: "vercel-wasm",
    setup(b) {
      b.onResolve({ filter: /\.wasm\?module/i }, async (data) => {
        const wasmFile = data.path.replace(/\?module$/, "");
        const resolvedPath = await b.resolve(wasmFile, {
          importer: data.importer,
          resolveDir: data.resolveDir
        });
        if (!resolvedPath.path) {
          return {
            errors: [
              { text: `WebAssembly file could not be located: ${wasmFile}` }
            ]
          };
        }
        const name = await wasmAssets.declare(resolvedPath.path);
        return {
          path: name,
          namespace: "vercel-wasm"
        };
      });
      b.onLoad({ namespace: "vercel-wasm", filter: /.+/ }, (args) => {
        return {
          loader: "js",
          contents: `export default globalThis[${JSON.stringify(args.path)}]`
        };
      });
    }
  };
  return { plugin, wasmAssets };
}
function sha1(data) {
  return createHash("sha1").update(data).digest("hex");
}

// src/edge-functions/edge-node-compat-plugin.mts
import BufferImplementation from "buffer";
import EventsImplementation from "events";
import AsyncHooksImplementation from "async_hooks";
import AssertImplementation from "assert";
import UtilImplementation from "util";
var SUPPORTED_NODE_MODULES = [
  "buffer",
  "events",
  "assert",
  "util",
  "async_hooks"
];
var getSupportedNodeModuleRegex = () => new RegExp(`^(?:node:)?(?:${SUPPORTED_NODE_MODULES.join("|")})$`);
function pick(obj, keys) {
  const res = {};
  for (const key of keys) {
    res[key] = obj[key];
  }
  return res;
}
var NativeModuleMap = () => {
  const mods = {
    buffer: pick(BufferImplementation, [
      "constants",
      "kMaxLength",
      "kStringMaxLength",
      "Buffer",
      "SlowBuffer"
    ]),
    events: pick(EventsImplementation, [
      "EventEmitter",
      "captureRejectionSymbol",
      "defaultMaxListeners",
      "errorMonitor",
      "listenerCount",
      "on",
      "once"
    ]),
    async_hooks: pick(AsyncHooksImplementation, [
      "AsyncLocalStorage",
      "AsyncResource"
    ]),
    assert: pick(AssertImplementation, [
      "AssertionError",
      "deepEqual",
      "deepStrictEqual",
      "doesNotMatch",
      "doesNotReject",
      "doesNotThrow",
      "equal",
      "fail",
      "ifError",
      "match",
      "notDeepEqual",
      "notDeepStrictEqual",
      "notEqual",
      "notStrictEqual",
      "ok",
      "rejects",
      "strict",
      "strictEqual",
      "throws"
    ]),
    util: pick(UtilImplementation, [
      "_extend",
      "callbackify",
      "format",
      "inherits",
      "promisify",
      "types"
    ])
  };
  return new Map(Object.entries(mods));
};
var NODE_COMPAT_NAMESPACE = "vercel-node-compat";
var NodeCompatBindings = class {
  constructor() {
    this.bindings = /* @__PURE__ */ new Map();
  }
  use(modulePath) {
    const stripped = modulePath.replace(/^node:/, "");
    const name = `__vc_node_${stripped}__`;
    if (!this.bindings.has(modulePath)) {
      const value = NativeModuleMap().get(stripped);
      if (value === void 0) {
        throw new Error(`Could not find module ${modulePath}`);
      }
      this.bindings.set(modulePath, {
        modulePath,
        name,
        value
      });
    }
    return name;
  }
  getContext() {
    const context = {};
    for (const binding of this.bindings.values()) {
      context[binding.name] = binding.value;
    }
    return context;
  }
};
function createNodeCompatPlugin() {
  const bindings = new NodeCompatBindings();
  const plugin = {
    name: "vc-node-compat",
    setup(b) {
      b.onResolve({ filter: getSupportedNodeModuleRegex() }, async (args) => {
        const importee = args.path.replace("node:", "");
        if (!SUPPORTED_NODE_MODULES.includes(importee)) {
          return;
        }
        return {
          namespace: NODE_COMPAT_NAMESPACE,
          path: args.path
        };
      });
      b.onLoad(
        { filter: /.+/, namespace: NODE_COMPAT_NAMESPACE },
        async (args) => {
          const fullName = args.path.startsWith("node:") ? args.path : `node:${args.path}`;
          const globalName = bindings.use(fullName);
          return {
            contents: `module.exports = ${globalName};`,
            loader: "js"
          };
        }
      );
    }
  };
  return {
    plugin,
    bindings
  };
}

// src/edge-functions/edge-handler.mts
import { EdgeRuntime, runServer } from "edge-runtime";
import { Headers as Headers2, request as undiciRequest } from "undici";
import { isError } from "@vercel/error-utils";
import { readFileSync } from "fs";

// src/utils.ts
import { debug, streamToBuffer } from "@vercel/build-utils";
import { pathToRegexp } from "path-to-regexp";
import { extname } from "path";
var WAIT_UNTIL_TIMEOUT = 10;
var WAIT_UNTIL_TIMEOUT_MS = 10 * 1e3;
var waitUntilWarning = (entrypointPath) => `
The function \`${entrypointPath.split("/").pop()}\` is still running after ${WAIT_UNTIL_TIMEOUT}s.
(hint: do you have a long-running waitUntil() promise?)
`.trim();
function entrypointToOutputPath(entrypoint2, zeroConfig) {
  if (zeroConfig) {
    const ext = extname(entrypoint2);
    return entrypoint2.slice(0, entrypoint2.length - ext.length);
  }
  return entrypoint2;
}
function logError(error) {
  let message = error.message;
  if (!message.startsWith("Error:")) {
    message = `Error: ${message}`;
  }
  console.error(message);
  if (error.stack) {
    const errorPrefixLength = "Error: ".length;
    const errorMessageLength = errorPrefixLength + error.message.length;
    debug(error.stack.substring(errorMessageLength + 1));
  }
}
var EdgeRuntimes = /* @__PURE__ */ ((EdgeRuntimes2) => {
  EdgeRuntimes2["Edge"] = "edge";
  EdgeRuntimes2["ExperimentalEdge"] = "experimental-edge";
  return EdgeRuntimes2;
})(EdgeRuntimes || {});
function isEdgeRuntime(runtime) {
  return runtime !== void 0 && Object.values(EdgeRuntimes).includes(runtime);
}
var ALLOWED_RUNTIMES = Object.values(EdgeRuntimes);
function validateConfiguredRuntime(runtime, entrypoint2) {
  if (runtime) {
    if (runtime === "nodejs") {
      throw new Error(
        `${entrypoint2}: \`config.runtime: "nodejs"\` semantics will evolve soon. Please remove the \`runtime\` key to keep the existing behavior.`
      );
    }
    if (!ALLOWED_RUNTIMES.includes(runtime)) {
      throw new Error(
        `${entrypoint2}: unsupported "runtime" value in \`config\`: ${JSON.stringify(
          runtime
        )} (must be one of: ${JSON.stringify(
          ALLOWED_RUNTIMES
        )}). Learn more: https://vercel.link/creating-edge-functions`
      );
    }
  }
}
async function serializeBody(request) {
  return request.method !== "GET" && request.method !== "HEAD" ? await streamToBuffer(request) : void 0;
}

// src/edge-functions/edge-handler.mts
import esbuild from "esbuild";
import { buildToHeaders } from "@edge-runtime/node-utils";
import { fileURLToPath } from "url";

// src/awaiter.ts
var Awaiter = class {
  constructor({ onError } = {}) {
    this.promises = /* @__PURE__ */ new Set();
    this.awaiting = () => this.waitForBatch().then(
      () => this.promises.size > 0 ? this.waitForBatch() : Promise.resolve()
    );
    this.waitUntil = (promise) => {
      this.promises.add(promise);
    };
    this.waitForBatch = async () => {
      const promises = Array.from(this.promises);
      this.promises.clear();
      await Promise.all(
        promises.map(
          (promise) => Promise.resolve(promise).then(() => void 0, this.onError)
        )
      );
    };
    this.onError = onError ?? console.error;
  }
};

// src/edge-functions/edge-handler.mts
var NODE_VERSION_MAJOR = process.version.match(/^v(\d+)\.\d+/)?.[1];
var NODE_VERSION_IDENTIFIER = `node${NODE_VERSION_MAJOR}`;
if (!NODE_VERSION_MAJOR) {
  throw new Error(
    `Unable to determine current node version: process.version=${process.version}`
  );
}
var toHeaders = buildToHeaders({ Headers: Headers2 });
var __dirname = fileURLToPath(new URL(".", import.meta.url));
var edgeHandlerTemplate = readFileSync(
  `${__dirname}/edge-handler-template.js`
);
async function compileUserCode(entrypointFullPath, entrypointRelativePath, isMiddleware) {
  const { wasmAssets, plugin: edgeWasmPlugin } = createEdgeWasmPlugin();
  const nodeCompatPlugin = createNodeCompatPlugin();
  try {
    const result = await esbuild.build({
      // bundling behavior: use globals (like "browser") instead
      // of "require" statements for core libraries (like "node")
      platform: "browser",
      conditions: ["edge-light", "development"],
      // target syntax: only use syntax available on the current
      // version of node
      target: NODE_VERSION_IDENTIFIER,
      sourcemap: "inline",
      legalComments: "none",
      bundle: true,
      plugins: [
        edgeWasmPlugin,
        nodeCompatPlugin.plugin,
        {
          name: "import.meta.url",
          setup({ onLoad }) {
            onLoad({ filter: /\.[cm]?js$/, namespace: "file" }, (args) => {
              let code = readFileSync(args.path, "utf8");
              code = code.replace(
                /\bimport\.meta\.url\b/g,
                JSON.stringify(import.meta.url)
              );
              return { contents: code };
            });
          }
        }
      ],
      entryPoints: [entrypointFullPath],
      write: false,
      // operate in memory
      format: "cjs"
    });
    const compiledFile = result.outputFiles?.[0];
    if (!compiledFile) {
      throw new Error(
        `Compilation of ${entrypointRelativePath} produced no output files.`
      );
    }
    const userCode = `
      // strict mode
      "use strict";var regeneratorRuntime;

      // user code
      (() => {
        ${compiledFile.text};
      })();

      const userModule = module.exports;

      // request metadata
      const isMiddleware = ${isMiddleware};
      const entrypointLabel = '${entrypointRelativePath}';

      // edge handler
      ${edgeHandlerTemplate};
      const dependencies = { Request, Response };
      const options = { isMiddleware, entrypointLabel };
      registerFetchListener(userModule, options, dependencies);
    `;
    return {
      entrypointPath: entrypointFullPath,
      userCode,
      wasmAssets,
      nodeCompatBindings: nodeCompatPlugin.bindings,
      awaiter: new Awaiter()
    };
  } catch (error) {
    console.error(`Failed to compile user code for edge runtime.`);
    if (isError(error))
      logError(error);
    return void 0;
  }
}
async function createEdgeRuntimeServer(params) {
  try {
    if (!params) {
      return void 0;
    }
    const wasmBindings = await params.wasmAssets.getContext();
    const nodeCompatBindings = params.nodeCompatBindings.getContext();
    const runtime = new EdgeRuntime({
      initialCode: params.userCode,
      extend: (context) => {
        Object.assign(context, {
          // This is required for esbuild wrapping logic to resolve
          module: {},
          // This is required for environment variable access.
          // In production, env var access is provided by static analysis
          // so that only the used values are available.
          process: {
            env: process.env
          },
          // These are the global bindings for Node.js compatibility
          ...nodeCompatBindings,
          // These are the global bindings for WebAssembly module
          ...wasmBindings,
          FetchEvent: class extends context.FetchEvent {
            constructor() {
              super(...arguments);
              this.waitUntil = (promise) => {
                params.awaiter.waitUntil(promise);
              };
            }
          }
        });
        return context;
      }
    });
    const server = await runServer({ runtime });
    runtime.context.globalThis[Symbol.for("@vercel/request-context")] = {
      get: () => ({
        waitUntil: params.awaiter.waitUntil.bind(params.awaiter)
      })
    };
    const onExit2 = () => new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.warn(waitUntilWarning(params.entrypointPath));
        resolve();
      }, WAIT_UNTIL_TIMEOUT_MS);
      Promise.all([params.awaiter.awaiting(), server.close()]).then(() => resolve()).catch(reject).finally(() => clearTimeout(timeout));
    });
    return { server, onExit: onExit2 };
  } catch (error) {
    console.error("Failed to instantiate edge runtime.");
    logError(error);
    return void 0;
  }
}
async function createEdgeEventHandler(entrypointFullPath, entrypointRelativePath, isMiddleware, isZeroConfig) {
  const userCode = await compileUserCode(
    entrypointFullPath,
    entrypointRelativePath,
    isMiddleware
  );
  const result = await createEdgeRuntimeServer(userCode);
  const server = result?.server;
  const onExit2 = result?.onExit;
  const handler = async function(request) {
    if (!server) {
      process.exit(1);
    }
    const body = await serializeBody(request);
    if (body !== void 0 && body.length) {
      request.headers["content-length"] = String(body.length);
    }
    const url = new URL(request.url ?? "/", server.url);
    const response = await undiciRequest(url, {
      body,
      headers: request.headers,
      method: request.method || "GET"
    });
    const resHeaders = toHeaders(response.headers);
    const isUserError = resHeaders.get("x-vercel-failed") === "edge-wrapper";
    if (isUserError && response.statusCode >= 500) {
      const body2 = await response.body.text();
      const fakeStackTrace = `    at (${entrypointRelativePath})`;
      const requestPath = entrypointToRequestPath(
        entrypointRelativePath,
        isZeroConfig
      );
      console.log(
        `Error from API Route ${requestPath}: ${body2}
${fakeStackTrace}`
      );
      process.exit(1);
    }
    return {
      status: response.statusCode,
      headers: resHeaders,
      body: response.body,
      encoding: "utf8"
    };
  };
  return {
    handler,
    onExit: onExit2
  };
}
function entrypointToRequestPath(entrypointRelativePath, isZeroConfig) {
  return "/" + entrypointToOutputPath(entrypointRelativePath, isZeroConfig);
}

// src/dev-server.mts
import { createServer as createServer2 } from "http";

// src/serverless-functions/helpers.ts
var import_content_type = __toESM(require_content_type());
import { PassThrough } from "stream";
import { parse as parseURL } from "url";
import { parse as parseQS } from "querystring";
import etag from "etag";
var ApiError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
};
function normalizeContentType(contentType) {
  if (!contentType) {
    return "text/plain";
  }
  const { type } = (0, import_content_type.parse)(contentType);
  return type;
}
function getBodyParser(body, contentType) {
  return function parseBody() {
    const type = normalizeContentType(contentType);
    if (type === "application/json") {
      try {
        const str = body.toString();
        return str ? JSON.parse(str) : {};
      } catch (error) {
        throw new ApiError(400, "Invalid JSON");
      }
    }
    if (type === "application/octet-stream")
      return body;
    if (type === "application/x-www-form-urlencoded") {
      return parseQS(body.toString());
    }
    if (type === "text/plain")
      return body.toString();
    return void 0;
  };
}
function getQueryParser({ url = "/" }) {
  return function parseQuery() {
    return parseURL(url, true).query;
  };
}
function getCookieParser(req) {
  return function parseCookie() {
    const header = req.headers.cookie;
    if (!header)
      return {};
    const { parse } = require_cookie();
    return parse(Array.isArray(header) ? header.join(";") : header);
  };
}
function status(res, statusCode) {
  res.statusCode = statusCode;
  return res;
}
function setCharset(type, charset) {
  const { parse, format } = require_content_type();
  const parsed = parse(type);
  parsed.parameters.charset = charset;
  return format(parsed);
}
function redirect(res, statusOrUrl, url) {
  if (typeof statusOrUrl === "string") {
    url = statusOrUrl;
    statusOrUrl = 307;
  }
  if (typeof statusOrUrl !== "number" || typeof url !== "string") {
    throw new Error(
      `Invalid redirect arguments. Please use a single argument URL, e.g. res.redirect('/destination') or use a status code and URL, e.g. res.redirect(307, '/destination').`
    );
  }
  res.writeHead(statusOrUrl, { Location: url }).end();
  return res;
}
function setLazyProp(req, prop, getter) {
  const opts = { configurable: true, enumerable: true };
  const optsReset = { ...opts, writable: true };
  Object.defineProperty(req, prop, {
    ...opts,
    get: () => {
      const value = getter();
      Object.defineProperty(req, prop, { ...optsReset, value });
      return value;
    },
    set: (value) => {
      Object.defineProperty(req, prop, { ...optsReset, value });
    }
  });
}
function createETag(body, encoding) {
  const buf = !Buffer.isBuffer(body) ? Buffer.from(body, encoding) : body;
  return etag(buf, { weak: true });
}
function json(req, res, jsonBody) {
  const body = JSON.stringify(jsonBody);
  if (!res.getHeader("content-type")) {
    res.setHeader("content-type", "application/json; charset=utf-8");
  }
  return send(req, res, body);
}
function send(req, res, body) {
  let chunk = body;
  let encoding;
  switch (typeof chunk) {
    case "string":
      if (!res.getHeader("content-type")) {
        res.setHeader("content-type", "text/html");
      }
      break;
    case "boolean":
    case "number":
    case "object":
      if (chunk === null) {
        chunk = "";
      } else if (Buffer.isBuffer(chunk)) {
        if (!res.getHeader("content-type")) {
          res.setHeader("content-type", "application/octet-stream");
        }
      } else {
        return json(req, res, chunk);
      }
      break;
  }
  if (typeof chunk === "string") {
    encoding = "utf8";
    const type = res.getHeader("content-type");
    if (typeof type === "string") {
      res.setHeader("content-type", setCharset(type, "utf-8"));
    }
  }
  let len;
  if (chunk !== void 0) {
    if (Buffer.isBuffer(chunk)) {
      len = chunk.length;
    } else if (typeof chunk === "string") {
      if (chunk.length < 1e3) {
        len = Buffer.byteLength(chunk, encoding);
      } else {
        const buf = Buffer.from(chunk, encoding);
        len = buf.length;
        chunk = buf;
        encoding = void 0;
      }
    } else {
      throw new Error(
        "`body` is not a valid string, object, boolean, number, Stream, or Buffer"
      );
    }
    if (len !== void 0) {
      res.setHeader("content-length", len);
    }
  }
  let etag2;
  if (!res.getHeader("etag") && len !== void 0 && (etag2 = createETag(chunk, encoding))) {
    res.setHeader("etag", etag2);
  }
  if (204 === res.statusCode || 304 === res.statusCode) {
    res.removeHeader("Content-Type");
    res.removeHeader("Content-Length");
    res.removeHeader("Transfer-Encoding");
    chunk = "";
  }
  if (req.method === "HEAD") {
    res.end();
  } else if (encoding) {
    res.end(chunk, encoding);
  } else {
    res.end(chunk);
  }
  return res;
}
function restoreBody(req, body) {
  const replicateBody = new PassThrough();
  const on = replicateBody.on.bind(replicateBody);
  const originalOn = req.on.bind(req);
  req.read = replicateBody.read.bind(replicateBody);
  req.on = req.addListener = (name, cb) => (
    // @ts-expect-error
    name === "data" || name === "end" ? on(name, cb) : originalOn(name, cb)
  );
  replicateBody.write(body);
  replicateBody.end();
}
async function readBody(req) {
  const body = await serializeBody(req) || Buffer.from("");
  restoreBody(req, body);
  return body;
}
async function addHelpers(_req, _res) {
  const req = _req;
  const res = _res;
  setLazyProp(req, "cookies", getCookieParser(req));
  setLazyProp(req, "query", getQueryParser(req));
  const contentType = req.headers["content-type"];
  const body = contentType === void 0 ? Buffer.from("") : await readBody(req);
  setLazyProp(req, "body", getBodyParser(body, contentType));
  res.status = (statusCode) => status(res, statusCode);
  res.redirect = (statusOrUrl, url) => redirect(res, statusOrUrl, url);
  res.send = (body2) => send(req, res, body2);
  res.json = (jsonBody) => json(req, res, jsonBody);
}

// src/serverless-functions/serverless-handler.mts
import { createServer } from "http";
import { Headers as Headers3, request as undiciRequest2 } from "undici";
import { listen } from "async-listen";
import { isAbsolute } from "path";
import { pathToFileURL } from "url";
import { buildToHeaders as buildToHeaders2 } from "@edge-runtime/node-utils";
import { promisify } from "util";
var toHeaders2 = buildToHeaders2({ Headers: Headers3 });
var [NODE_MAJOR] = process.versions.node.split(".").map((v) => Number(v));
var HTTP_METHODS = [
  "GET",
  "HEAD",
  "OPTIONS",
  "POST",
  "PUT",
  "DELETE",
  "PATCH"
];
async function createServerlessServer(userCode) {
  const server = createServer(userCode);
  return {
    url: await listen(server, { host: "127.0.0.1", port: 0 }),
    onExit: promisify(server.close.bind(server))
  };
}
async function compileUserCode2(entrypointPath, awaiter, options) {
  const id = isAbsolute(entrypointPath) ? pathToFileURL(entrypointPath).href : entrypointPath;
  let listener = await import(id);
  for (let i = 0; i < 5; i++) {
    if (listener.default)
      listener = listener.default;
  }
  if (HTTP_METHODS.some((method) => typeof listener[method] === "function")) {
    if (NODE_MAJOR < 18) {
      throw new Error(
        "Node.js v18 or above is required to use HTTP method exports in your functions."
      );
    }
    const { createWebExportsHandler: createWebExportsHandler2 } = await Promise.resolve().then(() => (init_helpers_web(), helpers_web_exports));
    const getWebExportsHandler = createWebExportsHandler2(awaiter);
    return getWebExportsHandler(listener, HTTP_METHODS);
  }
  return async (req, res) => {
    if (options.shouldAddHelpers && typeof listener.listen !== "function") {
      await addHelpers(req, res);
    }
    return listener(req, res);
  };
}
async function createServerlessEventHandler(entrypointPath, options) {
  const awaiter = new Awaiter();
  Object.defineProperty(globalThis, Symbol.for("@vercel/request-context"), {
    enumerable: false,
    configurable: true,
    value: {
      get: () => ({
        waitUntil: awaiter.waitUntil.bind(awaiter)
      })
    }
  });
  const userCode = await compileUserCode2(entrypointPath, awaiter, options);
  const server = await createServerlessServer(userCode);
  const isStreaming = options.mode === "streaming";
  const handler = async function(request) {
    const url = new URL(request.url ?? "/", server.url);
    const response = await undiciRequest2(url, {
      body: await serializeBody(request),
      headers: {
        ...request.headers,
        host: request.headers["x-forwarded-host"]
      },
      method: request.method || "GET"
    });
    let body = null;
    let headers = toHeaders2(response.headers);
    if (isStreaming) {
      body = response.body;
    } else {
      body = Buffer.from(await response.body.arrayBuffer());
    }
    return {
      status: response.statusCode,
      headers,
      body,
      encoding: "utf8"
    };
  };
  const onExit2 = () => new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      console.warn(waitUntilWarning(entrypointPath));
      resolve();
    }, WAIT_UNTIL_TIMEOUT_MS);
    Promise.all([awaiter.awaiting(), server.onExit()]).then(() => resolve()).catch(reject).finally(() => clearTimeout(timeout));
  });
  return {
    handler,
    onExit: onExit2
  };
}

// src/dev-server.mts
import { init, parse as parseEsm } from "es-module-lexer";
import { parse as parseCjs } from "cjs-module-lexer";
import { getConfig } from "@vercel/static-config";
import { Project } from "ts-morph";
import { listen as listen2 } from "async-listen";
import { readFile } from "fs/promises";
var entrypoint = process.env.VERCEL_DEV_ENTRYPOINT;
delete process.env.VERCEL_DEV_ENTRYPOINT;
if (!entrypoint) {
  throw new Error("`VERCEL_DEV_ENTRYPOINT` must be defined");
}
var parseConfig = (entryPointPath) => getConfig(new Project(), entryPointPath);
async function createEventHandler(entrypoint2, config, options) {
  const entrypointPath = join(process.cwd(), entrypoint2);
  const staticConfig = parseConfig(entrypointPath);
  const runtime = staticConfig?.runtime;
  validateConfiguredRuntime(runtime, entrypoint2);
  if (config.middleware === true || isEdgeRuntime(runtime)) {
    return createEdgeEventHandler(
      entrypointPath,
      entrypoint2,
      config.middleware || false,
      config.zeroConfig
    );
  }
  const content = await readFile(entrypointPath, "utf8");
  const isStreaming = staticConfig?.supportsResponseStreaming || await hasWebHandlers(async () => parseCjs(content).exports) || await hasWebHandlers(
    async () => init.then(() => parseEsm(content)[1].map((specifier) => specifier.n))
  );
  return createServerlessEventHandler(entrypointPath, {
    mode: isStreaming ? "streaming" : "buffer",
    shouldAddHelpers: options.shouldAddHelpers
  });
}
async function hasWebHandlers(getExports) {
  const exports = await getExports().catch(() => []);
  for (const name of exports) {
    if (HTTP_METHODS.includes(name)) {
      return true;
    }
  }
  return false;
}
var handleEvent;
var handlerEventError;
var onExit;
async function main() {
  const config = JSON.parse(process.env.VERCEL_DEV_CONFIG || "{}");
  delete process.env.VERCEL_DEV_CONFIG;
  const buildEnv = JSON.parse(process.env.VERCEL_DEV_BUILD_ENV || "{}");
  delete process.env.VERCEL_DEV_BUILD_ENV;
  const shouldAddHelpers = !(config.helpers === false || buildEnv.NODEJS_HELPERS === "0");
  const proxyServer = createServer2(onDevRequest);
  await listen2(proxyServer, { host: "127.0.0.1", port: 0 });
  try {
    const result = await createEventHandler(entrypoint, config, {
      shouldAddHelpers
    });
    handleEvent = result.handler;
    onExit = result.onExit;
  } catch (error) {
    logError(error);
    handlerEventError = error;
  }
  const address = proxyServer.address();
  if (typeof process.send === "function") {
    process.send(address);
  } else {
    console.log("Dev server listening:", address);
  }
}
async function onDevRequest(req, res) {
  if (handlerEventError) {
    process.exit(1);
  }
  if (!handleEvent) {
    res.statusCode = 500;
    res.end("Bridge is not ready, please try again");
    return;
  }
  try {
    const { headers, body, status: status2 } = await handleEvent(req);
    res.statusCode = status2;
    for (const [key, value] of headers) {
      if (value !== void 0)
        res.setHeader(
          key,
          key === "set-cookie" ? headers.getSetCookie() : value
        );
    }
    if (body === null) {
      res.end();
    } else if (body instanceof Buffer) {
      res.end(body);
    } else {
      body.pipe(res);
    }
  } catch (error) {
    res.statusCode = 500;
    res.end(error.stack);
  }
}
main().catch((err) => {
  logError(err);
  process.exit(1);
});
process.on("message", async (m) => {
  switch (m) {
    case "shutdown":
      if (onExit) {
        await onExit();
      }
      process.exit(0);
      break;
    default:
      console.error(`unknown IPC message from parent:`, m);
      break;
  }
});
/*! Bundled license information:

content-type/index.js:
  (*!
   * content-type
   * Copyright(c) 2015 Douglas Christopher Wilson
   * MIT Licensed
   *)

cookie/index.js:
  (*!
   * cookie
   * Copyright(c) 2012-2014 Roman Shtylman
   * Copyright(c) 2015 Douglas Christopher Wilson
   * MIT Licensed
   *)
*/
