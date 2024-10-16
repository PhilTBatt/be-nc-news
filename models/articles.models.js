const db = require('../db/connection')

exports.fetchArticleById = (id) => {
    return db.query('SELECT * FROM articles WHERE article_id = $1', [id])
    .then(article => {
        if (article.rows.length === 0) {
            return Promise.reject({status: 404, msg: 'Article not found'})
        }
        return article.rows[0]
    })
}

exports.fetchArticles = () => {
    return db.query(`SELECT articles.article_id, articles.title, articles.author, articles.topic, articles.created_at,
        articles.votes, articles.article_img_url, COUNT(comments.article_id) AS comment_count FROM articles LEFT JOIN comments
        ON comments.article_id = articles.article_id GROUP BY articles.article_id  ORDER BY articles.created_at DESC`)
    .then(articles => {
        return articles.rows
    })
}

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