const { fetchEndpoints } = require("../models/api.model")

exports.getEndpoints = (req, res) => {
    return fetchEndpoints()
    .then(endPoints => res.status(200).send({response: endPoints}))
}