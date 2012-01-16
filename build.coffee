###
Builds the client-side scripts/styles from source Coffeescript/Stylus.
###

coffee   = require 'coffee-script'
fs       = require 'fs'
jade     = require 'jade'
nib      = require 'nib'
path     = require 'path'
{Squash} = require 'squash'
stylus   = require 'stylus'
util     = require 'util'

# The main script
@script = 'client/scripts/app'

# The absolute path to the Jade runtime
@jade_runtime = path.resolve './client/scripts/lib/vendor/jade_runtime'

# Options to use with Squash when building the script
@squash_options =
  # The directory to resolve initial requires from
  cwd: 'client/scripts'
  
  # Methods to get Javascript from other extensions
  extensions:
    '.coffee': (file) ->
      # Just compile the file with coffeescript
      return coffee.compile fs.readFileSync file, 'utf8'
    
    '.jade': (file) ->
      # Get the callback code
      js = String jade.compile fs.readFileSync(file, 'utf8'),
        client  : true
        filename: file
      
      # Work out the relative path to the Jade runtime
      p = path.relative path.dirname(file), exports.jade_runtime
      p = './' + p unless p[0] is '.'
      p = p.replace /\\(?=.)/g, '/'
      
      # The JS should load the Jade runtime into a `jade` variable, and attach
      # the compiled callback to `exports`.
      return """
        var jade = require(#{util.inspect p});
        module.exports = #{js}
      """
  
  # A method to call when missing dependencies are encountered
  relax: (file, from) ->
    console.log String new Error "Could not find module `#{file}` from `#{from}`"
  
  # The files to require initially (just the main script)
  requires: { './app.coffee' : 'app' }

# Builds the script
@build_script = =>
  squash = new Squash @squash_options
  fs.writeFileSync "#{@script}.js", squash.squash()
  console.log "Built #{@script}"

# The main style
@style = 'client/styles/app'

# Builds the style
@build_style = =>
  styl = fs.readFileSync "#{@style}.styl", 'utf8'
  css  = stylus(styl).set('filename', "#{@style}.styl").use nib()
  css.render (err, css) =>
    if err
      console.log String err
      return
    fs.writeFileSync "#{@style}.css", css
    console.log "Built #{@style}"

# Only build if this is the main module
if require.main == module
  @build_script()
  @build_style()