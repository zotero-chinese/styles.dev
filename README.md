# Styles

- CSL 官方仓库：https://github.com/citation-style-language/styles
- GB/T 7714相关的csl以及Zotero使用技巧及教程：https://github.com/redleafnew/Chinese-STD-GB-T-7714-related-csl
- 中文国关及小部分综合社科期刊CSL: https://github.com/EdwardSaidZhou/CSL-Chinese-IR-CSSCI-Journals

## 这个仓库

这个仓库临时性作为 styles 预览的开发，尚未存放 styles 文件，获取文件请前往上述几个仓库。

## 访问

<https://zotero-cn.github.io/styles>

## 进展

- [x] `cs:info` 提取
- [x] 样式预览
- [ ] `second-field-align` 选项适配
- [ ] 子文件夹示例数据覆盖  
      UPDATE 2022-08-06：由于 citeproc-js-serve 不支持子文件夹 CSL 文件，寻求更换 Styles 文件组织方案或更换样式渲染方案
- [ ] 页面详情页添加样式安装链接和样式源文件链接

## 技术路线

- 将 `github/redleafnew/Chinese-STD-GB-T-7714-related-csl` 作为 csl 文件源。

    ```bash
    git submodule update --init
    ```

- 以 `github/zotero/citeproc-js-server` 建立引文处理服务器。


    ```bash
    cd citeproc-js-serve
    export NODE_ENV=submodule
    npm install
    npm start
    ```

- 在 `preview.py` 中，（WORK IN PROGRESS）

  - 从 `csl/*.csl` 提取 `<info>` 内的信息，

  - 向引文处理服务器请求获得其引文和书目样式预览，处理后以 yaml 格式一并写入 `docs/preview/{uuid.md}` 中的 `Front Matter`；

- 使用 VuePress 构建静态页面，构建后部署在 GitHub Pages。

## 运行

1. clone this repo
2. install node.js, Python
3. bash run.sh
4. yarn install
5. yarn run dev:vite

