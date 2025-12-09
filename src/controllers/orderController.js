const { Order, OrderItem, Product, User, Table } = require('../models');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/responseHandler');
const { getPagination, generateOrderNumber, calculateOrderTotals } = require('../utils/helpers');
const { sequelize } = require('../config/database');

const getAllOrders = async (req, res, next) => {
  try {
    const { page = 1, size = 10, status, order_type, payment_status, start_date, end_date } = req.query;
    const { limit, offset } = getPagination(page, size);
    
    const where = {};
    if (status) where.status = status;
    if (order_type) where.order_type = order_type;
    if (payment_status) where.payment_status = payment_status;
    if (start_date || end_date) {
      where.created_at = {};
      if (start_date) where.created_at[require('sequelize').Op.gte] = new Date(start_date);
      if (end_date) where.created_at[require('sequelize').Op.lte] = new Date(end_date);
    }
    
    const { count, rows } = await Order.findAndCountAll({
      where,
      limit,
      offset,
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'full_name'] },
        { model: Table, as: 'table', attributes: ['id', 'table_number'] },
        { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }
      ],
      order: [['created_at', 'DESC']]
    });
    
    return paginatedResponse(res, 200, 'Orders retrieved', rows, { page: parseInt(page), limit, totalItems: count });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'full_name'] },
        { model: Table, as: 'table' },
        { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }
      ]
    });
    if (!order) {
      return errorResponse(res, 404, 'Order not found');
    }
    return successResponse(res, 200, 'Order retrieved', order);
  } catch (error) {
    next(error);
  }
};

const createOrder = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { table_id, customer_name, customer_phone, order_type, items, notes } = req.body;
    
    // Validate items
    if (!items || items.length === 0) {
      await transaction.rollback();
      return errorResponse(res, 400, 'Order must have at least one item');
    }
    
    // Create order
    const orderNumber = generateOrderNumber();
    const order = await Order.create({
      order_number: orderNumber,
      user_id: req.user.id,
      table_id,
      customer_name,
      customer_phone,
      order_type: order_type || 'dine-in',
      notes
    }, { transaction });
    
    // Create order items
    const orderItems = [];
    for (const item of items) {
      const product = await Product.findByPk(item.product_id);
      if (!product) {
        await transaction.rollback();
        return errorResponse(res, 404, `Product ${item.product_id} not found`);
      }
      if (!product.is_available) {
        await transaction.rollback();
        return errorResponse(res, 400, `Product ${product.name} is not available`);
      }
      
      const subtotal = parseFloat(product.price) * item.quantity;
      const orderItem = await OrderItem.create({
        order_id: order.id,
        product_id: product.id,
        product_name: product.name,
        quantity: item.quantity,
        price: product.price,
        discount: item.discount || 0,
        subtotal: subtotal - (item.discount || 0),
        notes: item.notes
      }, { transaction });
      
      orderItems.push(orderItem);
      
      // Update stock
      await product.decrement('stock', { by: item.quantity, transaction });
    }
    
    // Calculate totals
    const totals = calculateOrderTotals(orderItems, 0.1, req.body.discount || 0);
    await order.update(totals, { transaction });
    
    // Update table status
    if (table_id) {
      await Table.update({ status: 'occupied' }, { where: { id: table_id }, transaction });
    }
    
    await transaction.commit();
    
    // Fetch complete order
    const completeOrder = await Order.findByPk(order.id, {
      include: [
        { model: User, as: 'user' },
        { model: Table, as: 'table' },
        { model: OrderItem, as: 'items', include: [{ model: Product, as: 'product' }] }
      ]
    });
    
    return successResponse(res, 201, 'Order created successfully', completeOrder);
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

const updateOrder = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return errorResponse(res, 404, 'Order not found');
    }
    await order.update(req.body);
    const updatedOrder = await Order.findByPk(order.id, {
      include: [
        { model: User, as: 'user' },
        { model: Table, as: 'table' },
        { model: OrderItem, as: 'items' }
      ]
    });
    return successResponse(res, 200, 'Order updated', updatedOrder);
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findByPk(req.params.id, { include: [{ model: Table, as: 'table' }] });
    
    if (!order) {
      return errorResponse(res, 404, 'Order not found');
    }
    
    await order.update({ status, ...(status === 'completed' && { completed_at: new Date() }) });
    
    // Update table status if order completed
    if (status === 'completed' && order.table_id) {
      await Table.update({ status: 'available' }, { where: { id: order.table_id } });
    }
    
    return successResponse(res, 200, 'Order status updated', order);
  } catch (error) {
    next(error);
  }
};

const deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return errorResponse(res, 404, 'Order not found');
    }
    if (order.status !== 'pending' && order.status !== 'cancelled') {
      return errorResponse(res, 400, 'Cannot delete order that is not pending or cancelled');
    }
    await order.destroy();
    return successResponse(res, 200, 'Order deleted');
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllOrders, getOrderById, createOrder, updateOrder, updateOrderStatus, deleteOrder };