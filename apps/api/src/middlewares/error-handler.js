import { Prisma } from "@prisma/client";
import { AppError } from "../errors/AppError.js";

/**
 * Último middleware da cadeia Express.
 * Ele impede que controllers criem formatos de erro diferentes.
 */
export function errorHandler(error, _request, response, _next) {
  if (error instanceof AppError) {
    return response.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        details: error.details
      }
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return response.status(409).json({
        error: {
          code: "UNIQUE_CONSTRAINT",
          message: "Já existe um registro com um dos dados informados."
        }
      });
    }

    if (error.code === "P2025") {
      return response.status(404).json({
        error: {
          code: "RECORD_NOT_FOUND",
          message: "Registro não encontrado."
        }
      });
    }
  }

  console.error("Erro interno não tratado:", error);

  return response.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "O servidor não conseguiu concluir a operação."
    }
  });
}
