# Styles

- CSL 官方仓库：https://github.com/citation-style-language/styles
- GB/T 7714相关的csl以及Zotero使用技巧及教程：https://github.com/redleafnew/Chinese-STD-GB-T-7714-related-csl
- GB/T 7714-2015 BibTeX Style：https://github.com/zepinglee/gbt7714-bibtex-style
- A rework of the GB/T 7714—2015 style for CSL：https://github.com/zepinglee/gb-t-7714-csl-style
- 中文国关及小部分综合社科期刊CSL: https://github.com/EdwardSaidZhou/CSL-Chinese-IR-CSSCI-Journals

## 这个仓库

这个仓库临时性作为 styles 预览的开发，尚未存放 styles 文件，获取文件请前往上述几个仓库。

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

  - 将以上信息按 author-data、numeric 或 journal、thesis 等分类方式排序归类，分别写入 `{Category-type}/{Category-name}.md` 。

- 使用 mkdocs 构建静态页面，根据需要自定义 `preview.md`，构建后部署在 GitHub Pages。

## 运行

1. clone this repo
2. install node.js, Python
3. bash run.sh
4. pip install
5. mkdocs serve