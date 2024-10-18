const db = require('../db/connection')

exports.fetchArticleComments = (id, limit = 10, page = 1) => {
    if (isNaN(limit)) return Promise.reject({status: 400, msg: 'Invalid limit query'})
    if (isNaN(page)) return Promise.reject({status: 400, msg: 'Invalid page query'})
    return db.query('SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3', [id, limit, (page - 1) * limit])
    .then((comments) => comments.rows)
}

exports.insertArticleComment = (id, comment) => {
    const validKeys = ['username', 'body']
    const commentObjKeys = Object.keys(comment)
    
    if (typeof comment.username !== 'string' || typeof comment.body !== 'string' || commentObjKeys.length !== validKeys.length ||!commentObjKeys.every(key => validKeys.includes(key))) {
        return Promise.reject({status: 400, msg: 'Missing required fields'})
    }

    return db.query('INSERT INTO comments (body, votes, author, article_id) VALUES ($1, $2, $3, $4) RETURNING *',
        [comment.body, 0, comment.username, id])
    .then(comments => comments.rows[0])
}

exports.removeComment = (id) => {
    return db.query('DELETE FROM comments WHERE comment_id = $1', [id])
    .then(result => {
        if (result.rowCount === 0) {
            return Promise.reject({status: 404, msg: 'Comment not found'})
        }}
    )
}

exports.updateCommentVotes = (id, vote) => {
    if (!vote) {
        return Promise.reject({status: 400, msg: 'Missing required fields'})
    }
    if (isNaN(vote)) {
        return Promise.reject({status: 400, msg: 'Invalid vote'})
    }
    return db.query('UPDATE comments SET votes = votes + $1 WHERE comment_id = $2 RETURNING *', [vote, id])
    .then(comment => {
        if (comment.rows.length === 0) {
            throw {status: 404, msg: 'Comment not found' }
        }

        return comment.rows[0]
    })
}
