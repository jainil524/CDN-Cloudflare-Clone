import { mkdir, existsSync, readFile, writeFile } from "fs";

const createDirectory = (path: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (!existsSync(path)) {
      mkdir(path, { recursive: true }, (err) => {
        if (err) {
          reject(`Error creating directory: ${err.message}`);
        } else {
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
}

const readFileAsync = (filePath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(`Error reading file: ${err.message}`);
      } else {
        resolve(data);
      }
    });
  });
}

const writeFileAsync = (filePath: string, data: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    writeFile(filePath, data, 'utf8', (err) => {
      if (err) {
        reject(`Error writing file: ${err.message}`);
      } else {
        resolve();
      }
    });
  });
}

export { createDirectory, readFileAsync, writeFileAsync };

