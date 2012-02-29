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
    @graph         = new Graph @$('#graph')
    @graph.toolbox = @toolbox = new Toolbox @$('#toolbox'), @graph
    
    # Refresh the graph on window resize
    $(global).resize => @graph.tree.refresh()