const express = require("express");
const { MongoClient } = require("mongodb");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
require("dotenv").config();
const ObjectID = require("mongodb").ObjectID;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.858ok.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
async function run() {
  try {
    await client.connect();
    const database = client.db("baby_planet");
    const userCollection = database.collection("users");
    const servicesCollection = database.collection("services");
    const OrdersCollection = database.collection("orders");
    const ProductReviewsCollection = database.collection("Productreviews");
    const ReviewCollection = database.collection("reviews");
    // User Insert
    app.post("/users", async (req, res) => {
      const result = await userCollection.insertOne(req.body);
      res.json(result);
    });
    // checkAdmin
    app.get("/users/:email", async (req, res) => {
      const result = await userCollection.findOne({ email: req.params.email });
      res.json(result);
    });
    // makeadmin
    app.put("/makeadmin", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const options = { upsert: true };
      const updateAdmin = {
        $set: user,
      };
      const result = await userCollection.updateOne(
        query,
        updateAdmin,
        options,
      );
      res.json(result);
    });

    // Services Post
    app.post("/services", async (req, res) => {
      const result = await servicesCollection.insertOne(req.body);
      res.json(result);
    });
    // Services Get
    app.get("/services", async (req, res) => {
      const result = await servicesCollection.find({}).toArray();
      res.json(result);
    });
    // Single Services Get
    app.get("/services/:id", async (req, res) => {
      const result = await servicesCollection.findOne({
        _id: ObjectID(req.params.id),
      });
      res.json(result);
    });
    // Services Delete
    app.delete("/services/:id", async (req, res) => {
      const query = { _id: ObjectID(req.params.id) };
      const orderDelete = await OrdersCollection.deleteOne({
        id: ObjectID(req.params.id),
      });
      const result = await servicesCollection.deleteOne(query);
      res.json(result);
    });

    // Orders Post
    app.post("/orders", async (req, res) => {
      const orderData = req.body;
      const checkOrder = await OrdersCollection.findOne({
        id: orderData.id,
        email: orderData.email,
      });
      // console.log(orderData);
      if (checkOrder?.id === orderData?.id) {
        // console.log("ache");
        const oldQuantity = checkOrder.quantity;
        const newQuantity = oldQuantity + 1;
        const query = { email: orderData.email, id: orderData.id };
        const options = { upsert: true };
        const updatQuantity = {
          $set: {
            quantity: newQuantity,
          },
        };
        const updateOrder = await OrdersCollection.updateOne(
          query,
          updatQuantity,
          options,
        );
        res.json(updateOrder);
      } else {
        // console.log("Nai");
        const insertOrder = await OrdersCollection.insertOne(orderData);
        res.json(insertOrder);
      }
    });
    // Find Order by email
    app.get("/orders/:email", async (req, res) => {
      const result = await OrdersCollection.find({
        email: req.params.email,
      }).toArray();
      res.json(result);
    });
    // find All Orders
    app.get("/orders", async (req, res) => {
      const orders = await OrdersCollection.find({}).toArray();
      res.json(orders);
    });
    // Order Status update
    app.put("/orders/status/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectID(id) };
      const options = { upsert: true };
      const updateStatus = {
        $set: {
          status: "approved",
        },
      };
      const update = await OrdersCollection.updateOne(
        query,
        updateStatus,
        options,
      );
      res.json(update);
    });
    // Order deleted
    app.delete("/orders/:id", async (req, res) => {
      const query = { _id: ObjectID(req.params.id) };
      const result = await OrdersCollection.deleteOne(query);
      res.json(result);
    });

  

    // user reviews
    app.get("/reviews", async (req, res) => {
      const result = await ReviewCollection.find({}).toArray();
      res.json(result);
    });
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await ReviewCollection.insertOne(review);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
