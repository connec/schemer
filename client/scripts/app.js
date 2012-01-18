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
        views: [ "./base_view" ]
    }, "views", function(global, module, exports, require, window) {
        ((function() {
            var Backbone, BaseView, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
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
            module.exports = BaseView = function(_super) {
                __extends(BaseView, _super);
                function BaseView() {
                    this.el = $(this.template());
                    BaseView.__super__.constructor.apply(this, arguments);
                }
                BaseView.prototype.fade_in = function(duration) {
                    if (duration == null) duration = 500;
                    this.el.fadeTo(0, 0);
                    this.render();
                    return this.el.fadeTo(duration, 1);
                };
                return BaseView;
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
        views: [ "./server_view" ],
        "": [ "./views/server_view" ]
    }, "views", function(global, module, exports, require, window) {
        ((function() {
            var $jit, BaseView, ServerView, query, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
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
            $jit = global.$jit;
            BaseView = require("./base_view");
            query = require("../lib/query");
            module.exports = ServerView = function(_super) {
                __extends(ServerView, _super);
                ServerView.prototype.template = require("./templates/server");
                function ServerView(on_loaded) {
                    this.on_loaded = on_loaded;
                    ServerView.__super__.constructor.apply(this, arguments);
                }
                ServerView.prototype.initialize = function() {
                    var _this = this;
                    this.server = {
                        name: "host",
                        id: "host",
                        data: {},
                        children: []
                    };
                    return query("show databases", function(err, results) {
                        if (err != null) throw err;
                        return async.forEachSeries(results, function(result, next_database) {
                            var database;
                            database = {
                                name: result.Database,
                                id: "" + _this.server.id + "_" + result.Database,
                                data: {},
                                children: []
                            };
                            _this.server.children.push(database);
                            return query("show tables", database.name, function(err, results) {
                                if (err != null) next_database(err);
                                return async.forEachSeries(results, function(result, next_table) {
                                    var table;
                                    table = {
                                        name: result["Tables_in_" + database.name],
                                        id: "" + database.id + "_" + result["Tables_in_" + database.name],
                                        data: {},
                                        children: []
                                    };
                                    database.children.push(table);
                                    return query("describe " + table.name, database.name, function(err, results) {
                                        var field, result, _i, _len;
                                        if (err) next_table(err);
                                        for (_i = 0, _len = results.length; _i < _len; _i++) {
                                            result = results[_i];
                                            field = {
                                                name: result.Field,
                                                id: "" + table.id + "_" + result.Field,
                                                data: {},
                                                children: []
                                            };
                                            table.children.push(field);
                                        }
                                        return next_table();
                                    });
                                }, function() {
                                    return next_database();
                                });
                            });
                        }, function(err) {
                            if (err != null) throw err;
                            return _this.on_loaded();
                        });
                    });
                };
                ServerView.prototype.render = function() {
                    $("body").html("").append(this.el);
                    return this.render_graph();
                };
                ServerView.prototype.render_graph = function() {
                    var div, set_label_text, tree;
                    div = $("<div></div>").css({
                        position: "absolute",
                        left: -1e3,
                        fontFamily: "Lucida Console",
                        fontSize: "0.8em"
                    }).prependTo("body");
                    set_label_text = function(element, node) {
                        var ratio;
                        div.text(node.name);
                        if ((ratio = 140 / div.width()) < 1) {
                            element.title = node.name;
                            return element.textContent = node.name.slice(0, Math.floor(ratio * node.name.length) - 3) + "...";
                        } else {
                            return element.textContent = node.name;
                        }
                    };
                    tree = new $jit.ST({
                        injectInto: "graph",
                        duration: 500,
                        transition: $jit.Trans.Quart.easeInOut,
                        levelDistance: 50,
                        levelsToShow: 1,
                        Navigation: {
                            enable: true,
                            panning: true
                        },
                        Edge: {
                            type: "bezier",
                            overridable: true
                        },
                        Node: {
                            width: 150,
                            height: 25,
                            type: "rectangle",
                            color: "#ccc",
                            overridable: true
                        },
                        onCreateLabel: function(element, node) {
                            var style;
                            element.id = node.id;
                            set_label_text(element, node);
                            style = element.style;
                            style.width = "150px";
                            style.lineHeight = "30px";
                            style.color = "#333";
                            style.cursor = "pointer";
                            style.fontFamily = "Lucida Console";
                            style.fontSize = "0.8em";
                            style.textAlign = "center";
                            return element.onclick = function() {
                                var nodes, tree_node;
                                nodes = [];
                                tree_node = tree.graph.getNode(node.id);
                                tree.graph.eachNode(function(subnode) {
                                    if (!(subnode._depth === node._depth && subnode.id !== node.id)) {
                                        return;
                                    }
                                    if (!tree.graph.getNode(subnode.id).getParents().length) return;
                                    if (!tree.graph.getNode(subnode.id).getParents()[0].selected) return;
                                    return nodes.push(subnode.id);
                                });
                                tree.op.removeNode(nodes, {
                                    duration: 250,
                                    hideLabels: false,
                                    type: "fade:con"
                                });
                                return tree.onClick(node.id);
                            };
                        },
                        onBeforePlotNode: function(node) {
                            if (node.selected) {
                                return node.data.$color = "#aaa";
                            } else {
                                return delete node.data.$color;
                            }
                        },
                        onBeforePlotLine: function(edge) {
                            if (edge.nodeFrom.selected && edge.nodeTo.selected) {
                                edge.data.$color = "#aaa";
                                return edge.data.$lineWidth = 3;
                            } else {
                                delete edge.data.$color;
                                return delete edge.data.$lineWidth;
                            }
                        }
                    });
                    tree.loadJSON(this.server);
                    tree.compute();
                    tree.onClick(tree.root);
                    global.tree = tree;
                    return div.remove();
                };
                return ServerView;
            }(BaseView);
        })).call(this);
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
            var BaseView, LoginView, ServerView, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
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
            BaseView = require("./base_view");
            ServerView = require("./server_view");
            module.exports = LoginView = function(_super) {
                __extends(LoginView, _super);
                function LoginView() {
                    LoginView.__super__.constructor.apply(this, arguments);
                }
                LoginView.prototype.template = require("./templates/login");
                LoginView.prototype.events = {
                    "keypress input": "login"
                };
                LoginView.prototype.render = function() {
                    return $(document.body).html("").append(this.el);
                };
                LoginView.prototype.login = function(event) {
                    var data;
                    if (event.charCode !== 13) return;
                    this.$("#message").text("");
                    this.$("input").blur().attr("disabled", "disabled");
                    this.$("#ring").css("-webkit-animation-play-state", "running");
                    data = {
                        host: this.$('input[name="host"]').val(),
                        user: this.$('input[name="user"]').val(),
                        password: this.$('input[name="password"]').val()
                    };
                    global.socket.once("success", this.login_success.bind(this));
                    global.socket.once("error", this.login_error.bind(this));
                    return global.socket.emit("login", data);
                };
                LoginView.prototype.login_success = function() {
                    var new_view, old_overflow, _this = this;
                    old_overflow = $("body").css("overflow");
                    new_view = new ServerView(function() {
                        $(document.body).css("overflow", "hidden");
                        _this.$("#ring").css("-webkit-animation-play-state", "paused");
                        return _this.el.addClass("leaving");
                    });
                    return this.el.bind("webkitAnimationEnd", function() {
                        $(document.body).css("overflow", old_overflow);
                        global.router.navigate("/server");
                        return new_view.fade_in();
                    });
                };
                LoginView.prototype.login_error = function(msg) {
                    this.$("#ring").css("-webkit-animation-play-state", "paused");
                    this.$("input").removeAttr("disabled");
                    return this.$("#message").text(msg).css("top", -this.$("#message").outerHeight());
                };
                return LoginView;
            }(BaseView);
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
                    var view;
                    view = new LoginView;
                    return view.fade_in();
                };
                Router.prototype.server = function() {
                    return check_login(function() {
                        var view;
                        return view = new ServerView(function() {
                            return view.fade_in();
                        });
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