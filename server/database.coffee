async = require 'async'
mysql = require 'mysql'

###
The Database class provides helper methods for common database operations.
###
module.exports = class Database
  
  ###
  Private helper function to remove nullish values from an array
  ###
  filter = (array) ->
    array.filter (entry) -> entry?
  
  ###
  Private helper function to process field descriptions returned by the database
  into a more userful format.
  ###
  process_field = (database, table, result) ->
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
      return callback null, results.map (result) =>
        process_field.call @, database, table, result
  
  ###
  Convenience method to get the details of a field in a table.
  ###
  get_field: (database, table, field, callback) ->
    @query "describe `#{database}`.`#{table}` `#{field}`", (err, [result]) =>
      return callback err if err
      return callback null, process_field.call @, database, table, result
  
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
  
  ###
  Convenience method to save a field.
  ###
  save_field: (database, table, field, attributes, callback) ->
    # Executes the save
    save = (old_attributes = {}) =>
      # Build the query
      query = [
        "alter table `#{database}`.`#{table}`"
        "add column"                                        if not attributes.id
        "change column `#{field}`"                          if attributes.id
        "`#{attributes.name}` #{attributes.type}"
        "(#{attributes.length})"                            if attributes.length?
        "#{if not attributes.null then 'not ' else ''}null"
        "default ?"                                         if attributes.default?
        "auto_increment"                                    if attributes.ai
      ]
      @query filter(query).join(' '), filter([attributes.default]), (err) =>
        return callback err if err
        
        # Drops the old key
        drop_key = =>
          @drop_key database, table, field, old_attributes.key, (err) ->
            return callback err if err
            return add_key()    if attributes.key
            return finish()
        
        # Creates the new key
        add_key = =>
          @add_key database, table, attributes.name, attributes.key, (err) ->
            return callback err if err
            return finish()
        
        # Executes the callback, passing the new field attributes
        finish = =>
          @get_field database, table, attributes.name, (err, field) ->
            return callback err if err
            return callback null, field
        
        # Decide what to do about the key
        if attributes.id
          return finish()   if old_attributes.key == attributes.key
          return add_key()  unless old_attributes.key
          return drop_key()
        else
          return finish() unless attributes.key
          return add_key()
    
    # Just save if this is a new field
    return save() unless attributes.id
    
    # Otherwise, get the old attributes
    @get_field database, table, field, (err, field) ->
      return callback err if err
      return save field
  
  ###
  Convenience method to drop a field with the given name.
  ###
  drop_field: (database, table, field, callback) ->
    @query "alter table `#{database}`.`#{table}` drop column `#{field}`", callback
  
  ###
  Convenience method to add a key to the given field.
  ###
  add_key: (database, table, field, type, callback) ->
    query = [
      "alter table `#{database}`.`#{table}` add"
      "primary"    if type is 'primary'
      "unique"     if type is 'unique'
      "key"
      "`#{field}`" unless type is 'primary'
      "(`#{field}`)"
    ]
    @query filter(query).join(' '), callback
  
  ###
  Convenience method to drop a key from the given field.
  ###
  drop_key: (database, table, field, type, callback) ->
    query = [
      "alter table `#{database}`.`#{table}` drop"
      "primary"    if type is 'primary'
      "key"
      "`#{field}`" unless type is 'primary'
    ]
    @query filter(query).join(' '), callback