const CSL = require("./citeproc_commonjs.js");
const fs = require("fs");
const path = require("path");

CSL.Output.Formats.html["@bibliography/entry"] = function (state, str) {
    // console.log(state.bibliography.opt)
    const o = state.bibliography.opt
    const second_field_align = o['second-field-align'] ? o['second-field-align'] : false
    const hangingindent = o['hangingindent'] ? o['hangingindent'] : false
    const format_style = `second-field-align-${second_field_align} hangingindent-${hangingindent}`;
    return `  <div class="csl-entry ${format_style}"> ${str} </div>\n`;
};

/**
 * @description 产生 citeproc-js 的 sys 参数
 * @author zeping lee
 * @param items
 * @returns {*}
 * @see {@link https://citeproc-js.readthedocs.io/en/latest/running.html#required-sys-functions}
 */
function make_citeproc_sys(items) {
    bib = {};
    for (var item of items) {
        bib[item.id] = item;
    }
    var citeproc_sys = {
        retrieveLocale: function (lang) {
            var file_path = "./locales/locales-" + lang + ".xml";
            if (fs.existsSync(file_path)) {
                return fs.readFileSync(file_path, "utf8");
            } else {
                console.error(`Cannot find "${file_path}".`)
                return undefined;
            }
        },
        retrieveItem: function (id) {
            return bib[id];
        },
    };
    return citeproc_sys;
}

/**
 * @description 产生引注
 * @author zeping lee
 * @param citeproc
 * @param cite_items_list
 * @returns {String}
 */
function make_citations(citeproc, cite_items_list) {
    var citation_res = [];

    var citation_count = 0;
    var citation_pre = [];
    var citation_post = [];

    for (var cite_items of cite_items_list) {
        citation_count += 1;
        citaiton_id = "CITATION-" + citation_count;
        var citation = {
            citationID: citaiton_id,
            citationItems: cite_items,
            properties: {
                noteIndex: citation_count,
            },
        };
        // console.log(citation);
        var citation_items = citeproc.processCitationCluster(
            citation,
            citation_pre,
            citation_post
        )[1];
        for (var citation_item of citation_items) {
            var index = citation_item[0];
            var citaiton_text = citation_item[1];
            citation_res[index] = citaiton_text;
        }

        citation_pre.push([citaiton_id, citation_count]);
    }

    var res = "";
    if (citation_res.length > 0) {
        if (citation_res.length > 1) {
            // res += "<blockquote>\n";
            for (var [index, text] of citation_res.entries()) {
                if (citeproc.opt.xclass == "note") {
                    res += "  <sup>" + (index + 1) + "</sup> " + text + "<br>\n";
                } else {
                    res += "  " + text + "<br>\n";
                }
            }
            // res += "</blockquote>";
        } else {
            // res = "> " + citation_res[0];
            res = citation_res[0];
        }
    }

    return res;
}

/**
 * @description 生成参考文献列表
 * @author zeping lee
 * @param {*} citeproc
 * @returns {String}
 */
function make_bibliography(citeproc) {
    var res = "";
    var params, bib_items;
    try {
        [params, bib_items] = citeproc.makeBibliography();
        // res += "<blockquote>\n";
        res += "" + params.bibstart;
        for (var bib_item of bib_items) {
            res += "" + bib_item;
        }
        res += "" + params.bibend + "\n";
        // res += "</blockquote>";
    } catch (TypeError) {
        res += "false";
    }
    return res;
}

/**
 * @description 获取指定 CSL 文件的元数据和参考文献预览
 * @author northword
 * @param {String} csl_file - 要获取的 csl 文件路径
 * @param {String} data_file - 使用的示例条目数据文件路径
 * @param {String} cite_file - 使用的引文列表文件路径
 * @returns {Object}  包含样式元数据和预览的对象/字典，其键值对见函数内 item 变量。
 */
function get_info(csl_file, data_file, cite_file) {

    var full_data = JSON.parse(fs.readFileSync(data_file, "utf8"));
    var citeproc_sys = make_citeproc_sys(full_data);
    var csl_style = fs.readFileSync(csl_file, "utf8");
    var citeproc = new CSL.Engine(citeproc_sys, csl_style);
    citeproc.opt.development_extensions.wrap_url_and_doi = true;
    // citeproc.opt.development_extensions.csl_reverse_lookup_support = true;

    var item = {
        'style_class': 'Unknow',
        'title': 'Undefined',
        'id': 'Undefined',
        'link_self': 'Undefined',
        'link_template': 'Undefined',
        'link_documentation': 'Undefined',
        'author': {},
        'contributor': {},
        'citation_format': 'Undefined',
        'field': [],
        'summary': 'Undefined',
        'updated': 'Undefined',
        'citations': 'Undefined',
        // 'bib_second_field_align': false,
        // 'bibstart': '<div class="csl-bib-body">',
        'bibliography': 'Undefined',
        // 'bibend': '</div>'
    }

    item['title'] = citeproc.cslXml.getNodesByName(citeproc.cslXml.dataObj, "title")[0].children[0];
    item['id'] = citeproc.cslXml.getNodesByName(citeproc.cslXml.dataObj, "id")[0].children[0];

    if (citeproc.cslXml.getNodesByName(citeproc.cslXml.dataObj, "link").length !== 0) {
        var link_nodes = citeproc.cslXml.getNodesByName(citeproc.cslXml.dataObj, "link");
        for (var node of link_nodes) {
            switch (node.attrs['rel']) {
                case 'self':
                    item['link_self'] = node.attrs["href"];
                    break;
                case 'documentation':
                    item['link_documentation'] = node.attrs["href"];
                    break;
                case 'template':
                    item['link_template'] = node.attrs["href"];
                    break;
                default:
                    break;
            }
        }
    }

    if (citeproc.cslXml.getNodesByName(citeproc.cslXml.dataObj, "category").length !== 0) {
        var category_nodes = citeproc.cslXml.getNodesByName(citeproc.cslXml.dataObj, "category");
        for (var node of category_nodes) {
            if ("citation-format" in node.attrs) {
                item['citation_format'] = node.attrs["citation-format"];
            } else if ("field" in node.attrs) {
                item['field'] = node.attrs["field"];
            }
        }
    }

    if (citeproc.cslXml.getNodesByName(citeproc.cslXml.dataObj, "summary").length !== 0) {
        item['summary'] = citeproc.cslXml.getNodesByName(citeproc.cslXml.dataObj, "summary")[0].children[0];
    }

    var cite_dict = JSON.parse(fs.readFileSync(cite_file, "utf8"));
    var example_cite_list = cite_dict["example"];
    item['citations'] = make_citations(citeproc, example_cite_list)
    item['bibliography'] = make_bibliography(citeproc)

    // console.log(item)
    return item
}

/**
 * @description 将获得的信息写入文件
 * @author northword
 * @param {Object} item - 从 get_info() 获得的元数据和预览信息
 * @param {Object} paths - 从 get_path() 获得的路径信息
 */
function write_file(item, paths) {

    res = `--- \n`
        + `title: ${item['title']} \n`
        + `category: ${item['citation_format']} \n`
        + `tag: ${item['field']} \n`
        + `--- \n\n`
        + `<!-- 此文件由脚本自动生成，请勿手动修改！ -->  \n\n`
        + `${item['summary']}  \n\n`
        + `::: note 引注  \n\n`
        + `${item['citations']}  \n\n`
        + `:::  \n\n`
        + `::: note 参考文献表  \n\n`
        + `${item['bibliography']}  \n\n`
        + `:::  \n\n`
        + `<!-- more -->  \n\n`
        + `## 下载链接  \n\n`
        + `- [从 GitHub 安装样式](${paths['github_raw']})  \n`
        + `- [在 GitHub 查看样式文件](${paths['github_link']})  \n`
        + `- Gitee JsDeliver 源待添加  \n`

    fs.writeFileSync(paths['output_file'], res);
    // console.log(res);
}

/**
 * @description 遍历给定文件夹，获取 csl 文件，并产生其对应的各种路径信息
 * @author northword
 * @param {String} base - 要获取的文件夹
 * @param {Object} date_file - 默认的/自定义的示例条目数据、示例引文列表的文件名
 * @returns {Array<Object>}  每个样式文件的信息放在一个对象，键值对参考函数内 pathResult 变量，所有对象放在一个列表, [{}, {}]。
 */
function get_paths(base, date_file) {
    let pathResults = []

    files = fs.readdirSync(base)
    files.forEach(function (file_name) {
        var file_full_path = path.join(base, file_name);
        stats = fs.statSync(file_full_path)
        if (stats.isFile() && path.extname(file_full_path) == ".csl") {

            let data_file_path = date_file['default_data']
            if (fs.existsSync(base + '/' + date_file['override_data'])) {
                data_file_path = base + '/' + date_file['override_data'];
            } else {
                data_file_path = date_file['default_data']
            }

            let cite_file_path = config['defaule_cite']
            if (fs.existsSync(base + '/' + config['override_cite'])) {
                cite_file_path = base + '/' + config['override_cite'];
            } else {
                cite_file_path = config['defaule_cite']
            }

            let pathResult = {
                'file_name': file_name,
                'file_dir': base,
                'file_full_path': file_full_path,
                'data_path': data_file_path,
                'cite_path': cite_file_path,
                'relative_path': path.relative('../', file_full_path),
                'github_link': config['github_repo'] + './tree/main/' + path.relative('../', file_full_path).replace(/\\/ig, "/"),
                'github_raw': config['github_repo'] + './raw/main/' + path.relative('../', file_full_path).replace(/\\/ig, "/"),
                'output_file': base + '/' + 'README.md',
            }

            pathResults.push(pathResult)
        }
        if (stats.isDirectory()) {
            for (i of get_paths(file_full_path, config)) {
                pathResults.push(i)
            }; //递归，如果是文件夹，就继续遍历该文件夹下面的文件
        }
    })
    return pathResults
}

/**
 * @type {String} CSL 文件的存放目录
 */
var csl_base = path.resolve('../src/');

/**
 * @type {Object} config 配置信息，除了 csl 文件目录以外的所有输入值，包含示例数据、仓库地址等。
 */
var config = {
    'default_data': 'default-data.json',
    'override_data': 'sample-data.json',
    'defaule_cite': 'default-cites.json',
    'override_cite': 'sample-cite.json',
    'github_repo': 'https://github.com/zotero-cn/styles/',
    'gitee_repo': '',
    'output_file': 'README.md'
}

/**
 *  for single file test，测试时取消该行注释即可。
 */
// var csl_base = path.resolve('../src/201comparative-economic-and-social-systems');

get_paths(csl_base, config).forEach((self)=>{
    console.log('Processing ' + self['file_full_path'])
    itemdata = get_info(self['file_full_path'], self['data_path'], self['cite_path']);
    // console.log(itemdata)
    write_file(itemdata, self)
})
