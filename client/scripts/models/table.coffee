Field     = require './field'
NodeModel = require './node_model'

###
A Database model represents a database in a server.
###
module.exports = class Table extends NodeModel
  
  ###
  The class of this model's children.
  ###
  @Child: Field
  
  ###
  Extend the constructor to disable child ordering.
  ###
  constructor: ->
    super
    @get('children').comparator = null