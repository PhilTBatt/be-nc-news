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
                expect(topic).toHaveProperty('slug', expect.any(String))
                expect(topic).toHaveProperty('description', expect.any(String))
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
        .then(({body: {article}}) => {
            expect(article).toHaveProperty('author', expect.any(String))
            expect(article).toHaveProperty('title', expect.any(String))
            expect(article.article_id).toBe(1)
            expect(article).toHaveProperty('body', expect.any(String))
            expect(article).toHaveProperty('topic', expect.any(String))
            expect(article).toHaveProperty('created_at')
            expect(article).toHaveProperty('votes', expect.any(Number))
            expect(article).toHaveProperty('article_img_url', expect.any(String))
        })
    })

    it('GET: 400 - should return an error for an invalid article_id', () => {
        return request(app)
        .get('/api/articles/invalid_id')
        .expect(400)
        .then(({body}) => {
            expect(body).toEqual({ msg: 'Invalid article_id' })
        })
    })

    it('GET: 404 - should return an error for a valid but non-existent article_id', () => {
        return request(app)
        .get('/api/articles/99')
        .expect(404)
        .then(({body}) => {
            expect(body).toEqual({msg: 'Article not found'})
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
                expect(article).toHaveProperty('author', expect.any(String))
                expect(article).toHaveProperty('title', expect.any(String))
                expect(article).toHaveProperty('article_id', expect.any(Number))
                expect(article).toHaveProperty('topic', expect.any(String))
                expect(article).toHaveProperty('created_at')
                expect(article).toHaveProperty('votes', expect.any(Number))
                expect(article).toHaveProperty('article_img_url', expect.any(String))
                expect(article).toHaveProperty('comment_count', expect.any(String))
                expect(article).not.toHaveProperty('body')
            })
        })
    })

    it('GET: 200 - should return articles sorted by date in descending order', () => {
        return request(app)
        .get('/api/articles')
        .expect(200)
        .then(({body}) => {
            expect(body.articles).toBeSortedBy('created_at', {descending: true})
        })
    })
})

describe('GET /api/articles/:article_id/comments', () => {
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

    it('GET: 400 - should return an error for an invalid article_id', () => {
        return request(app)
        .get('/api/articles/invalid_id')
        .expect(400)
        .then(({body}) => {
            expect(body).toEqual({ msg: 'Invalid article_id' })
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

describe('POST /api/articles/:article_id/comments', () => {
    it('POST: 201 - should add a comment for the given article_id and respond with the posted comment', () => {
        const newComment = {username: 'butter_bridge', body: 'example'}
        return request(app)
        .post('/api/articles/1/comments')
        .send(newComment)
        .expect(201)
        .then(({body: {comment}}) => {
            expect(comment).toHaveProperty('comment_id')
            expect(comment).toHaveProperty('author', 'butter_bridge')
            expect(comment).toHaveProperty('body', 'example')
            expect(comment).toHaveProperty('article_id', 1)
            expect(comment).toHaveProperty('created_at')
            expect(comment).toHaveProperty('votes', 0)
        })
    })

    it('POST: 400 - should respond with an error when required fields are missing', () => {
        const incompleteComment = {username: 'butter_bridge'}
        return request(app)
        .post('/api/articles/1/comments')
        .send(incompleteComment)
        .expect(400)
        .then(({body}) => {
            expect(body).toEqual({msg: 'Missing required fields'})
        })
    })

    test('POST: 400 - should respond with an error when given a invalid article_id', () => {
        return request(app)
        .get('/api/articles/not-an-id/comments')
        .expect(400)
        .then(({body}) => {
            expect(body).toEqual({msg: 'Invalid article_id'})
        })
    })

    it('POST: 404 - should respond with an error when given a non-existent article_id', () => {
        const comment = {username: 'butter_bridge', body: 'body'}
        return request(app)
        .post('/api/articles/99/comments')
        .send(comment)
        .expect(404)
        .then(({body}) => {
            expect(body).toEqual({msg: 'Article not found'})
        })
    })

    it('POST: 404 - should respond with an error when given a non-existent username', () => {
        const comment = {username: 'nonexistent_user', body: 'body'}
        return request(app)
        .post('/api/articles/1/comments')
        .send(comment)
        .expect(404)
        .then(({body}) => {
            expect(body).toEqual({msg: 'User not found'})
        })
    })
})