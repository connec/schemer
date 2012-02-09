BaseView   = require '../base'
ServerView = require '../server'

module.exports = class LoginView extends BaseView
  # Load the home template
  template: require '../../templates/login'
  
  # Bind events
  events:
    'keypress input' : 'login'
  
  ###
  Initialise the view.
  ###
  initialize: ->
    # Cache some frequently used jQuery selections
    @$ring    = @$('#ring')
    @$message = @$('#message')
  
  # Attempt to log in to the server
  login: (event) ->
    # Only proceed if the user pressed enter
    return unless event.which is 13
    
    # Clear any previous errors
    @$message.text('')
    
    # Start the ring's spinning animation
    @$ring.css '-webkit-animation-play-state': 'running'
    @$('input').blur().attr disabled: 'disabled'
    
    # Collect the login data
    credentials =
      host:     @$('input[name="host"]').val()
      user:     @$('input[name="user"]').val()
      password: @$('input[name="password"]').val()
    
    # Make the socket request
    socket.request 'login', credentials, (err) =>
      if err
        # If there's an error, stop the animation and display it
        @$ring.animationPlayState 'paused'
        @$message.text(String err).css top: -@$('#message').outerHeight()
        @$('input').removeAttr 'disabled'
        return
      
      # Otherwise, trigger the leaving animation
      @$ring.animationPlayState 'paused'
      @el.addClass 'leaving'
      
      # Fade in the new view when the leaving animation ends
      @el.animationEnd =>
        @router.navigate ''
        new ServerView(@router).fade_in()