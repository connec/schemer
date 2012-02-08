###
Define some compatability helpers as jQuery plugins.
###

###
Sets a number of vendor-specific CSS properties for animation-play-state.
###
jQuery.fn.animationPlayState = (state) ->
  @css
    'animation-play-state':         state
    '-moz-animation-play-state':    state
    '-ms-animation-play-state':     state
    '-webkit-animation-play-state': state

###
Binds a handler to a number of vendor-specific animationend events.
###
jQuery.fn.animationEnd = (handler) ->
  throw new Error 'animationEnd triggering not implemented' unless handler
  
  @bind 'animationend', handler
  @bind 'webkitAnimationEnd', handler