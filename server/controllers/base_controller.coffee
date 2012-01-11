###
The Base controller contains common functionality for controllers.
###
module.exports = class BaseController
  
  ###
  Initialise the controller and store the request context.
  ###
  constructor: (@request) ->
  
  ###
  Execute's a request based on the stored request context.
  
  The default `execute` operation looks for an `action` paremeter in the
  request context, and executes it as a controller method.
  ###
  execute: ->
    action = @request.params.action
    
    # Check the action parameter exists
    unless action?
      throw new Error "Could not execute controller `#{@constructor.name}`: missing required parameter `action`"
    
    # Check the action exists
    unless @[action]? and typeof @[action] is 'function'
      throw new Error "Could not execute controller `#{@constructor.name}`: action `#{action}` is not a function"
    
    # Execute the action
    @[action]()