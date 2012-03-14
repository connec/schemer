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
      return on_error err if err
      
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
    # If the node is not open, select it and open it
    unless node.$elem.hasClass 'open'
      @node_select node
      @transition (done) =>
        async.series [
          (sync) =>
            # Animate the selection of the node
            @tree.bind_once 'anim:after', sync
            @tree.animate()
          (sync) ->
            # Open the node from the database
            node.open sync
          (sync) ->
            # Animate the opening of the node
            @tree.bind_once 'anim:after', sync
            @tree.animate()
        ], (err) ->
          on_error err if err
          done()
      return
    
    # If the node is not the root
    unless node == @tree.root
      # Close the node
      node.close()
      node.$elem.removeClass 'selected open'
      
      # Select the parent node if there is now no selected node
      @node_select node.parent if @tree.$wrapper.find('.selected').length is 0
      
      @transition (done) =>
        @tree.bind_once 'anim:after', =>
          # Need another check for selected nodes now that nodes have been
          # removed
          @node_select node.parent if @tree.$wrapper.find('.selected').length is 0
          @tree.bind_once 'anim:after', done
          @tree.animate()
        @tree.animate()
      return
    
    # Select the root, and clear all other open nodes
    @tree.$wrapper.find('.open').removeClass 'open'
    @node_select node
    child.close() for child in node.children
    @transition (done) =>
      @tree.bind_once 'anim:after', done
      @tree.animate()
  
  ###
  Selects the given node.
  ###
  node_select: (node) ->
    # Remove current selection
    @tree.$wrapper.find('.selected').each ->
      $(@).removeClass 'open' unless $(@).data('node').children.length > 0
      $(@).removeClass 'selected'
    
    # Apply the selection and centre the graph
    node.$elem.addClass 'selected open'
    @toolbox.update node
    @tree.set_centre node
  
  ###
  Handles the dimming of the screen during a transition.
  ###
  transition: (callback) ->
    done = =>
      $('#overlay').fadeTo 250, 0, =>
        @tree.bind 'node:click', @node_click.bind @
        $('#overlay').hide()
    @tree.unbind 'node:click'
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