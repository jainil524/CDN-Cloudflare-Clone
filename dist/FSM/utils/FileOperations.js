"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.directoryExists = exports.writeFileAsync = exports.readFileAsync = exports.createDirectory = void 0;
const fs_1 = require("fs");
const directoryExists = (path) => {
    return (0, fs_1.existsSync)(path);
};
exports.directoryExists = directoryExists;
const createDirectory = (path) => {
    return new Promise((resolve, reject) => {
        if (!(0, fs_1.existsSync)(path)) {
            (0, fs_1.mkdir)(path, { recursive: true }, (err) => {
                if (err) {
                    reject(`Error creating directory: ${err.message}`);
                }
                else {
                    resolve();
                }
            });
        }
        else {
            resolve();
        }
    });
};
exports.createDirectory = createDirectory;
const readFileAsync = (filePath) => {
    return new Promise((resolve, reject) => {
        (0, fs_1.readFile)(filePath, 'utf8', (err, data) => {
            if (err) {
                reject(`Error reading file: ${err.message}`);
            }
            else {
                resolve(data);
            }
        });
    });
};
exports.readFileAsync = readFileAsync;
const writeFileAsync = (filePath, data) => {
    return new Promise((resolve, reject) => {
        (0, fs_1.writeFile)(filePath, data, 'utf8', (err) => {
            if (err) {
                reject(`Error writing file: ${err.message}`);
            }
            else {
                resolve();
            }
        });
    });
};
exports.writeFileAsync = writeFileAsync;
