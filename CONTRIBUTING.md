# 如何贡献我的源代码

此文档介绍了 styles 仓库的组成以及运转机制，您提交的代码将给 styles 带来什么好处，以及如何才能加入我们的行列。

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

# 运行脚本生成预览
yarn generate

# 启动开发服务器
yarn dev:vite

```

对 CSL 文件做出更改后，只需重新运行 `yarn generate` ，即可生成新的预览。VuePress 将热更新静态页面。


如果贡献者使用 Windows ，请尽量不对 `src/**/*.md` 作提交，因为 CRLF -> LF 会带来大量无用的 Git 记录。


## 通过 Github 贡献代码

Styles 目前使用 Git 来控制程序版本，如果你想为 ThinkPHP 贡献源代码，请先大致了解 Git 的使用方法。我们目前把项目托管在 GitHub 上，任何 GitHub 用户都可以向我们贡献代码。

参与的方式很简单，fork 一份代码到你的仓库中，修改后提交，并向我们发起 pull request 申请，我们会及时对代码进行审查并处理你的申请并。审查通过后，你的代码将被 merge 进我们的仓库中，这样你就会自动出现在贡献者名单里了，非常方便。

## GitHub Issue

GitHub 提供了 Issue 功能，该功能可以用于：

- 请求新样式
- 提出样式改进

该功能不应该用于：

- 不友善的言论

