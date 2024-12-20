const { fetchArticleById } = require("../models/articles.models")
const { fetchArticleComments, insertArticleComment, removeComment, updateCommentVotes } = require("../models/comments.model")


exports.getArticleComments = (req, res, next) => {
    const {article_id} = req.params
    const {limit, p} = req.query
    return Promise.all([fetchArticleById(article_id), fetchArticleComments(article_id, limit, p)])
    .then(([article, comments]) => res.status(200).send({comments}))
    .catch(next)
}

exports.postArticleComment = (req, res, next) => {
    const {article_id} = req.params
    return insertArticleComment(article_id, req.body)
    .then(comment => res.status(201).send({comment}))
    .catch(err => next({...err, context: 'article'}))
}

exports.deleteComment = (req, res, next) => {
    const {comment_id} = req.params
    removeComment(comment_id)
    .then(() => res.status(204).send())
    .catch(err => next({...err, context: 'comment'}))
}

exports.patchCommentVotes = (req, res, next) => {
    const {comment_id} = req.params
    const vote = req.body.inc_votes
    return updateCommentVotes(comment_id, vote)
    .then(comment => res.status(200).send({comment}))
    .catch(err => next({...err, context: 'comment'}))
}