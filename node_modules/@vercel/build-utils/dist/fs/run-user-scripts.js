"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var run_user_scripts_exports = {};
__export(run_user_scripts_exports, {
  detectPackageManager: () => detectPackageManager,
  execCommand: () => execCommand,
  getEnvForPackageManager: () => getEnvForPackageManager,
  getNodeBinPath: () => getNodeBinPath,
  getNodeBinPaths: () => getNodeBinPaths,
  getNodeVersion: () => getNodeVersion,
  getPathForPackageManager: () => getPathForPackageManager,
  getPathOverrideForPackageManager: () => getPathOverrideForPackageManager,
  getScriptName: () => getScriptName,
  getSpawnOptions: () => getSpawnOptions,
  installDependencies: () => installDependencies,
  runBundleInstall: () => runBundleInstall,
  runCustomInstallCommand: () => runCustomInstallCommand,
  runNpmInstall: () => runNpmInstall,
  runPackageJsonScript: () => runPackageJsonScript,
  runPipInstall: () => runPipInstall,
  runShellScript: () => runShellScript,
  scanParentDirs: () => scanParentDirs,
  spawnAsync: () => spawnAsync,
  spawnCommand: () => spawnCommand,
  traverseUpDirectories: () => traverseUpDirectories,
  turboVersionSpecifierSupportsCorepack: () => turboVersionSpecifierSupportsCorepack,
  usingCorepack: () => usingCorepack,
  walkParentDirs: () => walkParentDirs
});
module.exports = __toCommonJS(run_user_scripts_exports);
var import_assert = __toESM(require("assert"));
var import_fs_extra = __toESM(require("fs-extra"));
var import_path = __toESM(require("path"));
var import_async_sema = __toESM(require("async-sema"));
var import_cross_spawn = __toESM(require("cross-spawn"));
var import_semver = require("semver");
var import_util = require("util");
var import_debug = __toESM(require("../debug"));
var import_errors = require("../errors");
var import_node_version = require("./node-version");
var import_read_config_file = require("./read-config-file");
var import_clone_env = require("../clone-env");
var import_json5 = __toESM(require("json5"));
const runNpmInstallSema = new import_async_sema.default(1);
const NO_OVERRIDE = {
  detectedLockfile: void 0,
  detectedPackageManager: void 0,
  path: void 0
};
function spawnAsync(command, args, opts = {}) {
  return new Promise((resolve, reject) => {
    const stderrLogs = [];
    opts = { stdio: "inherit", ...opts };
    const child = (0, import_cross_spawn.default)(command, args, opts);
    if (opts.stdio === "pipe" && child.stderr) {
      child.stderr.on("data", (data) => stderrLogs.push(data));
    }
    child.on("error", reject);
    child.on("close", (code, signal) => {
      if (code === 0 || opts.ignoreNon0Exit) {
        return resolve();
      }
      const cmd = opts.prettyCommand ? `Command "${opts.prettyCommand}"` : "Command";
      reject(
        new import_errors.NowBuildError({
          code: `BUILD_UTILS_SPAWN_${code || signal}`,
          message: opts.stdio === "inherit" ? `${cmd} exited with ${code || signal}` : stderrLogs.map((line) => line.toString()).join("")
        })
      );
    });
  });
}
function spawnCommand(command, options = {}) {
  const opts = { ...options, prettyCommand: command };
  if (process.platform === "win32") {
    return (0, import_cross_spawn.default)("cmd.exe", ["/C", command], opts);
  }
  return (0, import_cross_spawn.default)("sh", ["-c", command], opts);
}
async function execCommand(command, options = {}) {
  const opts = { ...options, prettyCommand: command };
  if (process.platform === "win32") {
    await spawnAsync("cmd.exe", ["/C", command], opts);
  } else {
    await spawnAsync("sh", ["-c", command], opts);
  }
  return true;
}
function* traverseUpDirectories({
  start,
  base
}) {
  let current = import_path.default.normalize(start);
  const normalizedRoot = base ? import_path.default.normalize(base) : void 0;
  while (current) {
    yield current;
    if (current === normalizedRoot)
      break;
    const next = import_path.default.join(current, "..");
    current = next === current ? void 0 : next;
  }
}
async function readProjectRootInfo({
  start,
  base
}) {
  let curRootPackageJsonPath;
  for (const dir of traverseUpDirectories({ start, base })) {
    const packageJsonPath = import_path.default.join(dir, "package.json");
    if (await import_fs_extra.default.pathExists(packageJsonPath)) {
      curRootPackageJsonPath = packageJsonPath;
    }
  }
  return curRootPackageJsonPath ? {
    packageJson: await import_fs_extra.default.readJson(curRootPackageJsonPath),
    rootDir: import_path.default.dirname(curRootPackageJsonPath)
  } : void 0;
}
async function getNodeBinPath({
  cwd
}) {
  const { lockfilePath } = await scanParentDirs(cwd);
  const dir = import_path.default.dirname(lockfilePath || cwd);
  return import_path.default.join(dir, "node_modules", ".bin");
}
function getNodeBinPaths({
  start,
  base
}) {
  return Array.from(traverseUpDirectories({ start, base })).map(
    (dir) => import_path.default.join(dir, "node_modules/.bin")
  );
}
async function chmodPlusX(fsPath) {
  const s = await import_fs_extra.default.stat(fsPath);
  const newMode = s.mode | 64 | 8 | 1;
  if (s.mode === newMode)
    return;
  const base8 = newMode.toString(8).slice(-3);
  await import_fs_extra.default.chmod(fsPath, base8);
}
async function runShellScript(fsPath, args = [], spawnOpts) {
  (0, import_assert.default)(import_path.default.isAbsolute(fsPath));
  const destPath = import_path.default.dirname(fsPath);
  await chmodPlusX(fsPath);
  const command = `./${import_path.default.basename(fsPath)}`;
  await spawnAsync(command, args, {
    ...spawnOpts,
    cwd: destPath,
    prettyCommand: command
  });
  return true;
}
function getSpawnOptions(meta, nodeVersion) {
  const opts = {
    env: (0, import_clone_env.cloneEnv)(process.env)
  };
  if (!meta.isDev) {
    let found = false;
    const oldPath = opts.env.PATH || process.env.PATH || "";
    const pathSegments = oldPath.split(import_path.default.delimiter).map((segment) => {
      if (/^\/node[0-9]+\/bin/.test(segment)) {
        found = true;
        return `/node${nodeVersion.major}/bin`;
      }
      return segment;
    });
    if (!found) {
      pathSegments.unshift(`/node${nodeVersion.major}/bin`);
    }
    opts.env.PATH = pathSegments.filter(Boolean).join(import_path.default.delimiter);
  }
  return opts;
}
async function getNodeVersion(destPath, fallbackVersion = process.env.VERCEL_PROJECT_SETTINGS_NODE_VERSION, config = {}, meta = {}, availableVersions = (0, import_node_version.getAvailableNodeVersions)()) {
  const latestVersion = (0, import_node_version.getLatestNodeVersion)(availableVersions);
  if (meta.isDev) {
    return { ...latestVersion, runtime: "nodejs" };
  }
  const { packageJson } = await scanParentDirs(destPath, true);
  const configuredVersion = config.nodeVersion || fallbackVersion;
  const packageJsonVersion = packageJson?.engines?.node;
  const supportedNodeVersion = await (0, import_node_version.getSupportedNodeVersion)(
    packageJsonVersion || configuredVersion,
    !packageJsonVersion,
    availableVersions
  );
  if (packageJson?.engines?.node) {
    const { node } = packageJson.engines;
    if (configuredVersion && !(0, import_semver.intersects)(configuredVersion, supportedNodeVersion.range)) {
      console.warn(
        `Warning: Due to "engines": { "node": "${node}" } in your \`package.json\` file, the Node.js Version defined in your Project Settings ("${configuredVersion}") will not apply, Node.js Version "${supportedNodeVersion.range}" will be used instead. Learn More: http://vercel.link/node-version`
      );
    }
    if ((0, import_semver.coerce)(node)?.raw === node) {
      console.warn(
        `Warning: Detected "engines": { "node": "${node}" } in your \`package.json\` with major.minor.patch, but only major Node.js Version can be selected. Learn More: http://vercel.link/node-version`
      );
    } else if ((0, import_semver.validRange)(node) && (0, import_semver.intersects)(`${latestVersion.major + 1}.x`, node)) {
      console.warn(
        `Warning: Detected "engines": { "node": "${node}" } in your \`package.json\` that will automatically upgrade when a new major Node.js Version is released. Learn More: http://vercel.link/node-version`
      );
    }
  }
  return supportedNodeVersion;
}
async function scanParentDirs(destPath, readPackageJson = false, base = "/") {
  (0, import_assert.default)(import_path.default.isAbsolute(destPath));
  const pkgJsonPath = await walkParentDirs({
    base,
    start: destPath,
    filename: "package.json"
  });
  const packageJson = readPackageJson && pkgJsonPath ? JSON.parse(await import_fs_extra.default.readFile(pkgJsonPath, "utf8")) : void 0;
  const {
    paths: [yarnLockPath, npmLockPath, pnpmLockPath, bunLockPath],
    packageJsonPackageManager
  } = await walkParentDirsMulti({
    base,
    start: destPath,
    filenames: [
      "yarn.lock",
      "package-lock.json",
      "pnpm-lock.yaml",
      "bun.lockb"
    ]
  });
  let lockfilePath;
  let lockfileVersion;
  let cliType;
  const [hasYarnLock, packageLockJson, pnpmLockYaml, bunLockBin] = await Promise.all([
    Boolean(yarnLockPath),
    npmLockPath ? (0, import_read_config_file.readConfigFile)(npmLockPath) : null,
    pnpmLockPath ? (0, import_read_config_file.readConfigFile)(pnpmLockPath) : null,
    bunLockPath ? import_fs_extra.default.readFile(bunLockPath, "utf8") : null
  ]);
  const rootProjectInfo = readPackageJson ? await readProjectRootInfo({
    base,
    start: destPath
  }) : void 0;
  const turboVersionRange = rootProjectInfo?.packageJson?.devDependencies?.turbo;
  const turboSupportsCorepackHome = turboVersionRange ? await checkTurboSupportsCorepack(
    turboVersionRange,
    rootProjectInfo?.rootDir
  ) : void 0;
  if (bunLockBin && hasYarnLock) {
    cliType = "bun";
    lockfilePath = bunLockPath;
    lockfileVersion = 0;
  } else if (hasYarnLock) {
    cliType = "yarn";
    lockfilePath = yarnLockPath;
  } else if (pnpmLockYaml) {
    cliType = "pnpm";
    lockfilePath = pnpmLockPath;
    lockfileVersion = Number(pnpmLockYaml.lockfileVersion);
  } else if (packageLockJson) {
    cliType = "npm";
    lockfilePath = npmLockPath;
    lockfileVersion = packageLockJson.lockfileVersion;
  } else if (bunLockBin) {
    cliType = "bun";
    lockfilePath = bunLockPath;
    lockfileVersion = 0;
  } else {
    cliType = detectPackageManagerNameWithoutLockfile(
      packageJsonPackageManager,
      turboSupportsCorepackHome
    );
  }
  const packageJsonPath = pkgJsonPath || void 0;
  return {
    cliType,
    packageJson,
    packageJsonPackageManager,
    lockfilePath,
    lockfileVersion,
    packageJsonPath,
    turboSupportsCorepackHome
  };
}
async function checkTurboSupportsCorepack(turboVersionRange, rootDir) {
  if (turboVersionSpecifierSupportsCorepack(turboVersionRange)) {
    return true;
  }
  const turboJsonPath = import_path.default.join(rootDir, "turbo.json");
  const turboJsonExists = await import_fs_extra.default.pathExists(turboJsonPath);
  let turboJson = null;
  if (turboJsonExists) {
    try {
      turboJson = import_json5.default.parse(await import_fs_extra.default.readFile(turboJsonPath, "utf8"));
    } catch (err) {
      console.warn(`WARNING: Failed to parse turbo.json`);
    }
  }
  const turboJsonIncludesCorepackHome = turboJson !== null && typeof turboJson === "object" && "globalPassThroughEnv" in turboJson && Array.isArray(turboJson.globalPassThroughEnv) && turboJson.globalPassThroughEnv.includes("COREPACK_HOME");
  return turboJsonIncludesCorepackHome;
}
function turboVersionSpecifierSupportsCorepack(turboVersionSpecifier) {
  if (!(0, import_semver.validRange)(turboVersionSpecifier)) {
    return false;
  }
  const versionSupportingCorepack = "2.1.3";
  const minTurboBeingUsed = (0, import_semver.minVersion)(turboVersionSpecifier);
  if (!minTurboBeingUsed) {
    return false;
  }
  return (0, import_semver.gte)(minTurboBeingUsed, versionSupportingCorepack);
}
function detectPackageManagerNameWithoutLockfile(packageJsonPackageManager, turboSupportsCorepackHome) {
  if (usingCorepack(
    process.env,
    packageJsonPackageManager,
    turboSupportsCorepackHome
  )) {
    const corepackPackageManager = validateVersionSpecifier(
      packageJsonPackageManager
    );
    switch (corepackPackageManager?.packageName) {
      case "npm":
      case "pnpm":
      case "yarn":
      case "bun":
        return corepackPackageManager.packageName;
      case void 0:
        return "npm";
      default:
        throw new Error(
          `Unknown package manager "${corepackPackageManager?.packageName}". Change your package.json "packageManager" field to a known package manager: npm, pnpm, yarn, bun.`
        );
    }
  }
  return "npm";
}
function usingCorepack(env, packageJsonPackageManager, turboSupportsCorepackHome) {
  if (env.ENABLE_EXPERIMENTAL_COREPACK !== "1" || packageJsonPackageManager === void 0) {
    return false;
  }
  if (turboSupportsCorepackHome === false) {
    console.warn(
      "Warning: Disabling corepack because it may break your project. To use corepack, either upgrade to `turbo@2.1.3+` or include `COREPACK_HOME` in `turbo.json#globalPassThroughEnv`."
    );
    return false;
  }
  return true;
}
async function walkParentDirs({
  base,
  start,
  filename
}) {
  (0, import_assert.default)(import_path.default.isAbsolute(base), 'Expected "base" to be absolute path');
  (0, import_assert.default)(import_path.default.isAbsolute(start), 'Expected "start" to be absolute path');
  for (const dir of traverseUpDirectories({ start, base })) {
    const fullPath = import_path.default.join(dir, filename);
    if (await import_fs_extra.default.pathExists(fullPath)) {
      return fullPath;
    }
  }
  return null;
}
async function walkParentDirsMulti({
  base,
  start,
  filenames
}) {
  let packageManager;
  for (const dir of traverseUpDirectories({ start, base })) {
    const fullPaths = filenames.map((f) => import_path.default.join(dir, f));
    const existResults = await Promise.all(
      fullPaths.map((f) => import_fs_extra.default.pathExists(f))
    );
    const foundOneOrMore = existResults.some((b) => b);
    const packageJsonPath = import_path.default.join(dir, "package.json");
    const packageJson = await import_fs_extra.default.readJSON(packageJsonPath).catch(() => null);
    if (packageJson?.packageManager) {
      packageManager = packageJson.packageManager;
    }
    if (foundOneOrMore) {
      return {
        paths: fullPaths.map((f, i) => existResults[i] ? f : void 0),
        packageJsonPackageManager: packageManager
      };
    }
  }
  return { paths: [], packageJsonPackageManager: packageManager };
}
function isSet(v) {
  return v?.constructor?.name === "Set";
}
async function runNpmInstall(destPath, args = [], spawnOpts, meta, nodeVersion) {
  if (meta?.isDev) {
    (0, import_debug.default)("Skipping dependency installation because dev mode is enabled");
    return false;
  }
  (0, import_assert.default)(import_path.default.isAbsolute(destPath));
  try {
    await runNpmInstallSema.acquire();
    const {
      cliType,
      packageJsonPath,
      packageJson,
      lockfileVersion,
      packageJsonPackageManager,
      turboSupportsCorepackHome
    } = await scanParentDirs(destPath, true);
    if (!packageJsonPath) {
      (0, import_debug.default)(
        `Skipping dependency installation because no package.json was found for ${destPath}`
      );
      runNpmInstallSema.release();
      return false;
    }
    if (meta && packageJsonPath && args.length === 0) {
      if (!isSet(meta.runNpmInstallSet)) {
        meta.runNpmInstallSet = /* @__PURE__ */ new Set();
      }
      if (isSet(meta.runNpmInstallSet)) {
        if (meta.runNpmInstallSet.has(packageJsonPath)) {
          return false;
        } else {
          meta.runNpmInstallSet.add(packageJsonPath);
        }
      }
    }
    const installTime = Date.now();
    console.log("Installing dependencies...");
    (0, import_debug.default)(`Installing to ${destPath}`);
    const opts = { cwd: destPath, ...spawnOpts };
    const env = (0, import_clone_env.cloneEnv)(opts.env || process.env);
    delete env.NODE_ENV;
    opts.env = getEnvForPackageManager({
      cliType,
      lockfileVersion,
      packageJsonPackageManager,
      nodeVersion,
      env,
      packageJsonEngines: packageJson?.engines,
      turboSupportsCorepackHome
    });
    let commandArgs;
    const isPotentiallyBrokenNpm = cliType === "npm" && (nodeVersion?.major === 16 || opts.env.PATH?.includes("/node16/bin-npm7")) && !args.includes("--legacy-peer-deps") && spawnOpts?.env?.ENABLE_EXPERIMENTAL_COREPACK !== "1";
    if (cliType === "npm") {
      opts.prettyCommand = "npm install";
      commandArgs = args.filter((a) => a !== "--prefer-offline").concat(["install", "--no-audit", "--unsafe-perm"]);
      if (isPotentiallyBrokenNpm && spawnOpts?.env?.VERCEL_NPM_LEGACY_PEER_DEPS === "1") {
        commandArgs.push("--legacy-peer-deps");
      }
    } else if (cliType === "pnpm") {
      opts.prettyCommand = "pnpm install";
      commandArgs = args.filter((a) => a !== "--prefer-offline").concat(["install", "--unsafe-perm"]);
    } else if (cliType === "bun") {
      opts.prettyCommand = "bun install";
      commandArgs = ["install", ...args];
    } else {
      opts.prettyCommand = "yarn install";
      commandArgs = ["install", ...args];
    }
    if (process.env.NPM_ONLY_PRODUCTION) {
      commandArgs.push("--production");
    }
    try {
      await spawnAsync(cliType, commandArgs, opts);
    } catch (err) {
      const potentialErrorPath = import_path.default.join(
        process.env.HOME || "/",
        ".npm",
        "eresolve-report.txt"
      );
      if (isPotentiallyBrokenNpm && !commandArgs.includes("--legacy-peer-deps") && import_fs_extra.default.existsSync(potentialErrorPath)) {
        console.warn(
          'Warning: Retrying "Install Command" with `--legacy-peer-deps` which may accept a potentially broken dependency and slow install time.'
        );
        commandArgs.push("--legacy-peer-deps");
        await spawnAsync(cliType, commandArgs, opts);
      } else {
        throw err;
      }
    }
    (0, import_debug.default)(`Install complete [${Date.now() - installTime}ms]`);
    return true;
  } finally {
    runNpmInstallSema.release();
  }
}
function getEnvForPackageManager({
  cliType,
  lockfileVersion,
  packageJsonPackageManager,
  nodeVersion,
  env,
  packageJsonEngines,
  turboSupportsCorepackHome
}) {
  const corepackEnabled = usingCorepack(
    env,
    packageJsonPackageManager,
    turboSupportsCorepackHome
  );
  const {
    detectedLockfile,
    detectedPackageManager,
    path: newPath
  } = getPathOverrideForPackageManager({
    cliType,
    lockfileVersion,
    corepackPackageManager: packageJsonPackageManager,
    nodeVersion,
    corepackEnabled,
    packageJsonEngines
  });
  if (corepackEnabled) {
    (0, import_debug.default)(
      `Detected corepack use for "${packageJsonPackageManager}". Not overriding package manager version.`
    );
  } else {
    (0, import_debug.default)(
      `Detected ${detectedPackageManager}. Added "${newPath}" to path. Based on assumed package manager "${cliType}", lockfile "${detectedLockfile}", and lockfileVersion "${lockfileVersion}"`
    );
  }
  const newEnv = {
    ...env
  };
  const alreadyInPath = (newPath2) => {
    const oldPath = env.PATH ?? "";
    return oldPath.split(import_path.default.delimiter).includes(newPath2);
  };
  if (newPath && !alreadyInPath(newPath)) {
    const oldPath = env.PATH + "";
    newEnv.PATH = `${newPath}${import_path.default.delimiter}${oldPath}`;
    if (detectedLockfile && detectedPackageManager) {
      const versionString = cliType === "pnpm" ? `version ${lockfileVersion} ` : "";
      console.log(
        `Detected \`${detectedLockfile}\` ${versionString}generated by ${detectedPackageManager}`
      );
      if (cliType === "bun") {
        console.warn(
          "Warning: Bun is used as a package manager at build time only, not at runtime with Functions"
        );
      }
    }
  }
  if (cliType === "yarn" && !env.YARN_NODE_LINKER) {
    newEnv.YARN_NODE_LINKER = "node-modules";
  }
  return newEnv;
}
function detectPnpmVersion(lockfileVersion) {
  switch (true) {
    case lockfileVersion === void 0:
      return "not found";
    case lockfileVersion === 5.3:
      return "pnpm 6";
    case lockfileVersion === 5.4:
      return "pnpm 7";
    case (lockfileVersion === 6 || lockfileVersion === 6.1):
      return "pnpm 8";
    case (lockfileVersion === 7 || lockfileVersion === 9):
      return "pnpm 9";
    default:
      return "not found";
  }
}
function validLockfileForPackageManager(cliType, lockfileVersion, packageManagerVersion) {
  const packageManagerMajorVersion = packageManagerVersion.major;
  switch (cliType) {
    case "npm":
    case "bun":
    case "yarn":
      return true;
    case "pnpm":
      switch (packageManagerMajorVersion) {
        case 9:
          if ("9.0.0" === packageManagerVersion.version && lockfileVersion === 6) {
            return false;
          }
          return [6, 7, 9].includes(lockfileVersion);
        case 8:
          return [6, 6.1].includes(lockfileVersion);
        case 7:
          return [5.3, 5.4].includes(lockfileVersion);
        case 6:
          return [5.3, 5.4].includes(lockfileVersion);
        default:
          return true;
      }
  }
}
function getPathOverrideForPackageManager({
  cliType,
  lockfileVersion,
  corepackPackageManager,
  corepackEnabled = true,
  packageJsonEngines
}) {
  const detectedPackageManger = detectPackageManager(cliType, lockfileVersion);
  if (!corepackPackageManager || !corepackEnabled) {
    if (cliType === "pnpm" && packageJsonEngines?.pnpm) {
      checkEnginesPnpmAgainstDetected(
        packageJsonEngines.pnpm,
        detectedPackageManger
      );
    }
    return detectedPackageManger ?? NO_OVERRIDE;
  }
  validateCorepackPackageManager(
    cliType,
    lockfileVersion,
    corepackPackageManager,
    packageJsonEngines?.pnpm
  );
  return NO_OVERRIDE;
}
function checkEnginesPnpmAgainstDetected(enginesPnpm, detectedPackageManger) {
  if (detectedPackageManger?.pnpmVersionRange && (0, import_semver.validRange)(detectedPackageManger.pnpmVersionRange) && (0, import_semver.validRange)(enginesPnpm)) {
    if (!(0, import_semver.intersects)(detectedPackageManger.pnpmVersionRange, enginesPnpm)) {
      throw new Error(
        `Detected pnpm "${detectedPackageManger.pnpmVersionRange}" is not compatible with the engines.pnpm "${enginesPnpm}" in your package.json. Either enable corepack with a valid package.json#packageManager value (https://vercel.com/docs/deployments/configure-a-build#corepack) or remove your package.json#engines.pnpm.`
      );
    }
  }
  console.warn(
    `Using package.json#engines.pnpm without corepack and package.json#packageManager could lead to failed builds with ERR_PNPM_UNSUPPORTED_ENGINE. Learn more: https://vercel.com/docs/errors/error-list#pnpm-engine-unsupported`
  );
}
function validateCorepackPackageManager(cliType, lockfileVersion, corepackPackageManager, enginesPnpmVersionRange) {
  const validatedCorepackPackageManager = validateVersionSpecifier(
    corepackPackageManager
  );
  if (!validatedCorepackPackageManager) {
    throw new Error(
      `Intended corepack defined package manager "${corepackPackageManager}" is not a valid semver value.`
    );
  }
  if (cliType !== validatedCorepackPackageManager.packageName) {
    throw new Error(
      `Detected package manager "${cliType}" does not match intended corepack defined package manager "${validatedCorepackPackageManager.packageName}". Change your lockfile or "package.json#packageManager" value to match.`
    );
  }
  if (cliType === "pnpm" && enginesPnpmVersionRange) {
    const pnpmWithinEngineRange = (0, import_semver.satisfies)(
      validatedCorepackPackageManager.packageVersion,
      enginesPnpmVersionRange
    );
    if (!pnpmWithinEngineRange) {
      throw new Error(
        `The version of pnpm specified in package.json#packageManager (${validatedCorepackPackageManager.packageVersion}) must satisfy the version range in package.json#engines.pnpm (${enginesPnpmVersionRange}).`
      );
    }
  }
  if (lockfileVersion) {
    const lockfileValid = validLockfileForPackageManager(
      cliType,
      lockfileVersion,
      validatedCorepackPackageManager.packageVersion
    );
    if (!lockfileValid) {
      throw new Error(
        `Detected lockfile "${lockfileVersion}" which is not compatible with the intended corepack package manager "${corepackPackageManager}". Update your lockfile or change to a compatible corepack version.`
      );
    }
  }
}
function validateVersionSpecifier(version) {
  if (!version) {
    return void 0;
  }
  const [before, after, ...extra] = version.split("@");
  if (extra.length) {
    return void 0;
  }
  if (!before) {
    return void 0;
  }
  if (!after) {
    return void 0;
  }
  const packageVersion = (0, import_semver.parse)(after);
  if (!packageVersion) {
    return void 0;
  }
  return {
    packageName: before,
    packageVersion
  };
}
function detectPackageManager(cliType, lockfileVersion) {
  switch (cliType) {
    case "npm":
      return void 0;
    case "pnpm":
      switch (detectPnpmVersion(lockfileVersion)) {
        case "pnpm 7":
          return {
            path: "/pnpm7/node_modules/.bin",
            detectedLockfile: "pnpm-lock.yaml",
            detectedPackageManager: "pnpm@7.x",
            pnpmVersionRange: "7.x"
          };
        case "pnpm 8":
          return {
            path: "/pnpm8/node_modules/.bin",
            detectedLockfile: "pnpm-lock.yaml",
            detectedPackageManager: "pnpm@8.x",
            pnpmVersionRange: "8.x"
          };
        case "pnpm 9":
          return {
            path: "/pnpm9/node_modules/.bin",
            detectedLockfile: "pnpm-lock.yaml",
            detectedPackageManager: "pnpm@9.x",
            pnpmVersionRange: "9.x"
          };
        case "pnpm 6":
          return {
            // undefined because pnpm@6 is the current default in the build container
            path: void 0,
            detectedLockfile: "pnpm-lock.yaml",
            detectedPackageManager: "pnpm@6.x",
            pnpmVersionRange: "6.x"
          };
        default:
          return void 0;
      }
    case "bun":
      return {
        path: "/bun1",
        detectedLockfile: "bun.lockb",
        detectedPackageManager: "bun@1.x"
      };
    case "yarn":
      return {
        path: void 0,
        detectedLockfile: "yarn.lock",
        detectedPackageManager: "yarn"
      };
  }
}
function getPathForPackageManager({
  cliType,
  lockfileVersion,
  nodeVersion,
  env
}) {
  const corepackEnabled = env.ENABLE_EXPERIMENTAL_COREPACK === "1";
  let overrides = getPathOverrideForPackageManager({
    cliType,
    lockfileVersion,
    corepackPackageManager: void 0,
    nodeVersion
  });
  if (corepackEnabled) {
    overrides = NO_OVERRIDE;
  }
  const alreadyInPath = (newPath) => {
    const oldPath = env.PATH ?? "";
    return oldPath.split(import_path.default.delimiter).includes(newPath);
  };
  switch (true) {
    case (cliType === "yarn" && !env.YARN_NODE_LINKER):
      return { ...overrides, yarnNodeLinker: "node-modules" };
    case alreadyInPath(overrides.path ?? ""):
      return {
        detectedLockfile: void 0,
        detectedPackageManager: void 0,
        path: void 0,
        yarnNodeLinker: void 0
      };
    default:
      return { ...overrides, yarnNodeLinker: void 0 };
  }
}
async function runCustomInstallCommand({
  destPath,
  installCommand,
  nodeVersion,
  spawnOpts
}) {
  console.log(`Running "install" command: \`${installCommand}\`...`);
  const {
    cliType,
    lockfileVersion,
    packageJson,
    packageJsonPackageManager,
    turboSupportsCorepackHome
  } = await scanParentDirs(destPath, true);
  const env = getEnvForPackageManager({
    cliType,
    lockfileVersion,
    packageJsonPackageManager,
    nodeVersion,
    env: spawnOpts?.env || {},
    packageJsonEngines: packageJson?.engines,
    turboSupportsCorepackHome
  });
  (0, import_debug.default)(`Running with $PATH:`, env?.PATH || "");
  await execCommand(installCommand, {
    ...spawnOpts,
    env,
    cwd: destPath
  });
}
async function runPackageJsonScript(destPath, scriptNames, spawnOpts) {
  (0, import_assert.default)(import_path.default.isAbsolute(destPath));
  const {
    packageJson,
    cliType,
    lockfileVersion,
    packageJsonPackageManager,
    turboSupportsCorepackHome
  } = await scanParentDirs(destPath, true);
  const scriptName = getScriptName(
    packageJson,
    typeof scriptNames === "string" ? [scriptNames] : scriptNames
  );
  if (!scriptName)
    return false;
  (0, import_debug.default)("Running user script...");
  const runScriptTime = Date.now();
  const opts = {
    cwd: destPath,
    ...spawnOpts,
    env: getEnvForPackageManager({
      cliType,
      lockfileVersion,
      packageJsonPackageManager,
      nodeVersion: void 0,
      env: (0, import_clone_env.cloneEnv)(process.env, spawnOpts?.env),
      packageJsonEngines: packageJson?.engines,
      turboSupportsCorepackHome
    })
  };
  if (cliType === "npm") {
    opts.prettyCommand = `npm run ${scriptName}`;
  } else if (cliType === "pnpm") {
    opts.prettyCommand = `pnpm run ${scriptName}`;
  } else if (cliType === "bun") {
    opts.prettyCommand = `bun run ${scriptName}`;
  } else {
    opts.prettyCommand = `yarn run ${scriptName}`;
  }
  console.log(`Running "${opts.prettyCommand}"`);
  await spawnAsync(cliType, ["run", scriptName], opts);
  (0, import_debug.default)(`Script complete [${Date.now() - runScriptTime}ms]`);
  return true;
}
async function runBundleInstall(destPath, args = [], spawnOpts, meta) {
  if (meta && meta.isDev) {
    (0, import_debug.default)("Skipping dependency installation because dev mode is enabled");
    return;
  }
  (0, import_assert.default)(import_path.default.isAbsolute(destPath));
  const opts = { ...spawnOpts, cwd: destPath, prettyCommand: "bundle install" };
  await spawnAsync("bundle", args.concat(["install"]), opts);
}
async function runPipInstall(destPath, args = [], spawnOpts, meta) {
  if (meta && meta.isDev) {
    (0, import_debug.default)("Skipping dependency installation because dev mode is enabled");
    return;
  }
  (0, import_assert.default)(import_path.default.isAbsolute(destPath));
  const opts = { ...spawnOpts, cwd: destPath, prettyCommand: "pip3 install" };
  await spawnAsync(
    "pip3",
    ["install", "--disable-pip-version-check", ...args],
    opts
  );
}
function getScriptName(pkg, possibleNames) {
  if (pkg?.scripts) {
    for (const name of possibleNames) {
      if (name in pkg.scripts) {
        return name;
      }
    }
  }
  return null;
}
const installDependencies = (0, import_util.deprecate)(
  runNpmInstall,
  "installDependencies() is deprecated. Please use runNpmInstall() instead."
);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  detectPackageManager,
  execCommand,
  getEnvForPackageManager,
  getNodeBinPath,
  getNodeBinPaths,
  getNodeVersion,
  getPathForPackageManager,
  getPathOverrideForPackageManager,
  getScriptName,
  getSpawnOptions,
  installDependencies,
  runBundleInstall,
  runCustomInstallCommand,
  runNpmInstall,
  runPackageJsonScript,
  runPipInstall,
  runShellScript,
  scanParentDirs,
  spawnAsync,
  spawnCommand,
  traverseUpDirectories,
  turboVersionSpecifierSupportsCorepack,
  usingCorepack,
  walkParentDirs
});
