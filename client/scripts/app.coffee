LoginView  = require './views/login'
ServerView = require './views/server'

# Include extra jQuery compatbility plugins
require '../lib/compatibility'

# Include the Backbone.sync override
require '../lib/sync'

###
The `socket_request` protocol provides an abstraction above typical send/receive
socket communications allowing convenient, unique request/response exchanges.
###
socket_request = (request, request_data, callback = request_data) ->
  request_data = null if request_data == callback
  
  data =
    id:           _.uniqueId 'request_'
    request:      request
    request_data: request_data
  
  @once "response_#{data.id}", ({err, result}) ->
    return callback $.extend (new Error), err if err
    return callback null, result
  
  @emit 'request', data

###
The `on_error` function provides uniform error handling.
###
on_error = (err) ->
  console.log err.stack
  alert String err

###
The Router class deals with mapping hash fragments to actions.
###
class Router extends Backbone.Router
  
  ###
  The routes to map.
  ###
  routes:
    '/':      'home'
    '/login': 'login'
  
  ###
  The `home` action simply displays the server page if they are logged in, or
  the login page otherwise.
  ###
  home: ->
    socket.request 'check_login', (err, response) =>
      return on_error err if err
      return @navigate '/login', true unless response
      
      new ServerView(@).fade_in()
  
  ###
  The `login` action creates and displays the login page.
  ###
  login: ->
    new LoginView(@).fade_in()

###
Kick everything off once the DOM has loaded.
###
jQuery ->
  # Initialise key global objects
  global.on_error = on_error
  global.socket   = io.connect()
  
  # Attach the socket_request method to the socket object
  socket.request = socket_request.bind global.socket
  
  # Initialise the router object
  router = new Router
  
  # Make sure the hash is at least '/'
  location.hash = '#/' if location.hash.length < 2
  
  # Start tracking hash navigation events
  Backbone.history.start()