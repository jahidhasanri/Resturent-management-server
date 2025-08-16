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

// dishesCollaction


app.post('/alldishes',async(req,res)=>{
  const user = req.body
 const result= await dishesCollaction.insertOne(user);
 res.send(result)
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
