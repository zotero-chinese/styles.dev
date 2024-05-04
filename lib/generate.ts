import fs from "fs-extra";

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

/**
 * @description 获取指定 CSL 文件的元数据和参考文献预览
 * @param {String} csl_file - 要获取的 csl 文件路径
 * @param {String} data_file - 使用的示例条目数据文件路径
 * @param {String} cite_file - 使用的引文列表文件路径
 * @returns {Object}  包含样式元数据和预览的对象/字典，其键值对见函数内 item 变量。
 */
export function getInfo(
  csl_file: string,
  data_file: string = "./lib/data/default-data.json",
  cite_file: string = "./lib/data/default-cite.json"
) {
  const style = fs.readFileSync(csl_file, { encoding: "utf-8" });
  const items = fs.readJSONSync(data_file);
  const citations = fs.readJSONSync(cite_file);

  const citeproc = getCiteproc(items, style);

  const cslXml = citeproc.cslXml;

  const info: StyleInfo = {
    style_class: "Unknown",
    title: getTitle(cslXml),
    id: getID(cslXml),
    link_self: getRefSelf(cslXml),
    link_template: getRefTemplate(cslXml),
    link_documentation: getRefDocument(cslXml),
    author: {},
    contributor: {},
    citation_format: getCitationFormat(cslXml),
    field: getField(cslXml),
    summary: "",
    updated: "Undefined",
    citations: make_citations(citeproc, citations),
    bibliography: make_bibliography(citeproc),
  };
  return info;
}
