const { fetchEndpoints } = require("../models/api.model")

exports.getEndpoints = (req, res) => {
    return fetchEndpoints()
    .then(endpoints => res.status(200).send({endpoints}))
}