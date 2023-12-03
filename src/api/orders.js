const OrderService = require('../services/order-service');
const isAuth = require('./middlewares/auth');
const kafkaProducer = require('../utils/kafka/kafka_producer');

module.exports = (app) => {

    const service = new OrderService();

    app.post('/order/create', isAuth, async (req, res, next) => {

        const { _id } = req.user;
        const { transactionId } = req.body;

        // transaction is created here

        try {
            // const { data } = await service.createOrder({ _id, transactionId }); // SEMENTARA DI COMMENT U/ DEBUGGING KAFKA

            // console.log('Data: ', data);

            // const payload = await service.getOrderPayload(_id, data, 'CREATE_ORDER'); // SEMENTARA DI COMMENT U/ DEBUGGING KAFKA

            const dataToKafka = {
                topic: 'ecommerce-service-create-order',
                body: { payload: 'Data'},
                // body: payload,
                partition: 1,
                attributes: 1
            };

            //send to kafka
            await kafkaProducer.send(dataToKafka);

            return res.status(200).json({ data: 'kafka called'}); // SEMENTARA DI DUMMY VALUE U/ DEBUGGING KAFKA

            // return res.status(200).json(data); --> sementara di comment

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