import express from 'express'
import route from './routes'
import cors from 'cors'

const app = express()
const PORT = 3333

app.use(cors())
app.use(express.json())
app.use(route)

app.listen(PORT, () => {
  console.log('Connected')
})
