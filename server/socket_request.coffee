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
    @database.get_databases (err, databases) =>
      return @respond err if err
      
      i = 0
      for {name} in databases
        i = match[1] if match = name.match(/new database \((\d+)\)/i) and parseInt(match[1]) > i
      name = "new database (#{++i})"
      @database.create_database name, @respond.bind @
  
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
  
  ###
  Creates a new table in `database` named 'new table (n)', with an id field.
  ###
  add_table: ({database}) ->
    # Representation of the ID field
    id =
      name: 'id'
      type: 'int'
      null: no
      ai:   yes
      key:  'primary'
    @database.get_tables database, (err, tables) =>
      return @respond err if err
      
      i = 0
      for {name} in tables
        i = match[1] if match = name.match(/new table\((\d+)\)/i) and parseInt(match[1]) > i
      name = "new table (#{++i})"
      @database.create_table database, name, [id], @respond.bind @
  
  ###
  Renames the table named `old_name` to given `new_name`.
  ###
  rename_table: ({database, old_name, new_name}) ->
    @database.rename_table database, old_name, database, new_name, @respond.bind @
  
  ###
  Drops the given table.
  ###
  drop_table: ({database, table}) ->
    @database.drop_table database, table, @respond.bind @