import os
import uuid
import yaml
import xml.dom.minidom
import requests
import json


def get_info(style_file_path, style_file_name):
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
    DOMTree = xml.dom.minidom.parse(style_file_path)
    style = DOMTree.documentElement
    if style.hasAttribute('class'):
        dict['style_class'] = style.getAttribute('class')

    info = style.getElementsByTagName('info')[0]

    dict['title'] = info.getElementsByTagName('title')[0].childNodes[0].data
    dict['id'] = info.getElementsByTagName('id')[0].childNodes[0].data

    # 变更 id 为 uuid
    # if (check_uuid4(info.id) != True):
    #     # dict['id']=uuid.uuid4()
    #     info.id = uuid.uuid4()
    #     info.id.write(info.id);
    #     dict['id'] = info.getElementsByTagName('id')[0].childNodes[0].data  

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
                dict['citation-format'] = category.getAttribute('citation-format')
            elif category.getAttribute('field'):
                dict['category'].append(category.getAttribute('field'))
    
    if info.getElementsByTagName('summary'):
        dict['summary'] = info.getElementsByTagName('summary')[0].childNodes[0].data
    if info.getElementsByTagName('updated'):
        dict['updated'] = info.getElementsByTagName('updated')[0].childNodes[0].data


    dict['citations'], dict['bibliography'], dict['bibstart'], dict['bibend'] = get_preview(
        style_file_name)

    return dict


def get_preview(style_name):
    '''生成样式文件的预览，需要 citeproc-js-serve 运行

    Args:
        style_name (string): 样式文件名称（无后缀的文件名）

    Returns:
        tuple: (citation, bibliography)
    '''
    # requests
    headers = {'content-type': 'application/json'}
    post = 'http://127.0.0.1:8085?responseformat=json&citations=1&style=' + style_name
    with open('sampledata.json', 'r', encoding='utf-8') as data:
        r = requests.post(post, headers=headers, data=data.read())
    # print(r.status_code, r.content)
    content = json.loads(r.content)  # json

    # bibliography
    bibliography = content['bibliography'][1]  # list
    bibstart = content['bibliography'][0]['bibstart']
    bibend = content['bibliography'][0]['bibend']

    # citation
    response_content_citations = content['citations']  # list
    citations = ''
    for response_content_citation in response_content_citations:
        citations += response_content_citation[1] + ', '

    return citations, bibliography, bibstart, bibend


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

    
            
def get_files(dirPath='./csl', suffix='csl'):
    """
    遍历给定文件夹下指定后缀的文件，并将相对于dirPath的路径和文件名返回

    Args:
        dirPath (str, optional): 文件夹路径. Defaults to './csl'.
        suffix (str, optional): 后缀名. Defaults to 'csl'.

    Returns:
        list: 复合列表，[[文件1路径,文件1名],[文件2路径,文件2名]]
    """
    csl_files = []
    dirs = os.listdir(dirPath)
    for currentFile in dirs:
        absPath = dirPath + '/' + currentFile
        if os.path.isdir(absPath):
            get_files(absPath, suffix)
        elif currentFile.split('.')[-1] == suffix:
            csl_files.append([absPath, currentFile.split('.')[0]])
    return csl_files

def write_category(items, name):
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
        

if __name__ == '__main__':

    # dict = get_info('./csl/000gb-t-7714-2015-numeric-bilingual.csl')
    # for key, value in dict.items():
    #     print( key, ': ', value)


    # 在给定的文件夹中遍历所有.csl文件
    csl_files = get_files('./csl', 'csl')

    # 获取每一个 CSL 的信息
    dicts=[]
    
    for csl_file in csl_files:
        print(csl_file[0])
        dict = get_info(csl_file[0], csl_file[1])
        dicts.append(dict)
        # for key, value in dict.items():
        #     print( key, ': ', value)
        with open('docs/preview/'+csl_file[1]+'.md', 'w') as f:
            f.write('---\n\n')
            yaml.dump(dict, f, sort_keys=False, allow_unicode=True)
            f.write('template: preview.html')
            f.write('\n\n---\n\n')
    
    numeric = [dict for dict in dicts if dict['citation-format']=='numeric']
    author_date = [dict for dict in dicts if dict['citation-format']=='author-date']
    write_category(numeric, 'numeric')
    write_category(author_date, 'author_date')
