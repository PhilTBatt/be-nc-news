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

exports.updateArticleVotes = (id, vote) => {
    if (!vote) {return Promise.reject({status: 400, msg: 'Missing required fields'})}
    if (isNaN(vote)) {return Promise.reject({status: 400, msg: 'Invalid vote'})}
    return db.query('UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING *', [vote, id])
    .then(article => article.rows[0])
}