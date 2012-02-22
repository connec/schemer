Database  = require './database'
NodeModel = require './node_model'

###
A Server model represents a database server.
###
module.exports = class Server extends NodeModel
  
  ###
  The class of this model's children.
  ###
  @Child: Database