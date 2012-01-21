GraphModel = require './graph_model'
Tables     = require '../collections/tables'

###
A Database model represents a database in a server.
###
module.exports = class Database extends GraphModel
  
  ###
  Databases contain tables.
  ###
  Children: Tables