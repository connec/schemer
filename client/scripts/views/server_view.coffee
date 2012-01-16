$jit     = global.$jit
BaseView = require './base_view'
query    = require '../lib/query'

module.exports = class ServerView extends BaseView
  # Load the server template
  template: require './templates/server'
  
  # Construct the view
  constructor: (@on_loaded) ->
    super
  
  # 'Initialize' the view after construction
  initialize: ->
    # Construct the server tree
    server =
      name     : 'host'
      id       : 'host'
      data     : {}
      children : []
    
    query 'show databases', (err, results) =>
      throw err if err?
      async.forEachSeries results, (result, callback) ->
        database =
          name     : result.Database
          id       : "#{server.id}_#{result.Database}"
          data     : {}
          children : []
        server.children.push database
        
        query 'show tables', database.name, (err, results) ->
          callback err if err?
          async.forEachSeries results, (result, callback) ->
            table =
              name     : result["Tables_in_#{database.name}"]
              id       : "#{database.id}_#{result["Tables_in_#{database.name}"]}"
              data     : {}
              children : []
            database.children.push table
            
            query "describe #{table.name}", database.name, (err, results) ->
              callback err if err
              for result in results
                field =
                  name     : result.Field
                  id       : "#{table.id}_#{result.Field}"
                  data     : {}
                  children : []
                table.children.push field
              callback()
          , ->
            callback()
      , (err) =>
        throw err if err?
        global.server = server
        @on_loaded()
  
  # Render the element to the page
  render: ->
    $('body').html('').append @el
    @render_graph()
  
  # Render the graph
  render_graph: ->
    tree = new $jit.ST
      injectInto    : 'graph'
      duration      : 500
      transition    : $jit.Trans.Quart.easeInOut
      levelDistance : 50
      Navigation :
        enable  : true
        panning : true
      Node :
        width       : 150
        height      : 25
        type        : 'rectangle'
        color       : '#aaa'
        overridable : true
      Edge :
        type        : 'bezier'
        overridable : true
      onCreateLabel : (element, node) ->
        element.id = node.id
        element.innerHTML = node.name
        element.onclick = ->
          tree.onClick node.id
      onPlaceLabel : (element, node) ->
        style = element.style
        style.width      = '150px'
        style.lineHeight = '25px'
        style.color      = '#333'
        style.cursor     = 'pointer'
        style.fontSize   = '0.8em'
        style.textAlign  = 'center'
      onBeforePlotNode : (node) ->
        if node.selected
          node.data.$color = '#888'
        else
          delete node.data.$color
      onBeforePlotLine : (edge) ->
        if edge.nodeFrom.selected and edge.nodeTo.selected
          edge.data.$color     = '#888'
          edge.data.$lineWidth = 3
        else
          delete edge.data.$color
          delete edge.data.$lineWidth
    
    tree.loadJSON global.server
    tree.compute()
    tree.onClick tree.root