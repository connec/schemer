Backbone   = global.Backbone
io         = global.io
jQuery     = global.jQuery

LoginView  = require './views/login_view'
ServerView = require './views/server_view'

check_login = (callback) ->
  global.socket.once 'auth_response', (authorised) ->
    unless authorised
      return global.router.navigate '/login', true
    callback()
  global.socket.emit 'auth_test'

class Router extends Backbone.Router
  
  routes:
    ''        : 'home'
    '/login'  : 'login'
    '/server' : 'server'
  
  home: ->
    check_login -> global.router.navigate '/server', true
  
  login: ->
    view = new LoginView
    view.fade_in()
  
  server: ->
    check_login ->
      view = new ServerView ->
        view.fade_in()

jQuery =>
  global.socket = io.connect()
  global.router = new Router
  Backbone.history.start()