const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const amqplib = require('amqplib');

const { APP_SECRET } = require('../config');

module.exports.generateSalt = async () => {
    return await bcrypt.genSalt();
};

module.exports.generatePassword = async (password, salt) => {
    return await bcrypt.hash(password, salt);
};

module.exports.validatePassword = async (enteredPassword, savedPassword, salt) => {

    return (await this.generatePassword(enteredPassword, salt)) === savedPassword;
};

module.exports.formattedData = (data) => {
    if (data) {
        return { data };
    } else {
        throw new Error('Data not found');
    }

};

module.exports.generateSignature = async (payload) => {
    try {
        return await jwt.sign(payload, APP_SECRET, { 'expiresIn': '1h' });
    } catch (error) {
        console.log(error);
        return error;
    }
};

module.exports.validateSignature = async (req) => {
    try {
        const signature = req.get('Authorization');
        console.log(signature);

        const payload = await jwt.verify(signature.split(' ')[1], APP_SECRET);
        req.user = payload;
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
};

module.exports.PublishUserEvents = async (payload) => {

    axios.post('http://localhost:3001/user/events', { payload });

    console.log('Sending event to User service', payload);

};

module.exports.PublishTransactionEvents = async (payload) => {

    axios.post('http://localhost:3004/transaction/events', { payload });

    console.log('Sending event to Transaction service', payload);
};


// RABBIT MQ Methods. Tidak digunakan lagi, diganti dengan Kafka

// module.exports.CreateChannel = async () => {

//     try {

//         const connection = await amqplib.connect(MESSAGEBROKER_URL);
//         const channel = await connection.createChannel();
//         await channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: false });

//         return channel;
    
//     } catch (error) {
//         return error;
//     }

// };

// module.exports.PublishMessage = async (channel, binding_key, message) => {

//     try {
//         await channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: false });
//         await channel.publish(EXCHANGE_NAME, binding_key, Buffer.from(message));
//         console.log('Message sent: ', message);


//     } catch (error) {
//         return error;
//     }
// };

// module.exports.SubscribeMessage = async (channel, service, binding_key) => {

//     try {
//         console.log('Order service subscribing...');

//         await channel.assertExchange(EXCHANGE_NAME, 'direct', { durable: false });

//         console.log('Order service finish asserting exchange');

//         const appQueue = await channel.assertQueue(QUEUE_NAME);

//         channel.bindQueue(appQueue.queue, EXCHANGE_NAME, binding_key);

//         console.log(`Listening to exchange_name: ${EXCHANGE_NAME}, with binding_key: ${binding_key} and queue ${QUEUE_NAME}`);

//         channel.consume(appQueue.queue, data => {
//             console.log('Receive data: ');
//             console.log(data.content.toString());
//             service.SubscribeEvents(data.content.toString());
//             channel.ack(data);
//         });

//     } catch (error) {
//         return error;
//     }
// };
