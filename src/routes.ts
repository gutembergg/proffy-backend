import express from 'express'
import db from './database/connection'
import { convertHourInMin } from './utils/converthourInMin'

const route = express.Router()

interface scheduleItem {
  week_day: number
  from: string
  to: string
}

route.post('/users', async (req, res) => {
  const { name, avatar, whatsapp, bio, subject, cost, schendule } = req.body

  const trx = await db.transaction()

  try {
    const insertUsersIds = await trx('users').insert({
      name,
      avatar,
      whatsapp,
      bio
    })

    const user_id = insertUsersIds[0]

    const insertedClassesIds = await trx('classes').insert({
      subject,
      cost,
      user_id
    })

    const class_id = insertedClassesIds[0]

    const classSchedule = schendule.map((scheduleItem: scheduleItem) => {
      return {
        class_id,
        week_day: scheduleItem.week_day,
        from: convertHourInMin(scheduleItem.from),
        to: convertHourInMin(scheduleItem.to)
      }
    })

    await trx('class_schedule').insert(classSchedule)

    await trx.commit()

    return res.status(201).send()
  } catch (error) {
    await trx.rollback()
    return res.status(400).send({ Error: 'Error create user' })
  }
})

export default route
