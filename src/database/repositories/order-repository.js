const { Order, Cart } = require('../models');
const { v4: uuidv4 } = require('uuid');
const { APIError } = require('../../utils/app-errors');

class OrderRepository {

    async GetOrders(userId) {
        try {

            const orders = await Order.find({ userId });
            return orders;

        } catch (error) {
            throw new APIError('API Error', 500, 'Unable to find order');
        }
    }

    async GetCart(userId) {

        try {
            const cartItems = await Cart.find({ userId });

            if (cartItems) {
                return cartItems;
            }
        
        } catch (error) {
            throw new APIError('API Error', 500, 'Unable to find cart');
        }
    }

    async AddToCart(userId, item, qty, isRemoving) {

        try {

            const cart = await Cart.findOne({ userId: userId});

            const { _id } = item;

            if (cart) {

                let isExist = false;
                let cartItems = cart.items;

                if (cartItems.length > 0) {

                    cartItems.map(item => {

                        if (item.product._id.toString() === _id.toString()) {
                            // If user action is removing from cart
                            if (isRemoving) {
                                cartItems.splice(cartItems.indexOf(item), 1);
                            } else {
                                item.unit = qty;
                            }
                            isExist = true;
                        }
                    });

                }

                if (!isExist && !isRemoving) {
                    cartItems.push({ product: {...item}, unit: qty});
                }

                cart.items = cartItems;

                return await cart.save();

            } else {
                console.log('cart does not exist +++++++');
                // cart is not exist yet
                return await Cart.create({
                    userId,
                    items: [{ product: {...item}, unit: qty }]
                });
            }

        } catch (err) {

            throw new APIError('API Error', 500, 'Unable to add/remove item to cart');
        }

    }

    async RemoveFromCart(userId, productId) {
        try {

            const cart = await Cart.findOne({ userId: userId});

            if (cart) {

                let cartItems = cart.items;

                if (cartItems.length > 0) {

                    cartItems.map(item => {

                        if (item.product._id.toString() === productId.toString()) {
                            cartItems.splice(cartItems.indexOf(item), 1);
                        }
                    });

                }

                cart.items = cartItems;

                return await cart.save();

            } else {
                console.log('cart does not exist');
                // cart is not exist yet
                return await Cart.create({
                    userId,
                    items: []
                });
            }

        } catch (err) {

            throw new APIError('API Error', 500, 'Unable to add/remove item to cart');
        }
    }

    async CreateNewOrder(userId, transactionId) {

        try {
            const cart = await Cart.findOne({ userId });

            if (cart) {

                let amount = 0;
                let cartItems = cart.items;

                if (cartItems.length > 0) {
                    //start process order
                    cartItems.map(item => {
                        amount += parseInt(item.product.price) * parseInt(item.unit);
                    });

                    const orderId = uuidv4();

                    const order = new Order({
                        orderId,
                        userId,
                        amount,
                        transactionId,
                        status: 'received',
                        items: cartItems
                    });

                    cart.items = [];

                    await cart.save();

                    const orderResult = await order.save();

                    // TODO create new transaction event

                    return orderResult;

                }
            }

            // if user has no cart
            return {};
            
        } catch (error) {
            throw new APIError('API Error', 500, 'Unable to create order');
        }
    }
}

module.exports = OrderRepository;