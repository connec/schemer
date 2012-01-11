coffeescript = require 'coffee-script'
fs           = require 'fs'
jade         = require 'jade'
nib          = require 'nib'
path         = require 'path'
{Squash}     = require 'squash'
stylus       = require 'stylus'
zapp         = require './server/zapp'

# The port to listen on
port = 3000

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
script_path  = 'client/scripts/app'

squash = new Squash
  cwd: 'client/scripts'
  extensions:
    '.coffee': (file) ->
      coffeescript.compile fs.readFileSync file, 'utf8'
    '.jade': (file) ->
      result = '''
        var jade = global.jade_runtime;
        module.exports = 
      '''
      result += String jade.compile fs.readFileSync(file, 'utf8'),
        client: true
        filename: file
      result += ';'
      return result
  relax: (name, from) ->
    console.log "Could not find module `#{name}` from `#{from}`"
  requires: {'./app.coffee': 'app'}

squash.watch (err, js) ->
  if err
    console.log String err
    return
  fs.writeFileSync "#{script_path}.js", js
  console.log "Rebuilt #{script_path}"

# Watch the client/styles directory for stylus file changes
style_path  = 'client/styles/app'
style_skip  = true

compile_style = ->
  styl = fs.readFileSync "#{style_path}.styl", 'utf8'
  css  = stylus(styl).set('filename', "#{style_path}.styl").use nib()
  css.render (err, css) ->
    if err
      console.log String err
      return
    fs.writeFileSync "#{style_path}.css", css
    console.log "Rebuilt #{style_path}"
  
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