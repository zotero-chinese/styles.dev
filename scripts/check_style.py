import argparse
import datetime
from pathlib import Path
import re
import sys

from lxml import etree

from csl_style import CslStyle


BAD_QUOTE_STYLES = [
    "comparative-economic-and-social-systems",
    "exploration-and-free-views",
    "journal-of-international-relations",
    "literary-and-artistic-contention",
    "literary-review",
    "modern-chinese-literature-studies",
    "the-journal-of-world-economy",
]


ns = {
    "cs": "http://purl.org/net/xbiblio/csl",
}


# #0 preceding-comment
# #1 title
# #2 title-short
# #3 id
# #4 link self
# #5 link independent-parent
# #6 link template
# #7 link doc
# #8 author
# #9 contributor
# #10 category citation-format
# #11 category field
# #12 issn
# #13 eissn
# #14 issnl
# #15 summary
# #16 published
# #17 updated
# #18 rights
# #19 end-comment
INFO_ITEM_ORDER = [
    "preceding-comment",
    "title",
    "title-short",
    "id",
    "link[@self]",
    "link[@independent-parent]",
    "link[@template]",
    "link[@documentation]",
    "author",
    "contributor",
    "category[@citation-format]",
    "category[@field]",
    "issn",
    "eissn",
    "issnl",
    "summary",
    "published",
    "updated",
    "rights",
    "end-comment",
]


VALID_FIELDS = [
    "anthropology",
    "astronomy",
    "biology",
    "botany",
    "chemistry",
    "communications",
    "engineering",
    "generic-base",
    "geography",
    "geology",
    "history",
    "humanities",
    "law",
    "linguistics",
    "literature",
    "math",
    "medicine",
    "philosophy",
    "physics",
    "political_science",
    "psychology",
    "science",
    "social_science",
    "sociology",
    "theology",
    "zoology",
]


def info(s):
    print(f"Info: {s}", file=sys.stderr)


def warning(s):
    print(f"Warning: {s}", file=sys.stderr)

def check_fields(file, csl_content, root):
    for field_el in root.xpath(".//cs:category[@field]", namespaces=ns):
        field = field_el.attrib["field"]
        if field not in VALID_FIELDS:
            msg = f'File "{file}", line {field_el.sourceline}: Invalid field'
            warning(msg)


def check_field(file, csl_content, root):
    field = ""
    fields = []
    field_el = None
    for field_el in root.xpath(".//cs:category[@field]", namespaces=ns):
        if not field:
            field = field_el.attrib["field"]
        fields.append(field_el.attrib["field"])

    title = root.xpath(".//cs:title", namespaces=ns)[0].text
    style_id = root.xpath(".//cs:id", namespaces=ns)[0].text
    summary = ""
    if summary_els := root.xpath(".//cs:summary", namespaces=ns):
        summary = summary_els[0].text

    if "export" in style_id:
        return

    if not field:
        msg = f'File "{file}": Empty field'
        warning(msg)

    if "GB/T 7714" in title:
        assert field == "generic-base"
        return

    # fields_str = " ".join(fields)
    # # if fields_str != "generic-base":
    # if len(fields) > 1:
    #     print(title, fields_str, sep="\t")

    if field == "generic-base":

        def warn_field(file, field_el):
            if field_el is not None:
                msg = f'File "{file}", line {field_el.sourceline}: Inappropriate field'
            else:
                msg = f'File "{file}": Inappropriate field'
            warning(msg)

        if (
            "journal" in title.lower()
            or "学报" in title
            or "journal" in style_id
            or root.xpath(".//cs:issn", namespaces=ns)
        ):
            if "编排规范" in title:
                return
            warn_field(file, field_el)
        # elif "学位论文" not in summary and "出版社" not in title:
        #     warn_field(file, field_el)
        elif (
            "大学" not in title
            and "大學" not in title
            and "研究院" not in title
            and "科学院" not in title
            and "出版社" not in title
        ):
            warn_field(file, field_el)


def check_affixes(path, root):
    for element in root.xpath(".//*[@prefix='']"):
        del element.attrib["prefix"]
    for element in root.xpath(".//*[@suffix='']"):
        del element.attrib["suffix"]

    style_id = Path(path).stem

    if style_id not in BAD_QUOTE_STYLES:
        for element in root.xpath(".//*[@prefix='“' or @suffix='”']"):
            warning(
                f'File "{path}", line {element.sourceline}: Quotes in dilimiters. Use \'quotes="true"\' instead.'
            )

    for tag in ["layout", "date", "group"]:
        for element in root.xpath(f".//cs:{tag}[@delimiter='']", namespaces=ns):
            del element.attrib["delimiter"]


def check_conditions(path: str, csl_content: str, element_tree):
    root = element_tree.getroot()
    for cond_xpath in [".//cs:if", ".//cs:else-if"]:
        for condition in root.findall(cond_xpath, ns):
            num_conditions = 0
            num_condition_types = 0
            for attr, value in condition.attrib.items():
                if attr != "match":
                    num_conditions += len(value.split())
                    num_condition_types += 1

            attributes_info = " ".join(
                [f'{key}="{value}"' for key, value in condition.attrib.items()]
            )

            if num_conditions > 1 and "match" not in condition.attrib:
                warning(
                    f'File "{path}", line {condition.sourceline}: condition \'{attributes_info}\' has no "match".'
                )
                if num_condition_types == 1 and "type" in condition.attrib:
                    condition.attrib["match"] = "any"
                else:
                    condition.attrib["match"] = "all"

            elif num_conditions == 1 and "match" in condition.attrib:
                if condition.attrib["match"] != "none":
                    warning(
                        f'File "{path}", line {condition.sourceline}: condition \'{attributes_info}\' has extra "match".'
                    )
                    condition.attrib.pop("match")


def check_condition_parents(path, root):
    for element_name in ["if", "else-if", "else"]:
        for condition in root.xpath(f".//cs:{element_name}", namespaces=ns):
            parent = condition.getparent()
            if "choose" not in parent.tag:
                warning(
                    f'File "{path}", line {condition.sourceline}: condition not in "choose".'
                )


def reorder_condition_values(root):
    for element_name in ["if", "else-if"]:
        for condition in root.xpath(f".//cs:{element_name}", namespaces=ns):
            for condition_name in [
                "is-numeric",
                "is-uncertain-date",
                "locator",
                "position",
                "type",
                # "variable",
            ]:
                if condition_name in condition.attrib:
                    value = condition.attrib[condition_name]
                    new_value = " ".join(sorted(value.split(), key=lambda x: x.lower()))
                    if new_value != value:
                        condition.attrib[condition_name] = new_value


def check_groups(path: str, csl_content: str, element_tree):
    root = element_tree.getroot()

    # Remove single group in a macro
    for group in root.xpath(".//cs:macro/cs:group", namespaces=ns):
        if len(group.getparent().xpath("./*")) == 1:
            if not group.attrib:
                warning(f'File "{path}", line {group.sourceline}: extra empty group.')

    # for group in root.xpath(".//cs:group", namespaces=ns):
    #     children = group.getchildren()
    #     if len(children) == 1 and children[0].tag != "choose":
    #         warning(
    #             f'File "{path}", line {group.sourceline}: Group has only one child element.'
    #         )


def check_macros(path: str, csl_content: str, element_tree):
    root = element_tree.getroot()

    unique_macros = set()

    for macro in root.findall(".//cs:macro", ns):
        name = macro.attrib["name"]
        if name in unique_macros:
            warning(
                f'File "{path}", line {macro.sourceline}: Duplicate macro "{name}".'
            )
        unique_macros.add(name)
        if not root.xpath(f".//*[@macro='{name}']"):
            warning(
                f'File "{path}", line {macro.sourceline}: The macro "{name}" is not used.'
            )

    for macro_call in root.xpath(".//*[@macro]"):
        name = macro_call.attrib["macro"]
        if name not in unique_macros:
            warning(
                f'File "{path}", line {macro_call.sourceline}: The macro "{name}" is not defined.'
            )

    # cleanup_unsed_macros(path, csl_content, called_macros)


def check_medium(path: str, csl_content: str):
    if '"OL"' in csl_content and 'text variable="medium"' not in csl_content:
        warning(f'File "{path}" does not contain "medium" variable.')


def cleanup_unsed_macros(path, csl_content: str, called_macros):
    lines = csl_content.splitlines(keepends=True)
    macros = []

    preamble = []
    macro = ""
    postamble = []
    state = 0
    for line in lines:
        if '<macro name="' in line:
            if state == 0 and preamble[-1].startswith("  <!--"):
                macro += preamble[-1]
                preamble.pop()
            state = 1
        elif "<citation" in line or "<bibliography" in line:
            if state == 1 and macro and macro.startswith("  <!--"):
                postamble.append(macro)
                macro = ""
            state = 2

        if state == 0:
            preamble.append(line)
        elif state == 2:
            postamble.append(line)
        else:
            macro += line
            if "</macro>" in line or re.match(r"\s*<macro .*/>", line):
                macros.append(macro)
                macro = ""

    new_macros = []
    for macro in macros:
        name = macro.split('<macro name="')[1].split('"', maxsplit=1)[0]
        if name in called_macros:
            new_macros.append(macro)

    csl_content = "".join(preamble + new_macros + postamble)
    with open(path, "w") as f:
        f.write(csl_content)


def swap_locale_layouts(root):
    root.attrib["default-locale"] = "en-US"

    for area_name in ["citation", "bibliography"]:
        areas = root.xpath(f"./cs:{area_name}", namespaces=ns)
        if areas:
            area = areas[0]
            layouts = area.xpath("./cs:layout", namespaces=ns)
            if len(layouts) != 2:
                continue
            layout_en = layouts[0]
            layout_zh = layouts[1]

            del layout_en.attrib["locale"]
            layout_zh.attrib["locale"] = "zh"

            area.insert(-2, layout_zh)
            etree.indent(area, level=1)


def check_text_case(path: str, csl_content: str, element_tree):
    root = element_tree.getroot()
    default_locale = root.attrib.get("default-locale", "en-US")

    for element in root.xpath(".//*[@text-case]"):
        text_case = element.attrib["text-case"]

        if text_case == "sentence":
            warning(
                f'File "{path}", line {element.sourceline}: Obsolete \'text-case="sentence"\'.'
            )
            del element.attrib["text-case"]

        elif (
            element.tag == "{http://purl.org/net/xbiblio/csl}text"
            and "macro" in element.attrib
        ):
            warning(
                f'File "{path}", line {element.sourceline}: Invalid text-case with macro.'
            )
            del element.attrib["text-case"]

        elif text_case == "title":
            if default_locale not in ["en", "en-US"]:
                warning(
                    f'File "{path}", line {element.sourceline}: text-case="title" does\' work with default-locale="{default_locale}".'
                )
                # swap_locale_layouts(root)
                # return

        elif text_case in ["capitalize-first", "capitalize-all"]:
            variable = None
            if element.tag == "name-part":
                warning(
                    f'File "{path}", line {element.sourceline}: \'text-case="{text_case}"\' should not be applied to "name-part"'
                )
                del element.attrib["text-case"]
            elif "variable" in element.attrib:
                variable = element.attrib["variable"]
                if variable in ["title", "title-short", "container-title"]:
                    warning(
                        f'File "{path}", line {element.sourceline}: \'text-case="{text_case}"\' should not be applied to "{variable}"'
                    )
                    del element.attrib["text-case"]

        elif text_case not in [
            "lowercase",
            "uppercase",
            "capitalize-first",
            "capitalize-all",
        ]:
            warning(
                f'File "{path}", line {element.sourceline}: invalid \'text-case="{text_case}"\'.'
            )
            del element.attrib["text-case"]


def check_style_options(style: CslStyle):
    name_options = ["et-al-min", "et-al-use-first"]
    valid_options = {
        "numeric": {
            "collapse": ["citation-number"],
            "after-collapse-delimiter": [],
        },
        "author-date": {
            "et-al-subsequent-min": [],
            "et-al-subsequent-use-first": [],
            "disambiguate-add-givenname": [],
            "givenname-disambiguation-rule": [],
            "disambiguate-add-names": [],
            "disambiguate-add-year-suffix": [],
            "cite-group-delimiter": [],
            "collapse": [
                "year",
                "year-suffix",
                "year-suffix-ranged",
            ],
            "year-suffix-delimiter": [],
            "after-collapse-delimiter": [],
        },
        "author": {
            "et-al-subsequent-min": [],
            "et-al-subsequent-use-first": [],
            "disambiguate-add-givenname": [],
            "givenname-disambiguation-rule": [],
            "disambiguate-add-names": [],
            "disambiguate-add-year-suffix": [],
            "cite-group-delimiter": [],
            "collapse": [
                "year",
                "year-suffix",
                "year-suffix-ranged",
            ],
            "year-suffix-delimiter": [],
            "after-collapse-delimiter": [],
        },
        "note": {
            "et-al-subsequent-min": [],
            "et-al-subsequent-use-first": [],
            "disambiguate-add-givenname": [],
            "givenname-disambiguation-rule": [],
            "disambiguate-add-names": [],
            "disambiguate-add-year-suffix": [],
        },
    }
    for attr, value in style.citation.attrib.items():
        if attr in name_options:
            continue

        format_options = valid_options[style.citation_format]
        if attr not in format_options:
            warning(
                f'File "{style.path}", line {style.citation.sourceline}: Invalid option "{attr}"'
            )
            continue
        else:
            if format_options[attr]:
                if value not in format_options[attr]:
                    warning(
                        f'File "{style.path}", line {style.citation.sourceline}: Invalid value "{value}" for option "{attr}"'
                    )


def check_sort(style: CslStyle):
    for key in style.style.xpath(".//cs:key[@sort='ascending']", namespaces=ns):
        warning(
            f'File "{style.path}", line {key.sourceline}: Extra attribute \'sort="ascending"\''
        )
        del key.attrib["sort"]

    citation_format = style.citation_format
    if citation_format != "note":
        for area_name in ["citation", "bibliography"]:
            if citation_format == "numeric" and area_name == "bibliography":
                continue
            areas = style.style.xpath(f".//cs:{area_name}", namespaces=ns)
            if areas and not style.style.xpath(
                f".//cs:{area_name}/cs:sort", namespaces=ns
            ):
                warning(
                    f'File "{style.path}", line {areas[0].sourceline}: Missing <sort> in <{area_name}>'
                )


# https://github.com/citation-style-language/utilities/blob/master/csl-reindenting-and-info-reordering.py
def reorder_info_items(root):
    csInfo = root.find(".//{http://purl.org/net/xbiblio/csl}info")

    counter = []
    for infoNodeIndex, infoNode in enumerate(csInfo):
        # check if node is an element
        if isinstance(infoNode.tag, str):
            # get rid of namespace
            tag = infoNode.tag.replace("{http://purl.org/net/xbiblio/csl}", "")
            if tag == "link":
                tag += "[@" + infoNode.get("rel") + "]"
            if (tag == "category") & (infoNode.get("citation-format") is not None):
                tag += "[@citation-format]"
            if (tag == "category") & (infoNode.get("field") is not None):
                tag += "[@field]"
        # check if node is a comment
        elif etree.tostring(
            infoNode, encoding="utf-8", xml_declaration=False
        ).decode() == ("<!--" + infoNode.text + "-->"):
            # keep comments that precede any element at the top
            if sum(counter) == 0:
                counter.append((INFO_ITEM_ORDER.index("preceding-comment"), None))
            # keep a comment at the end at the end
            elif len(counter) == (len(csInfo) - 1):
                counter.append((INFO_ITEM_ORDER.index("end-comment"), None))
            # keep other comments with preceding element
            else:
                counter.append((counter[-1], None))

        # Possible improvements:
        # * exceptions for recognizable comments (issn, category)
        else:
            pass
            # print(infoNode)

    # make sure if length counter is identical to length csInfo
    # http://scienceoss.com/sort-one-list-by-another-list/
    if len(counter) == len(csInfo):
        # for index in range(len(counter)):
        #     # use float() to avoid integer division
        #     counter[index][0] += index / (float(len(counter)))
        csInfoWithKeys = sorted(zip(counter, csInfo), key=lambda x: x[0])
        sortedCounter, sortedCsInfo = zip(*csInfoWithKeys)

        # overwrite list contents
        # http://stackoverflow.com/questions/5438362/overwrite-entire-object-in-place
        csInfo[:] = sortedCsInfo

    # Trim whitespace from cs:summary text contents
    try:
        summary = root.find(".//{http://purl.org/net/xbiblio/csl}summary")
        summary.text = summary.text.strip()
    except:
        pass

    # Trim whitespace from cs:title text contents
    try:
        title = root.find(".//{http://purl.org/net/xbiblio/csl}title")
        title.text = title.text.strip()
    except:
        pass

    # Reorder attributes on cs:link
    try:
        links = root.findall(".//{http://purl.org/net/xbiblio/csl}link")
        for link in links:
            rel = link.get("rel")
            del link.attrib["rel"]
            link.set("rel", rel)
    except:
        pass

    # # Add citation-number sort for non-sorting numeric styles
    # try:
    #     citation = root.find(".//{http://purl.org/net/xbiblio/csl}citation")

    #     # make sure style is independent
    #     # make sure style is numeric
    #     # if style doesn't sort, add sort (cs:sort, cs:key) for citation-number
    #     citationFormat = root.find(
    #         ".//{http://purl.org/net/xbiblio/csl}category[@citation-format]"
    #     )
    #     if citationFormat.attrib.get("citation-format") == "numeric":
    #         if citation[0].tag != "{http://purl.org/net/xbiblio/csl}sort":
    #             numberSort = etree.fromstring(
    #                 '<sort><key variable="citation-number"/></sort>'
    #             )
    #             citation.insert(0, numberSort)
    # except:
    #     pass


def check_style(file):
    with open(file) as f:
        csl_content = f.read()

    # parser = etree.XMLParser(remove_blank_text=True)
    parser = etree.XMLParser()
    style = etree.parse(file, parser)
    root = style.getroot()

    csl_style = CslStyle.from_file(file)

    # info(f'Running test of "{style_name}.csl"')

    check_fields(file, csl_content, style)

    check_field(file, csl_content, style)

    check_affixes(file, root)

    check_conditions(file, csl_content, style)

    check_condition_parents(file, root)

    reorder_condition_values(root)

    check_groups(file, csl_content, style)

    check_macros(file, csl_content, style)

    # check_medium(file, csl_content)

    check_text_case(file, csl_content, style)

    check_style_options(csl_style)

    check_sort(csl_style)

    reorder_info_items(root)

    write_style(style, file)


def write_style(style, path):
    with open(path) as f:
        original_content = f.read()
    style_str = etree.tostring(style, pretty_print=True, xml_declaration=True, encoding="utf-8").decode("utf-8")
    style_str = style_str.replace("'", '"', 4)
    style_str = style_str.replace(" ", "&#160;")  # no-break space
    style_str = style_str.replace(" ", "&#8195;")  # em space
    style_str = style_str.replace("ᵉ", "&#7497;")
    style_str = style_str.replace("‑", "&#8209;")  # non-breaking hyphen
    # style_str = style_str.replace("–", "&#8211;")  # en dash
    style_str = style_str.replace("&#8211;", "–")  # en dash
    style_str = style_str.replace("—", "&#8212;")  # em dash
    style_str = re.sub(r"(<title>.*?)&#8212;", r"\1—", style_str)
    style_str = re.sub(r"(<summary>.*?)&#8212;", r"\1—", style_str)
    style_str = style_str.replace("GB/T 7714&#8212;", "GB/T 7714—")  # em dash
    style_str = re.sub(r"(\S)[ \t]+<!--", r"\1  <!--", style_str)
    style_str = re.sub(r"<!--\s*(\S)", r"<!-- \1", style_str)
    style_str = re.sub(r"(\S)[ \t]*-->", r"\1 -->", style_str)

    if style_str != original_content:
        now = datetime.datetime.now().astimezone().isoformat(timespec="seconds")
        style_str = re.sub(r"<updated>[^<]*</updated>", f"<updated>{now}</updated>", style_str)
        with open(path, "w") as f:
            f.write(style_str)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("files", nargs="*")
    args = parser.parse_args()

    files = args.files
    if not files:
        files = sorted(Path("./src").glob("**/*.csl"))

    for file in files:
        check_style(file)


if __name__ == "__main__":
    main()
