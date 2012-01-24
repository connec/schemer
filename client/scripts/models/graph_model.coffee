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
      id       : "#{@get('parent')?.get('id') ? ''}/#{@get 'name'}"
      children : if @Children? then new @Children @ else null
  
  ###
  Loads this model's children from the database.
  ###
  fetch_children: (callback) ->
    children = @get 'children'
    return callback null, children unless children
    children.fetch
      error   : (_, err) -> callback err
      success : (collection) -> callback null, collection
  
  ###
  Returns a JIT compatible representation of this model and its children.
  ###
  get_graph_json: (depth = 1) ->
    children = @get 'children'
    {
      id       : @get 'id'
      name     : @get 'name'
      children : if depth and children?
          depth--
          children.map (child) ->
            child.get_graph_json depth
        else
          []
    }