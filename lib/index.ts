import { argv, cwd, exit } from "node:process";

import { watch } from "chokidar";
import FastGlob from "fast-glob";
import fs from "fs-extra";
import consola from "consola";

import { run } from "./generate.js";

const arg = argv[2],
  src = "src",
  dist = "dist";

async function main() {
  fs.ensureDir(dist);

  if (arg == "watch") {
    serve();
  } else if (arg == "all") {
    build();
  } else if (typeof arg == "string") {
    run(arg);
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
        const result = run(path);
        console.log(result.bibliography);
      } catch (e) {
        consola.error(e);
        exit(1);
      }
    });
}

function build() {
  let result: StyleFullResult[] = [];
  FastGlob.globSync("**/*.csl").map((path) => {
    consola.log(`处理 ${path}`);
    result.push(run(path));
    fs.outputJSONSync(`${dist}/result.json`, result, { spaces: 2 });
  });
}

main().catch((err) => {
  consola.error(err);
  exit(1);
});
