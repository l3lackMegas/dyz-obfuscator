import rimraf from "rimraf"

import fs from 'fs'
import { promisify } from 'util'
import {globby} from 'globby';

import { minify } from 'html-minifier';
import css from 'css';
import CleanCSS from 'clean-css';
import JavaScriptObfuscator from 'javascript-obfuscator';
import luaSimpleXorEncrypt from './luaSimpleXorEncrypt.js'

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

export const obfuscateHTML = (sourceString) => {
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

        let encode = "";
        for (var i=0; i<result.length; i++) {
            encode += String.fromCharCode(result.charCodeAt(i) + 1);
        }
        let obfuscate = `<script>var s=\`${encode}\`;var m="";for(var i=0;i<s.length;i++)m+=String.fromCharCode(s.charCodeAt(i)-1);document.write(m);setTimeout(()=>{var sc=document.getElementsByTagName('script');while(sc.length > 0)sc[0].remove();},1000);</script><noscript>You must enable JavaScript to see this text.</noscript>`
        return {success: true, source: obfuscate}
    } catch (error) {
        return {success: false, source: sourceString, error: error.message}
    }
    
}

export const obfuscateCSS = (sourceString, sourceName) => {
    try {
        var obj = css.parse(sourceString, {
            source: sourceName
        });

        //console.log(obj)
    
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

export const obfuscateJS = (sourceString) => {
    try {
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

export const obfuscateLua = (sourceString, key) => {
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