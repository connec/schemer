_ = global._

###
A wrapper around socket-based queries.
###
module.exports = query = (sql, database = null, callback) ->
  [database, callback] = [null, database] unless callback?
  
  data = {sql, database, id: _.uniqueId 'query'}
  socket.once "results_#{data.id}", (data) ->
    return callback data.err if data.err?
    callback null, data.results
  socket.emit 'query', data