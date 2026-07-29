/**
 * Encapsula controllers assíncronos e encaminha rejeições ao middleware de erro.
 */
export function asyncHandler(handler) {
  return function wrappedHandler(request, response, next) {
    Promise.resolve(handler(request, response, next)).catch(next);
  };
}
