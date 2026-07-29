import { AppError } from "../errors/AppError.js";

/**
 * Autoriza a rota de acordo com os papéis informados.
 */
export function authorize(...allowedRoles) {
  return function authorizationMiddleware(request, _response, next) {
    if (!request.user || !allowedRoles.includes(request.user.role)) {
      return next(new AppError("Acesso não autorizado.", 403, "FORBIDDEN"));
    }

    return next();
  };
}
