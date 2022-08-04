const express = require ('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require ('cors')
require('dotenv').config()
const connectDB = require('./config/db')
connectDB()

app.use(cors())
app.use(bodyParser.json())
app.use(express.json())
app.get('/', (req, res) => {
    res.status(200).send('Hello World')
})
app.use('', require('./routes/adminRoutes'))
const PORT = process.env.PORT || 8080

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

