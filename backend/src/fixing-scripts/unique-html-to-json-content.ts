import {getUselessPageJSONPathList, removeObjectFieldsByPathList} from './page-json-description-helpers';
import {promises as fsPromises} from 'fs';
import {join} from 'path';


const {readFile} = fsPromises;


export async function loadJsonFilesAndCheck() {
  const dirPath = join('src', 'fixing-scripts', '.tmp');

  const alfaRomeoJSONPath = join(dirPath, 'alfa-romeo-page.json');
  const jaguarJSONPath = join(dirPath, 'jaguar-page.json');

  const alfaRomeoJSON = JSON.parse((await readFile(alfaRomeoJSONPath)).toString());
  const jaguarJSON = JSON.parse((await readFile(jaguarJSONPath)).toString());

  const uselessPathList = getUselessPageJSONPathList(alfaRomeoJSON, jaguarJSON);

  const clearedAlfaRomeoJSON = removeObjectFieldsByPathList(alfaRomeoJSON, uselessPathList);

  console.log(clearedAlfaRomeoJSON);
}