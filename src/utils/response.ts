import { Response } from "express";

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
export const sendSuccess = (
  statusCode = 200,
  res: Response,
  message: string,
  data: any = {},
) => {
  return res.status(statusCode).json({
    success: true,
    statusCode,
    message,
    data,
  });
};

/**
 *
 * @param {number} statusCode
 * @param {Response} res
 * @param {string} message
 * @param {any} error
 * @returns {void}
 */
export const sendError = (
  statusCode = 500,
  res: Response,
  message: string,
  error: any = {},
) => {
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    error,
  });
};
