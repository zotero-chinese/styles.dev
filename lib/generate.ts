import fs from "fs-extra";
import { basename, dirname, join } from "node:path";

import {
  getCiteproc,
  getTitle,
  getID,
  getRefSelf,
  getRefTemplate,
  getRefDocument,
  getCitationFormat,
  getField,
  make_citations,
  make_bibliography,
  getStyleClass,
} from "./utils/citeproc.js";

import { allDefaultItems, getCustomItems } from "./data/index.js";

import { customFields } from "./customFields.js";
import { getTags } from "./utils/getTags.js";

/**
 * @description 获取指定 CSL 文件的元数据和参考文献预览
 * @param  csl_file - 要获取的 csl 文件路径
 * @param  data_file - 使用的示例条目数据文件路径
 * @param  cite_file - 使用的引文列表文件路径
 * @returns   包含样式元数据和预览的对象/字典，其键值对见函数内 item 变量。
 */
export function generate(csl_file: string): StyleFullResult {
  // 读取样式文件
  const style = fs.readFileSync(csl_file, { encoding: "utf-8" });

  // 获取 citeproc 实例
  const items = [...allDefaultItems, ...getCustomItems(csl_file)];
  const citeproc = getCiteproc(items, style);
  const cslXml = citeproc.cslXml;

  // 获取 info 信息
  const info: StyleInfo = {
    style_class: getStyleClass(citeproc),
    title: getTitle(cslXml),
    id: getID(cslXml),
    link_self: getRefSelf(cslXml),
    link_template: getRefTemplate(cslXml),
    link_documentation: getRefDocument(cslXml),
    author: [],
    contributor: [],
    citation_format: getCitationFormat(cslXml),
    field: getField(cslXml),
    summary: "",
    updated: "",
  };

  // 获取引注和参考文献表信息
  const citations = fs.readJSONSync("./lib/data/default-cite.json");
  const test: StyleTestResult = {
    citations: make_citations(citeproc, citations),
    bibliography: make_bibliography(citeproc),
  };

  // 获取自定义字段信息
  // const cslName = basename(csl_file, ".csl");
  // const custom = customFields[cslName] || {};
  const tags = getTags(style);

  return { ...info, ...test, ...tags };
}

export function generateAndWrite(csl_file: string) {
  const result = generate(csl_file);
  const dir = dirname(csl_file);

  // 写元数据 JSON
  fs.outputJSONSync(join(dir, "metadata.json"), result, { spaces: 2 });

  // 写测试结果 MD

  return result;
}
