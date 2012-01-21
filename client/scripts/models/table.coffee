Fields     = require '../collections/fields'
GraphModel = require './graph_model'

###
A Database model represents a database in a server.
###
module.exports = class Table extends GraphModel
  
  ###
  Tables contain fields.
  ###
  Children: Fields