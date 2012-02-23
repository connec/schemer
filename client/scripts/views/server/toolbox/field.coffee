Section = require './section'

module.exports = class FieldSection extends Section
  
  ###
  The template for this section.
  ###
  template: require '../../../templates/toolbox/field'
  
  ###
  Bind events.
  ###
  events:
    # Changes to the property inputs should reflect in the model
    'change select.type':          'change'
    'change input.default':        'change'
    'change select.key':           'change'
    'change input.ai':             'change'
    
    'change input.default_toggle': 'toggle_default'
    
    'click input.save':            'update'
    
    'click .drop':                 'drop'
    'click .rename':               'rename'
  
  ###
  Handles changes of properties.
  ###
  change: (e) ->
    on_change = => @node.$elem.addClass 'changed'
    @node.bind 'change', on_change
    
    $elem     = $(e.target)
    $selected = $elem.find ':selected'
    if      $elem.hasClass 'type'    then @node.set type: $selected.attr('data-type'), length: $selected.attr('data-length')
    else if $elem.hasClass 'default' then @node.set default: (if $elem.is(':disabled') then null else $elem.val())
    else if $elem.hasClass 'key'     then @node.set key: (if $elem.val() then $elem.val() else null)
    else if $elem.hasClass 'ai'      then @node.set ai: $elem.is ':checked'
    else    console.log 'bad element'
    
    @node.unbind 'change', on_change
  
  ###
  Handles the toggling of the default checkbox.
  ###
  toggle_default: (e) ->
    if $(e.target).is ':checked'
      @node.$elem.addClass 'changed'
      @$('input.default').removeAttr('disabled').focus()
    else
      @node.set default: null
      @node.$elem.addClass 'changed'
      @$('input.default').val('').attr disabled: 'disabled'