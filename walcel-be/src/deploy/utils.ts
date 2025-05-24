import { readdirSync, statSync } from 'node:fs';
import * as path from 'node:path';

export const getAllFiles = (folderPath: string) => {
  let response: string[] = [];

  const allFilesAndFolders = readdirSync(folderPath);
  allFilesAndFolders.forEach((file) => {
    const fullFilePath = path.join(folderPath, file);
    if (statSync(fullFilePath).isDirectory()) {
      response = response.concat(getAllFiles(fullFilePath));
    } else {
      response.push(fullFilePath);
    }
  });
  return response;
};
