Field   = require '../../../models/field'
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
    for child in @node.children
      if (match = child.get('name').match(/new field \((\d+)\)/i)) and parseInt(match[1]) > i
        i = match[1]
    
    # Create the new child
    child = new Field
      name:    "new field (#{++i})"
      type:    'int'
      length:  11
      null:    false
      default: null
      ai:      false
      key:     false
    child.parent = @node
    child.$elem.addClass 'changed'
    
    # Add the node to the tree
    @node.get('children').add child
    @node.tree.animate()
    @node.tree.bind_once 'anim:after', =>
      @toolbox.graph.node_click child