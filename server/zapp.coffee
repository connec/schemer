yamljs = require 'yaml-js'
zappa  = require 'zappa'

# Instantiate the Zappa server
module.exports = zapp = zappa.app ->
  # Use the `templates` directory for views (they're not the same as backbone views)
  @set
    'views'       : "#{__dirname}/templates"
    'view engine' : 'jade'
  
  # Use standard static serving in the client directory
  @use
    'static' : "#{__dirname}/../client"
  
  # Dispatches a request to the appropriate controller
  dispatch = ->
    # Initialise the controller with the request context object
    Controller = require "./controllers/#{@params.controller}_controller"
    controller = new Controller @
    
    # Execute the controller
    controller.execute()
  
  # Load the routes
  for route, default_parameters of require('./configs/routes').shift()
    do (default_parameters) =>
      # Get the verb/route
      [verb, route] = route.split /\s/
      unless route?
        route = verb
        verb  = 'get'
      
      # Check there's a `controller` parameter somewhere
      unless default_parameters.controller? or route.match /:controller(?:\/|$)/
        throw new Error "no `controller` parameter for route #{route}"
      
      # Create the route in express
      @[verb] route, ->
        # Copy default parameters into the `params` object
        (@params[k] = v unless @params[k]?) for k, v of default_parameters
        
        # Dispatch this request
        dispatch.call @

# Attach a method to start the server
zapp.start = (port = 3000) ->
  @app.listen port
  console.log "Listening on port #{port}"

# Attach a method to stop the server
zapp.stop = (callback) ->
  # Attach the callback
  @app.on 'close', ->
    console.log "Server stopped"
    callback()
  
  console.log 'Stopping server...'
  @app.close()

# Start the server if this module's been called directly
zapp.start() if require.main == module