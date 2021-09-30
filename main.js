#!/usr/bin/env node

import program from 'commander'
import path from 'path'
import fse from 'fs-extra'
//import readline from 'readline';
import logUpdate from 'log-update';

import {spawn, exec} from 'child_process';

import AutoGitUpdate, { readAppVersion } from './updateor.js';

const log = logUpdate.create(process.stdout, {
    showCursor: true
});

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

const WhiteListExtension = ['html', 'css', 'js'];
// Use current working dir vs __dirname where this code lives
const cwd = process.cwd()

const main = async () => {
	console.log('Started Dyz-Obfuscator!')
	try {
		

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
				displayCopypath = path.posix.join(destPath, copypath).replace(/\\/g, '/'),
				desPath = path.posix.join(cwd, destPath, copypath).replace(/\\/g, '/');

			let terminalOut = `[${index+1}/${filesAll.length}] Copying file to ${displayCopypath}`
			log(terminalOut.length > process.stdout.columns ?
				terminalOut.substring(0, process.stdout.columns - 13) + '...' + terminalOut.substring(terminalOut.length - 10, terminalOut.length)
				: terminalOut
			);
			//await sleep(100)
			
			if(WhiteListExtension.includes(getExtension(pathname))) taskList.push(pathname);
			//console.log(desPath)

			fse.copySync(pathname, desPath)
			//console.log('Copied to ' + desPath)
			// readline.clearLine(process.stdout);
			// readline.cursorTo(process.stdout, 0);
		};
		log(`[!] Finish copied ${filesAll.length} files!`)
		//console.log(taskList, `Found ${taskList.length} items.`, srcPath)

		console.log("\nStarting obfuscate task...\n")

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
			// readline.clearLine(process.stdout);
			// readline.cursorTo(process.stdout, 0);
			// fse.copySync(pathname, desPath)
			// console.log('Copied to ' + desPath)
		};
		log(`[!] Obfuscated files ${taskList.length} successfully!\n`)

		console.log(`All Files has been created at ${path.join(cwd, destPath)}`)
		process.exit();
	} catch (error) {
		console.log('Error creating obfuscate file.', error)
	}
}

const updater = new AutoGitUpdate({
    repository: 'https://github.com/l3lackMegas/dyz-obfuscator',
	branch: "main",
    tempLocation: "C:\\tmp",
    executeOnComplete: 'npm i && npm link',
    exitOnComplete: true
});

updater.setLogConfig({
	logGeneral: false
})

let updateInfo = await updater.compareVersions()
//console.log(updateInfo)
console.log(`Running from ${cwd}`)
if(!updateInfo.upToDate) {
	console.log(`[!] New update detected! Starting update...(${updateInfo.remoteVersion})`)
	await updater.forceUpdate();
	console.log("[!] The script has been updated!")
	console.log("[!] Start script on new shell...")
	await (new Promise(function(resolve, reject) {
        spawn("dobs", process.argv, {
			shell: true,
			detached: true
		});
        setTimeout(resolve, 1000);
    }));
	process.exit();
} else {
	main()
}