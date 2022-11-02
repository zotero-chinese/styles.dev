# Styles

- CSL 官方仓库：<https://github.com/citation-style-language/styles>
- GB/T 7714 相关的 csl 以及 Zotero 使用技巧及教程：<https://github.com/redleafnew/Chinese-STD-GB-T-7714-related-csl>
- 中文国关及小部分综合社科期刊 CSL: <https://github.com/EdwardSaidZhou/CSL-Chinese-IR-CSSCI-Journals>

## 这个仓库

这个仓库临时性作为 styles 预览的开发，尚未完成，获取文件请前往上述几个仓库。

## 访问

<https://zotero-cn.github.io/styles>

## 进展

[待办事项](https://github.com/zotero-cn/styles/issues/6)

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

项目运行需要安装 [Node.js](https://nodejs.org/zh-cn/)。

```bash

# Clone 这个仓库
git clone https://github.com/zotero-cn/styles.git

# 进入项目目录
cd styles

# 初始化子模块
git submodule update --init

# 如果是第一次接触 Node.js 或运行后续命令时提示 yarn 命令不存在，
# 请执行下一行以安装 yarn 包管理器
npm install -g yarn

# 安装依赖
yarn install

# 启动预览脚本和网页服务器
yarn dev

```

对 CSL 文件做出更改后，脚本会自动生成更改文件对应的预览。VuePress 将热更新静态页面。

如果需要单独操作，可以参考以下：

```bash

# 运行脚本生成全部 CSL 文件的预览
yarn generate

# 启动 VuePress 开发服务器
yarn dev:vite

```

## 贡献指南

运行与构建请参上文。

如果贡献者使用 Windows ，请尽量不对 `src/**/*.md` 作提交，因为 CRLF -> LF 会带来大量无用的 Git 记录。
