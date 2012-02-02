###
A Graph model contains methods for integrating with a JIT spacetree graph.
###
module.exports = class GraphModel extends Backbone.Model
  
  ###
  Initialise the model.
  ###
  constructor: ->
    super
    @set
      node_id  : "#{@get('parent')?.get('node_id') ? ''}/#{@get 'name'}"
      children : if @Children? then new @Children @ else null
  
  children: ->
    @get 'children'
  
  ###
  Loads this model's children from the database.
  ###
  fetch_children: (callback) ->
    return callback() unless children = @get 'children'
    children.reset()
    children.fetch
      error   : (_, err) -> callback err
      success : (collection) -> callback null, collection