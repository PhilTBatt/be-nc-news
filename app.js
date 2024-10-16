const express = require('express')
const { getTopics } = require('./controllers/topics.controller')
const { getEndpoints } = require('./controllers/api.controller')
const { getArticleById, getArticles, getArticleComments, postArticleComment } = require('./controllers/articles.controller')
const app = express()
app.use(express.json())

app.get('/api/topics', getTopics)

app.get('/api', getEndpoints)

app.get('/api/articles/:article_id', getArticleById)

app.get('/api/articles', getArticles)

app.get('/api/articles/:article_id/comments', getArticleComments)

app.post('/api/articles/:article_id/comments', postArticleComment)

app.all('/*', (req, res) => {
    res.status(404).send({msg: 'Not found'})
})

app.use((err, req, res, next) => {
    if (err.code === '22P02') {
        res.status(400).send({msg: 'Invalid article_id'})
    }
    else if (err.code === '23503' && err.constraint === 'comments_author_fkey') {
        res.status(404).send({msg: 'User not found'})
    }
    else if (err.code === '23503') {
        res.status(404).send({msg: 'Article not found'})
    }
    else if (err.code === '42703') {
        res.status(400).send({msg: 'Invalid article_id'})
    }
    else if (err.status && err.msg) {
        res.status(err.status).send({msg: err.msg})
    }
    else {
        res.status(500).send({msg: 'Internal Server Error'})}
})

module.exports = app