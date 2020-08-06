import db from '../database/connection'
import { convertHourInMin } from '../utils/converthourInMin'
import { Request, Response } from 'express'

interface scheduleItem {
  week_day: number
  from: string
  to: string
}

export default class ClassController {
  async index(req: Request, res: Response) {
    const filters = req.query

    const week_day = filters.week_day as string
    const subject = filters.subject as string
    const time = filters.time as string

    if (!filters.week_day || !filters.subject || !filters.time) {
      return res.status(400).send({ Error: 'Missing filters for search classes' })
    }

    const timeInMinutes = convertHourInMin(time)

    const classes = await db('classes')
      .whereExists(function () {
        this.select('class_schedule.*')
          .from('class_schedule')
          .whereRaw('`class_schedule`. `class_id` = `classes`. `id`')
          .whereRaw('`class_schedule`. `week_day` = ??', [Number(week_day)])
          .whereRaw('`class_schedule`. `from` <= ??', [timeInMinutes])
          .whereRaw('`class_schedule`. `to` > ??', [timeInMinutes])
      })
      .where('classes.subject', '=', subject)
      .join('users', 'classes.user_id', '=', 'user_id')
      .select(['classes.*', 'users.*'])
    return res.send(classes)
  }

  async store(req: Request, res: Response) {
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
  }
}
