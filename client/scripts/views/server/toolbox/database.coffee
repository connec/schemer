Section = require './section'

module.exports = class DatabaseSection extends Section
  
  ###
  The template for this section.
  ###
  template: require '../../../templates/toolbox/database'
  
  ###
  Bind events.
  ###
  events:
    'click .add':    'add_child'
    'click .drop':   'drop'
    'click .rename': 'rename'