import helper from "../transform/helper";
import { DataItem } from "../transform/types/transformerTypes";

export default class Storage {

    getTransformedRows(rows: DataItem[][]) {
        return rows.map((row: DataItem[]) => {
            return row.map((item: DataItem) => {
                const transfomer = helper.loadTransformer(item.transformer);
                return transfomer(item)
            });
        });
    }
}