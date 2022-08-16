import os
import uuid
import yaml
import xml.dom.minidom
import requests
import json


def get_info(style_file_path):
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
        'field': [],
        'summary': 'Undefined',
        'updated': 'Undefined',
    }
    # 使用 minidom 解析器打开 XML 文档
    DOMTree = xml.dom.minidom.parse(style_file_path)
    style = DOMTree.documentElement
    if style.hasAttribute('class'):
        dict['style_class'] = style.getAttribute('class')

    info = style.getElementsByTagName('info')[0]

    dict['title'] = info.getElementsByTagName('title')[0].childNodes[0].data
    dict['id'] = info.getElementsByTagName('id')[0].childNodes[0].data

    if info.getElementsByTagName('link'):
        for link in info.getElementsByTagName('link'):
            match (link.getAttribute('rel')):
                case 'self':
                    dict['link_self'] = link.getAttribute('href')
                case 'template':
                    dict['link_template'] = link.getAttribute('href')
                case 'documentation':
                    dict['link_documentation'] = link.getAttribute('href')
                case default:
                    pass

    if info.getElementsByTagName('category'):
        for category in info.getElementsByTagName('category'):
            if category.getAttribute('citation-format'):
                dict['citation-format'] = category.getAttribute(
                    'citation-format')
            elif category.getAttribute('field'):
                dict['field'].append(category.getAttribute('field'))

    if info.getElementsByTagName('summary'):
        dict['summary'] = info.getElementsByTagName(
            'summary')[0].childNodes[0].data
    if info.getElementsByTagName('updated'):
        dict['updated'] = info.getElementsByTagName(
            'updated')[0].childNodes[0].data

    return dict


def get_preview(style_name, data_file='sampledata.json'):
    '''生成样式文件的预览，需要 citeproc-js-serve 运行

    Args:
        style_name (string): 样式文件名称（无后缀的文件名）
        data_file (string): 示例数据文件的路径

    Returns:
        dict: cite{}
    '''
    # requests
    headers = {'content-type': 'application/json'}
    post = 'http://127.0.0.1:8085?responseformat=json&citations=1&style=' + style_name
    
    if data_file==False:
        data_file = 'sampledata.json'
        
    with open(data_file, 'r', encoding='utf-8') as data:
        r = requests.post(post, headers=headers, data=data.read())
    # print(r.status_code, r.content)
    response = json.loads(r.content)  # json

    cite = {
        'citations': 'Undefined',
        'bib_second_field_align': False,
        'bibstart': '<div class="csl-bib-body">',
        'bibliography': 'Undefined',
        'bibend': '</div>'
        }
    # bibliography
    cite['bibliography'] = response['bibliography'][1]  # list
    cite['bib_second_field_align'] = response['bibliography'][0]['second-field-align']
    cite['bibstart'] = response['bibliography'][0]['bibstart']
    cite['bibend'] = response['bibliography'][0]['bibend']

    # citation
    cite['citations'] = ''
    for citation_item in response['citations']:
        cite['citations'] += citation_item[1] + ', '

    return cite


def check_uuid4(test_uuid, version=4):
    '''检查一个 id 是否是合法的 uuid

    Args:
        test_uuid (string): 要被检查的 uuid
        version (int, optional): uuid 的版本. Defaults to 4.

    Returns:
        bool: 合法 1，非法 0
    '''
    try:
        return uuid.UUID(test_uuid).version == version
    except ValueError:
        return False

# def change_id():
#     # 变更 id 为 uuid
#     if (check_uuid4(info.id) != True):
#         # dict['id']=uuid.uuid4()
#         info.id = uuid.uuid4()
#         info.id.write(info.id);
#         dict['id'] = info.getElementsByTagName('id')[0].childNodes[0].data


def get_files(base='./csl/', suffix='csl', data_file='data.json'):
    '''
    遍历给定文件夹下指定后缀的文件，并将相对于dirPath的路径和文件名返回

    Args:
        base (str, optional): 文件夹路径. Defaults to './csl'.
        suffix (str, optional): 后缀名. Defaults to 'csl'.
        data_file (str, optional): 用于替换默认示例数据的文件名. Defaults to 'data.json'.

    Returns:
        list: 复合列表，
        [
            [
                文件1名 无后缀, 
                文件1路径, 
                data文件路径    如果有，是路径，否则为 False
                ],
            [
                文件2路径,
                文件2名,
                False
                ]
        ]
    '''
    for root, ds, fs in os.walk(base):
        for f in fs:
            if f.endswith(suffix):
                csl_path = os.path.join(root, f)
                if data_file in fs:
                    data_path = os.path.join(root, data_file)
                else:
                    data_path = False
                yield [f.split('.')[0], csl_path, data_path]


def write_category(items, name):
    '''
    按分类写入内容

    Args:
        items (dict): 包含写入内容的字典
        name (string): 文件名
    '''
    with open('docs/category/'+name+'.md', 'w') as f:
        f.write('# '+name)
        for item in items:
            f.write('\n\n## '+ item['title']+'\n\n')
            f.write(item['summary']+'\n\n')
            f.write('### 引文\n\n')
            f.write(item['citations']+'\n\n')
            f.write('### 书目\n\n')
            bibliography = item['bibstart'] + ''
            for bibo in item['bibliography']:
                bibliography += bibo
            bibliography += item['bibend']
            f.write(bibliography+'\n\n')


def write_file(dict, file_name):

    dict['tag'] = dict['field']
    dict['category'] = [dict['citation-format']]

    citation = dict.pop('citations')
    bibliography = dict.pop('bibstart') + ''
    for bibo in dict.pop('bibliography'):
        bibliography += bibo
    bibliography += dict.pop('bibend')

    with open('docs/preview/'+file_name+'.md', 'w') as f:
        # Markdown 前言
        f.write('---\n\n')
        yaml.dump(dict, f, sort_keys=False, allow_unicode=True)
        f.write('\n\n---\n\n')
        # Markdown 摘要
        f.write(dict['summary'])
        f.write('\n\n::: note 引文 \n\n')
        f.write(citation)
        f.write('\n\n ::: \n\n')
        f.write('\n\n::: note 书目 \n\n')
        f.write(bibliography)
        f.write('\n\n ::: \n\n')
        f.write('<!-- more -->')
        # Markdown 正文、下载链接：todo...

    return 0


if __name__ == '__main__':

    # 在给定的文件夹中遍历所有.csl文件
    csl_files = get_files('./csl/', 'csl', 'data.json')

    # # 获取每一个 CSL 的信息
    # dicts=[]

    for csl_file in csl_files:
        # print(csl_file)
        dict = get_info(csl_file[1])
        dict.update(get_preview(csl_file[0], csl_file[2]))
        # for key, value in dict.items():
        #     print( key, ': ', value)
        write_file(dict, csl_file[0])

    # numeric = [dict for dict in dicts if dict['citation-format']=='numeric']
    # author_date = [dict for dict in dicts if dict['citation-format']=='author-date']
    # write_category(numeric, 'numeric')
    # write_category(author_date, 'author_date')
