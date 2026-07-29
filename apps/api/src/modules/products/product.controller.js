import * as productService from "./product.service.js";

export async function index(request, response) {
  const products = await productService.listProducts(request.validatedQuery ?? request.query);
  return response.status(200).json({ products });
}

export async function show(request, response) {
  const product = await productService.getProductById(request.params.id);
  return response.status(200).json({ product });
}

export async function create(request, response) {
  const product = await productService.createProduct(request.body);
  return response.status(201).json({ product });
}

export async function update(request, response) {
  const product = await productService.updateProduct(request.params.id, request.body);
  return response.status(200).json({ product });
}

export async function destroy(request, response) {
  await productService.deleteProduct(request.params.id);
  return response.status(204).send();
}
