LoginView = require './views/login_view'
GraphView = require './views/graph_view'
Server    = require './models/server'

###
The `socket_request` protocol provides an abstraction above typical send/receive
socket communications allowing convenient, unique request/response exchanges.
###
socket_request = (request, request_data, callback) ->
  [request_data, callback] = [null, request_data] unless callback
  
  data = {
    id: _.uniqueId 'request_'
    request
    request_data
  }
  
  @once "response_#{data.id}", ({err, result}) ->
    if err
      error = new Error
      error[k] = v for k, v of err
      return callback error
    return callback null, result
  
  @emit 'request', data

###
Convenience method - checks if the client is logged in, and executes the given
callback if so.  Otherwise, redirects to the login page.
###
check_login = (callback) ->
  # Send a check_login request over the socket
  global.socket.request 'check_login', (err, response) ->
    return console.log String err if err
    return global.router.navigate '/login', true unless response
    
    # Instantiate the server object if login was successful
    global.server = new Server name: response.host
    
    # Execute the success callback
    callback()

###
The Router class deals with mapping hash fragments to actions.
###
class Router extends Backbone.Router
  
  ###
  The routes to map.
  ###
  routes:
    '/'      : 'home'
    '/login' : 'login'
  
  ###
  The `home` action simply displays the server page if they are logged in, or
  the login page otherwise.
  ###
  home: ->
    check_login ->
      view = new GraphView ->
        view.fade_in()
  
  ###
  The `login` action creates and displays the login page.
  ###
  login: ->
    view = new LoginView
    view.fade_in()

###
Kick everything off once the DOM has loaded.
###
jQuery =>
  # Initialise key global objects
  global.socket = io.connect()
  global.router = new Router
  
  # Attach the socket_request method to the socket object
  global.socket.request = socket_request.bind global.socket
  
  # Make sure the hash is at least '/'
  if global.location.hash.length < 2
    global.location.hash = '#/'
  
  # Start tracking hash navigation events
  Backbone.history.start()