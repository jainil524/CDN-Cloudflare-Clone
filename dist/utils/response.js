"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendSuccess = void 0;
/**
 *
 * @param {number} statusCode
 * @description : HTTP status code to be returned
 *
 * @param {Response} res
 * @description : Express response object
 * @param {string} message
 * @description : Message to be returned in the response
 * @param {any} data
 * @description : Data to be returned in the response, default is an empty object
 * @returns {void}
 */
const sendSuccess = (statusCode = 200, res, message, data = {}) => {
    return res.status(statusCode).json({
        success: true,
        statusCode,
        message,
        data,
    });
};
exports.sendSuccess = sendSuccess;
/**
 *
 * @param {number} statusCode
 * @param {Response} res
 * @param {string} message
 * @param {any} error
 * @returns {void}
 */
const sendError = (statusCode = 500, res, message, error = {}) => {
    return res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        error,
    });
};
exports.sendError = sendError;
