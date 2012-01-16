((function() {
    var root = this, modules, require_from, register, error;
    if (typeof global == "undefined") {
        var global;
        if (typeof window != "undefined") {
            global = window;
        } else {
            global = {};
        }
    }
    modules = {};
    require_from = function(parent, from) {
        return function(name) {
            if (modules[from] && modules[from][name]) {
                modules[from][name].parent = parent;
                if (modules[from][name].initialize) {
                    modules[from][name].initialize();
                }
                return modules[from][name].exports;
            } else {
                return error(name, from);
            }
        };
    };
    register = function(names, directory, callback) {
        var module = {
            exports: {},
            initialize: function() {
                callback.call(module.exports, global, module, module.exports, require_from(module, directory), undefined);
                delete module.initialize;
            },
            parent: null
        };
        for (var from in names) {
            modules[from] = modules[from] || {};
            for (var j in names[from]) {
                var name = names[from][j];
                modules[from][name] = module;
            }
        }
    };
    error = function(file, from) {
        return console.log(String(new Error("Could not find module `" + file + "` from `" + from + "`")));
    };
    register({
        "views\\templates": [ "../../lib/vendor/jade_runtime" ]
    }, "lib\\vendor", function(global, module, exports, require, window) {
        if (!Array.isArray) {
            Array.isArray = function(arr) {
                return "[object Array]" == Object.prototype.toString.call(arr);
            };
        }
        if (!Object.keys) {
            Object.keys = function(obj) {
                var arr = [];
                for (var key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        arr.push(key);
                    }
                }
                return arr;
            };
        }
        exports.attrs = function attrs(obj) {
            var buf = [], terse = obj.terse;
            delete obj.terse;
            var keys = Object.keys(obj), len = keys.length;
            if (len) {
                buf.push("");
                for (var i = 0; i < len; ++i) {
                    var key = keys[i], val = obj[key];
                    if ("boolean" == typeof val || null == val) {
                        if (val) {
                            terse ? buf.push(key) : buf.push(key + '="' + key + '"');
                        }
                    } else if ("class" == key && Array.isArray(val)) {
                        buf.push(key + '="' + exports.escape(val.join(" ")) + '"');
                    } else {
                        buf.push(key + '="' + exports.escape(val) + '"');
                    }
                }
            }
            return buf.join(" ");
        };
        exports.escape = function escape(html) {
            return String(html).replace(/&(?!\w+;)/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
        };
        exports.rethrow = function rethrow(err, filename, lineno) {
            if (!filename) throw err;
            var context = 3, str = require("fs").readFileSync(filename, "utf8"), lines = str.split("\n"), start = Math.max(lineno - context, 0), end = Math.min(lines.length, lineno + context);
            var context = lines.slice(start, end).map(function(line, i) {
                var curr = i + start + 1;
                return (curr == lineno ? "  > " : "    ") + curr + "| " + line;
            }).join("\n");
            err.path = filename;
            err.message = (filename || "Jade") + ":" + lineno + "\n" + context + "\n\n" + err.message;
            throw err;
        };
    });
    register({
        views: [ "./templates/login" ]
    }, "views\\templates", function(global, module, exports, require, window) {
        var jade = require("../../lib/vendor/jade_runtime");
        module.exports = function anonymous(locals, attrs, escape, rethrow) {
            var attrs = jade.attrs, escape = jade.escape, rethrow = jade.rethrow;
            var __jade = [ {
                lineno: 1,
                filename: "C:\\Users\\Minty\\Code\\projects\\honours\\client\\scripts\\views\\templates\\login.jade"
            } ];
            try {
                var buf = [];
                with (locals || {}) {
                    var interp;
                    __jade.unshift({
                        lineno: 1,
                        filename: __jade[0].filename
                    });
                    __jade.unshift({
                        lineno: 1,
                        filename: __jade[0].filename
                    });
                    buf.push("<section");
                    buf.push(attrs({
                        id: "home"
                    }));
                    buf.push(">");
                    __jade.unshift({
                        lineno: undefined,
                        filename: __jade[0].filename
                    });
                    __jade.unshift({
                        lineno: 2,
                        filename: __jade[0].filename
                    });
                    buf.push("<div");
                    buf.push(attrs({
                        id: "ring"
                    }));
                    buf.push(">");
                    __jade.unshift({
                        lineno: undefined,
                        filename: __jade[0].filename
                    });
                    __jade.shift();
                    buf.push("</div>");
                    __jade.shift();
                    __jade.unshift({
                        lineno: 3,
                        filename: __jade[0].filename
                    });
                    buf.push("<form");
                    buf.push(attrs({
                        id: "login"
                    }));
                    buf.push(">");
                    __jade.unshift({
                        lineno: undefined,
                        filename: __jade[0].filename
                    });
                    __jade.unshift({
                        lineno: 4,
                        filename: __jade[0].filename
                    });
                    buf.push("<div");
                    buf.push(attrs({
                        id: "message",
                        "class": "red"
                    }));
                    buf.push(">");
                    __jade.unshift({
                        lineno: undefined,
                        filename: __jade[0].filename
                    });
                    __jade.shift();
                    buf.push("</div>");
                    __jade.shift();
                    __jade.unshift({
                        lineno: 6,
                        filename: __jade[0].filename
                    });
                    buf.push("<input");
                    buf.push(attrs({
                        name: "host",
                        placeholder: "Host",
                        type: "text"
                    }));
                    buf.push("/>");
                    __jade.shift();
                    __jade.unshift({
                        lineno: 7,
                        filename: __jade[0].filename
                    });
                    buf.push("<input");
                    buf.push(attrs({
                        name: "user",
                        placeholder: "User",
                        type: "text"
                    }));
                    buf.push("/>");
                    __jade.shift();
                    __jade.unshift({
                        lineno: 7,
                        filename: __jade[0].filename
                    });
                    buf.push("<input");
                    buf.push(attrs({
                        name: "password",
                        placeholder: "Password",
                        type: "password"
                    }));
                    buf.push("/>");
                    __jade.shift();
                    __jade.shift();
                    buf.push("</form>");
                    __jade.shift();
                    __jade.shift();
                    buf.push("</section>");
                    __jade.shift();
                    __jade.shift();
                }
                return buf.join("");
            } catch (err) {
                rethrow(err, __jade[0].filename, __jade[0].lineno);
            }
        };
    });
    register({
        "": [ "./views/login_view" ]
    }, "views", function(global, module, exports, require, window) {
        ((function() {
            var Backbone, LoginView, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
                for (var key in parent) {
                    if (__hasProp.call(parent, key)) child[key] = parent[key];
                }
                function ctor() {
                    this.constructor = child;
                }
                ctor.prototype = parent.prototype;
                child.prototype = new ctor;
                child.__super__ = parent.prototype;
                return child;
            };
            Backbone = global.Backbone;
            module.exports = LoginView = function(_super) {
                __extends(LoginView, _super);
                LoginView.prototype.template = require("./templates/login");
                LoginView.prototype.events = {
                    "keypress input": "login"
                };
                function LoginView() {
                    this.el = $(this.template()).fadeTo(0, 0);
                    LoginView.__super__.constructor.apply(this, arguments);
                }
                LoginView.prototype.initialize = function() {
                    return this.render();
                };
                LoginView.prototype.render = function() {
                    return $(document.body).html("").append(this.el.fadeTo(250, 1));
                };
                LoginView.prototype.login = function(event) {
                    var data, _this = this;
                    if (event.charCode !== 13) return;
                    this.$("#message").text("");
                    this.$("input").blur().attr("disabled", "disabled");
                    this.$("#ring").css("-webkit-animation-play-state", "running");
                    data = {
                        host: this.$('input[name="host"]').val(),
                        user: this.$('input[name="user"]').val(),
                        password: this.$('input[name="password"]').val()
                    };
                    global.socket.once("success", function() {
                        var old_overflow;
                        old_overflow = $(document.body).css("overflow");
                        $(document.body).css("overflow", "hidden");
                        _this.$("#ring").css("-webkit-animation-play-state", "paused");
                        _this.el.bind("webkitAnimationEnd", function() {
                            _this.el.remove();
                            $(document.body).css("overflow", old_overflow);
                            return global.router.navigate("/server", true);
                        });
                        return _this.el.addClass("leaving");
                    });
                    global.socket.once("error", function(msg) {
                        _this.$("#ring").css("-webkit-animation-play-state", "paused");
                        _this.$("input").removeAttr("disabled");
                        return _this.$("#message").text(msg).css("top", -_this.$("#message").outerHeight());
                    });
                    return global.socket.emit("login", data);
                };
                return LoginView;
            }(Backbone.View);
        })).call(this);
    });
    register({
        views: [ "../lib/query" ]
    }, "lib", function(global, module, exports, require, window) {
        ((function() {
            var query, _;
            _ = global._;
            module.exports = query = function(sql, database, callback) {
                var data, _ref;
                if (database == null) database = null;
                if (callback == null) {
                    _ref = [ null, database ], database = _ref[0], callback = _ref[1];
                }
                data = {
                    sql: sql,
                    database: database,
                    id: _.uniqueId("query")
                };
                socket.once("results_" + data.id, function(data) {
                    if (data.err != null) return callback(data.err);
                    return callback(null, data.results);
                });
                return socket.emit("query", data);
            };
        })).call(this);
    });
    register({
        views: [ "./templates/server" ]
    }, "views\\templates", function(global, module, exports, require, window) {
        var jade = require("../../lib/vendor/jade_runtime");
        module.exports = function anonymous(locals, attrs, escape, rethrow) {
            var attrs = jade.attrs, escape = jade.escape, rethrow = jade.rethrow;
            var __jade = [ {
                lineno: 1,
                filename: "C:\\Users\\Minty\\Code\\projects\\honours\\client\\scripts\\views\\templates\\server.jade"
            } ];
            try {
                var buf = [];
                with (locals || {}) {
                    var interp;
                    __jade.unshift({
                        lineno: 1,
                        filename: __jade[0].filename
                    });
                    __jade.unshift({
                        lineno: 1,
                        filename: __jade[0].filename
                    });
                    buf.push("<section");
                    buf.push(attrs({
                        id: "server"
                    }));
                    buf.push(">");
                    __jade.unshift({
                        lineno: undefined,
                        filename: __jade[0].filename
                    });
                    __jade.unshift({
                        lineno: 2,
                        filename: __jade[0].filename
                    });
                    buf.push("<div");
                    buf.push(attrs({
                        id: "graph"
                    }));
                    buf.push(">");
                    __jade.unshift({
                        lineno: undefined,
                        filename: __jade[0].filename
                    });
                    __jade.shift();
                    buf.push("</div>");
                    __jade.shift();
                    __jade.shift();
                    buf.push("</section>");
                    __jade.shift();
                    __jade.shift();
                }
                return buf.join("");
            } catch (err) {
                rethrow(err, __jade[0].filename, __jade[0].lineno);
            }
        };
    });
    register({
        "": [ "./views/server_view" ]
    }, "views", function(global, module, exports, require, window) {
        ((function() {
            var Backbone, ServerView, query, _, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
                for (var key in parent) {
                    if (__hasProp.call(parent, key)) child[key] = parent[key];
                }
                function ctor() {
                    this.constructor = child;
                }
                ctor.prototype = parent.prototype;
                child.prototype = new ctor;
                child.__super__ = parent.prototype;
                return child;
            };
            _ = global._;
            Backbone = global.Backbone;
            query = require("../lib/query");
            module.exports = ServerView = function(_super) {
                __extends(ServerView, _super);
                ServerView.prototype.template = require("./templates/server");
                function ServerView() {
                    this.el = $(this.template()).fadeTo(0, 0);
                    ServerView.__super__.constructor.apply(this, arguments);
                }
                ServerView.prototype.initialize = function() {
                    var server, _this = this;
                    server = {
                        name: "host",
                        id: "host",
                        children: []
                    };
                    return query("show databases", function(err, results) {
                        if (err != null) throw err;
                        return async.forEachSeries(results, function(result, callback) {
                            var database;
                            database = {
                                name: result.Database,
                                id: "" + server.id + "_" + result.Database,
                                children: []
                            };
                            server.children.push(database);
                            return query("show tables", database.name, function(err, results) {
                                if (err != null) callback(err);
                                return async.forEachSeries(results, function(result, callback) {
                                    var table;
                                    table = {
                                        name: result["Tables_in_" + database.name],
                                        id: "" + database.id + "_" + result["Tables_in_" + database.name],
                                        children: []
                                    };
                                    database.children.push(table);
                                    return query("describe " + table.name, database.name, function(err, results) {
                                        var field, result, _i, _len;
                                        if (err) callback(err);
                                        for (_i = 0, _len = results.length; _i < _len; _i++) {
                                            result = results[_i];
                                            field = {
                                                name: result.Field,
                                                id: "" + table.id + "_" + result.Field,
                                                children: []
                                            };
                                            table.children.push(field);
                                        }
                                        return callback();
                                    });
                                }, function() {
                                    return callback();
                                });
                            });
                        }, function(err) {
                            if (err != null) throw err;
                            global.server = server;
                            return _this.render();
                        });
                    });
                };
                ServerView.prototype.render = function() {
                    $(document.body).html("").append(this.el.fadeTo(250, 1));
                    return global.init();
                };
                return ServerView;
            }(Backbone.View);
        })).call(this);
    });
    register({
        "": [ "app" ]
    }, "", function(global, module, exports, require, window) {
        ((function() {
            var Backbone, LoginView, Router, ServerView, check_login, io, jQuery, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
                for (var key in parent) {
                    if (__hasProp.call(parent, key)) child[key] = parent[key];
                }
                function ctor() {
                    this.constructor = child;
                }
                ctor.prototype = parent.prototype;
                child.prototype = new ctor;
                child.__super__ = parent.prototype;
                return child;
            }, _this = this;
            Backbone = global.Backbone;
            io = global.io;
            jQuery = global.jQuery;
            LoginView = require("./views/login_view");
            ServerView = require("./views/server_view");
            check_login = function(callback) {
                global.socket.once("auth_response", function(authorised) {
                    if (!authorised) return global.router.navigate("/login", true);
                    return callback();
                });
                return global.socket.emit("auth_test");
            };
            Router = function(_super) {
                __extends(Router, _super);
                function Router() {
                    Router.__super__.constructor.apply(this, arguments);
                }
                Router.prototype.routes = {
                    "": "home",
                    "/login": "login",
                    "/server": "server"
                };
                Router.prototype.home = function() {
                    return check_login(function() {
                        return global.router.navigate("/server", true);
                    });
                };
                Router.prototype.login = function() {
                    return new LoginView;
                };
                Router.prototype.server = function() {
                    return check_login(function() {
                        return new ServerView;
                    });
                };
                return Router;
            }(Backbone.Router);
            jQuery(function() {
                global.socket = io.connect();
                global.router = new Router;
                return Backbone.history.start();
            });
        })).call(this);
    });
    root["app"] = require_from(null, "")("app");
})).call(this);