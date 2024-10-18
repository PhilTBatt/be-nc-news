const db = require('../db/connection')

exports.fetchArticleById = (id) => {
    return db.query(`SELECT articles.article_id, articles.title, articles.author, articles.topic, articles.body, articles.created_at, 
        articles.votes, articles.article_img_url, COUNT(comments.article_id)::int AS comment_count FROM articles 
        LEFT JOIN comments ON comments.article_id = articles.article_id WHERE articles.article_id = $1 GROUP BY articles.article_id`, [id])
    .then(article => {
        if (article.rows.length === 0) {
            return Promise.reject({status: 404, msg: 'Article not found'})
        }
        return article.rows[0]
    })
}

exports.fetchArticles = (sortBy = 'created_at', order = 'DESC', topic, limit = 10, page = 1) => {
    const validColumns = ['article_id', 'title', 'author', 'topic', 'created_at', 'votes', 'article_img_url', 'comment_count']
    const validOrders = ['ASC', 'DESC']

    if (!validColumns.includes(sortBy)) return Promise.reject({status: 400, msg: 'Invalid sort_by query'})
    if (!validOrders.includes(order)) return Promise.reject({status: 400, msg: 'Invalid order query'})
    if (isNaN(limit)) return Promise.reject({status: 400, msg: 'Invalid limit query'})
    if (isNaN(page)) return Promise.reject({status: 400, msg: 'Invalid page query'})

    let query = `SELECT articles.article_id, articles.title, articles.author, articles.topic, articles.created_at,
    articles.votes, articles.article_img_url, COUNT(comments.article_id)::int AS comment_count FROM articles LEFT JOIN comments
    ON comments.article_id = articles.article_id`
    const params = []
    
    if (topic) {
        query += ` WHERE topic = $1`
        params.push(topic)
    }
    
    query += ` GROUP BY articles.article_id  ORDER BY ${sortBy} ${order} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(limit, (page - 1) * limit)
    
    return db.query(query, params)
    .then(articles => {
        if (articles.rows.length === 0 && topic) {
            return Promise.reject({status: 404, msg: 'Topic not found'})
        }
        const countQuery = `SELECT COUNT(*) AS total_count FROM articles` + (topic ? ` WHERE topic = $1` : '')
        const countParams = topic ? [topic] : []
        return Promise.all([articles.rows, db.query(countQuery, countParams)])
    })
}

exports.updateArticleVotes = (id, vote) => {
    if (!vote) {
        return Promise.reject({status: 400, msg: 'Missing required fields'})
    }
    if (isNaN(vote)) {
        return Promise.reject({status: 400, msg: 'Invalid vote'})
    }
    return db.query('UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING *', [vote, id])
    .then(article => article.rows[0])
}

exports.insertArticle = (article) => {
    const {author, title, body, topic, article_img_url} = article
    return db.query('INSERT INTO articles (author, title, body, topic, article_img_url, votes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *, 0 AS comment_count', 
        [author, title, body, topic, article_img_url || 'placeholder.img', 0])
    .then(article => article.rows[0])
}