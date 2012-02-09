Section = require './section'
Table   = require '../../../models/table'

module.exports = class DatabaseSection extends Section
  
  ###
  The template for this section.
  ###
  template: require '../../../templates/toolbox/database'
  
  ###
  Bind events.
  ###
  events:
    'click .add':    'add_child'
    'click .drop':   'drop_database'
    'click .rename': 'rename_database'
  
  ###
  Handles the creation of a new table.
  ###
  add_child: ->
    super database: @node.model.get 'name'
  
  ###
  Handles the dropping of a database.
  ###
  drop_database: ->
    $('#overlay').show().fadeTo 250, 0.5
    global.socket.request 'drop_database', {database: @node.model.get('name')}, (err) =>
      $('#overlay').fadeTo 250, 0, -> $(@).hide()
      return console.log String err if err
      parent = @node.parent
      @toolbox.graph.tree.remove_node @node
      @toolbox.graph.node_click parent
  
  ###
  Handles the renaming of a database.
  ###
  rename_database: ->
    rename = (e) =>
      return if e.type is 'keypress' and e.which isnt 13
      
      new_name = $input.val().toLowerCase()
      if new_name == @node.model.get 'name'
        # Do nothing if the name hasn't changed
        @node.$label.text new_name
        return
      
      $input.val new_name
      $('#overlay').show().fadeTo 250, 0.5
      global.socket.request 'rename_database',
        old_name: @node.model.get 'name'
        new_name: new_name
      , (err, database) =>
        $('#overlay').fadeTo 250, 0, -> $(@).hide()
        return console.log String err if err
        @node.model.set database
        @node.$label.text database.name
        @$('h1').text database.name
    
    @node.$label.html ''
    $input = $('<input/>')
      .attr(type: 'text', value: @node.model.get 'name')
      .appendTo(@node.$label)
      .focus()
      .select()
      .bind('blur', rename)
      .bind('keypress', rename)