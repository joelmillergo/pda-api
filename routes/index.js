const user = require('./user')
const adv = require('./adv')
const task = require('./task')

const routes = user.concat(adv).concat(task);


module.exports = routes;