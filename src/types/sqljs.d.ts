declare module 'sql.js' {
  export interface Database {
    run(sql: string, params?: any[]): void;
    exec(sql: string): { columns: string[]; values: any[][] }[];
    each(
      sql: string,
      callback: (row: { [key: string]: any }) => void,
      done?: () => void
    ): void;
    prepare(sql: string): Statement;
    export(): Uint8Array;
    close(): void;
  }

  export interface Statement {
    bind(values?: any[]): void;
    step(): boolean;
    get(): any[];
    getColumnNames(): string[];
    getAsObject(): { [key: string]: any };
    reset(): void;
    free(): void;
    run(params?: any[]): void;
  }

  export interface InitSqlJsConfig {
    locateFile?: (file: string) => string;
    wasmBinaryFile?: string;
  }

  export interface SqlJsStatic {
    Database: new (data?: Uint8Array | ArrayLike<number>) => Database;
    Statement: new () => Statement;
  }

  export default function initSqlJs(
    config?: InitSqlJsConfig
  ): Promise<SqlJsStatic>;
}

