// ✅ 正しい import（v5 以降の最新仕様）
import { createRouteHandler } from "uploadthing/next";
import { ourFileRouter } from "./core";

// ✅ App Router 用の API Handler を export
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
});
