const express = require('express')
const cors = require('cors')

const app = express()

const apiRouter = require('./routes/api-router')

app.use(cors())
app.use(express.json())

app.use('/api', apiRouter)

app.all('/*', (req, res) => {
    res.status(404).send({msg: 'Not found'})
})

app.use((err, req, res, next) => {
    if (err.code === '22P02') {
        res.status(400).send({msg: `Invalid ${err.context}_id`})
    } else if (err.code === '23502') {
        res.status(400).send({msg: 'Missing required fields'})
    } else if (err.code === '23503' && err.constraint === 'comments_author_fkey') {
        res.status(404).send({msg: 'User not found'})
    } else if (err.code === '23503' && err.constraint === 'comments_article_id_fkey') {
        res.status(404).send({msg: 'Article not found'})
    } else if (err.status && err.msg) {
        res.status(err.status).send({msg: err.msg})
    } else {
        res.status(500).send({msg: 'Internal Server Error'})
    }
})

module.exports = app
