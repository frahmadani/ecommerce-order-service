const OrderService = require('../services/order-service');
const isAuth = require('./middlewares/auth');
const kafkaProducer = require('../utils/kafka/kafka_producer');
const mongoose = require('mongoose');
const logger = require('../utils/app-logger');

module.exports = (app) => {

    const service = new OrderService();

    app.post('/order/create', isAuth, async (req, res, next) => {

        logger.info('API POST /order/create is called');
        const { _id } = req.user;
        const transactionId = (new mongoose.Types.ObjectId()).toHexString();

        // transaction is created here

        try {
            const { data } = await service.createOrder({ _id, transactionId }); // SEMENTARA DI COMMENT U/ DEBUGGING KAFKA
            console.log('Data: ', data);
            const payload = await service.getOrderPayload(_id, data, 'CREATE_ORDER'); // SEMENTARA DI COMMENT U/ DEBUGGING KAFKA
            if (payload?.data?.data) {
                payload.data.data.transactionId = transactionId;
            }
            console.log("payload:", payload)

            const dataToKafka = {
                topic: 'ecommerce-service-create-order',
                body: { payload: payload},
                // body: payload,
                partition: 1,
                attributes: 1
            };

            //send to kafka
            kafkaProducer.send(dataToKafka);
            logger.info(`Success sending data with topic ${dataToKafka.topic} to Kafka`);

            if (data && Object.keys(data).length > 0) {
                data.transactionId = transactionId
            }

            logger.info('Success creating order');
            return res.status(200).json(data); // --> sementara di comment

        } catch (error) {
            logger.error(`Failed creating order: ${error}`);
            return res.status(500).json(error);
        }
    });

    app.get('/order', isAuth, async (req, res, next) => {
        logger.info('API GET /order is called');

        const { _id } = req.user;

        try {

            const { data } = await service.getOrders(_id);

            logger.info('Success retrieving orders');
            return res.status(200).json(data);

        } catch (error) {
            logger.error(`Failed retrieving orders: ${error}`);
            return res.status(500).json(error);
        }
    });

    app.get('/order/cart', isAuth, async (req, res, next) => {
        logger.info('API GET /order/cart is called');

        const { _id } = req.user;

        try {
            const { data } = await service.getCart({ _id });

            logger.info('Success retrieving cart');
            return res.status(200).json(data);

        } catch (error) {
            logger.error(`Failed retrieving cart: ${error}`);
            return res.status(500).json(error);
        }
        
    });
};