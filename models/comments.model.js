const db = require('../db/connection')

exports.fetchArticleComments = (id) => {
    return db.query('SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC', [id])
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