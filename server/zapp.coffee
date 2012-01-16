{MemoryStore} = require('express').session
{parseCookie} = require('connect').utils
{Session}     = require('connect').middleware.session
yamljs        = require 'yaml-js'
zappa         = require 'zappa'

# Instantiate the Zappa server
module.exports = zapp = zappa.app ->
  session_store = new MemoryStore()
  
  @set {
    # Use the `templates` directory for views (they're not the same as backbone views)
    'views': "#{__dirname}/templates"
    
    # Use Jade for templating
    'view engine': 'jade'
  }
  
  @use {
    # Use standard static serving in the client directory
    'static': "#{__dirname}/../client"
    
    # Use bodyParser to process POST bodies
    'bodyParser'
    
    # Use cookieParser to process cookie data
    'cookieParser'
    
    # Use session to process session data
    'session':
      key    : 'sid'
      secret : 'demhonours'
      store  : session_store
    
    # Attach a database client for each request
    'database'
  }
  
  # Reduce the log level to get rid of constant debugger messages
  @io.set 'log level', 2
  
  # Check the client has a valid session when authorizing a socket
  @io.set 'authorization', (data, accept) ->
    unless data.headers.cookie
      return accept 'No cookie transmitted', false
    
    data.cookie       = parseCookie data.headers.cookie
    data.sessionID    = data.cookie.sid
    data.sessionStore = session_store
    session_store.get data.sessionID, (err, session) ->
      unless session and not err
        return accept 'Error retrieving session', false
      
      data.session = new Session data, session
      accept null, true
  
  # Dispatches a request to the appropriate controller
  dispatch = ->
    try
      # Copy the `socket.handshake.session` object to `session` if this is a socket
      @session = @socket.handshake.session if @socket?
      
      # Initialise the controller with the request context object
      Controller = require "./controllers/#{@params.controller}_controller"
      controller = new Controller @
      
      # Execute the controller
      controller.execute()
    catch err
      console.log err.stack
  
  # Load the routes
  for verb, routes of require('./configs/routes').shift()
    for path, default_params of routes
      do (default_params) =>
        # Check there's a `controller` parameter somewhere
        unless default_params.controller? or path.match /:controller(?:\/|$)/
          throw new Error "no `controller` parameter for path `#{path}`"
        
        # Create the route
        route = {}
        route[path] = ->
          # Create `@params` if this is a socket callback
          @params = {} unless @params?
          
          # Copy the default parameters into the `params` object
          (@params[k] = v unless @params[k]?) for k, v of default_params
          
          # Dispatch this request
          dispatch.call @
        @[verb] route

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