import CsvStorage from "./data-storage/csvStorage";
import MysqlStorage from "./data-storage/mysqlStorage";
import helper from "./transform/helper";

const main = async () => {
    const mysqlStorage = new MysqlStorage({
        host: 'localhost',
        port: 3307,
        user: 'root',
        password: 'root',
        database: 'destination',
    });
    await mysqlStorage.connect();
    const schemas = await mysqlStorage.generateSchema();
    helper.save("src/schemas/mysql-schema.json", schemas);
    await mysqlStorage.close();
}

main(); 