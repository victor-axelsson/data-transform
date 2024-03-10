import CsvStorage from "./data-storage/csvStorage";
import MysqlStorage from "./data-storage/mysqlStorage";
import helper from "./transform/helper";

const main = async () => {
    const csvStorage = new CsvStorage("dataset/clinvar_conflicting.csv", "transformed.xlsx");
    const mysqlStorage = new MysqlStorage({
        host: 'localhost',
        port: 3307,
        user: 'root',
        password: 'root',
        database: 'destination',
    });
    await mysqlStorage.connect()
    const tableSchemas = await helper.loadTableSchema("src/schemas/genetic-schema.json");
    await helper.pipeData(csvStorage, mysqlStorage, tableSchemas);
}

main(); 