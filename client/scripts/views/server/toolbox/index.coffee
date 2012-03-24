Database  = require '../../../models/database'
Field     = require '../../../models/field'
NodeModel = require '../../../models/node_model'
Server    = require '../../../models/server'
Table     = require '../../../models/table'

Sections = {}
Sections.database = require './database'
Sections.field    = require './field'
Sections.server   = require './server'
Sections.table    = require './table'

###
Gets the key (server/database/table/field) for the given class without relying
on `Function#name`.
###
get_key = (Klass) ->
  switch Klass
    when Server   then 'server'
    when Database then 'database'
    when Table    then 'table'
    when Field    then 'field'

module.exports = class ToolboxView extends Backbone.View
  
  ###
  Constructs the view.
  ###
  constructor: (@server_view, @el) ->
    super()
  
  ###
  Updates the toolbox for the given model.
  ###
  update: (node) ->
    nodes = {}
    nodes[get_key node.constructor] = node
    
    nodes.table    = nodes.field.parent    if nodes.field
    nodes.database = nodes.table.parent    if nodes.table
    nodes.server   = nodes.database.parent if nodes.database
    
    @sections = {}
    @sections[k] = new Sections[k] @, node for k, node of nodes
    
    @render()
  
  ###
  Renders the sections of the toolbox.
  ###
  render: ->
    @el.html ''
    for k in ['field', 'table', 'database', 'server']
      @el.append @sections[k].render().fadeTo(0, 0).fadeTo(250, 1) if @sections[k]
    
    # Truncate the headings in case they are too big
    @$('h1').each (i, h1) => @server_view.truncate $(h1)
  
  ###
  Gets the section for the given key.
  ###
  get_section: (key) ->
    key = get_key(key.constructor) if key instanceof NodeModel
    return @sections[key]