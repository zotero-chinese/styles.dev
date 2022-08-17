const { PassThrough } = require("stream");

CSL = require("./citeproc_commonjs.js");
fs = require("fs");
path = require("path");

CSL.Output.Formats.html["@display/left-margin"] = function (state, str) {
    return str + " ";
};
CSL.Output.Formats.html["@display/right-inline"] = function (state, str) {
    return str;
};

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
    // citeproc.opt.development_extensions.wrap_url_and_doi = true;
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

function write_file(item, output_file = "output.md") {
    res = '---\n'
    res += 'title: ' + item['title'] + '\n'
    res += 'category: ' + item['citation_format'] + '\n'
    res += 'tag: ' + item['field'] + '\n'
    res += '---\n\n'
    res += item['summary'] + '\n'
    res += "\n\n::: note 引文\n\n";
    res += item['citations']
    res += "\n\n:::\n\n";
    res += "\n\n::: note 书目\n\n";
    res += item['bibliography']
    res += "\n\n:::\n\n";
    res += '<!-- more -->'

    fs.writeFileSync(output_file, res);
    // console.log(res);
}



/**
 * 文件遍历方法
 * @param base 需要遍历的文件路径
 */
// var list = new Array();
function get_files(base, defaule_date_file, override_data_file, defaule_cite_file, override_cite_file) {
    let list = []
    //根据文件路径读取文件，返回文件列表
    files = fs.readdirSync(base)
    files.forEach(function (file_name) {
        var file_full_path = path.join(base, file_name);
        stats = fs.statSync(file_full_path)
        if (stats.isFile() && path.extname(file_full_path) == ".csl") {
            let data_file_path = defaule_date_file
            if (fs.existsSync(base + '/' + override_data_file)) {
                data_file_path = base + '/' + override_data_file;
            } else {
                data_file_path = defaule_date_file
            }
            let cite_file_path = defaule_cite_file
            if (fs.existsSync(base + '/' + override_cite_file)) {
                cite_file_path = base + '/' + override_cite_file;
            } else {
                cite_file_path = defaule_cite_file
            }
            list.push([base, file_name, file_full_path, data_file_path, cite_file_path])
        }
        if (stats.isDirectory()) {
            for (i of get_files(file_full_path, defaule_date_file, override_data_file, defaule_cite_file, override_cite_file)) {
                list.push(i)
            }; //递归，如果是文件夹，就继续遍历该文件夹下面的文件
        }
    })
    return list
}


var csl_base = path.resolve('../src/');
var default_data_file = 'default-data.json'
var override_data_file = 'sample-data.json'
var defaule_cite_file = 'default-cites.json'
var override_cite_file = 'sample-cite.json'


var csls = get_files(csl_base, default_data_file, override_data_file, defaule_cite_file, override_cite_file)
// console.log(csls);
for (var csl of csls) {
    console.log(csl[2])
    itemdata = get_info(csl[2], csl[3], csl[4]);
    // console.log(itemdata)
    var output_file = path.resolve(csl[0] + '/' + 'README.md')
    // console.log(output_file)
    write_file(itemdata, output_file)
}





