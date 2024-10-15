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
            expect(body).toHaveProperty('topics')
            expect(Array.isArray(body.topics)).toBe(true)
            expect(body.topics.length === 3).toBe(true)
            body.topics.forEach(topic => {
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
        .then(({body}) => {
            expect(body).toEqual({endpoints})
        })
    })
})

describe('/api/articles/:article_id', () => {
    it('GET: 200 - should return an article object with the correct properties', () => {
        return request(app)
            .get('/api/articles/1')
            .expect(200)
            .then(({body}) => {
                expect(body.article).toHaveProperty('author')
                expect(body.article).toHaveProperty('title')
                expect(body.article.article_id).toBe(1)
                expect(body.article).toHaveProperty('body')
                expect(body.article).toHaveProperty('topic')
                expect(body.article).toHaveProperty('created_at')
                expect(body.article).toHaveProperty('votes')
                expect(body.article).toHaveProperty('article_img_url')
            })
    })

    it('GET: 404 - should return an error for a valid but non-existent article_id', () => {
        return request(app)
            .get('/api/articles/99')
            .expect(404)
            .then(({body}) => {
                expect(body).toEqual({ msg: 'Article not found' })
            })
    })

    it('GET: 400 - should return an error for an invalid article_id', () => {
        return request(app)
        .get('/api/articles/invalid_string')
        .expect(400)
        .then(({body}) => {
            expect(body).toEqual({ msg: 'Invalid article_id' })
        })
    })
})

describe('/api/articles', () => {
    it('GET: 200 - should return an array of article objects with the correct properties', () => {
        return request(app)
            .get('/api/articles')
            .expect(200)
            .then(({body}) => {
                expect(Array.isArray(body.articles)).toBe(true)
                body.articles.forEach(article => {
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
                expect(body.articles).toBeSortedBy('created_at', { descending: true })
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

describe('/api/articles/:article_id/comments', () => {
    it('GET: 200 - should return an array of comments for the given article_id', () => {
        return request(app)
        .get('/api/articles/1/comments')
        .expect(200)
        .then(({body}) => {
            expect(body.comments).toBeInstanceOf(Array)
            expect(body.comments.length).toBe(11)
            body.comments.forEach(comment => {
                expect(comment).toHaveProperty('comment_id')
                expect(comment).toHaveProperty('votes')
                expect(comment).toHaveProperty('created_at')
                expect(comment).toHaveProperty('author')
                expect(comment).toHaveProperty('body')
                expect(comment.article_id).toBe(1)
            })
        })
    })

    it('GET: 200 - should respond with an empty array when there are no comments for an article', () => {
        return request(app)
        .get('/api/articles/2/comments')
        .expect(200)
        .then(({body}) => {
            expect(body).toEqual({comments : []})
        })
    })

    it('GET: 200 - should return the most recent comments first', () => {
        return request(app)
        .get('/api/articles/1/comments')
        .expect(200)
        .then(({body}) => {
                expect(body.comments).toBeSortedBy('created_at', {descending: true})
        })
    })

    it('GET: 404 - should respond with an error for a valid but non-existent article_id', () => {
        return request(app)
            .get('/api/articles/999/comments')
            .expect(404)
            .then(({body}) => {
                expect(body).toEqual({msg: 'Article not found'})
            })
    })
})
