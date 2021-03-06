###
The Base view contains common funcitonality for views.
###
module.exports = class BaseView extends Backbone.View
  
  ###
  Construct the view.
  ###
  constructor: (@router) ->
    @el = $ @template()
    super()
  
  ###
  Renders the view to the page.
  ###
  render: ->
    $('body').html('').append @el
  
  ###
  Renders the element and fades it in.
  ###
  fade_in: (duration = 500) ->
    @el.fadeTo 0, 0
    @render()
    @el.fadeTo duration, 1