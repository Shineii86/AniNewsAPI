"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
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
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var schemas_exports = {};
__export(schemas_exports, {
  buildsSchema: () => buildsSchema,
  functionsSchema: () => functionsSchema
});
module.exports = __toCommonJS(schemas_exports);
const functionsSchema = {
  type: "object",
  minProperties: 1,
  maxProperties: 50,
  additionalProperties: false,
  patternProperties: {
    "^.{1,256}$": {
      type: "object",
      additionalProperties: false,
      properties: {
        runtime: {
          type: "string",
          maxLength: 256
        },
        memory: {
          minimum: 128,
          maximum: 3009
        },
        maxDuration: {
          type: "number",
          minimum: 1,
          maximum: 900
        },
        includeFiles: {
          type: "string",
          maxLength: 256
        },
        excludeFiles: {
          type: "string",
          maxLength: 256
        }
      }
    }
  }
};
const buildsSchema = {
  type: "array",
  minItems: 0,
  maxItems: 128,
  items: {
    type: "object",
    additionalProperties: false,
    required: ["use"],
    properties: {
      src: {
        type: "string",
        minLength: 1,
        maxLength: 4096
      },
      use: {
        type: "string",
        minLength: 3,
        maxLength: 256
      },
      config: { type: "object" }
    }
  }
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  buildsSchema,
  functionsSchema
});
