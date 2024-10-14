const db = require('../db/connection')
const { fetchArticleById } = require('../models/articles.models')

module.exports.getArticleById = (req, res, next) => {
    const id = req.params.article_id
    console.log(id)
    fetchArticleById(id)
    .then(article => res.status(200).send({Article: article}))
    .catch(err => next(err))
}