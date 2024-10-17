const { fetchUsers, fetchUsersByName } = require("../models/users.model")

exports.getUsers = (req, res, next) => {
    return fetchUsers()
    .then(({rows}) => res.status(200).send({users: rows}))
}

exports.getUsersByName = (req, res, next) => {
    const username = req.params.username
    return fetchUsersByName(username)
    .then((user) => res.status(200).send({user}))
    .catch(next)
}