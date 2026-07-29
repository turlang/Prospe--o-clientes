import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate.js";
import { authorize } from "../../middlewares/authorize.js";
import { validate } from "../../middlewares/validate.js";
import { asyncHandler } from "../../utils/async-handler.js";
import * as controller from "./order.controller.js";
import {
  createOrderSchema,
  orderIdParamsSchema,
  updateOrderStatusSchema
} from "./order.schema.js";

export const orderRouter = Router();
export const adminOrderRouter = Router();

orderRouter.use(authenticate);
orderRouter.post("/", validate(createOrderSchema), asyncHandler(controller.create));
orderRouter.get("/my", asyncHandler(controller.myOrders));
orderRouter.get(
  "/:id",
  validate(orderIdParamsSchema, "params"),
  asyncHandler(controller.show)
);

adminOrderRouter.use(authenticate, authorize("ADMIN"));
adminOrderRouter.get("/", asyncHandler(controller.adminIndex));
adminOrderRouter.patch(
  "/:id/status",
  validate(orderIdParamsSchema, "params"),
  validate(updateOrderStatusSchema),
  asyncHandler(controller.updateStatus)
);
