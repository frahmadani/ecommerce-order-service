const orderEventHandler = require('../api/handler/event_handler');

const init = () => {
    initEventListener();
};
const initEventListener = () => {
    orderEventHandler.addToCart();
    orderEventHandler.removeFromCart();
    orderEventHandler.cancelTxOrder();
    orderEventHandler.payTxOrder();
};

module.exports = {
    init: init
};
