Section = require './section'

module.exports = class TableSection extends Section
  
  ###
  The template for this section.
  ###
  template: require '../../../templates/toolbox/table'
  
  ###
  Bind events.
  ###
  events:
    'click .add':    'add_child'
    'click .drop':   'drop'
    'click .rename': 'rename'
  
  ###
  Adds a child node (Field) to this node.
  ###
  add_child: ->
    # Find the first free 'new field (i)'
    i = 0
    for {model} in @node.children
      if (match = model.get('name').match(/new field \((\d+)\)/i)) and parseInt(match[1]) > i
        i = match[1]
    
    # Create the new child
    child      = new Field name: "new field (#{++i})"
    node       = new Tree.Node child.get 'name'
    node.model = child
    @node.model.children().add child
    
    # Add the node to the tree
    tree = @toolbox.graph.tree
    tree.insert_node node, @node
    tree.animate()
    tree.bind_once 'anim:after', =>
      @toolbox.graph.node_click node