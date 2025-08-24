const express = require('express')
require('dotenv').config();
const app = express()
const cors=require('cors');
const port = process.env.PROT || 5000;
//middleware
app.use(cors());
app.use(express.json());



const { MongoClient, ServerApiVersion } = require('mongodb');
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
