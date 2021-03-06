Database    = require '../../models/database'
Field       = require '../../models/field'
Server      = require '../../models/server'
Table       = require '../../models/table'
ToolboxView = require './toolbox'

module.exports = class GraphView extends Backbone.View
  
  ###
  Constructs the view.
  ###
  constructor: (@server_view, @el) ->
    super()
  
  ###
  Builds the server tree for the visualisation.
  ###
  initialize: ->
    # Construct the Tree representing the visualisation
    @tree = global.tree = new Tree @el
    @tree.bind 'node:click', @node_click.bind @
    @tree.bind 'node:add', ({$label}) => @server_view.truncate $label
    
    # Load the server details
    socket.request 'get_server', (err, server) =>
      return on_error err if err
      
      # Prepare the root of the tree
      @tree.set_root new Server server
      @tree.set_centre @tree.root
      @tree.refresh()
      
      # Set up panning
      @setup_panning()
      
      # Simulate a click on the root to display the databases
      @node_click @tree.root
  
  ###
  Enables panning of the graph.
  ###
  setup_panning: ->
    start_mouse = start_graph = false
    
    @el.mousemove (e) =>
      return unless start_mouse or start_graph
      @tree.$wrapper.css
        left: start_graph.x - start_mouse.x + e.clientX
        top:  start_graph.y - start_mouse.y + e.clientY
      
      # This is a little hacky... invalidate the tree's previous style to force
      # the next animation to occur in order to allow recentreing
      @tree.previous_styles = '{}'
    
    @el.mousedown (e) =>
      return unless $(e.target).is @el
      start_mouse = x: e.clientX, y: e.clientY
      start_graph = x: @tree.$wrapper.position().left, y: @tree.$wrapper.position().top
      @tree.$wrapper.css
        left:   start_graph.x
        top:    start_graph.y
        right:  'auto'
    
    @el.mouseup =>
      start_mouse = start_graph = false
      @tree.$wrapper.css
        left: 'auto'
        right: @el.width() - @tree.$wrapper.width() - @tree.$wrapper.position().left
  
  ###
  Handler for clicks on nodes.
  ###
  node_click: (node, callback) ->
    # If the node is not open, select it and open it
    unless node.$elem.hasClass 'open'
      @node_select node
      @server_view.transition (done) =>
        async.series [
          (sync) =>
            # Animate the selection of the node
            if node instanceof Database
              node.parent.get('children').remove sibling for sibling in node.siblings()
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
          callback?()
          done()
      return
    
    # If the node is not the root
    unless node == @tree.root
      if node.$elem.is '.selected'
        # If the parent is the root, perform a click on the root instead
        return @node_click node.parent, callback if node.parent == @tree.root
        
        # Close the node, and select the parent
        node.close()
        node.$elem.removeClass 'selected open'
        @node_select node.parent
      else
        # Node must be open, just select it
        @node_select node
      
      @server_view.transition (done) =>
        @tree.bind_once 'anim:after', =>
          callback?()
          done()
        @tree.animate()
      
      return
    
    # Select the root, and clear all other open nodes
    @tree.$wrapper.find('.open, .selected').removeClass 'open selected'
    @node_select node
    child.close() for child in node.children
    @server_view.transition (done) =>
      node.refresh =>
        @tree.bind_once 'anim:after', ->
          callback?()
          done()
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
    @server_view.toolbox.update node
    @tree.set_centre node