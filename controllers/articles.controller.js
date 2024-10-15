const db = require('../db/connection')
const { fetchArticleById, fetchArticles, fetchArticleComments } = require('../models/articles.models')

exports.getArticleById = (req, res, next) => {
    const id = req.params.article_id
    return fetchArticleById(id)
    .then(article => res.status(200).send({article}))
    .catch(next)
}

exports.getArticles = (req, res, next) => {
    return fetchArticles()
    .then(articles => res.status(200).send({articles}))
    .catch(next)
}

exports.getArticleComments = (req, res, next) => {
    const id = req.params.article_id
    fetchArticleById(id)
    .then(() => {
      return fetchArticleComments(id)
    })
    .then(comments => res.status(200).send({comments}))
    .catch(next)
}