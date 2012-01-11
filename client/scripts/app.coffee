jade_runtime = require './vendor/jade_runtime'
jquery       = require './vendor/jquery'

global.jade_runtime = jade_runtime

jquery ->
  {HomeView} = require './views/home_view'
  new HomeView