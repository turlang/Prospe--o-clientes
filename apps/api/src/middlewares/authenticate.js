import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "../errors/AppError.js";
import { prisma } from "../lib/prisma.js";

/**
 * Verifica o JWT e carrega o usuário atual.
 */
export async function authenticate(request, _response, next) {
  try {
    const authorization = request.headers.authorization;

    if (!authorization?.startsWith("Bearer ")) {
      throw new AppError("Token de acesso ausente.", 401, "UNAUTHENTICATED");
    }

    const token = authorization.slice("Bearer ".length);
    const payload = jwt.verify(token, env.JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE
    });

    if (typeof payload !== "object" || typeof payload.sub !== "string") {
      throw new AppError("Token de acesso inválido.", 401, "INVALID_TOKEN");
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, name: true, email: true, role: true }
    });

    if (!user) {
      throw new AppError("Usuário da sessão não existe.", 401, "INVALID_SESSION");
    }

    request.user = user;
    next();
  } catch (error) {
    if (error instanceof AppError) return next(error);
    return next(new AppError("Token expirado ou inválido.", 401, "INVALID_TOKEN"));
  }
}
