{MemoryStore} = require('express').session
{parseCookie} = require('connect').utils
SocketRequest = require './socket_request'
{Session}     = require('connect').middleware.session
util          = require 'util'
zappa         = require 'zappa'

# Instantiate the Zappa server
module.exports = zapp = zappa.app ->
  # Specify the session store manually so we can access it in listeners
  session_store = new MemoryStore()
  
  @set {
    # Use Jade for templating
    'view engine': 'jade'
    
    # Change the 'views' dir to point to 'templates' to avoid confusion with
    # Backbone's views
    'views': "#{__dirname}/templates"
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
  }
  
  # Reduce the log level to get rid of constant debugger messages
  @io.set 'log level', 3
  
  # Check the client has a valid session when authorizing a socket
  @io.set 'authorization', (data, accept) ->
    # Check a cookie actually exists
    unless data.headers.cookie
      return accept new Error('No cookie transmitted'), false
    
    # Gather relevant session data
    data.cookie       = parseCookie data.headers.cookie
    data.sessionID    = data.cookie.sid
    data.sessionStore = session_store
    
    # Load the session
    session_store.get data.sessionID, (err, session) ->
      return accept new Error('Error retrieving session'), false if err
      
      data.session = new Session data, session
      accept null, true
  
  # Handles 'socket requests'
  @on request: ->
    console.log "   debug - received request #{util.inspect @data}"
    request = new SocketRequest @socket
    request.dispatch @data
  
  # The only HTTP response - renders the layout
  @get '/' : ->
    @render 'layout', layout: false

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