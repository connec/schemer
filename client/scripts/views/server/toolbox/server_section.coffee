Database = require '../../../models/database'
Section  = require './section'

module.exports = class ServerSection extends Section
  
  ###
  The template for this section.
  ###
  template: require '../templates/toolbox/server'
  
  ###
  Bind events.
  ###
  events:
    'click .add': 'add_database'
  
  ###
  Adds a database to the visualisation.
  ###
  add_database: ->
    $('#overlay').show().fadeTo 250, 0.5
    socket.request 'add_database', (err, database) =>
      $('#overlay').fadeTo 250, 0, -> $(@).hide()
      return console.log String err if err
      
      database   = new Database $.extend {}, database, parent: @node.model
      node       = new Tree.Node database.get 'name'
      node.model = database
      @node.model.children().add database
      
      tree = @toolbox.graph.tree
      tree.insert_node node, @node
      @node.children.sort (a, b) ->
        return -1 if a.model.get('name') < b.model.get('name')
        return +1 if a.model.get('name') > b.model.get('name')
        return 0
      tree.animate()
      tree.bind_once 'anim:after', =>
        @toolbox.graph.node_click node