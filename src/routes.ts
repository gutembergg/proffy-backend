import express from 'express'
import ClassController from './controllers/ClassController'
import ConnectionController from './controllers/ConnectionController'

const route = express.Router()

const classController = new ClassController()
const connectionController = new ConnectionController()

route.get('/users', classController.index)
route.post('/users', classController.store)

route.get('/connections', connectionController.index)
route.post('/connections', connectionController.create)

export default route
