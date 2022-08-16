#!/usr/bin/bash

cd ./citeproc-js-server

# echo '[info] Initing git submodule...'
# git submodule update --init --recursive

echo '[info] Installing dependency...'
export NODE_ENV=submodule
npm install

echo '[info] Starting citeproc serve...'
npm start &
sleep 5s # 缓一缓让 citeproc 跑起来再执行下一步

cd ..
echo '[info] Geting preview...'
pip install -r requirements.txt
python preview.py

echo '[info] Kill citeproc serve'
kill $(ps -ef | grep node | awk '{print $2}')

echo '[info] DONE!'