const { fetchUsers } = require("../models/users.model")

exports.getUsers = (req, res, next) => {
    return fetchUsers()
    .then(({rows}) => res.status(200).send({users: rows}))
}