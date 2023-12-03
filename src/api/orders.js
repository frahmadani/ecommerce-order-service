const OrderService = require('../services/order-service');
const isAuth = require('./middlewares/auth');
const kafkaProducer = require('../utils/kafka/kafka_producer');
const mongoose = require('mongoose');

module.exports = (app) => {

    const service = new OrderService();

    app.post('/order/create', isAuth, async (req, res, next) => {

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

            if (data && Object.keys(data).length > 0) {
                data.transactionId = transactionId
            }

            return res.status(200).json(data); // --> sementara di comment

        } catch (error) {
            return res.status(500).json(error);
        }
    });

    app.get('/order', isAuth, async (req, res, next) => {

        const { _id } = req.user;

        try {

            const { data } = await service.getOrders(_id);

            return res.status(200).json(data);

        } catch (error) {
            return res.status(500).json(error);
        }
    });

    app.get('/order/cart', isAuth, async (req, res, next) => {

        const { _id } = req.user;

        try {
            const { data } = await service.getCart({ _id });

            return res.status(200).json(data);

        } catch (error) {
            return res.status(500).json(error);
        }
        
    });
};