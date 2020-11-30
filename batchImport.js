const { MongoClient } = require("mongodb");
const assert = require("assert");

require("dotenv").config();

const { MONGO_URI } = process.env;

const options = {
  useNewUrlParser: true,

  useUnifiedTopology: true,
};

const seats = {};
const row = ["A", "B", "C", "D", "E", "F", "G", "H"];
for (let r = 0; r < row.length; r++) {
  for (let s = 1; s < 13; s++) {
    seats[`${row[r]}-${s}`] = {
      _id: `${row[r]}-${s}`,
      price: 225,
      isBooked: false,
    };
  }
}
const seatsArray = Object.values(seats);

const batchImport = async () => {
  const client = await MongoClient(MONGO_URI, options);

  const dbName = "workshop2";

  try {
    await client.connect();

    console.log("connected!");

    const db = client.db(dbName);

    console.log("*****");

    const result = await db.collection("seating").insertMany(seatsArray);
    assert.equal(seatsArray.length, result.insertedCount);

    console.log({ status: 201, data: result });
  } catch (err) {
    console.log({ status: 500, message: err.message });
  }

  client.close();

  console.log("disconnected!");
};

batchImport();
