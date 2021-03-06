import rimraf from "rimraf"

import fs from 'fs'
import { promisify } from 'util'
import {globby} from 'globby';

import { minify } from 'html-minifier';
import css from 'css';
import cssParser from './css-parser.js';
import CleanCSS from 'clean-css';
import JavaScriptObfuscator from 'javascript-obfuscator';
import luaSimpleXorEncrypt from './LuaSimpleXorEncrypt.js'

export const readByte = (filePath)=>{
    let fileData = fs.readFileSync(filePath).toString('hex');
    let result = []
    for (var i = 0; i < fileData.length; i+=2)
      result.push('0x'+fileData[i]+''+fileData[i+1])
    return result;
}

export const directoryExists = (filepath) => {
    return fs.existsSync(filepath)
}

export const readdir = globby
export const mkdir = promisify(fs.mkdir)
export const rm = promisify(rimraf)

export const getExtension = (s) => {
    var re = /(?:\.([^.]+))?$/;
    return re.exec(s)[1];
}

export function sanitizeString(str) {
    str = str.replace(/[^a-z0-9áéíóúñü_-\s\.,]/gim,"");
    return str.trim();
}

export const obfuscateHTML = (sourceString, _log, logMessage) => {
    try {
        let html = sourceString.replace(/([<]+ +[<])/g, "<")
        html = html.replace(/([>]+ +[>])/g, ">")
        //console.log(html)
        var result = minify(html, {
            removeAttributeQuotes: true,
            processConditionalComments: false,
            removeComments: true,
            removeCommentsFromCDATA:true,
            collapseWhitespace:true,
            collapseBooleanAttributes:true,
            removeRedundantAttributes:true,
            useShortDoctype:true,
            removeOptionalTags:true,
        });

        //let encode = "";
        let arrString = []
        let randNumber = parseInt(Math.random()*40000)
        let maxLength = result.length
        for (var i=0; i<result.length; i++) {
            arrString.push(`x${result.charCodeAt(i) + randNumber}`)
            //encode += String.fromCharCode(result.charCodeAt(i) + 1);
            if(maxLength > 10000) {
                let percent = ((i + 1) / maxLength) * 100
                let terminalOut = `\x1b[2m\x1b[43m\x1b[30mProgress: (${i + 1}/${maxLength} | ${Math.floor(percent)}%)\x1b[0m ${logMessage}`;
                if(_log) _log(terminalOut.length > process.stdout.columns ?
                    terminalOut.substring(0, process.stdout.columns - 13) + '...' + terminalOut.substring(terminalOut.length - 10, terminalOut.length)
                    : terminalOut
                );
            }
        }
        //encode = encode.replace(/(`)/g, '\\`')
        let terminalOut = `\x1b[2m\x1b[43m\x1b[30m(Final Processing)\x1b[0m ${logMessage}`;
        let jsPreset = `var s=\`${JSON.stringify(arrString)}\`;var m="";var mm=JSON.parse(s);for(var i=0;i<mm.length;i++)m+=String.fromCharCode(parseInt(mm[i].substring(1,mm[i].length))-${randNumber});document.write(m);setTimeout(()=>{var sc=document.getElementsByTagName('script');while(sc.length > 0)sc[0].remove();},1000);`
        let obfuscate = `<script>${obfuscateJS(jsPreset, _log, terminalOut).source}</script><noscript>You must enable JavaScript to see this text.</noscript>`
        return {success: true, source: obfuscate}
    } catch (error) {
        return {success: false, source: sourceString, error: error.message}
    }
    
}

export const obfuscateCSS = (sourceString, sourceName, _log, logMessage) => {
    try {
        
        var obj = cssParser(sourceString, {
            source: sourceName
        });

        //console.log(obj.stylesheet.rules)
        
        let newCSSObject = {
            type: 'stylesheet',
            stylesheet: { source: undefined, rules: [], parsingErrors: [] }
        }
    
        
        obj.stylesheet.rules.forEach(rules => {
            if(rules.type == 'rule') {
                rules.declarations.forEach(declaration => {
                    newCSSObject.stylesheet.rules.push({
                        type: rules.type,
                        selectors: rules.selectors,
                        declarations: [ declaration ],
                        position: null
                    })
                });
            } else {
                newCSSObject.stylesheet.rules.push(rules)
            }
        });
    
        //console.log(newCSSObject)
        //console.log(obj.stylesheet.rules[1])
        //var result = css.stringify(obj);
        let newObfuscate = css.stringify(newCSSObject);
        //let newObfuscate = css.stringify(obj);
        
        var input = newObfuscate;
        return {success: true, source: (new CleanCSS({}).minify(input)).styles}
    } catch (error) {
        return {success: false, source: sourceString, error: error.message}
    }
}

export const obfuscateJS = (sourceString, _log, logMessage) => {
    try {
        if(sourceString.length > 10000) {
            let terminalOut = `\x1b[2m\x1b[43m\x1b[30m(Large Encrypting...)\x1b[0m ${logMessage}`;
            if(_log) _log(terminalOut.length > process.stdout.columns ?
                terminalOut.substring(0, process.stdout.columns - 13) + '...' + terminalOut.substring(terminalOut.length - 10, terminalOut.length)
                : terminalOut
            );
        }
        var obfuscationResult = JavaScriptObfuscator.obfuscate(sourceString,
            {
                compact: true,
                controlFlowFlattening: true,
                controlFlowFlatteningThreshold: 1,
                numbersToExpressions: true,
                simplify: true,
                shuffleStringArray: true,
                splitStrings: true,
                stringArrayThreshold: 1
            }
        );
    
        return {success: true, source: obfuscationResult.getObfuscatedCode()};
    } catch (error) {
        return {success: false, source: sourceString, error: error.message}
    }
    
}

export const obfuscateLua = (sourceString, key, _log, logMessage) => {
    try {
        let luaEncrypted = luaSimpleXorEncrypt(sourceString, key, {
            isGG: false,
            isLua52: true
        })
    
        return {success: true, source: luaEncrypted}
    } catch (error) {
        return {success: false, source: sourceString, error: error.message}
    }
}

export const sleep = (ms)=>new Promise(resolve => setTimeout(resolve, ms))

export default {
    directoryExists,
    readdir,
    mkdir,
    rm,
    getExtension,
    sleep
}