async = require 'async'
mysql = require 'mysql'

###
The Database class provides helper methods for common database operations.
###
module.exports = class Database
  
  ###
  Initialise a Database instance with given credentials.
  ###
  constructor: (credentials) ->
    @client = mysql.createClient credentials
    
    # Provide direct access to the client's query and end methods.
    @query = @client.query.bind @client
    @end   = @client.end.bind @client
  
  ###
  Convenience method to issue a USE query.
  ###
  use: (database, callback) ->
    @query "use `#{database}`", callback
  
  ###
  Convenience method to get an array of the databases on the server.
  ###
  get_databases: (callback) ->
    @query 'show databases', (err, results) =>
      return callback err if err
      return callback null, results.map (result) =>
        id:   "#{@client.host}/#{result.Database}"
        name: result.Database
  
  ###
  Convenience method to get an array of the tables in a database.
  ###
  get_tables: (database, callback) ->
    @query "show tables in `#{database}`", (err, results) =>
      return callback err if err
      return callback null, results.map (result) =>
        id:   "#{@client.host}/#{database}/#{result["Tables_in_#{database}"]}"
        name: result["Tables_in_#{database}"]
  
  ###
  Convenience method to get an array of the fields of a table.
  ###
  get_fields: (database, table, callback) ->
    @query "describe `#{database}`.`#{table}`", (err, results) =>
      return callback err if err
      
      # Fields need a bit of processing...
      fields = results.map (result) =>
        id:      "#{@client.host}/#{database}/#{table}/#{result.Field}"
        name:    result.Field
        type:    result.Type.match(/(.*?)(\(|$)/)[1]
        length:  result.Type.match(/\((.*)\)/)?[1]
        null:    if result.Null is 'NO' then no else yes
        default: result.Default
        ai:      if result.Extra.match /auto_increment/ then yes else no
        key:     switch result.Key
          when 'PRI' then 'primary'
          when 'UNI' then 'unique'
          when 'MUL' then 'index'
          else false
      callback null, fields
  
  ###
  Convenience method to create a database on the server with given name.
  ###
  create_database: (name, callback) ->
    @query "create database `#{name}`", (err) =>
      return callback err if err
      return callback null,
        id:   "#{@client.host}/#{name}"
        name: name
  
  ###
  Convenience method to drop a database with given name.
  ###
  drop_database: (name, callback) ->
    @query "drop database `#{name}`", callback
  
  ###
  Convenience method to rename a database.
  ###
  rename_database: (old_name, new_name, callback) ->
    @create_database new_name, (err) =>
      return callback err if err
      
      @get_tables old_name, (err, tables) =>
        return callback err if err
        
        async.forEach tables, ({name}, done) =>
          @rename_table old_name, name, new_name, name, done
        , (err) =>
          return callback err if err
          @drop_database old_name, (err) =>
            return callback err if err
            return callback null,
              id:   "#{@client.host}/#{new_name}"
              name: new_name
  
  ###
  Convenience method to create a table.
  ###
  create_table: (database, name, fields, callback) ->
    query = "create table `#{database}`.`#{name}` (" + (fields.map (field) ->
      """
      `#{field.name}` #{field.type} #{field.length ? ''}
      #{if field.null then 'NULL' else 'NOT NULL'}
      #{if field.ai then 'AUTO_INCREMENT' else ''}
      #{if field.key is 'primary' then 'PRIMARY KEY' else ''}
      """
    ).join(', ') + ')' 
    @query query, (err) =>
      return callback err if err
      return callback null,
        id:   "#{@client.host}/#{database}/#{name}"
        name: name
  
  ###
  Convenience method to rename a table.
  ###
  rename_table: (old_db, old_name, new_db, new_name, callback) ->
    @query "rename table `#{old_db}`.`#{old_name}` to `#{new_db}`.`#{new_name}`", (err) =>
      return callback err if err
      return callback null,
        id:   "#{@client.host}/#{new_db}/#{new_name}"
        name: new_name
  
  ###
  Convenience method to drop a table with given name.
  ###
  drop_table: (database, name, callback) ->
    @query "drop table `#{database}`.`#{name}`", callback