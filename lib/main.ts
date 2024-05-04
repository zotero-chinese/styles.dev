import { argv, cwd, exit } from "node:process";

import { watch } from "chokidar";
import FastGlob from "fast-glob";
import fs from "fs-extra";

import { getInfo } from "./generate.js";

const arg = argv[2],
  src = "src",
  dist = "dist";

function main() {
  fs.mkdirSync(dist);

  if (arg == "watch") {
    serve();
  } else if (arg == "all") {
    build();
  } else if (typeof arg == "string") {
    getInfo(arg);
  }
}

function serve() {
  watch("./src", {
    persistent: true, // 保持监听
    ignored: /^(?=.*(\.\w+)$)(?!.*(?:\.csl?|\.json)$).*$/, // 忽略除了 .csl 和 .json 以外的文件
    ignoreInitial: true, // 初始化时忽略已有文件的 add 和 adddir 事件
  })
    .on("ready", () => {
      console.log("已监听 src 目录");
    })
    .on("change", (path, stats) => {
      // getInfo(path);
      console.log(path, stats);
    });
}

function build() {
  let result: StyleInfo[] = [];
  FastGlob.globSync("**/*.csl").map((path) => {
    result.push(getInfo(path));
  });
  fs.writeJSONSync(`${dist}/result.json`, result, { spaces: 2 });
}

main();
