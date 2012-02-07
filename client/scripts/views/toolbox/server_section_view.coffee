Database    = require '../../models/database'
SectionView = require './section_view'

module.exports = class ServerSectionView extends SectionView
  
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
    global.socket.request 'add_database', (err, name) =>
      $('#overlay').fadeTo 250, 0, -> $(@).hide()
      return console.log String err if err
      
      database    = new Database parent: @node.model, name: name
      database.id = true
      node        = new Tree.Node database.get 'name'
      node.model  = database
      @node.model.children().add database
      
      tree.insert_node node, @node
      @node.children.sort (a, b) ->
        return -1 if a.model.get('name') < b.model.get('name')
        return +1 if a.model.get('name') > b.model.get('name')
        return 0
      tree.animate()
      tree.bind_once 'anim:after', =>
        @toolbox.graph.node_click node