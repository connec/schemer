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
    'click .drop':   'drop_table'
    'click .rename': 'rename_table'
  
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
  
  ###
  Handles the dropping of a table.
  ###
  drop_table: ->
    $('#overlay').show().fadeTo 250, 0.5
    global.socket.request 'drop_table',
      database: @node.model.get('parent').get 'name'
      table:    @node.model.get 'name'
    , (err) =>
      $('#overlay').fadeTo 250, 0, -> $(@).hide()
      return console.log String err if err
      parent = @node.parent
      @toolbox.graph.tree.remove_node @node
      @toolbox.graph.node_click parent
  
  ###
  Handles the renaming of a table.
  ###
  rename_table: ->
    rename = (e) =>
      return if e.type is 'keypress' and e.which isnt 13
      
      new_name = $input.val().toLowerCase()
      if new_name == @node.model.get 'name'
        # Do nothing if the name hasn't changed
        @node.$label.text new_name
        return
      
      $input.val new_name
      $('#overlay').show().fadeTo 250, 0.5
      global.socket.request 'rename_table',
        database: @node.model.get('parent').get 'name'
        old_name: @node.model.get 'name'
        new_name: new_name
      , (err, table) =>
        $('#overlay').fadeTo 250, 0, -> $(@).hide()
        return console.log String err if err
        @node.model.set table
        @node.$label.text table.name
        @$('h1').text table.name
    
    @node.$label.html ''
    $input = $('<input/>')
      .attr(type: 'text', value: @node.model.get 'name')
      .appendTo(@node.$label)
      .focus()
      .select()
      .bind('blur', rename)
      .bind('keypress', rename)