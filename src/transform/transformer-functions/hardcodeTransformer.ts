import { DataItem, TransformerFunction } from "../types/transformerTypes";


const transform: TransformerFunction = (data: DataItem): DataItem => {
    if (!data.params?.hardCodedValue) {
        throw new Error("Missing hardCodedValue for hardcodedValue transformer function");
    }

    const transformed: DataItem = {
        ...data,
        value: data.params.hardCodedValue
    }

    return transformed;
}

export default transform; 