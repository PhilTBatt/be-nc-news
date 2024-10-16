const { fetchArticleById } = require("../models/articles.models")
const { fetchArticleComments, insertArticleComment } = require("../models/comments.model")


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