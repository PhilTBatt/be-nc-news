const request = require('supertest')
const app = require('../app')
const seed = require('../db/seeds/seed')
const data = require("../db/data/test-data/index")
const db = require('../db/connection')
const endpoints = require('../endpoints.json')
const jestSorted = require('jest-sorted')


beforeEach(() => seed(data))
afterAll(() => db.end())

describe('/api/*', () => {
    it('404 - should return an error when given an invalid route', () => {
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
            expect(body).toHaveProperty('Topics')
            expect(Array.isArray(body.Topics)).toBe(true)
            expect(body.Topics.length === 3).toBe(true)
            body.Topics.forEach(topic => {
                expect(topic).toHaveProperty('slug')
                expect(topic).toHaveProperty('description')
            })
        })
    })
})

describe('/api', () => {
    it('GET: 200 - should return a json representation of all the available endpoints', () => {
        return request(app)
        .get('/api')
        .expect(200)
        .then(({ body }) => {
            expect(body).toEqual({response: endpoints})
        })
    })
})

describe('/api/articles/:article_id', () => {
    it('GET: 200 - should return an article object with the correct properties', () => {
        return request(app)
            .get('/api/articles/1')
            .expect(200)
            .then(({ body }) => {
                expect(body.Article).toHaveProperty('author')
                expect(body.Article).toHaveProperty('title')
                expect(body.Article.article_id).toBe(1)
                expect(body.Article).toHaveProperty('body')
                expect(body.Article).toHaveProperty('topic')
                expect(body.Article).toHaveProperty('created_at')
                expect(body.Article).toHaveProperty('votes')
                expect(body.Article).toHaveProperty('article_img_url')
            })
    })

    it('GET: 404 - should return an error for an valid but non-existent article_id', () => {
        return request(app)
            .get('/api/articles/99')
            .expect(404)
            .then(({ body }) => {
                expect(body).toEqual({ msg: 'Article not found' })
            })
    })

    it('GET: 400 - should return an error for an invalid article_id)', () => {
        return request(app)
        .get('/api/articles/invalid_string')
        .expect(400)
        .then(({ body }) => {
            expect(body).toEqual({ msg: 'Invalid article_id' })
        })
        })
})

describe('/api/articles', () => {
    it('GET: 200 - should return an array of article objects with the correct properties', () => {
        return request(app)
            .get('/api/articles')
            .expect(200)
            .then(({ body }) => {
                expect(Array.isArray(body.Articles)).toBe(true)
                body.Articles.forEach(article => {
                    expect(article).toHaveProperty('author')
                    expect(article).toHaveProperty('title')
                    expect(article).toHaveProperty('article_id')
                    expect(article).toHaveProperty('topic')
                    expect(article).toHaveProperty('created_at')
                    expect(article).toHaveProperty('votes')
                    expect(article).toHaveProperty('article_img_url')
                    expect(article).toHaveProperty('comment_count')
                    expect(article).not.toHaveProperty('body')
                })
            })
    })

    it('GET: 200 - should return articles sorted by date in descending order', () => {
        return request(app)
            .get('/api/articles')
            .expect(200)
            .then(({body}) => {
                expect(body.Articles).toBeSortedBy('created_at', { descending: true })
            })
    })

    it('GET: 404 - should return an error when no articles are found', () => {
        return db.query('TRUNCATE TABLE articles, comments RESTART IDENTITY CASCADE') // Unsure on this but it allowed me to get no articles back the easiest
        .then(() => {
            return request(app)
            .get('/api/articles')
            .expect(404)
            .then(({body}) => {
                expect(body).toEqual({msg: 'No articles found'})
            })
        })
    })
})