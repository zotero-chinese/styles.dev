from collections import OrderedDict
import glob
import json

def sort_json(path):
    with open(path) as f:
        data = json.load(f)

    def get_sort_key(item):
        if item[0] == 'id':
            return '00'
        elif item[0] == 'type':
            return '01'
        else:
            return str.casefold(item[0])

    data = [OrderedDict(sorted(item.items(), key=get_sort_key)) for item in data]
    data = sorted(data, key=lambda x: x['id'])

    with open(path, 'w') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)
        f.write('\n')


sort_json('data.json')
