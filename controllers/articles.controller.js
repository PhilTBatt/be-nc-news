const db = require('../db/connection')
const { fetchArticleById, fetchArticles, fetchArticleComments } = require('../models/articles.models')

exports.getArticleById = (req, res, next) => {
    const {article_id} = req.params
    return fetchArticleById(article_id)
    .then(article => res.status(200).send({article}))
    .catch(next)
}

exports.getArticles = (req, res, next) => {
    return fetchArticles()
    .then(articles => res.status(200).send({articles}))
    .catch(next)
}

exports.getArticleComments = (req, res, next) => {
    const {article_id} = req.params
    Promise.all([fetchArticleById(article_id), fetchArticleComments(article_id)])
    .then(([article, comments]) => res.status(200).send({comments}))
    .catch(next)
}