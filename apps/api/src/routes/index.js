import { Router } from "express";
import { authRouter } from "../modules/auth/auth.routes.js";
import { adminOrderRouter, orderRouter } from "../modules/orders/order.routes.js";
import { productRouter } from "../modules/products/product.routes.js";

export const apiRouter = Router();

apiRouter.get("/health", (_request, response) => {
  response.status(200).json({
    status: "ok",
    service: "delivery-burger-api",
    timestamp: new Date().toISOString()
  });
});

apiRouter.use("/auth", authRouter);
apiRouter.use("/products", productRouter);
apiRouter.use("/orders", orderRouter);
apiRouter.use("/admin/orders", adminOrderRouter);
