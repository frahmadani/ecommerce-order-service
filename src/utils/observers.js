const orderEventHandler = require('../api/handler/event_handler');

const init = () => {
    initEventListener();
};
const initEventListener = () => {
    orderEventHandler.addToCart();
    orderEventHandler.removeFromCart();
    orderEventHandler.cancelTxOrder();
};

module.exports = {
    init: init
};
