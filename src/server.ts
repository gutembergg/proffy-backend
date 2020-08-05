import express from 'express'
import route from './routes'

const app = express()
const PORT = 3333

app.use(express.json())
app.use(route)

app.listen(PORT, () => {
  console.log('Connected')
})
