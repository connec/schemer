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
    
    # Hold a reference to the overview and ruler
    @$overlay = @$('#overlay')
    @$ruler   = @$('#ruler')
    
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
    @graph.el.css
      left:  toolbox_width
      width: $(global).innerWidth() - toolbox_width
    
    @$overlay.css
      left:  0
      width: $(global).innerWidth() + toolbox_width
  
  ###
  Handles the blocking of the interface during a transition.
  ###
  transition: (callback) ->
    done = => @$overlay.fadeTo 250, 0, -> $(this).hide()
    @$overlay.show().fadeTo 250, 0.5
    callback done
  
  ###
  Uses the ruler to truncate the contents of an element.
  ###
  truncate: ($elem) ->
    $elem.removeAttr 'title'
    @$ruler.css
      fontFamily: $elem.css 'fontFamily'
      fontSize:   $elem.css 'fontSize'
      fontWeight: $elem.css 'fontWeight'
    @$ruler.text $elem.text()
    
    # Stop early if it's already shorter
    return unless @$ruler.width() > $elem.width()
    
    @$ruler.append '...'
    while @$ruler.text() isnt '...' and @$ruler.width() > $elem.width()
      @$ruler.text @$ruler.text()[0...-4] + '...'
    
    $elem.attr title: $elem.text()
    $elem.text @$ruler.text()