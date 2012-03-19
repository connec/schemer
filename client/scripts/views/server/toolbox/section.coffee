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
          @node.tree.bind_once 'anim:after', =>
            @toolbox.graph.node_click model, => @toolbox.get_section(model).rename()
          @node.tree.animate()
        error: (_, err) -> on_error err
  
  ###
  Handles the dropping of this node.
  ###
  drop: ->
    parent      = @node.parent
    next_of_kin = @node.previous_sibling() ? @node.next_sibling() ? parent
    
    if not @node.id
      parent.get('children').remove @node
      return @toolbox.graph.node_click next_of_kin
    
    @toolbox.graph.transition (done) =>
      @node.destroy
        complete: done
        error:    (_, err) -> on_error err
        success:  =>
          return @toolbox.graph.node_click next_of_kin
  
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
      @node.close()
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
              success: =>
                @node.parent.get('children').sort()
                @node.tree.animate()
              error: (_, err) -> on_error err
          error: (_, err) =>
            # Change the name back based on the ID
            @node.set name: @node.id[(@node.id.lastIndexOf('/') + 1)..]
            on_error err
            done()
      
      # Kick off the animation
      @node.tree.animate()