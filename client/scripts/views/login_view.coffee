BaseView   = require './base_view'
ServerView = require './server_view'

module.exports = class LoginView extends BaseView
  # Load the home template
  template: require './templates/login'
  
  # Bind events
  events:
    'keypress input' : 'login'
  
  # Render the element to the page
  render: ->
    $(document.body).html('').append @el
  
  # Attempt to log in to the server
  login: (event) ->
    # Only proceed if the user pressed enter (character code 13)
    return unless event.charCode is 13
    
    # Clear any previous errors
    @$('#message').text('');
    
    # Start the ring's spinning animation
    @$('input').blur().attr 'disabled', 'disabled'
    @$('#ring').css '-webkit-animation-play-state', 'running'
    
    # Collect the login data
    data =
      host     : @$('input[name="host"]').val()
      user     : @$('input[name="user"]').val()
      password : @$('input[name="password"]').val()
    
    # Add the socket callbacks
    global.socket.once 'success', @login_success.bind @
    global.socket.once 'error', @login_error.bind @
    
    # Emit the login event to the server
    global.socket.emit 'login', data
  
  # What to do after a successful login
  login_success: ->
    old_overflow = $('body').css 'overflow'
    
    new_view = new ServerView =>
      $(document.body).css 'overflow', 'hidden'
      @$('#ring').css '-webkit-animation-play-state', 'paused'
      @el.addClass 'leaving'
    
    @el.bind 'webkitAnimationEnd', =>
      $(document.body).css 'overflow', old_overflow
      global.router.navigate '/server'
      new_view.fade_in()
  
  # What to do after a login error
  login_error: (msg) ->
    @$('#ring').css '-webkit-animation-play-state', 'paused'
    @$('input').removeAttr 'disabled'
    @$('#message').text(msg).css 'top', - @$('#message').outerHeight()