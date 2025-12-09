const {
  Order,
  OrderItem,
  Product,
  User,
  Table,
  sequelize,
} = require("../models");
const { asyncHandler } = require("../middlewares/errorHandler");
const {
  successResponse,
  errorResponse,
  paginatedResponse,
} = require("../utils/responseHandler");
const { Op } = require("sequelize");

// Utility: hitung total order
const calculateTotals = (items, taxRate = 0.1, discount = 0) => {
  const subtotal = items.reduce((sum, item) => sum + Number(item.subtotal), 0);
  const tax = subtotal * taxRate;
  const total = subtotal + tax - discount;
  return { subtotal, tax, total };
};

// GET ALL ORDERS
exports.getAllOrders = asyncHandler(async (req, res) => {
  const {
    page = 1,
    size = 10,
    status,
    order_type,
    payment_status,
    start_date,
    end_date,
  } = req.query;

  const where = {};
  if (status) where.status = status;
  if (order_type) where.order_type = order_type;
  if (payment_status) where.payment_status = payment_status;

  if (start_date || end_date) {
    where.createdAt = {};
    if (start_date) where.createdAt[Op.gte] = new Date(start_date);
    if (end_date) where.createdAt[Op.lte] = new Date(end_date);
  }

  const limit = parseInt(size);
  const offset = (parseInt(page) - 1) * limit;

  const { count, rows } = await Order.findAndCountAll({
    where,
    limit,
    offset,
    include: [
      { model: User, as: "user", attributes: ["id", "username", "full_name"] },
      { model: Table, as: "table" },
      {
        model: OrderItem,
        as: "items",
        include: [{ model: Product, as: "product" }],
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  return paginatedResponse(res, 200, "Orders retrieved", rows, {
    page: parseInt(page),
    limit,
    totalItems: count,
  });
});

// GET ORDER BY ID
exports.getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findByPk(req.params.id, {
    include: [
      { model: User, as: "user" },
      { model: Table, as: "table" },
      {
        model: OrderItem,
        as: "items",
        include: [{ model: Product, as: "product" }],
      },
    ],
  });

  if (!order) return errorResponse(res, 404, "Order not found");

  return successResponse(res, 200, "Order retrieved", order);
});

// CREATE ORDER
exports.createOrder = asyncHandler(async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      table_id,
      customer_name,
      customer_phone,
      order_type,
      items,
      notes,
    } = req.body;

    if (!items || items.length === 0)
      return errorResponse(res, 400, "Order must have at least one item");

    // Create Order
    const order = await Order.create(
      {
        order_number: `ORD-${Date.now()}`,
        user_id: req.user.id,
        table_id,
        customer_name,
        customer_phone,
        order_type: order_type || "dine-in",
        notes,
      },
      { transaction }
    );

    const orderItems = [];

    for (const item of items) {
      const product = await Product.findByPk(item.product_id);
      if (!product) throw new Error(`Product ${item.product_id} not found`);
      if (!product.is_available)
        throw new Error(`Product ${product.name} unavailable`);

      const subtotal = Number(product.price) * item.quantity;

      const orderItem = await OrderItem.create(
        {
          order_id: order.id,
          product_id: product.id,
          product_name: product.name,
          quantity: item.quantity,
          price: product.price,
          discount: item.discount || 0,
          subtotal: subtotal - (item.discount || 0),
          notes: item.notes,
        },
        { transaction }
      );

      orderItems.push(orderItem);

      // Update stock
      await product.decrement("stock_quantity", {
        by: item.quantity,
        transaction,
      });
    }

    // Hitung total
    const totals = calculateTotals(orderItems, 0.1, req.body.discount || 0);
    await order.update(totals, { transaction });

    // Update table status
    if (table_id) {
      await Table.update(
        { status: "occupied" },
        { where: { id: table_id }, transaction }
      );
    }

    await transaction.commit();

    const fullOrder = await Order.findByPk(order.id, {
      include: [
        { model: User, as: "user" },
        { model: Table, as: "table" },
        {
          model: OrderItem,
          as: "items",
          include: [{ model: Product, as: "product" }],
        },
      ],
    });

    return successResponse(res, 201, "Order created", fullOrder);
  } catch (err) {
    await transaction.rollback();
    return errorResponse(res, 400, err.message);
  }
});

// UPDATE ORDER
exports.updateOrder = asyncHandler(async (req, res) => {
  const order = await Order.findByPk(req.params.id);
  if (!order) return errorResponse(res, 404, "Order not found");

  await order.update(req.body);

  const updated = await Order.findByPk(order.id, {
    include: [
      { model: User, as: "user" },
      { model: Table, as: "table" },
      { model: OrderItem, as: "items" },
    ],
  });

  return successResponse(res, 200, "Order updated", updated);
});

// UPDATE ORDER STATUS
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findByPk(req.params.id, {
    include: [{ model: Table, as: "table" }],
  });

  if (!order) return errorResponse(res, 404, "Order not found");

  const { status } = req.body;

  await order.update({
    status,
    ...(status === "completed" && { completed_at: new Date() }),
  });

  if (status === "completed" && order.table_id) {
    await Table.update(
      { status: "available" },
      { where: { id: order.table_id } }
    );
  }

  return successResponse(res, 200, "Order status updated", order);
});

// DELETE ORDER
exports.deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findByPk(req.params.id);

  if (!order) return errorResponse(res, 404, "Order not found");

  if (!["pending", "cancelled"].includes(order.status))
    return errorResponse(res, 400, "Cannot delete non-pending order");

  await order.destroy();

  return successResponse(res, 200, "Order deleted");
});
