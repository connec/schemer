BaseView = require '../base'
Graph    = require './graph'
Toolbox  = require './toolbox'

###
The Server view represents the main view of the application.
###
module.exports = class ServerView extends BaseView
  
  ###
  The template for the view.
  ###
  template: require '../../templates/server'
  
  ###
  Initialises the view.
  ###
  initialize: ->
    # Construct the components of the view
    @graph   = new Graph   @, @$('#graph')
    @toolbox = new Toolbox @, @$('#toolbox')
    
    # Refresh the graph on window resize
    $(global).resize =>
      @resize()
      @graph.tree.refresh()
  
  ###
  Extend BaseView::render to resize the graph and overlay.
  ###
  render: ->
    super
    @resize()
  
  ###
  Resizes the graph to fill the space left by the toolbox.
  ###
  resize: ->
    toolbox_width = @toolbox.el.outerWidth true
    @$('#graph').css
      left:  toolbox_width
      width: $(global).innerWidth() - toolbox_width
    
    @$('#overlay').css
      left:  0
      width: $(global).innerWidth() + toolbox_width
  
  ###
  Handles the blocking of the interface during a transition.
  ###
  transition: (callback) ->
    done = =>
      @$('#overlay').fadeTo 250, 0, =>
        @$('#overlay').hide()
    @$('#overlay').show().fadeTo 250, 0.5
    callback done