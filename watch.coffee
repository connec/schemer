build        = require './build'
fs           = require 'fs'
{Squash}     = require 'squash'
zapp         = require './server/zapp'

# The port to listen on
port = 3000

# Add a handler for uncaught exceptions, so the script keeps running
process.on 'uncaughtException', (err) ->
  console.log "Uncaught Exception:\n  #{err.stack}"

# Watch the server directory for changes
server_timer = null
fs.watch 'server', (event) ->
  return unless event is 'change'
  clearTimeout server_timer if server_timer?
  
  server_timer = setTimeout ->
    console.log 'Restarting server'
    
    # Clear `require.cache` so we requires are refreshed
    delete require.cache[file] for file of require.cache
    
    # Reload the server
    try
      new_zapp = require './server/zapp'
      
      # This is a bit ugly: because closing the server is asynchronous and
      # won't complete until all connections have timed out, we leave the
      # initial server running and instead copy all the properties from
      # the new one.
      (zapp[k] = v unless k is 'app' or k is 'io') for k, v of new_zapp
      zapp.app[k] = v for k, v of new_zapp.app
      zapp.io[k] = v for k, v of new_zapp.io
      
      console.log "Listening on port #{port}"
    catch err
      console.log String err
    
    server_timer = null
  , 50

# Watch the client/scripts directory for changes
squash = new Squash build.squash_options
squash.watch (err, js) ->
  if err
    console.log String err
    return
  fs.writeFileSync "#{build.script}.js", js
  console.log "Rebuilt #{build.script}"

# Watch the client/styles directory for stylus file changes
style_skip  = true
compile_style = ->
  build.build_style()
  setTimeout ->
    style_skip = false
  , 50

fs.watch 'client/styles', (event) ->
  return unless event is 'change'
  return if style_skip
  style_skip = true
  setTimeout compile_style, 50

compile_style()

# Start the app
zapp.start port