import express from 'express'
import dotenv from 'dotenv'
dotenv.config()
import route from './routes/userRoute.js'
import cors from 'cors'
const port =  process.env.PORT
const app  = express();

app.use(cors())
app.use(express.json())
app.use('/api/user',route)




app.listen(port,()=>{
    console.log(`app is running on port http://localhost:${port}`)
})