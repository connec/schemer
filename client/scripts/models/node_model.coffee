###
The NodeModel combines the functionalities of a Backbone.Model and a Tree.Node
to simplify the manipulation of a database-driven tree visualisation.
###
module.exports = class NodeModel extends Backbone.Model
  
  # Mix in Tree.Node
  @::[k] = v for k, v of Tree.Node::
  
  ###
  Initialise the NodeModel.
  ###
  constructor: (properties = {}) ->
    # Call the Model/Node constructors
    super properties
    Tree.Node.call @, @get 'name'
    
    # Bind model events
    @bind 'change:name', => @$label.text @get 'name'
    
    # Create a collection for children
    @set children: new Children @ if @constructor.Child
  
  ###
  Opens this node's subtree by aquiring children from the database.
  ###
  open: (callback) ->
    # If there are no children just execute the callback
    return callback?() unless @constructor.Child
    return @refresh callback
  
  ###
  Closes this node's subtree.
  ###
  close: ->
    # Do nothing if this node has no children
    return unless @constructor.Child
    
    # Otherwise, delete all the node's children
    @get('children').remove @children[0..]
  
  ###
  Refreshes this node's children, recursively.
  ###
  refresh: (callback) ->
    # Only refresh if this node is open
    return callback?() unless @$elem.hasClass 'open'
    
    @get('children').fetch
      add:     true
      error:   (_, err) -> callback? err
      success: =>
        async.forEach @children, (child, sync) ->
          child.refresh sync
        , ->
          callback?()
    return

###
The Children class represents the children of a NodeModel.
###
class Children extends Backbone.Collection
  
  ###
  Initialise the the children with the given parent.
  ###
  constructor: (@parent) ->
    super()
    @model = @parent.constructor.Child
    @bind 'add', @on_add.bind @
    @bind 'remove', @on_remove.bind @
  
  ###
  Extends Backbone.Collection::fetch with functionality to remove nodes that
  were not in the updated collection.
  ###
  fetch: (options) ->
    # Record the ids that exist before the update
    initial_ids    = {}
    initial_ids[k] = null for k of @_byId
    
    # Extend options.success to remove any not-updated (and therefore, not in
    # the database) models
    success         = options.success
    options.success = (_, updated) =>
      delete initial_ids[model.id] for model in updated
      @remove @_byId[id] for id of initial_ids
      success.apply null, arguments
    
    # Continue with the fetch
    super
  
  ###
  Gets the value by which to compare models in the collection.
  ###
  comparator: (model) ->
    model.get 'name'
  
  ###
  Alter `add` to skip models if it is already in the collection.
  ###
  add: (models) ->
    if Array.isArray models
      models = models.filter (model) => model.id not of @_byId
    else
      return if models.id of @_byId
    super
  
  ###
  Called when a model is added to the collection.
  ###
  on_add: (model, collection, options) ->
    model.parent = @parent
    @parent.tree.insert_node model, @parent, options.index ? @indexOf model
  
  ###
  Called when a model is removed from the collection.
  ###
  on_remove: (model) ->
    # Remove the model from the tree
    @parent.tree.remove_node model if model in @parent.children