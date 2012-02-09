Server      = require '../../models/server'
ToolboxView = require './toolbox'

module.exports = class GraphView extends Backbone.View
  ###
  Constructs the view.
  ###
  constructor: (@el) ->
    super()
  
  ###
  Builds the server tree for the visualisation.
  ###
  initialize: ->
    # Create a 'ruler' div for measuring labels
    @$ruler = $('<div/>').attr(id: 'ruler').appendTo @el
    
    # Construct the Tree representing the visualisation
    @tree = global.tree = new Tree @el
    @tree.bind 'node:add', @node_add.bind @
    @tree.bind 'node:click', @node_click.bind @
    @tree.bind 'node:remove', @node_remove.bind @
    
    # Load the server details
    socket.request 'get_server', (err, server) =>
      throw err if err
      
      # Prepare the root of the tree
      @tree.set_root server.name
      @tree.root.model = new Server server
      @tree.set_centre @tree.root
      @tree.refresh()
      
      # Simulate a click on the root to display the database
      @node_click @tree.root
  
  ###
  Called when a new node is added to the tree.
  ###
  node_add: (node, context) ->
    # Try and find the model represented by this node
    node.model ?= context?.model.children().find name: node.$label.text()
    
    # Adjust the label text so it fits in the node
    @set_label_text node.$label
  
  ###
  Called when a node is removed from the tree.
  ###
  node_remove: (node) ->
    # Remove the model property
    delete node.model
  
  ###
  Handler for clicks on nodes.
  ###
  node_click: (node) =>
    # Do nothing if this bode is already selected
    return if node.$elem.hasClass 'selected'
    
    # We're moving down if this node's parent is selected
    if parseInt(node.$elem.attr 'data-depth') < parseInt(@$('.selected').attr 'data-depth')
      direction = 'up'
    else
      direction = 'down'
    
    # Apply styles to the new selected node and its parents
    @tree.$wrapper.find('.in-path, .selected').removeClass 'in-path selected'
    node.$elem.addClass 'selected'
    path.$elem.addClass 'in-path' for path in [node].concat node.parents()
    
    # Remove the click handler until we're done animating
    @tree.unbind 'node:click', @node_click
    
    # Execute the methods for the direction we're moving in
    @["move_#{direction}"] node
  
  ###
  Updates the graph after a transition deeper into the graph.
  ###
  move_down: (node) ->
    # First, remove all siblings and centre the view on the node.
    unless node.model.constructor.name is 'Field'
      @tree.remove_node sibling for sibling in node.siblings()
    @tree.set_centre node
    @tree.animate()
    
    # After the animation, add all the new node's children
    @tree.bind_once 'anim:after', =>
      return @finish_move node unless node.model.id and node.model.children()
      @$('#overlay').show().fadeTo 250, 0.5
      node.model.fetch_children (err, children) =>
        @$('#overlay').fadeTo 250, 0, -> $(@).hide()
        return console.log String err if err
        children.each (child) =>
          @tree.insert_node child.get('name'), node
        @tree.animate()
        @tree.bind_once 'anim:after', => @finish_move node
  
  ###
  Updates the graph after a transition higher up the graph.
  ###
  move_up: (node) ->
    only_child = node.children[0]
    
    # First, remove all grand-children
    if only_child
      @tree.remove_node child for child in only_child.children[0..]
    @tree.set_centre node
    @tree.animate()
    
    # After the animation, add in all the direct children
    @tree.bind_once 'anim:after', =>
      @$('#overlay').show().fadeTo 250, 0.5
      node.model.fetch_children (err, children) =>
        @$('#overlay').fadeTo 250, 0, -> $(@).hide()
        return console.log String err if err
        children.each (child) =>
          return if child.get('name') == only_child?.model.get('name')
          @tree.insert_node child.get('name'), node
        node.children.sort (a, b)->
          return -1 if a.model.get('name') < b.model.get('name')
          return +1 if a.model.get('name') > b.model.get('name')
          return 0
        @tree.animate()
        @tree.bind_once 'anim:after', => @finish_move node
  
  ###
  Tidies up after a move has been completed.
  ###
  finish_move: (node) ->
    # Rebind the click handler
    @tree.bind 'node:click', @node_click
    
    # Update the toolbox
    @toolbox.update node
  
  ###
  Shorten a node's name inline with the node width.
  ###
  set_label_text: ($label) ->
    label = $label.text()
    @$ruler.text label
    if (ratio = 140 / @$ruler.width()) < 1
      $label.attr title: label
      $label.text label.slice(0, Math.floor(ratio * label.length) - 3) + '...'
    else
      $label.text label