import { argv, cwd, exit } from "node:process";

import { watch } from "chokidar";
import FastGlob from "fast-glob";
import fs from "fs-extra";
import consola from "consola";

// import { isMainThread } from "worker_threads";
// import Tinypool from "tinypool";

import { generate, generateAndWrite } from "./generate.js";

const arg = argv[2],
  src = "src",
  dist = "dist";

async function main() {
  fs.ensureDir(dist);

  if (arg == "watch") {
    serve();
  } else if (arg == "all") {
    await build();
  } else if (typeof arg == "string") {
    generate(arg);
  } else {
    consola.error("需要指明参数");
    exit(1);
  }
}

function serve() {
  watch("./src", {
    persistent: true, // 保持监听
    ignored: /^(?=.*(\.\w+)$)(?!.*(?:\.csl?|\.json)$).*$/, // 忽略除了 .csl 和 .json 以外的文件
    ignoreInitial: true, // 初始化时忽略已有文件的 add 和 adddir 事件
  })
    .on("ready", () => {
      consola.ready("已监听 src 目录");
    })
    .on("change", (path, stats) => {
      console.clear();
      consola.info(`${path} changed. \n`);
      try {
        const result = generate(path);
        console.log(result.bibliography);
      } catch (e) {
        consola.error(e);
        exit(1);
      }
    });
}

async function build() {
  console.time("build");
  const result = await Promise.all(
    FastGlob.globSync("**/*.csl").map(async (path) => {
      consola.log(`${path}`);
      return generateAndWrite(path);
    })
  );
  fs.outputJSONSync(`${dist}/result.json`, result, { spaces: 2 });
  console.timeEnd("build");
}

// 尝试使用 worker 运行缩短时间
// async function build() {
//   if (isMainThread) {
//     console.time("build");
//     let result: StyleFullResult[] = [];

//     const pool = new Tinypool({
//       filename: "./dist/generate.js",
//     });

//     result = await Promise.all(
//       FastGlob.globSync("**/*.csl").map((path) => {
//         // (async function () {
//         //   console.log(await  pool.run( path ););
//         // })();

//         return pool.run(path);
//       })
//     );
//     fs.outputJSONSync(`${dist}/result.json`, result, { spaces: 2 });
//     console.timeEnd("build");
//   } else {
//     module.exports = (path: string) => {
//       return run(path);
//     };
//   }
// }

main().catch((err) => {
  consola.error(err);
  exit(1);
});
