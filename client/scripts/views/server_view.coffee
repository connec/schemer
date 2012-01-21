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
    
    # Track the currently selected level in the tree
    current_level = 0
    
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
          return if node._depth == tree.clickedNode._depth
          
          # If we're moving deeper in the tree...
          if node._depth > tree.clickedNode._depth
            async.series [
              (finished) ->
                nodes = []
                tree.graph.eachNode (subnode) ->
                  return unless subnode._depth == node._depth and subnode.id != node.id
                  return unless tree.graph.getNode(subnode.id).getParents().length
                  return unless tree.graph.getNode(subnode.id).getParents()[0].selected
                  nodes.push subnode.id
                tree.op.removeNode nodes,
                  duration   : 250
                  hideLabels : false
                  type       : 'fade:con'
                  onComplete : -> finished()
              (finished) ->
                tree_node = tree.graph.getNode node.id
                children  = tree_node.model.get 'children'
                return finished() unless children? and children.length is 0
                tree_node.model.fetch_children (err, children) ->
                  return finished err if err
                  tree.addSubtree tree_node.model.get_graph_json(), 'animate',
                    hideLabels : false
                    onComplete : -> finished()
            ], (err) ->
              return console.log String err if err
              current_level = node._depth
              tree.onClick node.id
          # Else, we're moving backwards...
          else
            tree_node = tree.graph.getNode node.id
            tree.onClick node.id,
              onComplete: ->
                tree.addSubtree tree_node.model.get_graph_json(), 'animate',
                  hideLabels : false
      
      # Set node properties before they are drawn
      onBeforePlotNode : (node) =>
        # Find the model for this node
        node.model = global.server
        parts = node.id.split(/\//g)[2...]
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