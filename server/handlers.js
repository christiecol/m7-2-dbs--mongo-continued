"use strict";

const { MongoClient } = require("mongodb");
const assert = require("assert");

require("dotenv").config();
const { MONGO_URI } = process.env;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const getSeats = async (req, res) => {
  const client = await MongoClient(MONGO_URI, options);
  const dbName = "workshop2";

  const seatingData = {};

  await client.connect();

  const db = client.db(dbName);

  try {
    const seats = await db.collection("seating").find().toArray();
    console.log(seats);

    seats.forEach((seat) => {
      seatingData[seat._id] = seat;
    });

    res
      .status(200)
      .json({ status: 200, seats: seatingData, numOfRows: 8, seatsPerRow: 12 });
  } catch (err) {
    console.log(err);
  }
};

const bookSeat = async (req, res) => {
  const client = await MongoClient(MONGO_URI, options);
  const { fullName, email, seatId, creditCard, expiration } = req.body;
  console.log(req.body);
  const dbName = "workshop2";
  let state;
  let lastBookingAttemptSucceeded = false;

  try {
    await client.connect();
    console.log("connected!");

    const db = client.db(dbName);

    const query = { _id: seatId };
    const newValues = {
      $set: { isBooked: true, name: fullName, email: email },
    };

    if (!state) {
      state = {
        bookedSeats: randomlyBookSeats(30),
      };
    }

    await delay(Math.random() * 3000);

    const isAlreadyBooked = !!state.bookedSeats[seatId];
    if (isAlreadyBooked) {
      return res.status(400).json({
        message: "This seat has already been booked!",
      });
    }

    if (!creditCard || !expiration) {
      return res.status(400).json({
        status: 400,
        message: "Please provide credit card information!",
      });
    }

    if (lastBookingAttemptSucceeded) {
      lastBookingAttemptSucceeded = !lastBookingAttemptSucceeded;

      return res.status(500).json({
        message:
          "An unknown error has occurred. Please try your request again.",
      });
    }

    lastBookingAttemptSucceeded = !lastBookingAttemptSucceeded;

    state.bookedSeats[seatId] = true;

    const booked = await db.collection("seating").updateOne(query, newValues);

    res.status(200).json({ status: 200 });
  } catch (err) {
    res.status(404).json({ status: 404 });
  }

  client.close();
  console.log("disconnected!");
};

module.exports = { getSeats, bookSeat };
