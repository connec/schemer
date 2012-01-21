Database        = require '../models/database'
GraphCollection = require './graph_collection'

###
The Databases collection contains the tables of a server.
###
module.exports = class Databases extends GraphCollection
  
  ###
  This collection is based on the Database model.
  ###
  model: Database