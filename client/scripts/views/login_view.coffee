Backbone = global.Backbone

module.exports = class LoginView extends Backbone.View
  # Load the home template
  template: require './templates/login'
  
  # Bind events
  events:
    'keypress input' : 'login'
  
  # Construct the view
  constructor: ->
    # Create an element from the template
    @el = $(@template()).fadeTo 0, 0
    super
  
  # 'Initialize' the view after construction
  initialize: ->
    @render()
  
  # Render the element to the page
  render: ->
    $(document.body).html('').append @el.fadeTo 250, 1
  
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
    
    global.socket.once 'success', =>
      old_overflow = $(document.body).css 'overflow'
      $(document.body).css 'overflow', 'hidden'
      @$('#ring').css '-webkit-animation-play-state', 'paused'
      @el.bind 'webkitAnimationEnd', =>
        @el.remove()
        $(document.body).css 'overflow', old_overflow
        global.router.navigate '/server', true
      @el.addClass 'leaving'
    
    global.socket.once 'error', (msg) =>
      @$('#ring').css '-webkit-animation-play-state', 'paused'
      @$('input').removeAttr 'disabled'
      @$('#message').text(msg).css 'top', - @$('#message').outerHeight()
      
    global.socket.emit 'login', data