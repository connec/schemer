{MemoryStore} = require('express').session
mysql         = require 'mysql'
{parseCookie} = require('connect').utils
{Session}     = require('connect').middleware.session
util          = require 'util'
zappa         = require 'zappa'

# Instantiate the Zappa server
module.exports = zapp = zappa.app ->
  session_store = new MemoryStore()
  
  @set {
    # Use Jade for templating
    'view engine': 'jade'
  }
  
  @use {
    # Use standard static serving in the client directory
    'static': "#{__dirname}/../client"
    
    # Use bodyParser to process POST bodies
    'bodyParser'
    
    # Use cookieParser to process cookie data
    'cookieParser'
    
    # Use session to process session data
    'session':
      key    : 'sid'
      secret : 'demhonours'
      store  : session_store
  }
  
  # Reduce the log level to get rid of constant debugger messages
  @io.set 'log level', 3
  
  # Check the client has a valid session when authorizing a socket
  @io.set 'authorization', (data, accept) ->
    # Check a cookie actually exists
    unless data.headers.cookie
      return accept 'No cookie transmitted', false
    
    # Gather relevant session data
    data.cookie       = parseCookie data.headers.cookie
    data.sessionID    = data.cookie.sid
    data.sessionStore = session_store
    
    # Load the session
    session_store.get data.sessionID, (err, session) ->
      return accept 'Error retrieving session', false if err
      
      data.session = new Session data, session
      accept null, true
  
  # Handles 'socket requests'
  @on request: ->
    console.log "   debug - received request #{util.inspect @data}"
    {id, request, request_data} = @data
    @session                    = @socket.handshake.session
    
    callback = (err, result) =>
      @emit "response_#{id}", {err, result}
    
    try
      switch request
        when 'login'
          # Attempt to log in to the database server with given credentials
          db = mysql.createClient request_data
          db.query 'show databases', (err) =>
            return callback err if err
            @session.credentials = request_data
            @session.save (err) =>
              return callback err if err
              callback null, null
          db.end (err) -> console.log String err if err
        
        when 'check_login'
          # See if the client is logged in
          if @session.credentials?
            callback null, 
              host : @session.credentials.host
              user : @session.credentials.user
          else
            callback null, false
        
        when 'get_databases'
          # Get an array of database on the server
          db = mysql.createClient @session.credentials
          db.query 'show databases', (err, results) ->
            return callback err if err
            callback null, ({name : result.Database} for result in results)
          db.end (err) -> console.log String err if err
        
        when 'get_tables'
          # Get an array of tables in a database
          {database} = request_data
          
          db = mysql.createClient @session.credentials
          db.query "use #{database}"
          db.query 'show tables', (err, results) ->
            return callback err if err
            callback null, ({name : result["Tables_in_#{database}"]} for result in results)
          db.end (err) -> console.log String err if err
        
        when 'get_fields'
          # Get an array of fields in a table
          {database, table} = request_data
          
          db = mysql.createClient @session.credentials
          db.query "use #{database}"
          db.query "describe #{table}", (err, results) ->
            return callback err if err
            
            # Fields need a bit of processing...
            fields = results.map (result) ->
              {
                name           : result.Field
                type           : result.Type.match(/(.*?)(\(|$)/)[1]
                length         : result.Type.match(/\((.*)\)/)?[1]
                nullable       : if result.Null is 'NO' then no else yes
                default        : result.Default
                auto_increment : if result.Extra.match /auto_increment/ then yes else no
                key            : switch result.Key
                  when 'PRI' then 'primary'
                  when 'UNI' then 'unique'
                  when 'MUL' then 'index'
                  else 'false'
              }
            callback null, fields
          db.end (err) -> console.log String err if err
        
        when 'save_table'
          # Save the current properties of a table to the database
          console.log request
        
        else
          throw new Error "cannot handle request: #{request}"
    catch err
      callback err
  
  # The only HTTP response - renders the layout
  @get '/' : ->
    @render 'layout', layout: false
  
  # The layout for the application
  @view layout: '''
    doctype 5
    html
      head
        meta(charset='utf-8')
        
        title Honours
        
        link(href='styles/app.css', rel='stylesheet')
        script(src='/scripts/lib/vendor/jquery.js')
        script(src='/scripts/lib/vendor/underscore.js')
        script(src='/scripts/lib/vendor/backbone.js')
        script(src='/scripts/lib/vendor/socket.io.js')
        script(src='/scripts/lib/vendor/async.js')
        script(src='/scripts/lib/vendor/jit.js')
        script(src='scripts/app.js')
      
      body
  '''

# Attach a method to start the server
zapp.start = (port = 3000) ->
  @app.listen port
  console.log "Listening on port #{port}"

# Attach a method to stop the server
zapp.stop = (callback) ->
  # Attach the callback
  @app.on 'close', ->
    console.log "Server stopped"
    callback()
  
  console.log 'Stopping server...'
  @app.close()

# Start the server if this module's been called directly
zapp.start() if require.main == module