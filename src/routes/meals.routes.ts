import { FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-if-session-id-exists'

export async function mealsRoutes(app: FastifyInstance) {
  app.post(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const mealsBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        isOnDiet: z.boolean(),
        date: z.coerce.date(),
      })

      const { name, description, isOnDiet } = mealsBodySchema.parse(
        request.body,
      )

      await knex('meals').insert({
        id: randomUUID(),
        name,
        description,
        is_on_diet: isOnDiet,
        user_id: request.user?.id,
        date: Date.now(),
      })

      return reply.status(201).send()
    },
  )

  app.put(
    '/:mealId',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const paramsSchema = z.object({
        mealId: z.string().uuid(),
      })

      const { mealId } = paramsSchema.parse(request.params)

      const updateMealsSchema = z.object({
        name: z.string().optional(),
        description: z.string().optional(),
        isOnDiet: z.boolean().optional(),
        date: z.coerce.date(),
      })

      const { name, description, isOnDiet, date } = updateMealsSchema.parse(
        request.body,
      )

      const meal = await knex('meals').where({ id: mealId }).first()

      if (!meal) {
        return reply.status(404).send({ error: 'Meal not found' })
      }

      await knex('meals').where({ id: mealId }).update({
        name,
        description,
        date: date.getTime(),
        is_on_diet: isOnDiet,
      })

      return reply.status(204).send()
    },
  )

  app.delete(
    '/:mealId',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const paramsSchema = z.object({
        mealId: z.string().uuid(),
      })

      const { mealId } = paramsSchema.parse(request.params)

      const meal = await knex('meals')
        .where({ id: mealId, user_id: request.user?.id })
        .first()

      if (!meal) {
        return reply.status(404).send({ error: 'Meal not found' })
      }

      await knex('meals').where({ id: mealId }).delete()

      return reply.status(204).send()
    },
  )

  app.get(
    '/',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const meals = await knex('meals')
        .select('*')
        .where({ user_id: request.user?.id })

      if (meals.length === 0) {
        return reply.status(404).send({ error: 'Meal not found' })
      }

      return { meals }
    },
  )

  app.get(
    '/:mealId',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request, reply) => {
      const paramsSchema = z.object({
        mealId: z.string().uuid(),
      })

      const { mealId } = paramsSchema.parse(request.params)

      const meal = await knex('meals')
        .where({ id: mealId, user_id: request.user?.id })
        .first()

      if (!meal) {
        return reply.status(404).send({ error: 'Meal not found' })
      }

      return { meal }
    },
  )

  app.get(
    '/metrics',
    {
      preHandler: [checkSessionIdExists],
    },
    async (request) => {
      const totalMealsFromUser = await knex('meals')
        .where({
          user_id: request.user?.id,
        })
        .orderBy('date', 'desc')

      let totalMealsOnDiet = 0
      let totalMealsOffDiet = 0

      totalMealsFromUser.forEach((meal) => {
        if (meal.is_on_diet) {
          totalMealsOnDiet++
        } else {
          totalMealsOffDiet++
        }
      })

      return {
        totalMeals: totalMealsFromUser.length,
        totalMealsOnDiet,
        totalMealsOffDiet,
      }
    },
  )
}
