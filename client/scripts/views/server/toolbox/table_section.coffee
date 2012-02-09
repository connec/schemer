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
    #'click .add':    'add_field'
    'click .drop':   'drop_table'
    'click .rename': 'rename_table'
  
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