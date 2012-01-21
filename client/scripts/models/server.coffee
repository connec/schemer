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