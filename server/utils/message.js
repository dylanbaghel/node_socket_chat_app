const moment = require('moment');

const genMessage = (from, text) => {
    return {
        from,
        text,
        createdAt: moment().valueOf()
    };
}

const genLocationMessage = (from, latitude, longitude) => {
    return {
        from,
        url: `https://www.google.com/maps/?q=${latitude},${longitude}`,
        createdAt: moment().valueOf()
    };
}

module.exports = { genLocationMessage, genMessage };