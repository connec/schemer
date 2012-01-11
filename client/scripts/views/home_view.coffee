backbone = require '../vendor/backbone'

class @HomeView extends backbone.View
  el: $(require('./templates/home')())
  
  events:
    'keypress input' : 'login'
  
  initialize: ->
    @render()
  
  render: ->
    $(document.body).html('').append @el
  
  login: (event) ->
    return unless event.charCode is 13
    $('body').css 'overflow', 'hidden'
    @$('input').attr 'disabled', 'disabled'
    @el.addClass 'spinning'
    setTimeout =>
      @el.removeClass('spinning').addClass 'leaving'
      @el.bind 'webkitAnimationEnd', =>
        @remove()
        $('body').css 'overflow', 'auto'
    , 2000