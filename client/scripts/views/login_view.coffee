BaseView  = require './base_view'
GraphView = require './graph_view'
Server    = require '../models/server'

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
    @$('#message').text('')
    
    # Start the ring's spinning animation
    @$('input').blur().attr 'disabled', 'disabled'
    @$('#ring').css '-webkit-animation-play-state', 'running'
    
    # Collect the login data
    data =
      host     : @$('input[name="host"]').val()
      user     : @$('input[name="user"]').val()
      password : @$('input[name="password"]').val()
    
    # Make the socket request
    global.socket.request 'login', data, (err) =>
      if err
        # If there's an error, stop the animation and display it
        @$('#ring').css '-webkit-animation-play-state', 'paused'
        @$('input').removeAttr 'disabled'
        @$('#message').text(String err).css 'top', -@$('#message').outerHeight()
        return
      
      # Initialise the server object
      global.server = new Server name: data.host
      
      # Save the body's overflow property for later
      old_overflow = $('body').css 'overflow'
      
      # Instantiate the Server view, and set the on_loaded callback
      new_view = new GraphView =>
        # Stop the spinning and start the leaving animation
        $('body').css 'overflow', 'hidden'
        @$('#ring').css '-webkit-animation-play-state', 'paused'
        @el.addClass 'leaving'
      
      # Fade in the new view when the leaving animation ends
      @el.bind 'webkitAnimationEnd', =>
        $('body').css 'overflow', old_overflow
        global.router.navigate ''
        new_view.fade_in()