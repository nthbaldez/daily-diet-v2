import { FastifyInstance } from 'fastify'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-if-session-id-exists'

export async function adminRoutes(app: FastifyInstance) {
  app.get(
    '/meals',
    {
      preHandler: [checkSessionIdExists],
    },
    async () => {
      const meals = await knex('meals').select('*')

      return { meals }
    },
  )
}
