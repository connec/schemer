Database = require '../../../models/database'
Field    = require '../../../models/field'
Server   = require '../../../models/server'
Table    = require '../../../models/table'

Sections = {}
Sections.database = require './database'
Sections.field    = require './field'
Sections.server   = require './server'
Sections.table    = require './table'

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
    switch node.constructor
      when Server   then nodes.server = node
      when Database then nodes.database = node
      when Table    then nodes.table = node
      when Field    then nodes.field = node
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