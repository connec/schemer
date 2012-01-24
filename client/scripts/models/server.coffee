Databases  = require '../collections/databases'
GraphModel = require './graph_model'

###
A Server model represents a database server.
###
module.exports = class Server extends GraphModel
  
  ###
  Servers contain databases.
  ###
  Children: Databases
  
  ###
  Initialize the model.
  ###
  constructor: ->
    super
    @set
      id      : true
      node_id : @get 'name'