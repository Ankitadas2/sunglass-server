const express=require('express')
const { MongoClient } = require('mongodb');
const app=express()
const cors=require('cors');
require('dotenv').config();
const ObjectId=require('mongodb').ObjectId;
const port=process.env.PORT|| 5000;

app.use(cors());
app.use(express.json())
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ypl1e.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run(){
    try{
    await client.connect();
    console.log('connected')
    const database=client.db('sunglass_store')
const sunglassCollection=database.collection('sunglass')
const ordersCollection=database.collection('orders')
const usersCollection=database.collection('users')
const reviewCollection=database.collection('review')
// get product api:
    app.get('/product',async(req,res)=>{
        const cursor=sunglassCollection.find({});
        const products=await cursor.limit(6).toArray();
        res.send(products)
    })
// get all products in UI for explore:
    app.get('/products',async(req,res)=>{
        const cursor=sunglassCollection.find({});
        const products=await cursor.toArray();
        res.send(products)
    })

    // get single Product:

    app.get('/products/:id',async(req,res)=>{
        const id=req.params.id;
        const query={_id:ObjectId(id)};
        const result=await sunglassCollection.findOne(query);
        
        res.json(result)
    })
    // Post addservices:
    app.post('/products',async(req,res)=>{
        const product=req.body;
        console.log('hit',product)
        const result=await sunglassCollection.insertOne(product)
        res.json(result);
    })

    // orders post:
    app.post('/orderConfirm',async(req,res)=>{
        const result=await ordersCollection.insertOne(req.body)
           res.send(result)
    })

    app.get('/orderConfirm',async(req,res)=>{
        let query={};
        const email=req.query.email;
        if(email){
            query={email:email}

        }
        const cursor=ordersCollection.find(query);
        const orders=await cursor.toArray();
        res.json(orders);
    })
    // all orders get :
    app.get('/orderConfirm',async(req,res)=>{
        const cursor=ordersCollection.find({});
        const orders=await cursor.toArray();
        res.json(orders)
    })

    // delete items from manage order:
    app.delete('/orderConfirm/:id',async(req,res)=>{
        const id=req.params.id;
        const query={_id:ObjectId(id)};
        const result=await ordersCollection.deleteOne(query);
        res.json(result)
    })

    // user data store:
        app.post('/users',async(req,res)=>{
            const user=req.body;
            const result=await usersCollection.insertOne(user);
            res.json(result)
        })
app.put('/users',async(req,res)=>{
    const user=req.body;
    const filter={email:user.email};
    const options={upsert:true}
    const updateDoc={$set:user};
    const result=await usersCollection.updateOne(filter,updateDoc,options);
    res.json(result);
})

app.put('/users/admin',async(req,res)=>{
    const user=req.body;
    const filter={email:user.email};
    const updateDoc={$set:{role:'admin'}};
    const result=await usersCollection.updateOne(filter,updateDoc);
    res.json(result)
})

app.get('/users/:email',async(req,res)=>{
    const email=req.params.email;
    const query={email:email};
    const user=await usersCollection.findOne(query)
    let isAdmin=false;
    if(user.role==='admin'){
   isAdmin=true;
    }
    res.json({admin:isAdmin})
})
// Order review post in database:
app.post('/orderReview',async(req,res)=>{
    const result=await reviewCollection.insertOne(req.body)
       res.send(result)
})
// Order review get in UI:
app.get('/orderReview',async(req,res)=>{
    const cursor=reviewCollection.find({});
    const reviews=await cursor.toArray();
    res.json(reviews)
})

// Update status:
app.put('/updateStatus/:id',async(req,res)=>{
    const filter={_id:ObjectId(req.params.id)};
    const result=await ordersCollection.updateOne(filter,{
        $set:{
            status:req.body.status,
        },
})
      res.send(result)
      console.log(result);

})

// Manage products delete section:
app.delete('/manageProduct/:id',async(req,res)=>{
    const id=req.params.id;
        const query={_id:ObjectId(id)};
        const result=await sunglassCollection.deleteOne(query);
        res.json(result)
})

}
    finally{

    }
}
run().catch(console.dir)






app.get('/',(req,res)=>{
    res.send('Sunglass shop')
})

app.listen(port,()=>{
    console.log('listening',port)
})