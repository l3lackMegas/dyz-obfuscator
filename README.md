# dyz-obfuscator
The HTML, CSS and JS obfuscator script.

Sorry, if this repo might be looks messy. I don't have time to clean up the code.

# Installation
```bash
git clone https://github.com/l3lackMegas/dyz-obfuscator.git
cd ./dyz-obfuscator
npm install
npm link
```

# Update
 ```bash
git pull
npm link
 ```
 
# Usage
 ```bash
 dobs [option]
 ```
 
 ## Example
 ```bash
dobs -s "/path/to/source" -o "/path/to/output"
```
```bash
dobs --source /path/to/source --output /path/to/output
```
 
 Options:
 ```
 -V, --version         output the version number
 -s,--source [folder]  Source images directory (default: "./")
 -o,--output [folder]  Directory to be created for obfuscated files (default: "./dyz-obfuscated")
 -h, --help            display help for command
 ```
  
# Dependencies
- "clean-css": "^5.2.0",
- "css": "^3.0.0",
- "fs-extra": "^10.0.0",
- "globby": "^12.0.2",
- "html-minifier": "^4.0.0",
- "javascript-obfuscator": "^2.19.0"
- "readline": "^1.3.0",
- "rimraf": "^3.0.2"

Thank to [auto-git-update](https://github.com/chegele/AutoGitUpdate) for auto-update