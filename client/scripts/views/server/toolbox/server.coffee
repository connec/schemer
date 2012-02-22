Section = require './section'

module.exports = class ServerSection extends Section
  
  ###
  The template for this section.
  ###
  template: require '../../../templates/toolbox/server'
  
  ###
  Bind events.
  ###
  events:
    'click .add': 'add_child'