import { AppError } from "../errors/AppError.js";

/**
 * Converte rotas inexistentes em uma resposta padronizada.
 */
export function notFound(request, _response, next) {
  next(new AppError(`Rota ${request.method} ${request.originalUrl} não encontrada.`, 404, "ROUTE_NOT_FOUND"));
}
