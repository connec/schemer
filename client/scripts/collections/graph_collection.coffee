###
A Graph collection contains methods for integrating with a JIT spacetree graph.
###
module.exports = class GraphCollection extends Backbone.Collection
  
  ###
  Initialise the collection.
  ###
  constructor: (@parent) ->
    super null
  
  ###
  Get the name of the model for comparisons.
  ###
  comparator: (model) ->
    model.get 'name'
  
  ###
  Fetches models from the server.
  ###
  fetch: ({error, success}) ->
    data = {}
    switch @model.name
      when 'Field'
        data.database = @parent.get('parent').get 'name'
        data.table    = @parent.get 'name'
      when 'Table'
        data.database = @parent.get 'name'
    
    global.socket.request "get_#{@constructor.name.toLowerCase()}", data, (err, models) =>
      return error null, err if err
      
      # Add the models
      model.parent = @parent for model in models
      @add models
      
      # Invoke the `success` callback
      success @, null