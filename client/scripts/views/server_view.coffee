$jit     = global.$jit
BaseView = require './base_view'
Server   = require '../models/server'

module.exports = class ServerView extends BaseView
  # Load the server template
  template: require './templates/server'
  
  # Construct the view
  constructor: (@on_loaded) ->
    super
  
  # Build the server tree for the visualisation
  initialize: ->
    global.server.fetch_children (err) =>
      return console.log String err if err
      @on_loaded()
  
  # Render the element to the page
  render: ->
    $('body').html('').append @el
    @render_graph()
  
  # Render the graph
  render_graph: ->
    # Create a div for measuring label names
    ruler = @$('#ruler')
    
    # Shorten a node's name inline with the node width
    set_label_text = (element, node) ->
      ruler.text node.name
      if (ratio = 140 / ruler.width()) < 1
        element.title       = node.name
        element.textContent = node.name.slice(0, Math.floor(ratio * node.name.length) - 3) + '...'
      else
        element.textContent = node.name
    
    # Create a spacetree visualisation
    tree = new $jit.ST
      # Setup the tree's properties
      injectInto    : 'graph'
      duration      : 500
      transition    : $jit.Trans.Quart.easeInOut
      levelDistance : 50
      levelsToShow  : 1
      Navigation :
        enable  : true
        panning : true
      
      # Properties for the edges
      Edge :
        type        : 'bezier'
        overridable : true
      
      # Properties for the nodes
      Node :
        width       : 150
        height      : 25
        type        : 'rectangle'
        color       : '#ccc'
        overridable : true
      
      # Set label contents/style when it is created
      onCreateLabel : (element, node) ->
        element.id = node.id
        set_label_text element, node
        
        style            = element.style
        style.width      = '150px'
        style.lineHeight = '30px'
        style.color      = '#333'
        style.cursor     = 'pointer'
        style.fontFamily = 'Lucida Console'
        style.fontSize   = '0.8em'
        style.textAlign  = 'center'
        
        element.onclick = ->
          # Get the actual node object in the graph
          tree_node = tree.graph.getNode node.id
          
          # Callback to trigger the graph's onClick event
          click = (on_complete) ->
            tree.onClick node.id, onComplete : ->
              # Remove any no-longer-visible subtrees
              tree_node.eachAdjacency (adjacency, node_id) ->
                # Don't remove parent nodes
                return if adjacency.nodeTo._depth < tree_node._depth
                
                # Don't waste time removing empty trees
                return if _.keys(adjacency.nodeTo.adjacencies).length is 1
                
                tree.removeSubtree node_id, false, 'replot'
              
              # Call the additional 'on_complete' if given
              on_complete?()
          
          # We want to remove siblings if we're moving deeper into the tree
          if node._depth > tree.clickedNode._depth
            # Collect the sibling of the selected node
            siblings = []
            parent   = tree_node.getParents()[0]
            parent?.eachAdjacency (adjacency, node_id) ->
              sibling = adjacency.nodeTo
              
              # Only interested in child nodes, and not the selected node
              return if sibling._depth < parent._depth or sibling.id == node.id
              siblings.push sibling.id
            
            # Remove the siblings from the graph
            tree.op.removeNode siblings,
              duration   : 250
              hideLabels : false
              type       : 'fade:con'
              onComplete : click
          
          # Else, we want to add in deleted nodes
          else
            click ->
              tree.addSubtree tree_node.model.get_graph_json(), 'animate',
                hideLabels : false
      
      # Dynamically load the appropriate nodes.
      request: (node_id, level, {onComplete}) ->
        # Make sure this is a 'legit' request
        console.log node_id
        return onComplete node_id if level is 0
        
        # The subtree is simply the node's associated model's children
        node  = tree.graph.getNode node_id
        model = node.model
        model.fetch_children (err) ->
          throw err if err
          onComplete node_id, model.get_graph_json()
      
      # Set node properties before they are drawn
      onBeforePlotNode : (node) =>
        # Find the model for this node
        node.model = global.server
        parts = node.id.split(/\//g)[1...]
        while parts.length
          node.model = node.model.get('children').find (child) ->
            child.get('name') == parts[0]
          parts.shift()
        
        if node.selected
          node.data.$color = '#aaa'
        else
          delete node.data.$color
      
      # Set edge properties before they are drawn
      onBeforePlotLine : (edge) ->
        if edge.nodeFrom.selected and edge.nodeTo.selected
          edge.data.$color     = '#aaa'
          edge.data.$lineWidth = 3
        else
          delete edge.data.$color
          delete edge.data.$lineWidth
    
    # Load the data
    tree.loadJSON global.server.get_graph_json()
    tree.compute()
    tree.onClick tree.root
    global.tree = tree