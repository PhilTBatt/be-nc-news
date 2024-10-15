const express = require('express')
const { getTopics } = require('./controllers/topics.controller')
const { getEndpoints } = require('./controllers/api.controller')
const { getArticleById, getArticles, getArticleComments } = require('./controllers/articles.controller')
const app = express()

app.get('/api/topics', getTopics)

app.get('/api', getEndpoints)

app.get('/api/articles/:article_id', getArticleById)

app.get('/api/articles', getArticles)

app.get('/api/articles/:article_id/comments', getArticleComments)

app.all('/*', (req, res) => {
    res.status(404).send({msg: 'Not found'})
})

app.use((err, req, res, next) => {
    if (err.code === '22P02') {
        res.status(400).send({ msg: 'Invalid article_id' })
    }
    else if (err.code === '42703') {
        res.status(400).send({ msg: 'Invalid article_id' })
    }
    else if (err.status && err.msg) {
        res.status(err.status).send({msg: err.msg})
    }
    else {
        res.status(500).send({msg: 'Internal Server Error'})}
})

module.exports = app