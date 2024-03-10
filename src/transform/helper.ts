import hardcodeTransformer from "./transformer-functions/hardcodeTransformer";
import { DataDestination, DataItem, DataSource, TableSchema, TransformerFunction, TransformerType } from "./types/transformerTypes";
import voidTransformer from "./transformer-functions/voidTransformer";
import fs from 'fs';

class Helper {
    loadTransformer(name: TransformerType): TransformerFunction {
        switch (name) {
            case "void":
                return voidTransformer;
            case "hardcoded":
                return hardcodeTransformer;
            case "encrypt":
                throw new Error("Not implemented")
                break;
            case "decrypt":
                throw new Error("Not implemented")
                break;
        }
    }

    async loadTableSchema(path: string) {
        const jsonData = fs.readFileSync(path, { encoding: 'utf8', flag: 'r' });
        return JSON.parse(jsonData);
    };

    save(filepath: string, data: any, pretty = true) {
        fs.writeFileSync(filepath, JSON.stringify(data, null, pretty ? 2 : 0));
    }

    pipeData(source: DataSource, destination: DataDestination, schemas: TableSchema[]): Promise<string> {
        return new Promise((resolve) => {
            schemas.forEach((tableSchema: TableSchema) => {
                source.readTransform(tableSchema, async (dataRows: DataItem[][], tableName: string) => {
                    await destination.write(tableSchema, dataRows);
                }, async () => {
                    console.log("done")
                    resolve("Done");
                })
            });
        })
    }
}

const helper = new Helper();
export default helper; 