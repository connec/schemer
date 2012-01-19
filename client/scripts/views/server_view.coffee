$jit     = global.$jit
BaseView = require './base_view'
query    = require '../lib/query'

module.exports = class ServerView extends BaseView
  # Load the server template
  template: require './templates/server'
  
  # Construct the view
  constructor: (@on_loaded) ->
    super
  
  # Build the server tree for the visualisation
  initialize: ->
    @server =
      name     : 'host'
      id       : 'host'
      data     : {}
      children : []
    
    # Get the databases on the server
    query 'show databases', (err, results) =>
      return console.log String err if err?
      async.forEachSeries results, (result, next_database) =>
        database =
          name     : result.Database
          id       : "#{@server.id}_#{result.Database}"
          data     : {}
          children : []
        @server.children.push database
        
        # Get the tables in the database
        query 'show tables', database.name, (err, results) ->
          return next_database err if err?
          async.forEachSeries results, (result, next_table) ->
            table =
              name     : result["Tables_in_#{database.name}"]
              id       : "#{database.id}_#{result["Tables_in_#{database.name}"]}"
              data     : {}
              children : []
            database.children.push table
            
            # Get the fields in the table
            query "describe #{table.name}", database.name, (err, results) ->
              return next_table err if err
              for result in results
                field =
                  name     : result.Field
                  id       : "#{table.id}_#{result.Field}"
                  data     : {}
                  children : []
                table.children.push field
              next_table()
          , ->
            next_database()
      , (err) =>
        return console.log String err if err?
        @on_loaded()
  
  # Render the element to the page
  render: ->
    $('body').html('').append @el
    @render_graph()
  
  # Render the graph
  render_graph: ->
    # Create a div for measuring label names
    div = $('<div></div>').css(
      position   : 'absolute'
      left       : -1000
      fontFamily : 'Lucida Console'
      fontSize   : '0.8em'
    ).prependTo 'body';
    
    # Shorten a node's name inline with the node width
    set_label_text = (element, node) ->
      div.text node.name
      if (ratio = 140 / div.width()) < 1
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
          nodes = []
          tree_node = tree.graph.getNode node.id
          tree.graph.eachNode (subnode) ->
            return unless subnode._depth == node._depth and subnode.id != node.id
            return unless tree.graph.getNode(subnode.id).getParents().length
            return unless tree.graph.getNode(subnode.id).getParents()[0].selected
            nodes.push subnode.id
          
          tree.op.removeNode nodes,
            duration   : 250
            hideLabels : false
            type       : 'fade:con'
          tree.onClick node.id
      
      # Set node properties before they are drawn
      onBeforePlotNode : (node) ->
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
    tree.loadJSON @server
    tree.compute()
    tree.onClick tree.root
    global.tree = tree
    
    # Remove the measuring div
    div.remove()