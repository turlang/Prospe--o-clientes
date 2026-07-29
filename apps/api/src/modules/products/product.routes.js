import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { authorize } from "../../middlewares/authorize.js";
import { validate } from "../../middlewares/validate.js";
import { asyncHandler } from "../../utils/async-handler.js";
import * as controller from "./product.controller.js";
import {
  createProductSchema,
  listProductsQuerySchema,
  productIdParamsSchema,
  updateProductSchema
} from "./product.schema.js";

export const productRouter = Router();

productRouter.get("/", validate(listProductsQuerySchema, "query"), asyncHandler(controller.index));
productRouter.get("/:id", validate(productIdParamsSchema, "params"), asyncHandler(controller.show));
productRouter.post(
  "/",
  authenticate,
  authorize("ADMIN"),
  validate(createProductSchema),
  asyncHandler(controller.create)
);
productRouter.put(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validate(productIdParamsSchema, "params"),
  validate(updateProductSchema),
  asyncHandler(controller.update)
);
productRouter.delete(
  "/:id",
  authenticate,
  authorize("ADMIN"),
  validate(productIdParamsSchema, "params"),
  asyncHandler(controller.destroy)
);
