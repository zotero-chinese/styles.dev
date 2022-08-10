import yaml
import xml.dom.minidom
import requests
import json
import frontmatter

def get_info(style_file):
    '''获取指定 csl 文件的 info 信息和 preview

    Args:
        style_file (string): 样式文件路径

    Returns:
        dict: 包含样式信息的字典
    '''
    dict = {
        'style_class': 'Unknow',
        'title': 'Undefined',
        'id': 'Undefined',
        'link_self': 'Undefined',
        'link_template': 'Undefined',
        'link_documentation': 'Undefined',
        'author': {},
        'contributor': {},
        'citation-format': 'Undefined',
        'category': [],
        'summary': 'Undefined',
        'updated': 'Undefined',
        'citations': 'Undefined',
        'bibstart': '<div class="csl-bib-body">',
        'bibliography': 'Undefined',
        'bibend': '</div>'
    }
    # 使用 minidom 解析器打开 XML 文档
    DOMTree = xml.dom.minidom.parse(style_file)
    style = DOMTree.documentElement
    if style.hasAttribute('class'):
        dict['style_class'] = style.getAttribute('class')

    info = style.getElementsByTagName('info')[0]

    dict['title'] = info.getElementsByTagName('title')[0].childNodes[0].data
    dict['id'] = info.getElementsByTagName('id')[0].childNodes[0].data

    links = info.getElementsByTagName('link')
    for link in links:
        match (link.getAttribute('rel')):
            case 'self':
                dict['link_self'] = link.getAttribute('href')
            case 'template':
                dict['link_template'] = link.getAttribute('href')
            case 'documentation':
                dict['link_documentation'] = link.getAttribute('href')
            case default:
                pass

    dict['citations'], dict['bibliography'], dict['bibstart'], dict['bibend'] = get_preview('000gb-t-7714-2015-numeric-bilingual')

    return dict


def get_preview(style_name):
    '''生成样式文件的预览，需要 citeproc-js-serve 运行

    Args:
        style_name (string): 样式文件名称（无后缀的文件名）

    Returns:
        tuple: (citation, bibliography)
    '''
    # response
    headers = {'content-type': 'application/json'}
    data = open('sampledata.json', 'r', encoding='utf-8')
    post = 'http://127.0.0.1:8085?responseformat=json&citations=1&style=' + style_name
    response_content = json.loads(requests.post(
        post, headers=headers, data=data).content)  # json
    # bibliography
    response_content_bibliography = response_content['bibliography'][1]  # list
    bibstart = response_content['bibliography'][0]['bibstart']
    bibend = response_content['bibliography'][0]['bibend']
   #  bibliography = bibstart + ''
   #  for bibo in response_content_bibliography:
   #      bibliography += bibo
   #  bibliography += bibend
    # citation
    response_content_citations = response_content['citations']  # list
    citations = ''
    for response_content_citation in response_content_citations:
        citations += response_content_citation[1] + ', '

    return citations, response_content_bibliography, bibstart, bibend


def check_uuid4(test_uuid, version=4):
    '''检查一个 id 是否是合法的 uuid

    Args:
        test_uuid (string): 要被检查的 uuid
        version (int, optional): uuid 的版本. Defaults to 4.

    Returns:
        bool: 合法 1，非法 0
    '''
    try:
        return id.UUID(test_uuid).version == version
    except ValueError:
        return False


def save_dict_to_yaml(dict_value: dict, save_path: str):
    """dict保存为yaml"""
    with open(save_path, 'w') as file:
        file.write(yaml.dump(dict_value, allow_unicode=True))


def read_yaml_to_dict(yaml_path: str, ):
    with open(yaml_path) as file:
        dict_value = yaml.load(file.read(), Loader=yaml.FullLoader)
        return dict_value


if __name__ == '__main__':

   # 在给定的文件夹中遍历所有.csl文件

   dict = get_info('csl/000gb-t-7714-2015-numeric-bilingual.csl')
   for key, value in dict.items():
      print('key: ', key, 'value: ', value)

   #  my_config_dict = {
   #      "mysql": {
   #          "host": "127.0.0.1",
   #          "tables": ["table_1", "table_2"],
   #      },
   #      "redis": {
   #          "host": "127.0.0.1",
   #          "db": 3,
   #      }
   #  }
   #  # 保存yaml
   #  save_dict_to_yaml(my_config_dict, "config.yaml")
   #  # 读取yaml
   #  config_value = read_yaml_to_dict("config.yaml")
   #  assert config_value == my_config_dict
   # fmdata = '---\n' + yaml.dump(dict, sort_keys=False) + '\n ---\n'
   with open('docs/preview/test.md', 'w') as yaml_file:
      yaml.dump(dict, yaml_file, sort_keys=False)
   # yaml.dump(dict, 'test.md', allow_unicode=True)

   # data = frontmatter.load(fmdata)
   # with open('test.md') as f:
   #    metadata, content = frontmatter.parse(f.read())
   #    metadata = dict
   #    frontmatter.dump(metadata, f)
   # print(metadata['title'])