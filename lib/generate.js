const CSL = require("./citeproc_commonjs.js");
const fs = require("fs");
const path = require("path");

CSL.Output.Formats.html["@bibliography/entry"] = function (state, str) {
    // console.log(state.bibliography.opt)
    const o = state.bibliography.opt
    const second_field_align = o['second-field-align'] ? o['second-field-align'] : false
    const hangingindent = o['hangingindent'] ? o['hangingindent'] : false
    const format_style = "second-field-align-" + second_field_align + " hangingindent-" + hangingindent;
    return "<div class=\"csl-entry " + format_style + " \" >" + str + "</div> \n";
};

// CSL.Output.Formats.html["@display/left-margin"] = function (state, str) {
//     switch(state.bibliography.opt['second-field-align']){
//         case 'flush':
//             return "\n      <div class=\"csl-left-margin\" style=\"display: flex; flex-direction: row; padding-right: 0.5em;\">" + str + "</div>";
//         case 'margin':
//             return str + " ";
//         default:
//             return str + " ";
//     }
// };
// CSL.Output.Formats.html["@display/right-inline"] = function (state, str) {
//     switch(state.bibliography.opt['second-field-align']){
//         case 'flush':
//             return "<div class=\"csl-right-inline\" style=\"margin: 0 .4em 0 1.5em;\">" + str + "</div>\n  ";
//         case 'margin':
//             return str;
//         default:
//             return str;
//     }
// };

function make_citeproc_sys(items) {
    bib = {};
    for (var item of items) {
        bib[item.id] = item;
    }
    var citeproc_sys = {
        retrieveLocale: function (lang) {
            return fs.readFileSync(
                "./locales/locales-" + lang + ".xml",
                "utf8"
            );
        },
        retrieveItem: function (id) {
            return bib[id];
        },
    };
    return citeproc_sys;
}

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

function make_bibliography(citeproc) {
    var res = "";
    var params, bib_items;
    try {
        [params, bib_items] = citeproc.makeBibliography();
        // res += "<blockquote>\n";
        res += "  " + params.bibstart;
        for (var bib_item of bib_items) {
            res += "  " + bib_item;
        }
        res += "  " + params.bibend + "\n";
        // res += "</blockquote>";
    } catch (TypeError) {
        res += "false";
    }
    return res;
}

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

function write_file(item, paths) {
    res = '---\n'
    res += 'title: ' + item['title'] + '\n'
    res += 'category: ' + item['citation_format'] + '\n'
    res += 'tag: ' + item['field'] + '\n'
    res += '---\n\n'
    res += '<!-- 此文件由脚本自动生成，请勿手动修改！ -->\n\n'
    res += item['summary'] + '\n'
    res += "\n\n::: note 引注\n\n";
    res += item['citations']
    res += "\n\n:::\n\n";
    res += "\n\n::: note 参考文献表\n\n";
    res += item['bibliography']
    res += "\n\n:::\n\n";
    res += '<!-- more --> \n\n'
    res += '## 下载链接\n\n'
    res += '- [从 GitHub 安装样式](' + paths['github_raw'] + ') \n'
    res += '- [在 GitHub 查看样式文件](' + paths['github_link'] + ') \n'
    res += '- Gitee JsDeliver 源待添加\n\n'

    fs.writeFileSync(paths['output_file'], res);
    // console.log(res);
}

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
                'github_link': config['github_repo'] + './tree/main/' + path.relative('../', file_full_path).replace(/\\/ig,"/"),
                'github_raw': config['github_repo'] + './raw/main/' + path.relative('../', file_full_path).replace(/\\/ig,"/"),
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

var csl_base = path.resolve('../src/');
var config = {
    'default_data': 'default-data.json',
    'override_data': 'sample-data.json',
    'defaule_cite': 'default-cites.json',
    'override_cite': 'sample-cite.json',
    'github_repo': 'https://github.com/zotero-cn/styles/',
    'gitee_repo': '',
    'output_file': 'README.md'
}


// for single file test
// var csl_base = path.resolve('../src/201comparative-economic-and-social-systems');

var paths = get_paths(csl_base, config)
// console.log(paths);
for (var p of paths) {
    console.log('Processing ' + p['file_full_path'])
    itemdata = get_info(p['file_full_path'], p['data_path'], p['cite_path']);
    // console.log(itemdata)
    var output_file = path.resolve(p['file_dir'] + '/' + 'README.md')
    // console.log(output_file)
    write_file(itemdata, p)
}
