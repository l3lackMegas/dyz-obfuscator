#!/usr/bin/env node

console.log('Started Dyz-Obfuscator!')

import program from 'commander'
import path from 'path'
import fse from 'fs-extra'
import readline from 'readline';


import {
	getExtension,
	directoryExists,
	readdir,
	mkdir,
	rm,
	obfuscateHTML,
	obfuscateCSS,
	obfuscateJS,
	sleep
} from './lib/index.js'

program
	.version('1.0.0')
	.name('dobs')
	.description('An image resizer to make thumbnails')
	.option('-s,--source [folder]', 'Source images directory', './')
	.option(
		'-o,--output [folder]',
		'Directory to be created for obfuscated files',
		'./dyz-obfuscated'
	)
	.parse(process.argv)

const WhiteListExtension = ['html', 'css', 'js'];

const main = async () => {
	try {
		// Use current working dir vs __dirname where this code lives
		const cwd = process.cwd()

		// Use user input or default options
		const {
			source,
			output
		} = program.opts()


		const srcPath = source.replace(/\\/g, '/')
		const destPath = output.replace(/\\/g, '/')
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
				desPath = path.posix.join(cwd, destPath, copypath).replace(/\\/g, '/');

			process.stdout.write(`[${index+1}/${filesAll.length}] Copying file to ${desPath}`);
			await sleep(100)
			
			if(WhiteListExtension.includes(getExtension(pathname))) taskList.push(pathname);
			//console.log(desPath)

			fse.copySync(pathname, desPath)
			//console.log('Copied to ' + desPath)
			readline.clearLine(process.stdout);
			readline.cursorTo(process.stdout, 0);
		};
		//console.log(taskList, `Found ${taskList.length} items.`, srcPath)
		console.log("[!] Finish copied files!")

		console.log("\nStarting obfuscate task...")

		for (let index = 0; index < taskList.length; index++) {
			let pathname = taskList[index];
			let fullPathname = path.posix.join(cwd, pathname).replace(/\\/g, '/');
			
			//console.log(stringSource)
			let sPath = path.posix.join(cwd, srcPath).replace(/\\/g, '/')
			let copypath = fullPathname.replace(sPath, ""),
				desPath = path.posix.join(cwd, destPath, copypath).replace(/\\/g, '/');
			//console.log(desPath)
			
			//console.log(pathname)
			let stringSource = fse.readFileSync(pathname, 'utf8');

			let obfuscatedOutput = "";
			process.stdout.write(`[${index+1}/${taskList.length}] Obfuscating to ${desPath}`);
			await sleep(100)
			// Wipe line for next status

			switch (getExtension(pathname).toLowerCase()) {
				case "html":
					obfuscatedOutput = obfuscateHTML(stringSource)
					break;

				case "css":
					obfuscatedOutput = obfuscateCSS(stringSource)
					break;

				case "js":
					obfuscatedOutput = obfuscateJS(stringSource)
					break;

				default:
					break;
			}
			//fse.removeSync(desPath)
			fse.writeFileSync(desPath, obfuscatedOutput, { flag: 'w' })
			readline.clearLine(process.stdout);
			readline.cursorTo(process.stdout, 0);
			// fse.copySync(pathname, desPath)
			// console.log('Copied to ' + desPath)
		};

		console.log('[!] Obfuscated files successfully!\n')

		console.log(`All Files has been created at ${path.join(cwd, destPath)}`)
	} catch (error) {
		console.log('Error creating obfuscate file.', error)
	}
}

main()