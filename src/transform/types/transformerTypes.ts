export interface DataItem {
    type: DataType;
    value: any;
    transformer: TransformerType;
    params: any | null;
}

export type TransformerType = "void" | "hardcoded" | "encrypt" | "decrypt"
export type DataType = "string" | "text" | "integer" | "float" | "date" | "boolean";
export type SupportedDataStorage = "mysql" | "csv";
export type TransformerFunction = (item: DataItem) => DataItem | Promise<DataItem>;

export interface TableSchema {
    name: string;
    columns: {
        [key: string]: {
            type: DataType;
            transformer: TransformerType;
            params?: {
                headerIndex?: number;
                isPrimaryKey?: boolean;
            };
        }
    }
}

export interface DataSource {
    name: SupportedDataStorage,
    connect: () => Promise<void>;
    getTableNames: () => Promise<string[]>;
    generateTableSchema: (tableName: string) => Promise<TableSchema>;
    generateSchema: () => Promise<TableSchema[]>;
    readTransform: (table: TableSchema, onRead: (rows: DataItem[][], table: string) => Promise<void>, onDone: () => Promise<void>) => Promise<void>;
}

export interface DataDestination {
    name: SupportedDataStorage,
    connect: () => Promise<void>;
    write: (table: TableSchema, rows: DataItem[][]) => Promise<void>;
}

export interface SchemaDefinition {
    dataSource: DataSource;
    schemaPath: string;
}

