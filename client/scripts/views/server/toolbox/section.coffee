module.exports = class Section extends Backbone.View
  
  ###
  Construct the view.
  ###
  constructor: (@toolbox, @node) ->
    @el = $ @template name: @node.model.get 'name'
    super()
  
  ###
  Renders the section.
  ###
  render: ->
    return @el
  
  ###
  Handles the creation of a child for this node.
  ###
  add_child: (request_args) ->
    Child = @node.model.constructor::Children::model
    
    $('#overlay').show().fadeTo 250, 0.5
    socket.request "add_#{Child.name.toLowerCase()}", request_args, (err, attributes) =>
      $('#overlay').fadeTo 250, 0, -> $(@).hide()
      return console.log String err if err
      
      child      = new Child $.extend {}, attributes, parent: @node.model
      node       = new Tree.Node child.get 'name'
      node.model = child
      @node.model.children().add child
      
      tree = @toolbox.graph.tree
      tree.insert_node node, @node
      @toolbox.graph.sort_children @node
      tree.animate()
      tree.bind_once 'anim:after', =>
        @toolbox.graph.node_click node