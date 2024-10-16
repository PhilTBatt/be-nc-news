const { fetchArticleById, fetchArticles} = require('../models/articles.models')

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