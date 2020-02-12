"""
Web-scrape basic information about ships
"""

# from bs4 import BeautifulSoup
# import urllib.request

import requests

url = 'https://www.cruisemapper.com/ships'
r = requests.get(url)
print(r.text)

# content = BeautifulSoup(open(url), "html.parser")
# text = urllib.request.urlopen(url).read()
# print(text)
