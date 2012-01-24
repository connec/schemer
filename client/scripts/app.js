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
                        id: "" + ((_ref = (_ref2 = this.get("parent")) != null ? _ref2.get("id") : void 0) != null ? _ref : "") + "/" + this.get("name"),
                        children: this.Children != null ? new this.Children(this) : null
                    });
                }
                GraphModel.prototype.fetch_children = function(callback) {
                    return this.get("children").fetch({
                        error: function(_, err) {
                            return callback(err);
                        },
                        success: function(collection) {
                            return callback(null, collection);
                        }
                    });
                };
                GraphModel.prototype.get_graph_json = function(depth) {
                    var children;
                    if (depth == null) depth = 1;
                    children = this.get("children");
                    return {
                        id: this.get("id"),
                        name: this.get("name"),
                        children: depth && children != null ? (depth--, children.map(function(child) {
                            return child.get_graph_json(depth);
                        })) : []
                    };
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
                        var model, _i, _len;
                        if (err) return error(null, err);
                        for (_i = 0, _len = models.length; _i < _len; _i++) {
                            model = models[_i];
                            model.parent = _this.parent;
                        }
                        _this.add(models);
                        return success(_this, null);
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
                function Server() {
                    Server.__super__.constructor.apply(this, arguments);
                }
                Server.prototype.Children = Databases;
                return Server;
            }(GraphModel);
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
            var $jit, BaseView, Server, ServerView, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
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
            Server = require("../models/server");
            module.exports = ServerView = function(_super) {
                __extends(ServerView, _super);
                ServerView.prototype.template = require("./templates/server");
                function ServerView(on_loaded) {
                    this.on_loaded = on_loaded;
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
                    return this.render_graph();
                };
                ServerView.prototype.render_graph = function() {
                    var ruler, set_label_text, tree, _this = this;
                    ruler = this.$("#ruler");
                    set_label_text = function(element, node) {
                        var ratio;
                        ruler.text(node.name);
                        if ((ratio = 140 / ruler.width()) < 1) {
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
                                var tree_node;
                                if (node._depth === tree.clickedNode._depth) return;
                                if (node._depth > tree.clickedNode._depth) {
                                    return async.series([ function(finished) {
                                        var nodes;
                                        nodes = [];
                                        tree.graph.eachNode(function(subnode) {
                                            if (!(subnode._depth === node._depth && subnode.id !== node.id)) {
                                                return;
                                            }
                                            if (!tree.graph.getNode(subnode.id).getParents().length) {
                                                return;
                                            }
                                            if (!tree.graph.getNode(subnode.id).getParents()[0].selected) {
                                                return;
                                            }
                                            return nodes.push(subnode.id);
                                        });
                                        return tree.op.removeNode(nodes, {
                                            duration: 250,
                                            hideLabels: false,
                                            type: "fade:con",
                                            onComplete: function() {
                                                return finished();
                                            }
                                        });
                                    }, function(finished) {
                                        var children, tree_node;
                                        tree_node = tree.graph.getNode(node.id);
                                        children = tree_node.model.get("children");
                                        if ((children != null ? children.length : void 0) === 0) {
                                            return tree_node.model.fetch_children(function(err, children) {
                                                if (err) return finished(err);
                                                return tree.addSubtree(tree_node.model.get_graph_json(), "animate", {
                                                    hideLabels: false,
                                                    onComplete: function() {
                                                        return finished();
                                                    }
                                                });
                                            });
                                        } else if (children != null ? children.length : void 0) {
                                            return tree.addSubtree(tree_node.model.get_graph_json(), "animate", {
                                                hideLabels: false,
                                                onComplete: function() {
                                                    return finished();
                                                }
                                            });
                                        } else {
                                            return tree.onClick(node.id);
                                        }
                                    } ], function(err) {
                                        if (err) return console.log(String(err));
                                        return tree.onClick(node.id);
                                    });
                                } else {
                                    tree_node = tree.graph.getNode(node.id);
                                    return tree.onClick(node.id, {
                                        onComplete: function() {
                                            return tree.addSubtree(tree_node.model.get_graph_json(), "animate", {
                                                hideLabels: false
                                            });
                                        }
                                    });
                                }
                            };
                        },
                        onBeforePlotNode: function(node) {
                            var parts;
                            node.model = global.server;
                            parts = node.id.split(/\//g).slice(2);
                            while (parts.length) {
                                node.model = node.model.get("children").find(function(child) {
                                    return child.get("name") === parts[0];
                                });
                                parts.shift();
                            }
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
                    tree.loadJSON(global.server.get_graph_json());
                    tree.compute();
                    tree.onClick(tree.root);
                    return global.tree = tree;
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