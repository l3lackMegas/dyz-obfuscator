import path from 'path'
import fse from 'fs-extra'
//import templatesString from './data/templates.lua';
import { fileURLToPath } from 'url';
const scriptPath = path.dirname(fileURLToPath(import.meta.url))
const templatesString = fse.readFileSync(path.join(scriptPath, '/data/templates.lua'), 'utf8');

let templates = {
  credit: '',
  keyInputCode: '',
  keyInputCodeGG: '',
  main: '',
  loadstring: '',
  load: '',
  decoder: '',
  decoderEnd: '',
  keyWrongAlertCode: '',
  keyWrongAlertCodeGG: '',
  keyWrongAlertEnd: ''
};
templatesString.replace(/\r\n/g, '\n')
  .split('--------------------')
  .forEach(value => {
    if (value.startsWith(' Template: ')) {
      let newlinePos = value.indexOf('\n');
      let name = value.substring(' Template: '.length, newlinePos);
      templates[name] = value.substring(newlinePos + 1);
    }
  });

export default templates;
