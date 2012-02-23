Database = require '../models/database'
Field    = require '../models/field'
Table    = require '../models/table'

###
Overwrite Backbone.sync to use WebSockets instead of AJAX.
###

Backbone.sync = (method, model, options) ->
  callback = (err, results) ->
    options.complete? results, err
    return options.error err if err
    return options.success results
  
  switch method
    when 'create'
      return create_model model, callback
    when 'delete'
      return delete_model model, callback
    when 'read'
      return read_collection model, callback if model.model?
    when 'update'
      return update_model model, callback
    else
      console.log 'unhandled method', method
  
  console.log 'unhandled sync', method, model

###
Creates a model on the database.
###
create_model = (model, callback) ->
  switch model.constructor
    when Database
      socket.request 'add_database', callback
    when Table
      socket.request 'add_table',
        database: model.parent.get 'name'
      , callback
    when Field
      socket.request 'save_field',
        database:   model.parent.parent.get 'name'
        table:      model.parent.get 'name'
        field:      model.get 'name'
        attributes: model.attributes
      , callback
    else
      console.log 'unhandled model create', model

###
Deletes a model on the database.
###
delete_model = (model, callback) ->
  switch model.constructor
    when Database
      socket.request 'drop_database', 
        database: model.get 'name'
      , callback
    when Table
      socket.request 'drop_table',
        database: model.parent.get 'name'
        table:    model.get 'name'
      , callback
    when Field
      socket.request 'drop_field',
        database: model.parent.parent.get 'name'
        table:    model.parent.get 'name'
        field:    model.get 'name'
      , callback
    else
      console.log 'unhandled model delete', model

###
Reads the contents of the given collection from the database.
###
read_collection = (collection, callback) ->
  switch collection.model
    when Database
      socket.request 'get_databases', callback
    when Table
      socket.request 'get_tables',
        database: collection.parent.get 'name'
      , callback
    when Field
      socket.request 'get_fields',
        database: collection.parent.parent.get 'name'
        table:    collection.parent.get 'name'
      , callback
    else
      console.log 'unhandled collection read', collection

###
Updates a model on the database.
###
update_model = (model, callback) ->
  switch model.constructor
    when Database
      socket.request 'rename_database',
        old_name: model.id.replace "#{model.parent.id}/", ''
        new_name: model.get 'name'
      , callback
    when Table
      socket.request 'rename_table',
        database: model.parent.get 'name'
        old_name: model.id.replace "#{model.parent.id}/", ''
        new_name: model.get 'name'
      , callback
    when Field
      socket.request 'save_field',
        database:   model.parent.parent.get 'name'
        table:      model.parent.get 'name'
        field:      model.id.replace "#{model.parent.id}/", ''
        attributes: model.attributes
      , callback
    else
      console.log 'unhandled model update', model