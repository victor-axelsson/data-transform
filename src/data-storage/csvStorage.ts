import { DataDestination, DataItem, DataSource, DataType, TableSchema, TransformerType } from "../transform/types/transformerTypes";
import fs from 'fs';
import Storage from "./storage";
import XLSX from 'xlsx'
import helper from "../transform/helper";

export default class CsvStorage extends Storage implements DataSource, DataDestination {
    inputPath: string;
    outputPath: string;
    name: "csv";

    constructor(inputPath: string, outputPath: string) {
        super();
        this.inputPath = inputPath;
        this.outputPath = outputPath;
        this.name = "csv";
    }

    async generateSchema() {
        const tableNames = await this.getTableNames();
        return await Promise.all(tableNames.map(async (tableName) => {
            return await this.generateTableSchema(tableName)
        }));
    }

    isCsv() {
        const normalizedpath = this.inputPath.toLowerCase();
        return normalizedpath.endsWith(".csv");
    }

    isOutputCsv() {
        const normalizedpath = this.outputPath.toLowerCase();
        return normalizedpath.endsWith(".csv");
    }

    async write(table: TableSchema, rows: DataItem[][]) {
        const headers = [Object.keys(table.columns)];
        const aoa = rows.map(r => r.map(c => c.value));
        var worksheet = XLSX.utils.aoa_to_sheet(headers.concat(aoa));

        if (this.isOutputCsv()) {
            const stream = XLSX.stream.to_csv(worksheet);
            stream.pipe(fs.createWriteStream(this.outputPath));
        } else {

            const getWorkBook = () => {
                if (fs.existsSync(this.outputPath)) {
                    return XLSX.readFile(this.outputPath);
                } else {
                    return XLSX.utils.book_new();
                }
            }

            const workbook = getWorkBook();
            XLSX.utils.book_append_sheet(workbook, worksheet, table.name);
            XLSX.writeFile(workbook, this.outputPath);
        }
    };

    async connect() {
        // This doesn't do anything for CSV files
    };
    async getTableNames() {
        const defaultTableName = "unknown";
        const normalizedpath = this.inputPath.toLowerCase();

        if (this.isCsv()) {
            const pt = normalizedpath.split("/").pop();
            if (pt) {
                return [pt.replace(".csv", "")];
            }

            return [defaultTableName];
        } else if (normalizedpath.endsWith(".xlsx")) {
            throw new Error("Not implemented");
        } else {
            throw new Error("Faulty file path");
        }
    };

    async generateTableSchema(tableName: string) {
        const workbook = XLSX.readFile(this.inputPath);
        const sheet = workbook.Sheets[this.isCsv() ? workbook.SheetNames[0] : tableName];
        const headers: string[] = (XLSX.utils.sheet_to_json(sheet, { header: 1 })[0]) as string[];

        return {
            name: tableName,
            columns: headers.reduce((acc: any, curr: string, index: number) => {
                acc[curr] = {
                    type: "string",
                    transformer: "void",
                    params: {
                        headerIndex: index
                    }
                }
                return acc;
            }, {})
        };
    };

    async readTransform(table: TableSchema, onRead: (rows: DataItem[][], table: string) => Promise<void>, onDone: () => Promise<void>) {
        var workbook = XLSX.readFile(this.inputPath);
        const sheet = workbook.Sheets[this.isCsv() ? workbook.SheetNames[0] : table.name];
        const aoa = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        const sortedColumns = Object.values(table.columns).sort((a, b) => {
            return (a.params?.headerIndex || 0) - (b.params?.headerIndex || 0);
        });

        const transformedRows = aoa.slice(1).map((row: any) => {

            // A map/forEach function cannot be used since items can be empty and hus skipped
            const rs: any = [];
            for (let i = 0; i < sortedColumns.length; i++) {
                const column = sortedColumns[i];
                const item = row[i];

                const dataItem: DataItem = {
                    type: column.type,
                    value: item,
                    transformer: column.transformer,
                    params: column.params
                }

                rs.push(helper.loadTransformer(column.transformer)(dataItem));
            }
            return rs;
        });
        await onRead(transformedRows, table.name);
        await onDone();
    }
}