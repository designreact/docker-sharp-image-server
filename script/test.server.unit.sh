command -v mocha >/dev/null 2>&1 || { echo >&2 "[ERROR]   mocha required but not installed. Aborting."; exit 1; }
mocha --compilers js:babel-register --recursive server/**/*.test.js
