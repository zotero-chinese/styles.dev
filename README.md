# Styles

- CSL 官方仓库：<https://github.com/citation-style-language/styles>
- GB/T 7714 相关的 csl 以及 Zotero 使用技巧及教程：<https://github.com/redleafnew/Chinese-STD-GB-T-7714-related-csl>
- 中文国关及小部分综合社科期刊 CSL: <https://github.com/EdwardSaidZhou/CSL-Chinese-IR-CSSCI-Journals>

## 状态

这个仓库临时性作为 styles 预览的开发，尚未完成，获取文件请前往上述几个仓库。

> [!NOTE]
> 本仓库仅作为 styles 仓库重构的原型，不接受样式反馈和样式文件请求。
> 在开发完成前，请前往 [redleafnew/Chinese-STD-GB-T-7714-related-csl](https://github.com/redleafnew/Chinese-STD-GB-T-7714-related-csl) 反馈关于 CSL 文件的问题。

## 访问

<https://zotero-chinese.com/styles>

## 进展

[待办事项](https://github.com/zotero-chinese/styles/issues/6)

## 技术路线

CSL 文件存放在 `src/` 下。每次提交时，触发 Actions 运行 `lib/main.ts`，执行：

- 生成引文和书目预览（ `citeproc-js` 实现）
  - 默认使用 `lib/data/default-data.json` 和 `lib/data/default-cite.json` 作为示例数据源和引用指针源。
  <!-- - 可以在样式文件同级目录下建立 `sample-data.json` 或/和 `sample-cite.json` 来覆盖默认值。 -->
- 提取 `cs:info` 数据，
- 将数据写入 `dist` 。

`dist` 目录将被提交到 `gh-pages` 分支。

## 运行

项目运行需要安装 [Node.js](https://nodejs.org/zh-cn/)。

```bash

# Clone 这个仓库
git clone https://github.com/zotero-chinese/styles.git --recursive

# 进入项目目录
cd styles

# 如果是第一次接触 Node.js 或运行后续命令时提示 yarn 命令不存在，
# 请执行下一行以安装 pnpm 包管理器
npm install -g pnpm

# 安装依赖
pnpm install

# 监听 CSL 文件变化并热更新
pnpm dev

# 生成所有数据
pnpm build
```

## 贡献指南

运行与构建请参上文。
