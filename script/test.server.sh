command -v ./node_modules/.bin/babel-node >/dev/null 2>&1 || { echo >&2 "[ERROR]   ./node_modules/.bin/babel-node required but not installed. Aborting."; exit 1; }
command -v ./node_modules/.bin/babel-istanbul >/dev/null 2>&1 || { echo >&2 "[ERROR]   ./node_modules/.bin/babel-istanbul required but not installed. Aborting."; exit 1; }
command -v ./node_modules/.bin/_mocha >/dev/null 2>&1 || { echo >&2 "[ERROR]   ./node_modules/.bin/_mocha required but not installed. Aborting."; exit 1; }
./node_modules/.bin/babel-node ./node_modules/.bin/babel-istanbul cover ./node_modules/.bin/_mocha -- --compilers js:babel-register --recursive server/**/*.test.js
