/**
 * Fachada segura para armazenamento no navegador.
 *
 * O navegador integrado de IDEs, sessões privadas ou políticas corporativas
 * podem bloquear o localStorage. A aplicação não deve deixar de renderizar por
 * causa dessa limitação; por isso todas as operações são protegidas.
 */
export const browserStorage = {
  get(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      console.warn(`[storage] Não foi possível ler a chave "${key}".`, error);
      return null;
    }
  },

  set(key, value) {
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.warn(`[storage] Não foi possível gravar a chave "${key}".`, error);
      return false;
    }
  },

  remove(key) {
    try {
      window.localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`[storage] Não foi possível remover a chave "${key}".`, error);
      return false;
    }
  }
};
