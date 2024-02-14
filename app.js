import  express from 'express'
import  cors from 'cors'
import  cookieparser from 'cookie-parser'
import morgan from 'morgan'
import errormiddleware from './middleware/error.js'
import routers from './routers/userRouter.js'
import courseRouter from './routers/course.router.js'
import  Paymentroute from './routers/payment.router.js'


const app = express()
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieparser())
app.use(cors({
    origin:[process.env.FORNTENDURL],
    credentials:true
}))
app.use(morgan('dev'))

import dbConnection from './/config/config.js'
dbConnection()

app.use('/api/v1/user',routers)
app.use('/api/v1/course',courseRouter)
app.use('/api/v1/payments',Paymentroute)






app.all('*',(req,res)=>{
    res.status(404).send('Opps!! page not found 404 !')
})
app.use(errormiddleware)
export default app;
