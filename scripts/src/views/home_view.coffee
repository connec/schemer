jade = require 'jade'

class window.HomeView extends Backbone.View
  el: $(jade.compile($('#template_home').remove().html().trim())())
  
  events:
    'keypress input': 'login'
  
  initialize: ->
    @render()
  
  render: ->
    $(document.body).html('').append @el
  
  login: (event) ->
    return unless event.charCode is 13
    @$('input').attr 'disabled', 'disabled'
    @el.addClass 'spinning'
    setTimeout (=>
      view = @
      @el.removeClass('spinning').addClass 'leaving'
      @el.bind 'webkitAnimationEnd', -> view.remove()
    ), 2000