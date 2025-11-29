/**
 * File System Adapter
 * Abstracts all file system operations for potential future database integration
 */

const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

/**
 * Read file content
 * @param {string} filePath - Absolute path to file
 * @param {string} encoding - File encoding (default: 'utf-8')
 * @returns {Promise<string>} File content
 */
async function readFile(filePath, encoding = 'utf-8') {
    return fs.readFile(filePath, encoding);
}

/**
 * Write file content
 * @param {string} filePath - Absolute path to file
 * @param {string} content - Content to write
 * @param {string} encoding - File encoding (default: 'utf-8')
 * @returns {Promise<void>}
 */
async function writeFile(filePath, content, encoding = 'utf-8') {
    return fs.writeFile(filePath, content, encoding);
}

/**
 * Check if file or directory exists
 * @param {string} filePath - Absolute path to check
 * @returns {boolean} True if exists
 */
function exists(filePath) {
    return fsSync.existsSync(filePath);
}

/**
 * Get file stats
 * @param {string} filePath - Absolute path to file
 * @returns {Promise<fs.Stats>} File stats
 */
async function stat(filePath) {
    return fs.stat(filePath);
}

/**
 * Get file stats synchronously
 * @param {string} filePath - Absolute path to file
 * @returns {fs.Stats} File stats
 */
function statSync(filePath) {
    return fsSync.statSync(filePath);
}

/**
 * Read directory contents
 * @param {string} dirPath - Absolute path to directory
 * @param {object} options - Options for readdir
 * @returns {Promise<Array>} Directory contents
 */
async function readdir(dirPath, options = {}) {
    return fs.readdir(dirPath, options);
}

/**
 * Read directory contents synchronously
 * @param {string} dirPath - Absolute path to directory
 * @param {object} options - Options for readdir
 * @returns {Array} Directory contents
 */
function readdirSync(dirPath, options = {}) {
    return fsSync.readdirSync(dirPath, options);
}

/**
 * Create directory
 * @param {string} dirPath - Absolute path to directory
 * @param {object} options - Options (recursive, etc.)
 * @returns {Promise<void>}
 */
async function mkdir(dirPath, options = { recursive: true }) {
    return fs.mkdir(dirPath, options);
}

/**
 * Delete file
 * @param {string} filePath - Absolute path to file
 * @returns {Promise<void>}
 */
async function unlink(filePath) {
    return fs.unlink(filePath);
}

/**
 * Delete file synchronously
 * @param {string} filePath - Absolute path to file
 * @returns {void}
 */
function unlinkSync(filePath) {
    return fsSync.unlinkSync(filePath);
}

/**
 * Delete directory recursively
 * @param {string} dirPath - Absolute path to directory
 * @param {object} options - Options
 * @returns {Promise<void>}
 */
async function rmdir(dirPath, options = { recursive: true, force: true }) {
    return fs.rm(dirPath, options);
}

/**
 * Rename/move file or directory
 * @param {string} oldPath - Old path
 * @param {string} newPath - New path
 * @returns {Promise<void>}
 */
async function rename(oldPath, newPath) {
    return fs.rename(oldPath, newPath);
}

/**
 * Rename/move file or directory synchronously
 * @param {string} oldPath - Old path
 * @param {string} newPath - New path
 * @returns {void}
 */
function renameSync(oldPath, newPath) {
    return fsSync.renameSync(oldPath, newPath);
}

/**
 * Copy file
 * @param {string} src - Source path
 * @param {string} dest - Destination path
 * @returns {Promise<void>}
 */
async function copyFile(src, dest) {
    return fs.copyFile(src, dest);
}

/**
 * Copy file or directory synchronously
 * @param {string} src - Source path
 * @param {string} dest - Destination path
 * @param {object} options - Options
 * @returns {void}
 */
function copySync(src, dest, options = { recursive: true }) {
    return fsSync.cpSync(src, dest, options);
}

module.exports = {
    readFile,
    writeFile,
    exists,
    stat,
    statSync,
    readdir,
    readdirSync,
    mkdir,
    unlink,
    unlinkSync,
    rmdir,
    rename,
    renameSync,
    copyFile,
    copySync
};
