/**
 * @description 将获得的信息写入文件
 * @author northword
 * @param {Object} item - 从 get_info() 获得的元数据和预览信息
 * @param {Object} paths - 从 get_path() 获得的路径信息
 */
async function write_file(item, paths) {
  var sample_text =
    `--- \n` +
    `title: ${item["title"]} \n` +
    `category: ${item["citation_format"]} \n` +
    `tag: ${item["field"]} \n` +
    `dir:\n` +
    `    link: true \n` +
    `--- \n\n` +
    `<!-- 此文件由脚本自动生成，请勿手动修改！ -->  \n\n` +
    `${item["summary"]}  \n\n` +
    `::: note 引注  \n\n` +
    `${item["citations"]}  \n\n` +
    `:::  \n\n` +
    `::: note 参考文献表  \n\n` +
    `${item["bibliography"]}  \n\n` +
    `:::  \n\n` +
    `<!-- more -->  \n\n` +
    `\n## 下载链接  \n\n` +
    `请从以下任意一个链接安装样式。 \n` +
    `- [从 GitHub 安装样式（最新）](${paths["github_raw"]})  \n` +
    `- [从 Jsdelivr 安装样式（GitHub 镜像，可能有 24h 延迟）](${paths["jsd_raw"]}) \n` +
    `- [从 Gitee 安装样式（国内镜像）](${paths["gitee_raw"]}) \n` +
    `\n## 查看样式源码 \n\n` +
    `- [在 GitHub 查看样式文件](${paths["github_link"]})  \n` +
    `- [在 Gitee 查看样式](${paths["gitee_link"]}) \n` +
    `\n## 调试信息 \n\n` +
    `[点此查看完整测试结果](./test.md) \n`;

  await fs.writeFile(paths["output_file"], sample_text);
  // console.log(sample_text);

  var test_text =
    `--- \n` +
    `title: ${item["title"]}测试结果 \n` +
    `article: false \n` +
    `dir:\n` +
    `    index: false \n` +
    `--- \n\n` +
    `# ${item["title"]}测试\n\n` +
    `<!-- 此文件由脚本自动生成，请勿手动修改！ -->\n\n` +
    `## 引注测试\n\n` +
    `${item["test_citations"]}\n\n` +
    `## 参考文献表测试\n\n` +
    `${item["test_bibliography"]}\n\n` +
    `## 完整参考文献表测试\n\n` +
    `${item["test_full_bibliography"]}\n\n` +
    `## 默认引注测试\n\n` +
    `${item["default_test_citations"]}\n\n` +
    `## 默认参考文献表测试\n\n` +
    `${item["default_test_bibliography"]}\n\n` +
    `## 默认完整参考文献表测试\n\n` +
    `${item["default_test_full_bibliography"]}\n`;

  fs.writeFileSync(paths["test_output_file"], test_text);
}
