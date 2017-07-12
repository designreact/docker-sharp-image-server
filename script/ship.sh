[ -d ./build ] || mkdir ./build
[ -d ./dist ] || mkdir ./dist

cp -R ./build/server.bundle.js ./dist/index.js
cp ./README.md ./dist/README.md
cp ./package.json ./dist/package.json
