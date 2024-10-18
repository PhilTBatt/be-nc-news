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
        .then(({body: {topics}}) => {
            expect(Array.isArray(topics)).toBe(true)
            expect(topics.length === 3).toBe(true)
            topics.forEach(topic => {
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

describe('GET /api/articles/:article_id', () => {
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
    it('GET: 200 - should return the correct comment_count for the article', () => {
        return request(app)
        .get('/api/articles/1')
        .expect(200)
        .then(({body: {article}}) => {
            expect(article.comment_count).toBe(11)
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

describe('PATCH /api/articles/:article_id', () => {
    it('PATCH: 200 - should update an article by article_id and return the updated article', () => {
        const voteUpdate = {inc_votes: 2}
        return request(app)
        .patch('/api/articles/1')
        .send(voteUpdate)
        .expect(200)
        .then(({body: {article}}) => {
            expect(article).toHaveProperty('article_id', 1)
            expect(article).toHaveProperty('votes', 102)
        })
    })

    it('PATCH: 400 - should return an error when given an invalid article_id', () => {
        const voteUpdate = {inc_votes: 1}
        return request(app)
        .patch('/api/articles/invalid_id')
        .send(voteUpdate)
        .expect(400)
        .then(({body}) => {
            expect(body).toEqual({msg: 'Invalid article_id'})
        })
    })

    it('PATCH: 400 - should return an error when given an invalid article_id', () => {
        const voteUpdate = {inc_votes: 'one'}
        return request(app)
        .patch('/api/articles/invalid_id')
        .send(voteUpdate)
        .expect(400)
        .then(({body}) => {
            expect(body).toEqual({msg: 'Invalid vote'})
        })
    })

    it('PATCH: 400 - should return an error when inc_votes is missing', () => {
        return request(app)
        .patch('/api/articles/1')
        .send({})
        .expect(400)
        .then(({body}) => {
            expect(body).toEqual({msg: 'Missing required fields'})
        })
    })

    it('PATCH: 404 - should return an error when given a valid but non-existent article_id', () => {
        const voteUpdate = {inc_votes: 1}
        return request(app)
        .patch('/api/articles/999')
        .send(voteUpdate)
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
        .then(({body: {articles}}) => {
            expect(Array.isArray(articles)).toBe(true)
            articles.forEach(article => {
                expect(article).toHaveProperty('author', expect.any(String))
                expect(article).toHaveProperty('title', expect.any(String))
                expect(article).toHaveProperty('article_id', expect.any(Number))
                expect(article).toHaveProperty('topic', expect.any(String))
                expect(article).toHaveProperty('created_at')
                expect(article).toHaveProperty('votes', expect.any(Number))
                expect(article).toHaveProperty('article_img_url', expect.any(String))
                expect(article).toHaveProperty('comment_count', expect.any(Number))
                expect(article).not.toHaveProperty('body')
            })
        })
    })

    it('GET: 200 - returns articles sorted by created_at (default) in descending order (default)', () => {
        return request(app).get('/api/articles')
        .expect(200)
        .then(({body: {articles}}) => {
            expect(Array.isArray(articles)).toBe(true)
            expect(articles).toBeSortedBy('created_at', {descending: true})
        })
    })

    it('GET: 200 - returns articles sorted by specified column', () => {
        return request(app).get('/api/articles?sort_by=article_id')
        .expect(200)
        .then(({body: {articles}}) => {
            expect(Array.isArray(articles)).toBe(true)
            expect(articles).toBeSortedBy('article_id', {descending: true})
    
            return request(app).get('/api/articles?sort_by=author')
        })
        .then(({body: {articles}}) => {
            expect(Array.isArray(articles)).toBe(true)
            expect(articles).toBeSortedBy('author', {descending: true})
        })
    })
    
    it('GET: 200 - returns articles sorted by specified column in ascending order', () => {
        return request(app).get('/api/articles?sort_by=article_id&order=ASC')
        .expect(200)
        .then(({body: {articles}}) => {
            expect(Array.isArray(articles)).toBe(true)
            expect(articles).toBeSortedBy('article_id', {descending: false})
    
            return request(app).get('/api/articles?sort_by=author&order=ASC')
        })
        .then(({body: {articles}}) => {
            expect(Array.isArray(articles)).toBe(true)
            expect(articles).toBeSortedBy('author', {descending: false})
        })
    })

    it('GET: 200 - should return articles filtered by topic', () => {
        return request(app)
        .get('/api/articles?topic=mitch')
        .expect(200)
        .then(({body: {articles}}) => {
            expect(Array.isArray(articles)).toBe(true)
            articles.forEach(article => {
                expect(article.topic).toBe('mitch')
            })
        })
    })

    it('GET: 200 - should respond with articles limited to the default of 10 when no limit is specified', () => {
        return request(app)
        .get('/api/articles')
        .expect(200)
        .then(({body: {articles, total_count}}) => {
            expect(Array.isArray(articles)).toBe(true)
            expect(articles).toHaveLength(10)
            expect(total_count).toBe(13)
        })
    })
    
    it('GET: 200 - should limit the number of responses based on the limit query', () => {
        return request(app)
        .get('/api/articles?limit=5')
        .expect(200)
        .then(({body: {articles, total_count}}) => {
            expect(Array.isArray(articles)).toBe(true)
            expect(articles).toHaveLength(5)
            expect(total_count).toBe(13)
        })
    })
    
    it('GET: 200 - should respond with articles from the correct page with the correct page length', () => {
        return request(app)
        .get('/api/articles?limit=5&p=2')
        .expect(200)
        .then(({body: {articles, total_count}}) => {
            expect(articles[0]).toEqual({"article_id": 5, "article_img_url": "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700", 
                "author": "rogersop", "comment_count": 2, "created_at": "2020-08-03T13:14:00.000Z", "title": "UNCOVERED: catspiracy to bring down democracy", "topic": "cats", "votes": 0})
            expect(Array.isArray(articles)).toBe(true)
            expect(articles).toHaveLength(5)
            expect(total_count).toBe(13)
        })
    })

    it('GET: 200 - should respond with articles from the correct page with the correct page length whilst being sorted, ordered and filtered', () => {
        return request(app)
        .get('/api/articles?sort_by=article_id&order=ASC&topic=mitch&limit=5&p=2')
        .expect(200)
        .then(({body: {articles, total_count}}) => {
            expect(articles[0]).toEqual({"article_id": 7, "article_img_url": "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700", 
                "author": "icellusedkars", "comment_count": 0, "created_at": "2020-01-07T14:08:00.000Z", "title": "Z", "topic": "mitch", "votes": 0})
            expect(Array.isArray(articles)).toBe(true)
            expect(articles).toBeSortedBy('article_id', {descending: false})
            expect(articles).toHaveLength(5)
            expect(total_count).toBe(12)
            articles.forEach(article => {
                expect(article.topic).toBe('mitch')
            })
        })
    })
    
    it('GET: 400 - should return an error when an invalid limit is provided', () => {
        return request(app)
        .get('/api/articles?limit=invalid')
        .expect(400)
        .then(({body}) => {
            expect(body.msg).toBe('Invalid limit query')
        })
    })
    
    it('GET: 400 - should return an error when an invalid page is provided', () => {
        return request(app)
        .get('/api/articles?p=invalid')
        .expect(400)
        .then(({body}) => {
            expect(body.msg).toBe('Invalid page query')
        })
    })

    it('GET: 400 - should return an error for an invalid sort_by column', () => {
        return request(app)
            .get('/api/articles?sort_by=invalid_column')
            .expect(400)
            .then(({body}) => {
                expect(body).toEqual({msg: 'Invalid sort_by query'})
            })
    })

    it('GET: 400 - should return an error for an invalid order value', () => {
        return request(app)
            .get('/api/articles?order=invalid_order')
            .expect(400)
            .then(({body}) => {
                expect(body).toEqual({msg: 'Invalid order query'})
            })
    })

    it('GET: 404 - should return an error for a non-existent topic', () => {
        return request(app)
        .get('/api/articles?topic=nonexistent_topic')
        .expect(404)
        .then(({body}) => {
            expect(body).toEqual({msg: 'Topic not found'})
        })
    })
})

describe('POST /api/articles', () => {
    it('POST: 201 - should add a new article and respond with the newly added article', () => {
        const newArticle = {author: 'butter_bridge', title: 'New Article Title',  body: 'This is the body of the new article.', topic: 'mitch',  article_img_url: 'https://example.com/image.jpg'}
        return request(app)
        .post('/api/articles')
        .send(newArticle)
        .expect(201)
        .then(({body: {article}}) => {
            expect(article).toHaveProperty('article_id')
            expect(article).toHaveProperty('author', 'butter_bridge')
            expect(article).toHaveProperty('title', 'New Article Title')
            expect(article).toHaveProperty('body', 'This is the body of the new article.')
            expect(article).toHaveProperty('topic', 'mitch')
            expect(article).toHaveProperty('article_img_url', 'https://example.com/image.jpg')
            expect(article).toHaveProperty('votes', 0)
            expect(article).toHaveProperty('created_at')
            expect(article).toHaveProperty('comment_count', 0)
        })
    })

    it('POST: 201 - should add a new article with a default article_img_url if not provided', () => {
        const newArticle = {author: 'butter_bridge', title: 'New Article Without Image', body: 'This is the body of the new article without an image.', topic: 'mitch'}
        return request(app)
        .post('/api/articles')
        .send(newArticle)
        .expect(201)
        .then(({body: {article}}) => {
            expect(article).toHaveProperty('article_id')
            expect(article).toHaveProperty('author', 'butter_bridge')
            expect(article).toHaveProperty('title', 'New Article Without Image')
            expect(article).toHaveProperty('body', 'This is the body of the new article without an image.')
            expect(article).toHaveProperty('topic', 'mitch')
            expect(article).toHaveProperty('article_img_url')
            expect(article).toHaveProperty('votes', 0)
            expect(article).toHaveProperty('created_at')
            expect(article).toHaveProperty('comment_count', 0)
        })
    })

    it('POST: 400 - should return an error when required fields are missing', () => {
        const incompleteArticle = {title: 'Incomplete Article'}
        return request(app)
        .post('/api/articles')
        .send(incompleteArticle)
        .expect(400)
        .then(({body}) => {
            expect(body).toEqual({msg: 'Missing required fields'})
        })
    })
})

describe('GET /api/articles/:article_id/comments', () => {
    it('GET: 200 - should return an array of comments for the given article_id', () => {
        return request(app)
        .get('/api/articles/1/comments')
        .expect(200)
        .then(({body: {comments}}) => {
            expect(comments).toBeInstanceOf(Array)
            expect(comments.length).toBe(10)
            comments.forEach(comment => {
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
        .then(({body: {comments}}) => {
            expect(comments).toEqual([])
        })
    })

    it('GET: 200 - should return the most recent comments first', () => {
        return request(app)
        .get('/api/articles/1/comments')
        .expect(200)
        .then(({body: {comments}}) => {
            expect(comments).toBeSortedBy('created_at', {descending: true})
        })
    })

    it('GET: 200 - should respond with comments limited to the default of 10 when no limit is specified', () => {
        return request(app)
        .get('/api/articles/1/comments')
        .expect(200)
        .then(({body: {comments}}) => {
            expect(comments[0]).toEqual({"article_id": 1, "author": "icellusedkars", "body": "I hate streaming noses", 
                "comment_id": 5, "created_at": "2020-11-03T21:00:00.000Z", "votes": 0})
            expect(comments).toBeInstanceOf(Array)
            expect(comments.length).toBe(10)
        })
    })

    it('GET: 200 - should return the correct number of comments based on the limit', () => {
        return request(app)
        .get('/api/articles/1/comments?limit=5')
        .expect(200)
        .then(({body: {comments}}) => {
            expect(comments[0]).toEqual({"article_id": 1, "author": "icellusedkars", "body": "I hate streaming noses", 
                "comment_id": 5, "created_at": "2020-11-03T21:00:00.000Z", "votes": 0})
            expect(comments).toBeInstanceOf(Array)
            expect(comments.length).toBe(5)
        })
    })

    it('GET: 200 - should return comments from the correct page when page is provided', () => {
        return request(app)
        .get('/api/articles/1/comments?limit=5&p=2')
        .expect(200)
        .then(({body: {comments}}) => {
            expect(comments).toBeInstanceOf(Array)
            expect(comments.length).toBe(5)
        })
    })

    it('GET: 400 - should return an error for an invalid limit query', () => {
        return request(app)
        .get('/api/articles/1/comments?limit=invalid_limit')
        .expect(400)
        .then(({body}) => {
            expect(body).toEqual({msg: 'Invalid limit query'})
        })
    })

    it('GET: 400 - should return an error for an invalid page query', () => {
        return request(app)
        .get('/api/articles/1/comments?p=invalid_page')
        .expect(400)
        .then(({body}) => {
            expect(body).toEqual({msg: 'Invalid page query'})
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

    it('POST: 400 - should respond with an error when given a invalid article_id', () => {
        const comment = {username: 'butter_bridge', body: 'body'}
        return request(app)
        .post('/api/articles/id/comments')
        .send(comment)
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

describe('DELETE /api/comments/:comment_id', () => {
    it('DELETE: 204 - should delete the comment by comment_id', () => {
        return request(app)
        .delete('/api/comments/1')
        .expect(204)
    })

    it('DELETE: 400 - should return an error for an invalid comment_id', () => {
        return request(app)
        .delete('/api/comments/invalid_id')
        .expect(400)
        .then(({body}) => {
            expect(body).toEqual({msg: 'Invalid comment_id'})
        })
    })

    it('DELETE: 404 - should return an error for a non-existent comment_id', () => {
        return request(app)
        .delete('/api/comments/999')
        .expect(404)
        .then(({body}) => {
            expect(body).toEqual({msg: 'Comment not found'})
        })
    })
})

describe('PATCH /api/comments/:comment_id', () => {
    it('PATCH: 200 - should update the votes on a comment given the comment_id and respond with the updated comment', () => {
        const voteUpdate = {inc_votes: 2}
        return request(app)
        .patch('/api/comments/1')
        .send(voteUpdate)
        .expect(200)
        .then(({body: {comment}}) => {
            expect(comment).toHaveProperty('comment_id', 1)
            expect(comment).toHaveProperty('votes', 18)
            expect(comment).toHaveProperty('body', expect.any(String))
            expect(comment).toHaveProperty('author', expect.any(String))
            expect(comment).toHaveProperty('created_at', expect.any(String))
            expect(comment).toHaveProperty('article_id', expect.any(Number))
        })
    })

    it('PATCH: 400 - should return an error when given an invalid comment_id', () => {
        const voteUpdate = {inc_votes: 1}
        return request(app)
        .patch('/api/comments/invalid_id')
        .send(voteUpdate)
        .expect(400)
        .then(({body}) => {
            expect(body).toEqual({msg: 'Invalid comment_id'})
        })
    })

    it('PATCH: 400 - should return an error when inc_votes is not a number', () => {
        const voteUpdate = {inc_votes: 'one'}
        return request(app)
        .patch('/api/comments/1')
        .send(voteUpdate)
        .expect(400)
        .then(({body}) => {
            expect(body).toEqual({msg: 'Invalid vote'})
        })
    })

    it('PATCH: 400 - should return an error when inc_votes is missing', () => {
        return request(app)
        .patch('/api/comments/1')
        .send({})
        .expect(400)
        .then(({body}) => {
            expect(body).toEqual({msg: 'Missing required fields'})
        })
    })

    it('PATCH: 404 - should return an error when given a valid but non-existent comment_id', () => {
        const voteUpdate = {inc_votes: 1}
        return request(app)
        .patch('/api/comments/999')
        .send(voteUpdate)
        .expect(404)
        .then(({body}) => {
            expect(body).toEqual({msg: 'Comment not found'})
        })
    })
})

describe('GET /api/users', () => {
    it('GET: 200 - should return an array of user objects', () => {
        return request(app)
        .get('/api/users')
        .expect(200)
        .then(({body}) => {
            expect(Array.isArray(body.users)).toBe(true)
            expect(body.users.length).toBe(4)
            body.users.forEach(user => {
                expect(user).toHaveProperty('username')
                expect(user).toHaveProperty('name')
                expect(user).toHaveProperty('avatar_url')
            })
        })
    })
})

describe('GET /api/users/:username', () => {
    test('200: should respond with the user object containing username, avatar_url, and name properties', () => {
        return request(app)
        .get('/api/users/butter_bridge')
        .expect(200)
        .then(({body: {user}}) => {
            expect(user).toHaveProperty('username')
            expect(user).toHaveProperty('name')
            expect(user).toHaveProperty('avatar_url')
        })
    })
  
    test('404: should respond with an error when username does not exist', () => {
        return request(app)
        .get('/api/users/non_existent_user')
        .expect(404)
        .then(({body}) => {
            expect(body).toEqual({msg: 'User not found'})
        })
    })
})