BaseView    = require './base_view'
Server      = require '../models/server'
ToolboxView = require './toolbox_view'

module.exports = class GraphView extends BaseView
  ###
  The template for this view.
  ###
  template: require './templates/server'
  
  ###
  Constructs the view.
  ###
  constructor: (@on_loaded) ->
    super
  
  ###
  Builds the server tree for the visualisation.
  ###
  initialize: ->
    global.server.fetch_children (err) =>
      return console.log String err if err
      @on_loaded()
  
  ###
  Renders the element to the page.
  ###
  render: ->
    $('body').html('').append @el
    @$ruler  = @$('#ruler')
    @toolbox = new ToolboxView @
    @render_graph()
  
  ###
  Setup and render the graph.
  ###
  render_graph: ->
    # Create a spacetree visualisation
    @tree = new Tree $('#graph')
    
    $(global).resize =>
      @tree.refresh()
    
    @tree.bind 'node:add', (node, context) =>
      # Attach the model represented by the node
      node.model ?= context?.model.children().find(name: node.$label.text()) ? global.server
      
      # Fix the label
      @set_label_text node.$label
      
      # Add a class if the node's model is not saved
      node.$elem.addClass 'unsaved' unless node.model.id
    
    @tree.bind 'node:remove', (node) ->
      # Remove the model property
      delete node.model
    
    @tree.bind 'node:click', @node_click
    
    # Initialise the root of the tree
    @tree.set_root global.server.get 'name'
    @tree.root.$elem.addClass 'in-path selected'
    @tree.set_centre @tree.root
    
    # Add the databases to the tree
    global.server.children().each (database) =>
      @tree.insert_node database.get('name'), @tree.root
    
    # Refresh the visualisation
    @tree.refresh(); global.tree = @tree
    @toolbox.update @tree.root
  
  ###
  Handler for clicks on nodes.
  ###
  node_click: (node) =>
    # Do nothing if this bode is already selected
    return if node.$elem.hasClass 'selected'
    
    # We're moving down if this node's parent is selected
    direction = if node.parent?.$elem.hasClass('selected') then 'down' else 'up'
    
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