module.exports = class Section extends Backbone.View
  
  ###
  Construct the view.
  ###
  constructor: (@toolbox, @node) ->
    @el = $ @template name: @node.get 'name'
    super()
  
  ###
  Renders the section.
  ###
  render: ->
    return @el
  
  ###
  Handles the creation of a child for this node.
  ###
  add_child: ->
    Child = @node.constructor.Child
    
    @toolbox.graph.transition (done) =>
      child        = new Child
      child.parent = @node
      child.save {},
        complete: done
        success: (model) =>
          @node.get('children').add model
          @node.tree.animate()
          @node.tree.bind_once 'anim:after', =>
            @toolbox.graph.node_click model
        error: (_, err) ->
          console.log err.stack
  
  ###
  Handles the dropping of this node.
  ###
  drop: ->
    @toolbox.graph.transition (done) =>
      @node.destroy
        complete: done
        success: =>
          parent = @node.parent
          @node.tree.remove_node @node
          @toolbox.graph.node_click parent
        error: (_, err) ->
          return console.log err.stack
  
  ###
  Handles the renaming of this node.
  ###
  rename: ->
    # Encapsulate the actual rename part, to save duplication
    rename = (e) =>
      return if e.type is 'keypress' and e.which isnt 13
      
      old_name = @node.get 'name'
      new_name = $input.val().toLowerCase()
      @node.set name: new_name
      return if old_name == new_name
      
      @toolbox.graph.transition (done) =>
        # Remove the children, as they need to be replaced with new IDs
        @node.tree.remove_node child for child in @node.children
        @node.tree.animate()
        @node.tree.bind_once 'anim:after', =>
          @node.save {},
            success: (model) =>
              # Re-add the children
              model.get('children').fetch
                complete: done
                success: =>
                  @$('h1').text model.get 'name'
                  @node.tree.animate()
                error: (_, err) ->
                  console.log err.stack
            error: (_, err) ->
              done()
              console.log err.stack
    
    @node.$label.html ''
    $input = $('<input/>')
      .attr(type: 'text', value: @node.get 'name')
      .appendTo(@node.$label)
      .focus()
      .select()
      .bind('blur', rename)
      .bind('keypress', rename)