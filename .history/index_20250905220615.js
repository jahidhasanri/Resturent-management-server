const express = require('express')
const SSLCommerzPayment = require('sslcommerz-lts')
require('dotenv').config();
const app = express()
const cors=require('cors');
const port = process.env.PROT || 5000;
//middleware
app.use(cors());
app.use(express.json());

const store_id = process.env.StoreId
const store_passwd = process.env.StorePass
const is_live = false //true for live, false for sandbox

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.RS_USER}:${process.env.RS_PASS}@cluster0.e8jg2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

const userCollaction = client.db("resturant-management").collection('users')
const dishesCollaction = client.db("resturant-management").collection('ALLdishes')
const wishListCollaction = client.db("resturant-management").collection('wishlist')
const cardCollaction = client.db("resturant-management").collection('card')
const orderInfoCollaction = client.db("resturant-management").collection('OrderInfo')
const FinalorderInfoCollaction = client.db("resturant-management").collection('order')


//final order

app.post("/finalOrder",async(req,res)=>{

  console.log(req.body);
  const data = {
        total_amount: 100,
        currency: 'BDT',
        tran_id: 'REF123', // use unique tran_id for each api call
        success_url: 'http://localhost:3030/success',
        fail_url: 'http://localhost:3030/fail',
        cancel_url: 'http://localhost:3030/cancel',
        ipn_url: 'http://localhost:3030/ipn',
        shipping_method: 'Courier',
        product_name: 'Computer.',
        product_category: 'Electronic',
        product_profile: 'general',
        cus_name: 'Customer Name',
        cus_email: 'customer@example.com',
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
    };
    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live)
    sslcz.init(data).then(apiResponse => {
        // Redirect the user to payment gateway
        let GatewayPageURL = apiResponse.GatewayPageURL
        res.redirect(GatewayPageURL)
        console.log('Redirecting to: ', GatewayPageURL)
    });
})




//userCollection

app.post('/users', async (req, res) => {
  const user = req.body;
  const query = { email: user.email };
console.log(user);
  try {
    const isExist = await userCollaction.findOne(query);
    if (isExist) {
      return res.status(200).send(isExist);
    }

    const result = await userCollaction.insertOne({
      name: user.name,
      image: user.image,
      email: user.email,
      role: "user",
    });

    res.status(201).send(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'server error' });
  }
});


app.get('/users', async (req, res) => {
  try {
    const { email } = req.query;
    const user = await userCollaction.findOne({ email: email });
    
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    res.send(user);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Server error" });
  }
});

app.get('/allusers',async(req,res)=>{
  const alluser= userCollaction.find();
  const result = await alluser.toArray();
  res.send(result);
})

app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const result = await userCollaction.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });


    app.put("/users/:id/role", async (req, res) => {
      const id = req.params.id;
      const { role } = req.body;
      const result = await userCollaction.updateOne(
        { _id: new ObjectId(id) },
        { $set: { role } }
      );
      res.send(result);
    });


// dishesCollaction


app.post('/alldishes',async(req,res)=>{
  const user = req.body
 const result= await dishesCollaction.insertOne(user);
 res.send(result)
})

app.get('/allsdishes',async(req,res)=>{
  const allItem = dishesCollaction.find();
  const resutl = await allItem.toArray();
  res.send(resutl);
})

 app.put("/dishes/:id", async (req, res) => {
      const id = req.params.id;
      const updatedDish = req.body;

      try {
        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
          $set: {
            name: updatedDish.name,
            price: updatedDish.price,
            quantity: updatedDish.quantity,
            image: updatedDish.image,
            isBestSeller: updatedDish.isBestSeller,
          },
        };

        const result = await dishesCollaction.updateOne(filter, updateDoc);
        if (result.modifiedCount > 0) {
          res.status(200).send({ message: "Dish updated successfully" });
        } else {
          res.status(404).send({ message: "No dish found or no changes made" });
        }
      } catch (error) {
        console.error("Update error:", error);
        res.status(500).send({ message: "Error updating dish" });
      }
    });

app.delete('/allsdishes/:id',async(req,res)=>{
const id = req.params.id;
const query = {_id: new ObjectId(id)};
const resutl = await dishesCollaction.deleteOne(query)
res.send(resutl);
})
 
// wishLishtCollection
app.post('/wishes',async(req,res)=>{
  const user = req.body
 const result= await wishListCollaction.insertOne(user);
 res.send(result)
})

 app.get("/wishes", async (req, res) => {
      const { userId } = req.query;
      if (!userId) return res.status(400).json({ message: "userId required" });
      try {
        const wishes = await wishListCollaction
          .find({ userId: userId })
          .toArray();
        res.json(wishes);
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
      }
    });


app.get('/wishlist',async(req,res)=>{
  const allItem = wishListCollaction.find();
  const result = await allItem.toArray();
  res.send(result);
})

app.delete('/wishes/:id',async(req,res)=>{
const id = req.params.id;
const query = {_id: new ObjectId(id)};
const resutl = await wishListCollaction.deleteOne(query)
res.send(resutl);
})


//card collection

app.post('/cardItem', async (req, res) => {
  const item = req.body;
  if (!item.userId) return res.status(400).send({ success: false, message: "userId required" });

  const query = { itemId: item.itemId, userId: item.userId };
  console.log("Query for checking duplicate:", query);

  try {
    const isExist = await cardCollaction.findOne(query);
    if (isExist) {
      return res.status(200).send({ success: false, message: 'Item already exists in cart' });
    }

    const result = await cardCollaction.insertOne(item);
    res.status(201).send({ success: true, message: 'Item added to cart', result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'server error' });
  }
});

app.get("/cardItems", async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ success: false, message: "userId required" });
  }

  try {
    const items = await cardCollaction.find({ userId: userId }).toArray();
    res.status(200).json({ success: true, data: items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

app.delete('/cardItems/:id',async(req,res)=>{
const id = req.params.id;
console.log(id);
const query = {_id: new ObjectId(id)};
const resutl = await cardCollaction.deleteOne(query)
res.send(resutl);
})

app.delete('/cardItemss', async (req, res) => {
  const userId = req.query.userId;
  try {
    const result = await cardCollaction.deleteMany({ userId });
    res.send({ success: true, deletedCount: result.deletedCount });
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, message: 'Failed to delete cart items' });
  }
});



app.patch('/cardItems/:id', async (req, res) => {
  const id = req.params.id;
  const { quantity } = req.body;

  if (quantity < 1) {
    return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
  }

  try {
    const result = await cardCollaction.updateOne(
      { _id: new ObjectId(id) },
      { $set: { quantity: quantity } }
    );

    if (result.modifiedCount > 0) {
      res.json({ success: true, message: 'Quantity updated successfully' });
    } else {
      res.json({ success: false, message: 'No item updated' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// orderInfoCollocton

app.post('/orders', async (req, res) => {
  try {
    const order = req.body;  
    const result = await orderInfoCollaction.insertOne(order);
    res.send({ success: true, insertedId: result.insertedId });
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, message: 'Failed to save order' });
  }
});

app.get("/orderInfo", async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(400).json({ success: false, message: "userId required" });
  }

  try {
    const items = await orderInfoCollaction.find({ userId: userId }).toArray();
    res.status(200).json({ success: true, data: items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});


   
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);







app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
