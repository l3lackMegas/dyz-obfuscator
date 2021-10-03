# dyz-obfuscator
The HTML, CSS, JS and Lua obfuscator for FiveM's resources.

`Sorry, if this repo might be looks messy. I don't have time to clean up the code.`

# Installation & Update
```bash
npm i -g dyz-obfuscator
```
 
# Usage
```bash
dobs [option]
```
 
## Example:
- Easy way to use:
```bash
dobs
```
- Wanna set a source and output folder? Check this:
```bash
dobs -s "/path/to/source" -o "/path/to/output"

#or

dobs --source /path/to/source --output /path/to/output
```
- Ignore some file by keywords? Use this option and see example of json file [here](https://github.com/l3lackMegas/dyz-obfuscator/blob/main/ignore-list.json).
```bash
dobs -i /path/to/ignore-list.json

#or

dobs -ignore /path/to/ignore-list.json
```
 
## Options
 ```
  -V, --version         output the version number
  -s,--source [folder]  Source images directory (default: "./")
  -o,--output [folder]  Directory to be created for obfuscated files (default: "./dyz-obfuscated")
  -i,--ignore [json file]  Directory to be created for obfuscated files
  -h, --help            output usage information
 ```
  
# Dependencies
- "chegs-simple-logger": "^1.1.0"
- "clean-css": "^5.2.0"
- "css": "^3.0.0"
- "fs-extra": "^10.0.0"
- "globby": "^12.0.2"
- "html-minifier": "^4.0.0"
- "javascript-obfuscator": "^2.19.0"
- "lodash": "^4.17.21"
- "log-update": "^4.0.0"
- "luamin": "^1.0.4"
- "node-jsencrypt": "^1.0.0"
- "rimraf": "^3.0.2"
- "simple-git": "^1.131.0"
- "utf8": "^3.0.0"

Thank to [chegele/AutoGitUpdate](https://github.com/chegele/AutoGitUpdate) for check version script, And Thank to [ganlvtech/lua-simple-encrypt](https://github.com/ganlvtech/lua-simple-encrypt) for lua encryption !
