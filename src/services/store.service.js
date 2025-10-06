import { addStores } from "../repositories/store.repository.js";

// 서비스에서는 레포지토리를 호출합니다

export const addStore = async (data) => {
    if (!data.regionId) {
        throw new Error("regionId는 필수 입력 항목입니다.");
    }
    const storeId= await addStores({
        name: data.name,
        address: data.address,
        score: data.score ?? 0,
        regionId: data.regionId,
    })

    return storeId;
}