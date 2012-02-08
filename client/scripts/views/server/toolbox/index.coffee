Sections = {}
Sections.database = require './database_section'
Sections.field    = require './field_section'
Sections.server   = require './server_section'
Sections.table    = require './table_section'

module.exports = class ToolboxView extends Backbone.View
  
  ###
  Constructs the view.
  ###
  constructor: (@el, @graph) ->
    super()
  
  ###
  Updates the toolbox for the given model.
  ###
  update: (node) ->
    nodes = {}
    switch node.model.constructor.name
      when 'Server'   then nodes.server = node
      when 'Database' then nodes.database = node
      when 'Table'    then nodes.table = node
      when 'Field'    then nodes.field = node
    nodes.table = nodes.field.parent if nodes.field
    
    @sections = {}
    @sections[k] = new Sections[k] @, node for k, node of nodes
    
    @render()
  
  ###
  Renders the sections of the toolbox.
  ###
  render: ->
    @el.html ''
    for k in ['server', 'database', 'table', 'field']
      @el.append @sections[k].render() if @sections[k]