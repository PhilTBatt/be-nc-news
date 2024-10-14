const request = require('supertest')
const app = require('../app')
const seed = require('../db/seeds/seed')
const data = require("../db/data/test-data/index")
const db = require('../db/connection')

beforeEach(() => seed(data))
afterAll(() => db.end())

describe('/api/*', () => {
    it('404 - returns an error when given an invalid route', () => {
        return request(app)
        .get('/api/invalid-route')
        .expect(404)
        .then(({body}) => {
            expect(body).toEqual({msg: 'Not found'})
        })
    })
})

describe('/api/topics', () => {
    it('GET: 200 - should return an array of topic objects with a slug and description', () => {
        return request(app)
        .get('/api/topics')
        .expect(200)
        .then(({body}) => {
            expect(Array.isArray(body)).toBe(true)
            body.forEach(topic => {
                expect(topic).toHaveProperty('slug')
                expect(topic).toHaveProperty('description')
            })
        })
    })
})
