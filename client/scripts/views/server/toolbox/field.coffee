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
    'change input.null':           'change'
    'change input.ai':             'change'
    
    'change input.default_toggle': 'toggle_default'
    'click input.default':         'toggle_default'
    
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
    if $elem.hasClass 'type'
      if $selected.text() is 'Custom...'
        $selected = @add_custom_type()
      @node.set type: $selected.attr('data-type'), length: $selected.attr('data-length')
    else if $elem.hasClass 'default' then @node.set default: (if $elem.is(':disabled') then null else $elem.val())
    else if $elem.hasClass 'key'     then @node.set key: (if $elem.val() then $elem.val() else null)
    else if $elem.hasClass 'null'    then @node.set null: $elem.is ':checked'
    else if $elem.hasClass 'ai'      then @node.set ai: $elem.is ':checked'
    else    console.log 'bad element'
    
    @node.unbind 'change', on_change
  
  ###
  Handles the toggling of the default checkbox.
  ###
  toggle_default: (e) ->
    console.log $target = $(e.target);
    if $target.is ':checked'
      @node.$elem.addClass 'changed'
      @$('input.default').removeAttr('disabled').focus()
    else
      if $target.is '.default'
        return unless $target.is ':disabled'
      @node.set default: null
      @node.$elem.addClass 'changed'
      @$('input.default').val('').attr disabled: 'disabled'
  
  ###
  Prompts for a custom type and adds it to the type select.
  ###
  add_custom_type: ->
    both   = prompt "Enter a custom type in the form 'type(length)'"
    type   = both
    length = null
    if match = type.match /(.*?)\((\d+)\)/
      type   = match[1]
      length = match[2]
    
    return $('<option/>')
      .attr('data-type': type, 'data-length': length, selected: true)
      .text(both)
      .insertBefore(@$('select.type option:last'))