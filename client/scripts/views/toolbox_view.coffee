DatabaseSectionView = require './toolbox/database_section_view'
FieldSectionView    = require './toolbox/field_section_view'
ServerSectionView   = require './toolbox/server_section_view'
TableSectionView    = require './toolbox/table_section_view'

module.exports = class ToolboxView extends Backbone.View
  
  ###
  Constructs the view.
  ###
  constructor: (@graph) ->
    @el = @graph.$('#toolbox')
    super()
  
  ###
  Updates the toolbox for the given model.
  ###
  update: (node) ->
    model  = node.model
    server = database = table = field = null
    switch model.constructor.name
      when 'Server'   then server   = node
      when 'Database' then database = node
      when 'Table'    then table    = node
      when 'Field'    then field    = node
    table    = field.parent if field
    
    @server = @database = @table = @field = null
    @server   = new ServerSectionView @, server if server
    @database = new DatabaseSectionView @, database if database
    @table    = new TableSectionView @, table if table
    @field    = new FieldSectionView @, field if field
    
    @render()
  
  ###
  Renders the sections of the toolbox.
  ###
  render: ->
    @el.html ''
    @el.append @server?.render()
    @el.append @database?.render()
    @el.append @table?.render()
    @el.append @field?.render()