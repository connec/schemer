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
            var BaseView, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
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
        models: [ "./graph_model" ]
    }, "models", function(global, module, exports, require, window) {
        ((function() {
            var GraphModel, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
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
            module.exports = GraphModel = function(_super) {
                __extends(GraphModel, _super);
                function GraphModel() {
                    var _ref, _ref2;
                    GraphModel.__super__.constructor.apply(this, arguments);
                    this.set({
                        node_id: "" + ((_ref = (_ref2 = this.get("parent")) != null ? _ref2.get("node_id") : void 0) != null ? _ref : "") + "/" + this.get("name"),
                        children: this.Children != null ? new this.Children(this) : null
                    });
                }
                GraphModel.prototype.children = function() {
                    return this.get("children");
                };
                GraphModel.prototype.fetch_children = function(callback) {
                    var children;
                    if (!(children = this.get("children"))) return callback();
                    children.reset();
                    return children.fetch({
                        error: function(_, err) {
                            return callback(err);
                        },
                        success: function(collection) {
                            return callback(null, collection);
                        }
                    });
                };
                return GraphModel;
            }(Backbone.Model);
        })).call(this);
    });
    register({
        collections: [ "./graph_collection" ]
    }, "collections", function(global, module, exports, require, window) {
        ((function() {
            var GraphCollection, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
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
            module.exports = GraphCollection = function(_super) {
                __extends(GraphCollection, _super);
                function GraphCollection(parent) {
                    this.parent = parent;
                    GraphCollection.__super__.constructor.call(this, null);
                }
                GraphCollection.prototype.comparator = function(model) {
                    return model.get("name");
                };
                GraphCollection.prototype.fetch = function(_arg) {
                    var data, error, success, _this = this;
                    error = _arg.error, success = _arg.success;
                    data = {};
                    switch (this.model.name) {
                      case "Field":
                        data.database = this.parent.get("parent").get("name");
                        data.table = this.parent.get("name");
                        break;
                      case "Table":
                        data.database = this.parent.get("name");
                    }
                    return global.socket.request("get_" + this.constructor.name.toLowerCase(), data, function(err, models) {
                        var model, _i, _j, _len, _len2;
                        if (err) return error(null, err);
                        for (_i = 0, _len = models.length; _i < _len; _i++) {
                            model = models[_i];
                            model.id = true;
                            model.parent = _this.parent;
                        }
                        for (_j = 0, _len2 = models.length; _j < _len2; _j++) {
                            model = models[_j];
                            model.parent = _this.parent;
                        }
                        _this.add(models);
                        return success(_this, null);
                    });
                };
                GraphCollection.prototype.find = function(arg) {
                    if (typeof arg === "function") {
                        return GraphCollection.__super__.find.apply(this, arguments);
                    }
                    return GraphCollection.__super__.find.call(this, function(model) {
                        var k, v;
                        for (k in arg) {
                            v = arg[k];
                            if (model.get(k) !== v) return false;
                        }
                        return true;
                    });
                };
                return GraphCollection;
            }(Backbone.Collection);
        })).call(this);
    });
    register({
        collections: [ "../models/field" ]
    }, "models", function(global, module, exports, require, window) {
        ((function() {
            var Field, GraphModel, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
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
            GraphModel = require("./graph_model");
            module.exports = Field = function(_super) {
                __extends(Field, _super);
                function Field() {
                    Field.__super__.constructor.apply(this, arguments);
                }
                return Field;
            }(GraphModel);
        })).call(this);
    });
    register({
        models: [ "../collections/fields" ]
    }, "collections", function(global, module, exports, require, window) {
        ((function() {
            var Field, Fields, GraphCollection, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
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
            GraphCollection = require("./graph_collection");
            Field = require("../models/field");
            module.exports = Fields = function(_super) {
                __extends(Fields, _super);
                function Fields() {
                    Fields.__super__.constructor.apply(this, arguments);
                }
                Fields.prototype.model = Field;
                Fields.prototype.comparator = null;
                return Fields;
            }(GraphCollection);
        })).call(this);
    });
    register({
        collections: [ "../models/table" ]
    }, "models", function(global, module, exports, require, window) {
        ((function() {
            var Fields, GraphModel, Table, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
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
            Fields = require("../collections/fields");
            GraphModel = require("./graph_model");
            module.exports = Table = function(_super) {
                __extends(Table, _super);
                function Table() {
                    Table.__super__.constructor.apply(this, arguments);
                }
                Table.prototype.Children = Fields;
                return Table;
            }(GraphModel);
        })).call(this);
    });
    register({
        models: [ "../collections/tables" ]
    }, "collections", function(global, module, exports, require, window) {
        ((function() {
            var GraphCollection, Table, Tables, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
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
            GraphCollection = require("./graph_collection");
            Table = require("../models/table");
            module.exports = Tables = function(_super) {
                __extends(Tables, _super);
                function Tables() {
                    Tables.__super__.constructor.apply(this, arguments);
                }
                Tables.prototype.model = Table;
                return Tables;
            }(GraphCollection);
        })).call(this);
    });
    register({
        collections: [ "../models/database" ]
    }, "models", function(global, module, exports, require, window) {
        ((function() {
            var Database, GraphModel, Tables, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
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
            GraphModel = require("./graph_model");
            Tables = require("../collections/tables");
            module.exports = Database = function(_super) {
                __extends(Database, _super);
                function Database() {
                    Database.__super__.constructor.apply(this, arguments);
                }
                Database.prototype.Children = Tables;
                return Database;
            }(GraphModel);
        })).call(this);
    });
    register({
        models: [ "../collections/databases" ]
    }, "collections", function(global, module, exports, require, window) {
        ((function() {
            var Database, Databases, GraphCollection, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
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
            Database = require("../models/database");
            GraphCollection = require("./graph_collection");
            module.exports = Databases = function(_super) {
                __extends(Databases, _super);
                function Databases() {
                    Databases.__super__.constructor.apply(this, arguments);
                }
                Databases.prototype.model = Database;
                return Databases;
            }(GraphCollection);
        })).call(this);
    });
    register({
        views: [ "../models/server" ],
        "": [ "./models/server" ]
    }, "models", function(global, module, exports, require, window) {
        ((function() {
            var Databases, GraphModel, Server, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
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
            Databases = require("../collections/databases");
            GraphModel = require("./graph_model");
            module.exports = Server = function(_super) {
                __extends(Server, _super);
                Server.prototype.Children = Databases;
                function Server() {
                    Server.__super__.constructor.apply(this, arguments);
                    this.set({
                        id: true,
                        node_id: this.get("name")
                    });
                }
                return Server;
            }(GraphModel);
        })).call(this);
    });
    register({
        views: [ "./toolbox_view" ]
    }, "views", function(global, module, exports, require, window) {
        ((function() {
            var ToolboxView, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
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
            module.exports = ToolboxView = function(_super) {
                __extends(ToolboxView, _super);
                function ToolboxView(el) {
                    this.el = el;
                }
                return ToolboxView;
            }(Backbone.View);
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
                        id: "ruler"
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
                    buf.push("<div");
                    buf.push(attrs({
                        id: "toolbox"
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
                        lineno: 4,
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
            var BaseView, Server, ServerView, ToolboxView, __bind = function(fn, me) {
                return function() {
                    return fn.apply(me, arguments);
                };
            }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
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
            Server = require("../models/server");
            ToolboxView = require("./toolbox_view");
            module.exports = ServerView = function(_super) {
                __extends(ServerView, _super);
                ServerView.prototype.template = require("./templates/server");
                function ServerView(on_loaded) {
                    this.on_loaded = on_loaded;
                    this.node_click = __bind(this.node_click, this);
                    ServerView.__super__.constructor.apply(this, arguments);
                }
                ServerView.prototype.initialize = function() {
                    var _this = this;
                    return global.server.fetch_children(function(err) {
                        if (err) return console.log(String(err));
                        return _this.on_loaded();
                    });
                };
                ServerView.prototype.render = function() {
                    $("body").html("").append(this.el);
                    this.$ruler = this.$("#ruler");
                    this.toolbox = new ToolboxView(this.$("#toolbox"));
                    return this.render_graph();
                };
                ServerView.prototype.render_graph = function() {
                    var _this = this;
                    this.tree = new Tree($("#graph"));
                    $(global).resize(function() {
                        return _this.tree.refresh();
                    });
                    this.tree.bind("node:add", function(node, context) {
                        var _ref;
                        node.model = (_ref = context != null ? context.model.children().find({
                            name: node.$label.text()
                        }) : void 0) != null ? _ref : global.server;
                        return _this.set_label_text(node.$label);
                    });
                    this.tree.bind("node:remove", function(node) {
                        return delete node.model;
                    });
                    this.tree.bind("node:click", this.node_click);
                    this.tree.set_root(global.server.get("name"));
                    this.tree.root.$elem.addClass("in-path selected");
                    this.tree.set_centre(this.tree.root);
                    global.server.children().each(function(database) {
                        return _this.tree.insert_node(database.get("name"), _this.tree.root);
                    });
                    this.tree.refresh();
                    return global.tree = this.tree;
                };
                ServerView.prototype.node_click = function(node) {
                    var direction, path, _i, _len, _ref, _ref2;
                    if (node.$elem.hasClass("selected")) return;
                    direction = ((_ref = node.parent) != null ? _ref.$elem.hasClass("selected") : void 0) ? "down" : "up";
                    this.tree.$wrapper.find(".in-path, .selected").removeClass("in-path selected");
                    node.$elem.addClass("selected");
                    _ref2 = [ node ].concat(node.parents());
                    for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
                        path = _ref2[_i];
                        path.$elem.addClass("in-path");
                    }
                    this.tree.unbind("node:click", this.node_click);
                    return this["move_" + direction](node);
                };
                ServerView.prototype.move_down = function(node) {
                    var sibling, _i, _len, _ref, _this = this;
                    _ref = node.siblings();
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        sibling = _ref[_i];
                        this.tree.remove_node(sibling);
                    }
                    this.tree.set_centre(node);
                    this.tree.animate();
                    if (!node.model.children()) return this.finish_move(node);
                    return this.tree.bind_once("anim:after", function() {
                        return node.model.fetch_children(function(err, children) {
                            if (err) return console.log(String(err));
                            children.each(function(child) {
                                return _this.tree.insert_node(child.get("name"), node);
                            });
                            _this.tree.animate();
                            return _this.tree.bind_once("anim:after", function() {
                                return _this.finish_move(node);
                            });
                        });
                    });
                };
                ServerView.prototype.move_up = function(node) {
                    var child, only_child, _i, _len, _ref, _this = this;
                    only_child = node.children[0];
                    _ref = only_child.children.slice(0);
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        child = _ref[_i];
                        this.tree.remove_node(child);
                    }
                    this.tree.set_centre(node);
                    this.tree.animate();
                    return this.tree.bind_once("anim:after", function() {
                        return node.model.fetch_children(function(err, children) {
                            var i;
                            if (err) return console.log(String(err));
                            i = 0;
                            children.each(function(child) {
                                if (child.get("name") === only_child.model.get("name")) {
                                    i++;
                                } else {
                                    _this.tree.insert_node(child.get("name"), node, i);
                                }
                                return i++;
                            });
                            _this.tree.animate();
                            return _this.tree.bind_once("anim:after", function() {
                                return _this.finish_move(node);
                            });
                        });
                    });
                };
                ServerView.prototype.finish_move = function() {
                    return this.tree.bind("node:click", this.node_click);
                };
                ServerView.prototype.set_label_text = function($label) {
                    var label, ratio;
                    label = $label.text();
                    this.$ruler.text(label);
                    if ((ratio = 140 / this.$ruler.width()) < 1) {
                        $label.attr({
                            title: label
                        });
                        return $label.text(label.slice(0, Math.floor(ratio * label.length) - 3) + "...");
                    } else {
                        return $label.text(label);
                    }
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
            var BaseView, LoginView, Server, ServerView, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
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
            Server = require("../models/server");
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
                    return global.socket.request("login", data, function(err) {
                        var new_view, old_overflow;
                        if (err) {
                            _this.$("#ring").css("-webkit-animation-play-state", "paused");
                            _this.$("input").removeAttr("disabled");
                            _this.$("#message").text(String(err)).css("top", -_this.$("#message").outerHeight());
                            return;
                        }
                        global.server = new Server({
                            name: data.host
                        });
                        old_overflow = $("body").css("overflow");
                        new_view = new ServerView(function() {
                            $("body").css("overflow", "hidden");
                            _this.$("#ring").css("-webkit-animation-play-state", "paused");
                            return _this.el.addClass("leaving");
                        });
                        return _this.el.bind("webkitAnimationEnd", function() {
                            $("body").css("overflow", old_overflow);
                            global.router.navigate("");
                            return new_view.fade_in();
                        });
                    });
                };
                return LoginView;
            }(BaseView);
        })).call(this);
    });
    register({
        "": [ "app" ]
    }, "", function(global, module, exports, require, window) {
        ((function() {
            var LoginView, Router, Server, ServerView, check_login, socket_request, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
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
            LoginView = require("./views/login_view");
            Server = require("./models/server");
            ServerView = require("./views/server_view");
            socket_request = function(request, request_data, callback) {
                var data, _ref;
                if (!callback) {
                    _ref = [ null, request_data ], request_data = _ref[0], callback = _ref[1];
                }
                data = {
                    id: _.uniqueId("request_"),
                    request: request,
                    request_data: request_data
                };
                this.once("response_" + data.id, function(_arg) {
                    var err, error, k, result, v;
                    err = _arg.err, result = _arg.result;
                    if (err) {
                        error = new Error;
                        for (k in err) {
                            v = err[k];
                            error[k] = v;
                        }
                        return callback(error);
                    }
                    return callback(null, result);
                });
                return this.emit("request", data);
            };
            check_login = function(callback) {
                return global.socket.request("check_login", function(err, response) {
                    if (err) return console.log(String(err));
                    if (!response) return global.router.navigate("/login", true);
                    global.server = new Server({
                        name: response.host
                    });
                    return callback();
                });
            };
            Router = function(_super) {
                __extends(Router, _super);
                function Router() {
                    Router.__super__.constructor.apply(this, arguments);
                }
                Router.prototype.routes = {
                    "/": "home",
                    "/login": "login"
                };
                Router.prototype.home = function() {
                    return check_login(function() {
                        var view;
                        return view = new ServerView(function() {
                            return view.fade_in();
                        });
                    });
                };
                Router.prototype.login = function() {
                    var view;
                    view = new LoginView;
                    return view.fade_in();
                };
                return Router;
            }(Backbone.Router);
            jQuery(function() {
                global.socket = io.connect();
                global.router = new Router;
                global.socket.request = socket_request.bind(global.socket);
                if (global.location.hash.length < 2) global.location.hash = "#/";
                return Backbone.history.start();
            });
        })).call(this);
    });
    root["app"] = require_from(null, "")("app");
})).call(this);