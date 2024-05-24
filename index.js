const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ObjectId } = require("mongodb");
const SSLCommerzPayment = require('sslcommerz')

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster01.fdvnuff.mongodb.net/`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();

    const database = client.db("phdb");
    const menuCollection = database.collection("menu");
    const reviewCollection = database.collection("reviews");
    const cartCollection = database.collection("carts");
    const reservationCollection = database.collection("reservation");

    app.get('/init', (req, res) => {
      const data = {
          total_amount: 100,
          currency: 'BDT',
          tran_id: 'REF123',
          success_url: 'http://localhost:5000/success',
          fail_url: 'http://localhost:5000/fail',
          cancel_url: 'http://localhost:5000/cancel',
          ipn_url: 'http://yoursite.com/ipn',
          shipping_method: 'Courier',
          product_name: 'Computer.',
          product_category: 'Electronic',
          product_profile: 'general',
          cus_name: 'Customer Name',
          cus_email: 'cust@yahoo.com',
          cus_add1: 'Dhaka',
          cus_add2: 'Dhaka',
          cus_city: 'Dhaka',
          cus_state: 'Dhaka',
          cus_postcode: '1000',
          cus_country: 'Bangladesh',
          cus_phone: '01711111111',
          cus_fax: '01711111111',
          ship_name: 'Customer Name',
          ship_add1: 'Dhaka',
          ship_add2: 'Dhaka',
          ship_city: 'Dhaka',
          ship_state: 'Dhaka',
          ship_postcode: 1000,
          ship_country: 'Bangladesh',
          multi_card_name: 'mastercard',
          value_a: 'ref001_A',
          value_b: 'ref002_B',
          value_c: 'ref003_C',
          value_d: 'ref004_D'
      };
      const sslcommer = new SSLCommerzPayment('abc662aaf34f2cb4', 'abc662aaf34f2cb4@ssl',false) //true for live default false for sandbox
      sslcommer.init(data).then(data => {
          //process the response that got from sslcommerz 
          //https://developer.sslcommerz.com/doc/v4/#returned-parameters
          res.redirect(data.GatewayPageURL)
      });
  })

  app.post('/success',async(req,res)=>{
    console.log(req.body);
    res.status(200).json(req.body);
   
  });
  // app.post('/fail',async(req,res)=>{
  //   console.log(req.body);
  //   res.status(400).json(req.body);
   
  // });
  // app.post('/cancel',async(req,res)=>{
  //   console.log(req.body);
  //   res.status(200).json(req.body);
   
  // });



    // Get All The Menu API
    app.get("/menu", async (req, res) => {
      const cursor = menuCollection.find({});
      const menus = await cursor.toArray();
      res.send(menus);
    });

    // Get All The Review API
    app.get("/reviews", async (req, res) => {
      const cursor = reviewCollection.find({});
      const reviews = await cursor.toArray();
      res.send(reviews);
    });

    app.post('/reviews',async(req,res)=>{
      const reviewItem = req.body;
      const result = await reviewCollection.insertOne(reviewItem);
      res.send(result);
    });

    app.get("/reservation", async (req, res) => {
      const cursor = reservationCollection.find({});
      const reservation = await cursor.toArray();
      res.send(reservation);
    });

    app.post('/reservation',async(req,res)=>{
      const reservationItem = req.body;
      const result = await reservationCollection.insertOne(reservationItem);
      res.send(result);
    });

    

    app.get('/carts',async(req,res)=>{
      const email = req.query.email;
      const query ={email: email}
      const result = await cartCollection.find().toArray();
      res.send(result);
    });


    app.post('/carts',async(req,res)=>{
      const cartItem = req.body;
      const result = await cartCollection.insertOne(cartItem);
      res.send(result);
    });

    app.delete('/carts/:id',async(req,res) => 
  {
    const id = req.params.id;
    const query = {_id: new ObjectId(id)}
    const result = await cartCollection.deleteOne(query);
    res.send(result);
  });


  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("PH Care server is running");
});

app.listen(port, () => {
  console.log(`Listening at ${port}`);
});
