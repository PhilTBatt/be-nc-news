const express = require('express')
const { getTopics } = require('./controllers/topics.controller')
const { getEndpoints } = require('./controllers/api.controller')
const { getArticleById } = require('./controllers/articles.controller')
const app = express()

app.get('/api/topics', getTopics)

app.get('/api', getEndpoints)

app.get('/api/articles/:article_id', getArticleById)

app.all('/*', (req, res) => {
    res.status(404).send({msg: 'Not found'})
})

app.use((err, req, res, next) => {
    if (err.status && err.msg) {
        res.status(err.status).send({msg: err.msg})
    }
    else {
        res.status(500).send({msg: 'Internal Server Error'})
    }
})

module.exports = app