export class PLimitUtil {
  // cache do módulo (singleton)
  private static pLimit: typeof import('p-limit').default | null = null;

  /**
   * Retorna a função pLimit já carregada
   * - lazy load
   * - compatível com CommonJS
   * - evita múltiplos imports
   */
  static async get() {
    if (!this.pLimit) {
      const mod = await import('p-limit');

      // p-limit é ESM default export
      this.pLimit = mod.default;
    }

    return this.pLimit;
  }

  /**
   * Helper opcional para já criar o limiter
   */
  static async create(concurrency: number) {
    const pLimit = await this.get();
    return pLimit(concurrency);
  }
}
