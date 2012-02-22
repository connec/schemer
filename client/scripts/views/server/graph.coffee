Field       = require '../../models/field'
Server      = require '../../models/server'
Table       = require '../../models/table'
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
    # Construct the Tree representing the visualisation
    @tree = global.tree = new Tree @el
    @tree.bind 'node:click', @node_click.bind @
    
    # Load the server details
    
    socket.request 'get_server', (err, server) =>
      console.log err.stack if err
      
      # Prepare the root of the tree
      @tree.set_root new Server server
      @tree.set_centre @tree.root
      @tree.refresh()
      
      # Simulate a click on the root to display the database
      @node_click @tree.root
  
  ###
  Handler for clicks on nodes.
  ###
  node_click: (node) ->
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
    if direction is 'down'
      # Remove all siblings and centre the view on the node
      @tree.remove_node sibling for sibling in node.siblings() unless node instanceof Field
    else
      # Remove all grand-children
      ids = for child in node.children
        @tree.remove_node grandchild for grandchild in child.children[0..]
        child.id
    
    @tree.set_centre node
    @tree.animate()
    
    # Convenience callback for finishing a move
    finish_move = (node) =>
      # Rebind the click handler
      @tree.bind 'node:click', @node_click.bind @
      
      # Update the toolbox
      @toolbox.update node
    
    # After the animation add all the children to the visualisation
    @tree.bind_once 'anim:after', =>
      # Finish now unless this model has been loaded from the database and has children
      return finish_move node unless node.id and node.get 'children'
      @transition (done) =>
        node.get('children').fetch
          complete: done
          success: =>
            @tree.animate()
            @tree.bind_once 'anim:after', -> finish_move node
          error: (_, err) =>
            console.log err.stack
  
  ###
  Handles the dimming of the screen during a transition.
  ###
  transition: (callback) ->
    done = ->
      $('#overlay').fadeTo 250, 0, -> $(@).hide()
    $('#overlay').show().fadeTo 250, 0.5
    callback done
  
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