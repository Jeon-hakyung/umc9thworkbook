import { StatusCodes } from "http-status-codes";
import { addStore,listStoreReviews } from "../services/store.service.js";

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


export const handleListStoreReviews = async (req,res,next)=> {
    /*
    #swagger.summary = '상점 리뷰 목록 조회 API';
    #swagger.responses[200] = {
      description: "상점 리뷰 목록 조회 성공 응답",
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              resultType: { type: "string", example: "SUCCESS" },
              error: { type: "object", nullable: true, example: null },
              success: {
                type: "object",
                properties: {
                  data: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: { type: "number" },
                        store: { type: "object", properties: { id: { type: "number" }, name: { type: "string" } } },
                        user: { type: "object", properties: { id: { type: "number" }, email: { type: "string" }, name: { type: "string" } } },
                        content: { type: "string" }
                      }
                    }
                  },
                  pagination: { type: "object", properties: { cursor: { type: "number", nullable: true } }}
                }
              }
            }
          }
        }
      }
    };
  */
    const reviews = await listStoreReviews(parseInt
        (req.params.storeId),typeof req.query.cursor === "string" ? parseInt(req.query.cursor):0
    );
    res.status(StatusCodes.OK).json(reviews);

}