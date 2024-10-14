const express = require('express')
const { getTopics } = require('./controllers/topics.controller')
const app = express()

app.get('/api/topics', getTopics)

app.all('/*', (req, res) => {
    res.status(404).send({msg: 'Not found'})
})

app.use((err, req, res, next) => {
    res.status(500).send({msg: 'Internal Server Error'})
})

module.exports = app