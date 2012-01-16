_        = global._
Backbone = global.Backbone
query    = require '../lib/query'

module.exports = class ServerView extends Backbone.View
  # Load the server template
  template: require './templates/server'
  
  # Construct the view
  constructor: ->
    # Create an element from the template
    @el = $(@template()).fadeTo 0, 0
    super
  
  # 'Initialize' the view after construction
  initialize: ->
    # Construct the server tree
    server =
      name     : 'host'
      id       : 'host'
      children : []
    query 'show databases', (err, results) =>
      throw err if err?
      
      async.forEachSeries results, (result, callback) ->
        database =
          name     : result.Database
          id       : "#{server.id}_#{result.Database}"
          children : []
        server.children.push database
        
        query 'show tables', database.name, (err, results) ->
          callback err if err?
          
          async.forEachSeries results, (result, callback) ->
            table =
              name     : result["Tables_in_#{database.name}"]
              id       : "#{database.id}_#{result["Tables_in_#{database.name}"]}"
              children : []
            database.children.push table
            
            query "describe #{table.name}", database.name, (err, results) ->
              callback err if err
              
              for result in results
                field =
                  name     : result.Field
                  id       : "#{table.id}_#{result.Field}"
                  children : []
                table.children.push field
              callback()
          , ->
            callback()
      , (err) =>
        throw err if err?
        global.server = server
        @render()
  
  # Render the element to the page
  render: ->
    $(document.body).html('').append @el.fadeTo 250, 1
    global.init()