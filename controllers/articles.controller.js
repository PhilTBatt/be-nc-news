const { fetchArticleById, fetchArticles, updateArticleVotes} = require('../models/articles.models')

exports.getArticleById = (req, res, next) => {
    const {article_id} = req.params
    return fetchArticleById(article_id)
    .then(article => res.status(200).send({article}))
    .catch(err => (next({...err, context: 'article'})))
}

exports.getArticles = (req, res, next) => {
    const {sort_by: sortBy, order, topic} = req.query
    return fetchArticles(sortBy, order, topic)
    .then(articles => res.status(200).send({articles}))
    .catch(next)
}

exports.patchArticleVotes = (req, res, next) => {
    const {article_id} = req.params
    const vote = req.body.inc_votes
    return Promise.all([fetchArticleById(article_id), updateArticleVotes(article_id, vote)])
    .then(([articleNo, article]) => res.status(200).send({article}))
    .catch(err => next({...err, context: 'article'}))
}