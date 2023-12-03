const { OrderRepository } = require('../database');
const { formattedData } = require('../utils');
const { APIError } = require('../utils/app-errors');

class OrderService {

    constructor() {
        this.repository = new OrderRepository();
    }

    async getCart({ _id }) {
        try {
            const cartItems = await this.repository.GetCart(_id);

            return formattedData(cartItems);

        } catch (error) {
            throw new APIError('Data not found');
        }
    }

    async createOrder(userInputs) {

        const { _id, transactionId } = userInputs;

        // verify transaction number

        try {

            const orderResult = await this.repository.CreateNewOrder(_id, transactionId);
            return formattedData(orderResult);

        } catch (error) {
            throw new APIError('Data not found');
        }
    }

    async getOrders(userId) {
        try {
            const orders = await this.repository.GetOrders(userId);

            return formattedData(orders);

        } catch (error) {
            throw new APIError('Data not found');
        }
    }

    async ManageCart(userId, item, qty, isRemoving) {

        try {
            const cartResult = await this.repository.AddToCart(userId, item, qty, isRemoving);

            console.log('Finish managing cart');

            return formattedData(cartResult);
    
        } catch (error) {
            throw new APIError('Data not found');
        }

    }

    async RemoveFromCart(userId, productId) {
        try {
            const cartResult = await this.repository.RemoveFromCart(userId, productId);

            console.log('Finish removing item from cart');

            return formattedData(cartResult);
            
        } catch (error) {
            throw new APIError('Data not found');
        }
    }

    // Subscribe Event tidak digunakan lagi, diganti dgn call dari observer kafka ke masing2 service
    async SubscribeEvents(topic, value) {

        const parsedPayload = JSON.parse(value);

        const { userId, product, qty } = parsedPayload.data;

        switch(topic){
        case 'ADD_TO_CART':
            console.log('menerima event ADD_TO_CART');
            console.log('Data dari ADD_TO_CART: ', parsedPayload.data);
            this.ManageCart(userId, product, qty, false);
            break;
        case 'REMOVE_FROM_CART':
            console.log('menerima event REMOVE_FROM_CART');
            console.log('Data dari REMOVE_FROM_CART: ', parsedPayload.data);
            this.ManageCart(userId, product, qty, true);
            break;
        default:
            break;
        }
    }

    async getOrderPayload(userId, order, event) {

        if (order) {
            const payload = {
                event,
                data: {
                    userId,
                    order
                }
            };
            return formattedData(payload);
        }

        return formattedData({ error: 'No order found'});
    }
}

module.exports = OrderService;