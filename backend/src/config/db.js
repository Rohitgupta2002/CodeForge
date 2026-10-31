const mongoose = require('mongoose');

async function main() {
    await mongoose.connect(process.env.DB_CONNECT_STRING);

    console.log("Connected Database:", mongoose.connection.name);
}

module.exports = main;


