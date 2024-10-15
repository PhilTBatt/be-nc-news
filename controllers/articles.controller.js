const db = require('../db/connection')
const { fetchArticleById, fetchArticles } = require('../models/articles.models')

exports.getArticleById = (req, res, next) => {
    const id = req.params.article_id
    return fetchArticleById(id)
    .then(article => res.status(200).send({Article: article}))
    .catch(err => next(err))
}

exports.getArticles = (req, res, next) => {
    return fetchArticles()
    .then(articles  => res.status(200).send({Articles: articles}))
    .catch((err) => {
        console.log(err)
        return next(err)
    })
}