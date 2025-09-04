import express from 'express';
import cors from 'cors';
import 'dotenv/config'
import connectDB from './configs/mongodb.js';

const app = express()

app.use(cors())


app.get('/',(req,res)=> res.send("api working"))


const PORT = process.env.PORT || 5000

app.listen(PORT, ()=>{
    console.log(`server is running on port ${PORT}`)
})

await connectDB()