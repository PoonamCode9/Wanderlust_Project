const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

if(process.env.NODE_ENV != "production") {
    require('dotenv').config({ path: "../.env" });
}
const maptilerClient = require("@maptiler/client");   // for map geocoding
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;


const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
    .then(() => {
        console.log("connected to DB");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(MONGO_URL);
};


const initDB = async () => {
    await Listing.deleteMany({});

    const newData = [];

    for (let obj of initData.data) {
        const response = await maptilerClient.geocoding.forward(obj.location, { limit: 1 });

        let geometry = response.features[0].geometry;
        newData.push({
            ...obj,
            owner: '69ac149f441d32dfe61e8805',
            geometry: geometry
        });
    }
    await Listing.insertMany(newData);
    console.log("Data was initialized");
};

initDB();