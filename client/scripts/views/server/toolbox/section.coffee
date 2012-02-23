module.exports = class Section extends Backbone.View
  
  ###
  Construct the view.
  ###
  constructor: (@toolbox, @node) ->
    @el = $ @template {@node}
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
        error: (_, err) -> on_error err
  
  ###
  Handles the dropping of this node.
  ###
  drop: ->
    parent = @node.parent
    unless @node.id
      parent.get('children').remove @node
      @toolbox.graph.node_click parent
    
    @toolbox.graph.transition (done) =>
      @node.destroy
        complete: done
        success:  => @toolbox.graph.node_click parent
        error:    (_, err) -> on_error err
  
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
      
      @update() if @node.id
    
    @node.$label.html ''
    $input = $('<input/>')
      .attr(type: 'text', value: @node.get 'name')
      .appendTo(@node.$label)
      .focus()
      .select()
      .bind('blur', rename)
      .bind('keypress', rename)
  
  ###
  Handles the updating of this node.
  ###
  update: ->
    @toolbox.graph.transition (done) =>
      # Remove the children, as they may need to be replaced with new IDs
      children = @node.get 'children'
      children.remove child for child in @node.children
      @node.tree.animate()
      @node.tree.bind_once 'anim:after', =>
        @node.save {},
          success: (model) =>
            @node.$elem.removeClass 'changed'
            
            # Update the view and rebind events
            @el.replaceWith @el = $ @template {@node}
            @delegateEvents()
            
            # Re-add the children
            return done() unless model.get 'children'
            model.get('children').fetch
              add: true
              complete: done
              success: => @node.tree.animate()
              error: (_, err) -> on_error err
          error: (_, err) ->
            done()
            on_error err