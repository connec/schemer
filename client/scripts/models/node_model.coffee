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
    @bind 'reset', @on_reset.bind @
  
  ###
  Gets the value by which to compare models in the collection.
  ###
  comparator: (model) ->
    model.get 'name'
  
  ###
  Called when a model is added to the collection.
  ###
  on_add: (model, collection, options) ->
    model.parent = @parent
    @parent.tree.insert_node model, @parent, options.index ? @indexOf model
  
  ###
  Called when the collection is reset.
  ###
  on_reset: ->
    skip = @parent.children.map (child) -> child.id
    @each (model, index) =>
      return if model.id in skip
      model.parent = @parent
      @parent.tree.insert_node model, @parent, index