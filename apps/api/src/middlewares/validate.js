import { AppError } from "../errors/AppError.js";

/**
 * Valida uma parte da requisição com Zod e substitui o valor bruto pelo valor tratado.
 */
export function validate(schema, source = "body") {
  return function validationMiddleware(request, _response, next) {
    const result = schema.safeParse(request[source]);

    if (!result.success) {
      return next(
        new AppError(
          "Dados de entrada inválidos.",
          422,
          "VALIDATION_ERROR",
          result.error.issues
        )
      );
    }

    if (source === "query") {
      request.validatedQuery = result.data;
    } else {
      request[source] = result.data;
    }

    return next();
  };
}
