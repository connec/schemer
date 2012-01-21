GraphCollection = require './graph_collection'
Field           = require '../models/field'

###
The Databases collection contains the tables of a server.
###
module.exports = class Fields extends GraphCollection
  
  ###
  This collection is based on the Field model.
  ###
  model: Field