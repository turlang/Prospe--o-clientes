import * as orderService from "./order.service.js";

export async function create(request, response) {
  const order = await orderService.createOrder(request.user.id, request.body);
  return response.status(201).json({ order });
}

export async function myOrders(request, response) {
  const orders = await orderService.listMyOrders(request.user.id);
  return response.status(200).json({ orders });
}

export async function show(request, response) {
  const order = await orderService.getOrderById(request.params.id, request.user);
  return response.status(200).json({ order });
}

export async function adminIndex(_request, response) {
  const orders = await orderService.listAllOrders();
  return response.status(200).json({ orders });
}

export async function updateStatus(request, response) {
  const order = await orderService.updateOrderStatus(request.params.id, request.body.status);
  return response.status(200).json({ order });
}
