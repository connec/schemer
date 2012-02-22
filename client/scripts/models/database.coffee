NodeModel = require './node_model'
Table     = require './table'

###
A Database model represents a database in a server.
###
module.exports = class Database extends NodeModel
  
  ###
  The class of this model's children.
  ###
  @Child: Table