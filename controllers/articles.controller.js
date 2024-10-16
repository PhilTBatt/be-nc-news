const db = require('../db/connection')
const { fetchArticleById, fetchArticles, fetchArticleComments, insertArticleComment } = require('../models/articles.models')

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
    return Promise.all([fetchArticleById(article_id), fetchArticleComments(article_id)])
    .then(([article, comments]) => res.status(200).send({comments}))
    .catch(next)
}

exports.postArticleComment = (req, res, next) => {
    const {article_id} = req.params
    return Promise.all([insertArticleComment(article_id, req.body), fetchArticleById(article_id)])
    .then(([comment, article]) => res.status(201).send({comment}))
    .catch(next)
}