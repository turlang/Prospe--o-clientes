import * as authService from "./auth.service.js";

/**
 * Controllers limitam-se a receber dados HTTP e delegar regras ao serviço.
 */
export async function register(request, response) {
  const result = await authService.registerCustomer(request.body);
  return response.status(201).json(result);
}

export async function login(request, response) {
  const result = await authService.login(request.body);
  return response.status(200).json(result);
}

export async function me(request, response) {
  return response.status(200).json({ user: request.user });
}
