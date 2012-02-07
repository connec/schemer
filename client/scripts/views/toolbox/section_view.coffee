module.exports = class SectionView extends Backbone.View
  
  ###
  Construct the view.
  ###
  constructor: (@toolbox, @node) ->
    @el = $ @template name: @node.model.get 'name'
    super()
  
  ###
  Renders the section.
  ###
  render: ->
    return @el