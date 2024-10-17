const articlesRouter = require('express').Router()
const { getArticleById, getArticles, patchArticleVotes } = require('../controllers/articles.controller')
const { getArticleComments, postArticleComment } = require('../controllers/comments.controller')

articlesRouter.get('/', getArticles)

articlesRouter.get('/:article_id', getArticleById)

articlesRouter.get('/:article_id/comments', getArticleComments)

articlesRouter.post('/:article_id/comments', postArticleComment)

articlesRouter.patch('/:article_id', patchArticleVotes)

module.exports = articlesRouter