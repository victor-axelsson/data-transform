import mysql, { Connection, ConnectionOptions } from 'mysql2/promise';
import Storage from './storage';
import { DataDestination, DataItem, DataSource, SupportedDataStorage, TableSchema } from "../transform/types/transformerTypes";

const TYPE_MAPPING = {
    "string": "VARCHAR(255)",
    "text": "text",
    "integer": "INT(32)",
    "float": "FLOAT(32)",
    "date": "TIMESTAMP",
    "boolean": "BOOLEAN"
}

const DEFAULTS_MAPPING = {
    "string": "''",
    "text": "''",
    "integer": 0,
    "float": 0,
    "date": new Date().getTime(),
    "boolean": false
}

export default class MysqlStorage extends Storage implements DataSource, DataDestination {
    name: SupportedDataStorage;
    options: ConnectionOptions;
    connection: Connection | undefined;

    constructor(options: ConnectionOptions) {
        super();
        this.options = options;
        this.name = "mysql";
    }

    async createTable(table: TableSchema,) {
        const con = this.getConnection();

        let havePrimaryKey = false;
        let columns = Object.keys(table.columns).map((columnName: string) => {
            const column = table.columns[columnName];
            if (column.params?.isPrimaryKey) {
                havePrimaryKey = true;
            }
            return `\`${columnName}\` ${TYPE_MAPPING[column.type]}${column.params?.isPrimaryKey ? "PRIMARY KEY AUTOINCREMENT" : ""}`;
        });

        // Add primary if missing
        if (!havePrimaryKey) {
            columns = [
                `id INT(32) PRIMARY KEY AUTO_INCREMENT`
            ].concat(columns);
        }

        const contstraints = "";
        const createClause = `CREATE TABLE IF NOT EXISTS \`${table.name}\` (${columns.join(",")}${contstraints})`;

        const [results, fields] = await con.query(
            createClause.replaceAll("\n", "").trim(),
            [this.options.database]
        );
    }

    async write(table: TableSchema, rows: DataItem[][]) {

        const con = this.getConnection();
        this.createTable(table);

        const columnNames = Object.keys(table.columns);

        console.log("WRITING=>Starting transaction")
        await con.query(
            `START TRANSACTION;`
        );
        const queries = rows.map(async (row: DataItem[], index: number) => {
            const values = row.map((item: DataItem) => {
                if (!item.value) {

                    if (!(item.type in DEFAULTS_MAPPING)) {
                        throw new Error(`Missing default for type: ${item.type}`);
                    }
                    return DEFAULTS_MAPPING[item.type];
                }

                if (item.type === 'string' || item.type === 'text') {
                    const strVal = (item.value + "").replaceAll("'", "\\'");
                    return `'${strVal}'`;
                }

                return item.value;
            });
            await con.query(
                `INSERT INTO ${table.name} (${columnNames.join(",")}) VALUES(${values.join(",")})`
            );

            const progress: number = parseFloat((index / rows.length * 100).toFixed(2));
            if (Math.round(progress) % 5 == 0) {
                console.log(`WRITING=>${progress}%`);
            }
        });

        await Promise.all(queries);
        console.log("WRITING=>Commit")
        await con.query(
            `COMMIT;`
        );
        console.log("WRITING=>Commited")
    }
    async connect() {
        // Create the connection to database
        this.connection = await mysql.createConnection(this.options);
    }

    getConnection() {
        if (!this.connection) {
            throw new Error("Is not connected to DB")
        }

        return this.connection;
    }

    async getTableNames() {
        const con = this.getConnection();

        const [results, fields] = await con.query(
            'SELECT table_name FROM information_schema.tables WHERE table_schema = ?;',
            [this.options.database]
        );

        console.log(results)

        return [];
    }

    async generateTableSchema(tableName: string) {
        return {} as TableSchema;
    }
    async generateSchema() {
        return {} as TableSchema[];
    }
    async readTransform(table: TableSchema, onRead: (rows: DataItem[][], table: string) => void) {

    }
}