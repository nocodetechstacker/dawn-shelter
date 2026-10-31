"""배포 전에 실행: python3 release.py

index.html 의 파일 버전(?v=), js/app.js 의 BUILD, version.txt 를 같은 값으로 맞춰요.
이미 열려 있거나 브라우저에 남아 있던 오래된 화면이 새 버전을 알아채고 스스로 새로고침해요.
"""
import re
import time

v = time.strftime("%Y%m%d%H%M")

with open("index.html", encoding="utf-8") as f:
    html = f.read()
html = re.sub(r'\?v=\d+"', f'?v={v}"', html)
with open("index.html", "w", encoding="utf-8") as f:
    f.write(html)

with open("js/app.js", encoding="utf-8") as f:
    js = f.read()
js = re.sub(r'const BUILD="[^"]*";', f'const BUILD="{v}";', js)
with open("js/app.js", "w", encoding="utf-8") as f:
    f.write(js)

with open("version.txt", "w", encoding="utf-8") as f:
    f.write(v + "\n")

print("버전", v)
