# Styles

- CSL 官方仓库：<https://github.com/citation-style-language/styles>
- GB/T 7714相关的csl以及Zotero使用技巧及教程：<https://github.com/redleafnew/Chinese-STD-GB-T-7714-related-csl>
- 中文国关及小部分综合社科期刊CSL: <https://github.com/EdwardSaidZhou/CSL-Chinese-IR-CSSCI-Journals>

## 这个仓库

这个仓库临时性作为 styles 预览的开发，尚未完成，获取文件请前往上述几个仓库。

## 访问

<https://zotero-cn.github.io/styles>

## 进展

- [x] `cs:info` 提取
  - [x] 基本的标题、分类、说明等信息
  - [ ] 作者、更新时间等信息
  - [ ] `cs:category` 中英文映射
- [x] 样式预览
- [ ] `second-field-align` 选项适配
- [x] 子文件夹示例数据覆盖：子文件夹存放 `sample-data.json` 和 `sample-cite.json`
- [ ] 页面详情页添加样式安装链接和样式源文件链接：通过拼接路径产生 URL 写入 md
- [ ] 样式文件格式化
  - [ ] 将原预览文件中的简介移入 CSL 文件的 `summary` 字段，以方便脚本调用
  - [ ] 核对每条样式文件的 self_link ，应指向仓库链接
  - [ ] id -> uuid （optional）
  - [ ] 去掉样式文件及其文件夹的编号前缀
  - [ ] `cs:category -> field` 是否需要不遵循 CSL 规范，添加 thesis（对于学位论文）、other（对于导出标题.csl）等
  - [ ] 为需要特别适配示例数据的样式文件增加覆盖数据

- [ ] 最终合并 styles 仓库
- [ ] 哪些样式可以合入上游官方仓库

## 技术路线

- CSL 文件存放在 `src/` 下，每个样式一个单独的文件夹。
- 每次提交时，触发 Actions 运行 `lib/generate.js`，
  - 生成引文和书目预览（ `citeproc-js` 实现）
    - 默认使用 `lib/default-data.json` 和 `lib/default-cite.json` 作为示例数据源和引用指针源。
    - 可以在样式文件同级目录下建立 `sample-data.json` 或/和 `sample-cite.json` 来覆盖默认值。
  - 提取 `cs:info` 数据，
  - 将数据写入样式文件同级目录下的 `README.md` 。
    - 此文件由脚本自动生成，请勿编辑，所有的编辑都将在脚本下一次运行时被覆盖。

- VuePress 读取 `src/**/*.md`，构建静态页面，部署在 GitHub Pages 上。
  - 注意不要在 Markdown 里使用非标准的、被废弃的 HTML 标签，VuePress 将直接抛出错误[^vuepress-html]。

[^vuepress-html]: [已废弃的 HTML 标签 - vuepress-theme-hope](https://vuepress-theme-hope.github.io/v2/zh/cookbook/vuepress/markdown.html#%E5%B7%B2%E5%BA%9F%E5%BC%83%E7%9A%84-html-%E6%A0%87%E7%AD%BE)

## 运行

1. 安装 [Node.js](https://nodejs.org/zh-cn/) 。
2. Clone 这个仓库，并在终端中进入库的根目录。
3. 初始化子模块

   ```bash
   git submodule update --init
   ```

4. 安装依赖

    ```bash
    yarn install
    ```

5. 生成预览

    ```bash
    yarn generate
    ```

6. 启动 VuePress 开发服务器

    ```bash
    yarn dev:vite
    ```

对 CSL 文件做出更改后，只需重新运行 `yarn generate` ，即可生成新的预览。VuePress 将热重载静态页面。

## 贡献指南

运行与构建请参上文。

如果贡献者使用 Windows ，请尽量不对 `src/**/*.md` 作提交，因为 CRLF -> LF 会带来大量 Git 记录，导致后人无法轻易看到哪些文件有了更新。
