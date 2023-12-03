const kafkaConsumer = require('../../utils/kafka/kafka_consumer');
const Order = require('../../services/order-service');

const order = new Order();

const addToCart = async () => {
    const dataConsumer = {
        topic: 'ecommerce-service-add-to-cart',
        groupId: 'ecommerce-order-service'
    };

    const consumer = new kafkaConsumer(dataConsumer);
    let ctx = 'addToCart';
    consumer.on('message', async (message) => {
        try {

            console.log('Data diterima: ', message);

            const parsedMessage = JSON.parse(message.value);

            const { userId, product, qty, isRemoving } = parsedMessage.data;

            const result = await order.ManageCart(userId, product, qty, isRemoving);

            if (result.err) {
                // logger.log(ctx, result.err, 'Data not commit Kafka');
            } else {
                consumer.commit(true, async (err, data) => {
                    if (err) {
                        // logger.log(ctx, err, 'Data not commit Kafka');
                    }
                    //   logger.log(ctx, data, 'Data Commit Kafka');
                });
            }
        } catch (error) {
            //   logger.log(ctx, error, 'Data error');
        }
    });


};

const removeFromCart = async () => {
    const dataConsumer = {
        topic: 'ecommerce-service-remove-from-cart',
        groupId: 'ecommerce-order-service'
    };

    const consumer = new kafkaConsumer(dataConsumer);
    let ctx = 'removeFromCart';
    consumer.on('message', async (message) => {
        try {

            console.log('Data diterima: ', message);

            const parsedMessage = JSON.parse(message.value);

            const { userId, product } = parsedMessage.data;

            console.log('userid: ', userId);
            console.log('productid: ', product._id);

            const result = await order.RemoveFromCart(userId, product._id);

            if (result.err) {
                // logger.log(ctx, result.err, 'Data not commit Kafka');
            } else {
                consumer.commit(true, async (err, data) => {
                    if (err) {
                        // logger.log(ctx, err, 'Data not commit Kafka');
                    }
                    //   logger.log(ctx, data, 'Data Commit Kafka');
                });
            }
        } catch (error) {
            //   logger.log(ctx, error, 'Data error');
        }
    });


};




module.exports = {
    addToCart,
    removeFromCart
};
