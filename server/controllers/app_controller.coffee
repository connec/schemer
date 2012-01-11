BaseController = require './base_controller'

###
The App controller simply renders the layout for manipulation by the client.
###
module.exports = class AppController extends BaseController
  
  ###
  Execute's the App controller.
  
  All this does is render the layout.
  ###
  execute: ->
    @request.render 'layout': {layout: false}