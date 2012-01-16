BaseController = require './base_controller'
mysql          = require 'mysql'

###
The Auth controller handles authentication with the database server.
###
module.exports = class AuthController extends BaseController
  
  ###
  Checks to see if a user is logged in.
  ###
  check_login: ->
    # Check if the client has been initialised in the session
    @request.emit 'auth_response', @request.session.credentials?
  
  ###
  Authenticates the user with the database.
  ###
  login: ->
    setTimeout =>
      # Create a DB client with the given credentials
      db = mysql.createClient @request.data
      
      # Attempt to log in with given credentials
      db.query 'SHOW DATABASES', (err) =>
        return @request.emit 'error', String err if err
        
        @request.session.credentials = @request.data
        @request.session.save (err) =>
          return @request.emit 'error', String err if err
          return @request.emit 'success'
    , 1000