BaseController = require './base_controller'
mysql          = require 'mysql'

###
The Query controller deals with database queries from the client.
###
module.exports = class QueryController extends BaseController
  
  ###
  Execute the query given in the socket data.
  ###
  execute: ->
    # Make sure they are still logged in
    return @request.emit "results_#{@request.data.id}", new Exception 'Login expired' unless @request.session.credentials?
    
    # Initialise the client
    client = mysql.createClient @request.session.credentials
    
    # Select the database if one's been given
    client.query "use #{@request.data.database}" if @request.data.database?
    
    # Execute the query
    client.query @request.data.sql, (err, results) =>
      console.log err if err?
      @request.emit "results_#{@request.data.id}", {err, results}
      client.end()