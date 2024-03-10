import { DataItem, TransformerFunction } from "../types/transformerTypes";

const transform: TransformerFunction = (data: DataItem): DataItem => {
    const transformed: DataItem = {
        ...data,
        value: data.value
    }

    return transformed;
}

export default transform;
