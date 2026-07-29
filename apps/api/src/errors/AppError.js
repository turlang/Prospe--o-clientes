/**
 * Erro de domínio transportável para a camada HTTP.
 */
export class AppError extends Error {
  constructor(message, statusCode = 400, code = "APPLICATION_ERROR", details = undefined) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}
