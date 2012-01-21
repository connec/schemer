###
The Base view contains common funcitonality for views.
###
module.exports = class BaseView extends Backbone.View
  
  ###
  Construct the view.
  ###
  constructor: ->
    @el = $ @template()
    super
  
  ###
  Renders the element and fades it in.
  ###
  fade_in: (duration = 500) ->
    @el.fadeTo 0, 0
    @render()
    @el.fadeTo duration, 1