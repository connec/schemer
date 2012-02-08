Database = require './database'

###
Encapsulates a socket request.
###
module.exports = class SocketRequest
  
  ###
  Initialise the request with the socket instance.
  ###
  constructor: (@socket) ->
    @session  = @socket.handshake.session
    @database = null
    
    # Initialise the database if we're already logged in
    @db_connect @session.credentials if @session.credentials
  
  ###
  Connects to the database with given credentials.
  ###
  db_connect: (credentials) ->
    @database = new Database credentials
  
  ###
  Dispatch a request, based on given data.
  ###
  dispatch: (data) ->
    {@id, request, request_data} = data
    
    unless @[request]
      return console.log String new Error "no handler for request `#{request}`"
    @[request] request_data
  
  ###
  Emits the response to this request.
  ###
  respond: (err, result) ->
    # Log the error for debugging
    console.log String err if err
    
    # Close the database
    @database?.end()
    
    # Emit the response
    @socket.emit "response_#{@id}", {err, result}
  
  ###
  Checks if the current session is logged in.
  ###
  check_login: ->
    return @respond null, false unless @session.credentials
    return @respond null, true
  
  ###
  Attempts to login to the database with given credentials and, if successful,
  stores the credentials for the session.
  ###
  login: (credentials) ->
    @db_connect credentials
    @database.query 'show databases', (err) =>
      return @respond err if err
      @session.credentials = credentials
      @session.save (err) =>
        return @respond err if err
        return @respond()
  
  ###
  Gets the server information.
  ###
  get_server: ->
    @respond new Error 'not authorised' unless @session.credentials
    @respond null,
      id:   @database.client.host
      name: @database.client.host
      user: @database.client.user
  
  ###
  Gets the database on the server, in the format expected by the Database model.
  ###
  get_databases: ->
    @database.get_databases @respond.bind @
  
  ###
  Gets the tables in a database, in the format expected by the Table model.
  ###
  get_tables: ({database}) ->
    @database.get_tables database, @respond.bind @
  
  ###
  Gets the fields of a table, in the format expected by the Field model.
  ###
  get_fields: ({database, table}) ->
    @database.get_fields database, table, @respond.bind @
  
  ###
  Creates a new database on the server named 'new database (n)'.
  ###
  add_database: ->
    i = 0
    @database.get_databases (err, databases) =>
      return @respond err if err
      
      for {name} in databases
        i = match[1] if match = name.match /new database \((\d+)\)/i
      name = "new database (#{++i})"
      @database.create_database name, (err) =>
        return @respond err if err
        return @respond null, name
  
  ###
  Renames the database named `old_name` to given `new_name`.  Any tables in
  `old_name` will be moved.
  ###
  rename_database: ({old_name, new_name}) ->
    @database.rename_database old_name, new_name, @respond.bind @
  
  ###
  Drops the given database.
  ###
  drop_database: ({database}) ->
    @database.drop_database database, @respond.bind @