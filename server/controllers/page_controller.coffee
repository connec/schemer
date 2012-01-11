BaseController = require './base_controller'

###
The Page controller handles rendering static pages.
###
module.exports = class PageController extends BaseController
  
  ###
  Execute the Page controller.
  
  Looks for a `page` parameter in the request context and simply attempts to
  render it.
  ###
  execute: ->
    page = @request.params.page
    
    # Check the `page` parameter exists
    unless page?
      throw new Error 'Could not execute controller `PageController`: missing required parameter `page`'
    
    # Render the page
    @request.render "pages/#{page}"