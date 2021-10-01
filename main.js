#!/usr/bin/env node

import program from 'commander'
import path from 'path'
import fse from 'fs-extra'
//import readline from 'readline';
import logUpdate from 'log-update';
import { fileURLToPath } from 'url';

import AutoGitUpdate, { readAppVersion } from './updateor.js';


const scriptPath = path.dirname(fileURLToPath(import.meta.url))
const log = logUpdate.create(process.stdout, {
    showCursor: true
});

// const log = (s)=>console.log(s);

import {
	getExtension,
	directoryExists,
	readdir,
	mkdir,
	rm,
	obfuscateHTML,
	obfuscateCSS,
	obfuscateJS,
	obfuscateLua
} from './lib/index.js'

// Use current working dir vs __dirname where this code lives
const cwd = process.cwd()

let exeLine = `${scriptPath.substring(0, 2)} && cd ${scriptPath} && npm i --force && npm link --force`

//console.log(exeLine)

const updater = new AutoGitUpdate({
    repository: 'https://github.com/l3lackMegas/dyz-obfuscator',
	branch: "main",
    tempLocation: "C:\\tmp",
    executeOnComplete: exeLine,
    exitOnComplete: false
});

updater.setLogConfig({
	logGeneral: false
})

let updateInfo = await updater.compareVersions()
console.log(`- Running from ${cwd}`)
console.log(`- Current version: ${updateInfo.currentVersion}, Remote version: ${updateInfo.remoteVersion}`)
if(!updateInfo.upToDate) {
	console.log(`
[!] New version detected! (${updateInfo.remoteVersion})
	==========================================================
	|                  To update the script.                 |
	|                                                        |
	|                 npm i -g dyz-obfuscator                |
	==========================================================
	`)
}

program
	.version(readAppVersion())
	.name('dobs')
	.description('An image resizer to make thumbnails')
	.option('-s,--source [folder]', 'Source images directory', './')
	.option(
		'-o,--output [folder]',
		'Directory to be created for obfuscated files',
		'./dyz-obfuscated'
	)
	.parse(process.argv)

const WhiteListExtension = ['html', 'css', 'js', 'lua'];
const IgnoreList = [
	'es_extended',
	'__resource.lua',
	'fxmanifest.lua',
	'config',
	'/src/',
	'jquery',
	'tailwind.css'
];

console.log('Started Dyz-Obfuscator!')
const main = async () => {
	try {

		// Use user input or default options
		const {
			source,
			output
		} = program.opts()


		const srcPath = source.replace(/\\/g, '/')
		const destPath = output.replace(/\\/g, '/')

		console.log(`Scanning files from ${srcPath}`)
		//console.log(source, output)

		// Remove destination directory is it exists
		if (directoryExists(destPath)) {
			await rm(destPath)
		}

		// Create destination directory
		await mkdir(destPath)


		// Read source directory
		const filesAll = await readdir(srcPath)

		// Create task list
		let taskList = []
		//filesAll.forEach(pathname => {
		for (let index = 0; index < filesAll.length; index++) {
			let pathname = filesAll[index];
			let fullPathname = path.posix.join(cwd, pathname).replace(/\\/g, '/');
			
			//console.log(stringSource)
			let sPath = path.posix.join(cwd, srcPath).replace(/\\/g, '/')
			let copypath = fullPathname.replace(sPath, ""),
				displayCopypath = path.posix.join(destPath, copypath).replace(/\\/g, '/'),
				desPath = path.posix.join(cwd, destPath, copypath).replace(/\\/g, '/');

			let terminalOut = `[${index+1}/${filesAll.length}] Copying file to ${displayCopypath}`
			log(terminalOut.length > process.stdout.columns ?
				terminalOut.substring(0, process.stdout.columns - 13) + '...' + terminalOut.substring(terminalOut.length - 10, terminalOut.length)
				: terminalOut
			);
			//await sleep(100)
			
			if(
				WhiteListExtension.includes(getExtension(pathname)) &&
				(()=>{
					let isNonIgnore = 0;
					IgnoreList.forEach(ignoreWord => {
						let isFound = pathname.toLocaleLowerCase().includes(ignoreWord.toLocaleLowerCase())
						isNonIgnore = isFound ? isNonIgnore + 1 : isNonIgnore
					});
					return isNonIgnore === 0;
				})()
			) taskList.push(pathname);
			//console.log(desPath)

			fse.copySync(pathname, desPath)
			//console.log('Copied to ' + desPath)
			// readline.clearLine(process.stdout);
			// readline.cursorTo(process.stdout, 0);
		};
		log(`[!] Finish copied ${filesAll.length} files!`)
		//console.log(taskList, `Found ${taskList.length} items.`, srcPath)

		console.log("\nStarting obfuscate task...\n")
		let failList = []
		for (let index = 0; index < taskList.length; index++) {
			let pathname = taskList[index];
			let fullPathname = path.posix.join(cwd, pathname).replace(/\\/g, '/');
			
			//console.log(stringSource)
			let sPath = path.posix.join(cwd, srcPath).replace(/\\/g, '/')
			let copypath = fullPathname.replace(sPath, ""),
				displayCopypath = path.posix.join(destPath, copypath).replace(/\\/g, '/'),
				desPath = path.posix.join(cwd, destPath, copypath).replace(/\\/g, '/');
			//console.log(desPath)
			
			//console.log(pathname)
			let stringSource = fse.readFileSync(pathname, 'utf8');

			let obfuscatedOutput = "";

			//process.stdout.write(`[${index+1}/${taskList.length}] Obfuscating to ${displayCopypath}`.substring(0, process.stdout.columns - 3) + '...');
			let terminalOut = `[${index+1}/${taskList.length}] Obfuscating file to ${displayCopypath}`
			log(terminalOut.length > process.stdout.columns ?
				terminalOut.substring(0, process.stdout.columns - 13) + '...' + terminalOut.substring(terminalOut.length - 10, terminalOut.length)
				: terminalOut
			);
			// Wipe line for next status

			switch (getExtension(pathname).toLowerCase()) {
				case "html":
					obfuscatedOutput = obfuscateHTML(stringSource)
					break;

				case "css":
					obfuscatedOutput = obfuscateCSS(stringSource, pathname)
					break;

				case "js":
					obfuscatedOutput = obfuscateJS(stringSource)
					break;

				case "lua":
					obfuscatedOutput = obfuscateLua(stringSource, 'RkWL5ExSjRw3qWT2')
					break;

				default:
					break;
			}
			//fse.removeSync(desPath)
			if(!obfuscatedOutput.success) failList.push([pathname, obfuscatedOutput.error])
			fse.writeFileSync(desPath, obfuscatedOutput.source, { flag: 'w' })
			// readline.clearLine(process.stdout);
			// readline.cursorTo(process.stdout, 0);
			// fse.copySync(pathname, desPath)
			// console.log('Copied to ' + desPath)
		};
		log(`[!] Obfuscated files ${taskList.length - failList.length} Successfully, ${failList.length} Failed!\n`)
		console.log(`[!] Failed list have ${failList.length} items here:\n${"-".repeat(process.stdout.columns)}`)
		failList.forEach((item, index) => {
console.log(`\x1b[1m\x1b[31m${index + 1}) ${item[1]}\x1b[0m
${"-".repeat(process.stdout.columns)}`)
		});

		if(failList.length > 0) console.log("Note: Please check your code syntax form each failed files. For now, it's will be replace with the original code.\n")

		console.log(`Finish task!, All Files has been created at ${path.join(cwd, destPath)}\n`)
		process.exit();
	} catch (error) {
		console.log('Error creating obfuscate file.', error)
	}
}

main();