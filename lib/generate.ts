import fs from "fs-extra";
import { basename } from "path";

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
} from "./utils/citeproc.js";

import { customFields } from "./customFields.js";

// import defauleData from "./data/default-data.json";
// import defaultCite from "./data/default-cite.json";

/**
 * @description 获取指定 CSL 文件的元数据和参考文献预览
 * @param  csl_file - 要获取的 csl 文件路径
 * @param  data_file - 使用的示例条目数据文件路径
 * @param  cite_file - 使用的引文列表文件路径
 * @returns   包含样式元数据和预览的对象/字典，其键值对见函数内 item 变量。
 */
export function run(
  csl_file: string,
  data_file: string = "./lib/data/default-data.json",
  cite_file: string = "./lib/data/default-cite.json"
): StyleFullResult {
  // 读取文件
  const style = fs.readFileSync(csl_file, { encoding: "utf-8" });
  const items = fs.readJSONSync(data_file);
  const citations = fs.readJSONSync(cite_file);

  // 获取 citeproc 实例
  const citeproc = getCiteproc(items, style);
  const cslXml = citeproc.cslXml;

  // 获取 info 信息
  const info: StyleInfo = {
    style_class: "",
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
  const test: StyleTestResult = {
    citations: make_citations(citeproc, citations),
    bibliography: make_bibliography(citeproc),
  };

  // 获取自定义字段信息
  const cslName = basename(csl_file, ".csl");
  const custom = customFields[cslName] || {};

  return { ...info, ...test, ...custom };
}
