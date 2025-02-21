import { app } from '../src/app'
import { execSync } from 'node:child_process'

import request from 'supertest'

describe('Meals routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a new meal', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({ name: 'John Doe', email: 'johndoe@gmail.com' })
      .expect(201)

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies as string[])
      .send({
        name: 'Café da manhã',
        description:
          'Panqueca de aveia com banana e mel + café preto sem açúcar',
        isOnDiet: true,
        date: new Date(),
      })
      .expect(201)
  })

  it('should be able to update a specific meal from an user', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'Nathan Baldez',
      email: 'nathanbsb2@hotmail.com',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies as string[])
      .send({
        name: 'Café da manhã',
        description:
          'Panqueca de aveia com banana e mel + café preto sem açúcar',
        isOnDiet: true,
        date: new Date(),
      })
      .expect(201)

    const mealsResponseBody = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies as string[])
      .expect(200)

    const mealId = mealsResponseBody.body.meals[0].id

    await request(app.server)
      .put(`/meals/${mealId}`)
      .set('Cookie', cookies as string[])
      .send({
        name: 'Desjejum',
        description:
          'Panqueca de Aveia com banana e mel + café preto sem açúcar',
        isOnDiet: true,
        date: new Date(),
      })
      .expect(204)
  })

  it('should be able to delete a specific meal from an user', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'Nathan Baldez',
      email: 'nathanbsb2@hotmail.com',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies as string[])
      .send({
        name: 'Café da manhã',
        description:
          'Panqueca de aveia com banana e mel + café preto sem açúcar',
        isOnDiet: true,
        date: new Date(),
      })
      .expect(201)

    const mealsResponseBody = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies as string[])
      .expect(200)

    const mealId = mealsResponseBody.body.meals[0].id

    await request(app.server)
      .delete(`/meals/${mealId}`)
      .set('Cookie', cookies as string[])
      .expect(204)
  })

  it('should be able to list all meals from an user', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'Nathan Baldez',
      email: 'nathanbsb2@hotmail.com',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies as string[])
      .send({
        name: 'Café da manhã',
        description:
          'Panqueca de aveia com banana e mel + café preto sem açúcar',
        isOnDiet: true,
        date: new Date(),
      })
      .expect(201)

    await request(app.server)
      .get('/meals')
      .set('Cookie', cookies as string[])
      .expect(200)
  })

  it('should be able to get a specific meal from an user', async () => {
    const createUserResponse = await request(app.server).post('/users').send({
      name: 'Nathan Baldez',
      email: 'nathanbsb2@hotmail.com',
    })

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies as string[])
      .send({
        name: 'Café da manhã',
        description:
          'Panqueca de aveia com banana e mel + café preto sem açúcar',
        isOnDiet: true,
        date: new Date(),
      })
      .expect(201)

    const mealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies as string[])
      .expect(200)

    const mealId = mealsResponse.body.meals[0].id

    const responseMeal = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookies as string[])
      .expect(200)

    expect(responseMeal.body).toEqual({
      meal: expect.objectContaining({
        name: 'Café da manhã',
        description:
          'Panqueca de aveia com banana e mel + café preto sem açúcar',
        is_on_diet: 1,
        date: expect.any(Number),
      }),
    })
  })
})
