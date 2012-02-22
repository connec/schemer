NodeModel = require './node_model'

###
A Field model represents a field in a table.
###
module.exports = class Field extends NodeModel
  
  ###
  Extend the constructor to deal with visualising field attributes.
  ###
  constructor: ->
    super
    
    @$elem.addClass 'pk' if @get('key') is 'primary'
    
    @bind 'change:key', =>
      @$elem.addClass 'pk' if @get('key') is 'primary'