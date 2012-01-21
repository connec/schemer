GraphCollection = require './graph_collection'
Table           = require '../models/table'

###
The Databases collection contains the tables of a server.
###
module.exports = class Tables extends GraphCollection
  
  ###
  This collection is based on the Table model.
  ###
  model: Table