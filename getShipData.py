"""
Web-scrape basic information about ships
"""
import requests
from subprocess import call

# Download new data file
url = 'http://risp.puertosdetenerife.org/dataset/eff95e11-4baa-4ab8-aeb2-33d80c6395d8/resource/4b31504e-fd63-4eba-a9ef-6663a12d5dd0/download/crucerosprevistos.csv'
myfile = requests.get(url)
open('crucerosprevistos_Tenerife.csv', 'wb').write(myfile.content)

# Push commit
command1 = 'git add crucerosprevistos_Tenerife.csv'
command2 = 'git commit -m "Update data"'
command3 = 'git push origin master'
call(['git', command1])
call(['git', command2])
call(['git', command3])


# content = BeautifulSoup(open(url), "html.parser")
# text = urllib.request.urlopen(url).read()
# print(text)
