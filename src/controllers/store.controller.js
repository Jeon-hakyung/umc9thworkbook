import { StatusCodes } from "http-status-codes";
import { addStore } from "../services/store.service.js";

export const handleAddStore = async (req, res, next) => {
    try {console.log("가게 추가를 요청했습니다!");
    console.log("body:", req.body); // 값이 잘 들어오나 확인하기 위한 테스트용

    const StoreId= await addStore(req.body); // 서비스 계층 호출 
    res.status(StatusCodes.CREATED).json({
        message: "가게 추가 성공",
        storeId: StoreId,
    }); }
    catch (err) {
        console.error(err);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({error: "가게 추가 중 오류가 발생했습니다."});
    }

}