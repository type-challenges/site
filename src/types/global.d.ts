declare module 'event-emitter' {
  declare namespace ee {
    interface Emitter<
      const T extends Record<string, (...args: any[]) => void>,
      const K extends keyof T = keyof T,
    > {
      emit: (type: K, ...args: Parameters<T[K]>) => void;
      off: (type: K, listener: T[K]) => void;
      on: (type: K, listener: T[K]) => void;
      once: (type: K, listener: T[K]) => void;
    }
  }
  declare function ee<T>(): ee.Emitter<T>;

  export = ee;
}
