import fastify from 'fastify'
import cookie from '@fastify/cookie'
import { usersRoutes } from './routes/users.routes'
import { mealsRoutes } from './routes/meals.routes'
import { adminRoutes } from './routes/admin.routes'

export const app = fastify()

app.register(cookie)

app.register(usersRoutes, { prefix: '/users' })
app.register(mealsRoutes, { prefix: '/meals' })
app.register(adminRoutes, { prefix: '/admin' })
