const usersRouter = require('express').Router()
const { getUsers, getUsersByName } = require('../controllers/users.controller')

usersRouter.get('/', getUsers)

usersRouter.get('/:username', getUsersByName)

module.exports = usersRouter