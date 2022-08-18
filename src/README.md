---
home: true
# layout: Blog
icon: home
title: 首页
heroImage: /logo.png
heroText: Zotero 中文样式
# heroFullScreen: true
tagline: 中文样式库，请按样式分类或按领域进行查找。
actions:
  - text: 浏览样式 💡
    link: /article/
    type: primary

  - text: 查看安装方法
    link: /#csl-文件的下载及添加

features:
  - title: 顺序编码制
    icon: markdown
    details: 
    link: /category/numeric/

  - title: “作者-日期”制
    icon: comment
    details: 
    link: /category/author-date/

  - title: 脚注制
    icon: info
    details: 
    link: /category/note/

  - title: 国标衍生样式
    icon: blog
    details: 
    link: /tag/gb/

  - title: 学位论文样式
    icon: lock
    details: 
    link: /tag/thesis/

  - title: 其他
    icon: more
    details: 
    link: /tag/other/

copyright: false
footer: GPL-3.0 Licensed | Copyright © 2022-present Zotero Chinese
---

## `csl` 文件的下载及添加

### 所有 `csl` 文件

![下载及使用动图](./guide/assets/download-csl.gif)

### 单个 `csl` 文件

![下载及使用动图](./guide/assets/download-s-csl.gif)

## 如何使用

::: note author-data 和前有逗号的问题

使用 `author-data` 样式的时，如果中文两个作者的 `和` 前面有逗号 `,` ，如显示为`（金红兰, 和金龙勋, 2021）`，请确认条目的作者是是否经过合并操作，如果合并过请拆分（可以使用 [茉莉花插件](https://github.com/l0o0/jasminum) ）。

:::

如果使用了支持中文作者超过 `3` 个为`等` ，英文为 `et al` 的 `csl`，但显示不正常需要在 `Zotero` 或 `JurisM` 中将英文文献 `Info` 中 `language` 字段修改为 `en-US`。

::: warning 中英文条目区域设置

**将英文文献 `Info` 中 `language` 字段修改为 `en-US`。将英文文献 `Info` 中 `language` 字段修改为 `en-US`。将英文文献 `Info` 中 `language` 字段修改为 `en-US`。**

**不是`English`！不是`English`！不是`English`！**

:::

或是需要将显示不正常的文献删除后重新插入。

使用详情参见 [基于`GB/T-7714-2015`的 `Style` 实现同时生成 `et al` 和`等`的方法](https://zhuanlan.zhihu.com/p/320253145)，
或 [`Zotero` 修改版终于可以原生支持同时生成 `et al` 和`等`了](https://zhuanlan.zhihu.com/p/314928204)。

批量修改语言：可以使用 delitemwithatt 插件，到 <https://github.com/redleafnew/delitemwithatt> 下载插件并安装,
选择需要修改的条目后，右击，选择“将语言字段设为 en”即可。其他方法参见 <https://zhuanlan.zhihu.com/p/341989158>。

`Github` 文件的下载方法也可见 <https://jingyan.baidu.com/article/b87fe19eca972b1219356872.html>。

`Zotero` 添加 `csl` 格式文件也可见 <https://zhuanlan.zhihu.com/p/64624484>。

完整的 `Zotero` 的使用教程见：[《优雅地用 `Zotero` 进行文献管理和论文写作》](https://github.com/redleafnew/Zotero_introduction/releases)。
