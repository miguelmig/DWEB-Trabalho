from lxml import html
import requests

page = requests.get('https://sou.uminho.pt/pt/cursos')
tree = html.fromstring(page.content)

def is_invalid(t):
    if ']' in t:
        return True
    def hasNumbers(inputString):
        return any(char.isdigit() for char in inputString)
    if hasNumbers(t):
        return True
    return False


rows = tree.xpath('//tbody//tr')
rows = map(lambda x : x[0].text, rows)
rows = filter(lambda x: not is_invalid(x), rows)

#print('\n'.join(rows))

for row in rows:
    sigla = ''.join([c for c in row if c.isupper()])
    print(' ' * (4 * 4) + 'option(value="{}") {}'.format(sigla, row.encode('utf8')))