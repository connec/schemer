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
        views: [ "../base" ],
        "views\\server": [ "../base" ]
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
                function BaseView(router) {
                    this.router = router;
                    this.el = $(this.template());
                    BaseView.__super__.constructor.call(this);
                }
                BaseView.prototype.render = function() {
                    return $("body").html("").append(this.el);
                };
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
                    GraphModel.__super__.constructor.apply(this, arguments);
                    this.set({
                        children: this.Children != null ? new this.Children(this) : null
                    });
                }
                GraphModel.prototype.parent = function() {
                    return this.get("parent");
                };
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
        collections: [ "../models/field" ],
        "views\\server\\toolbox": [ "../../../models/field" ]
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
        collections: [ "../models/table" ],
        "views\\server": [ "../../models/table" ],
        "views\\server\\toolbox": [ "../../../models/table" ]
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
        collections: [ "../models/database" ],
        "views\\server\\toolbox": [ "../../../models/database" ]
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
        "views\\server": [ "../../models/server" ]
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
        "views\\server\\toolbox": [ "./section" ]
    }, "views\\server\\toolbox", function(global, module, exports, require, window) {
        ((function() {
            var Section, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
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
            module.exports = Section = function(_super) {
                __extends(Section, _super);
                function Section(toolbox, node) {
                    this.toolbox = toolbox;
                    this.node = node;
                    this.el = $(this.template({
                        name: this.node.model.get("name")
                    }));
                    Section.__super__.constructor.call(this);
                }
                Section.prototype.render = function() {
                    return this.el;
                };
                Section.prototype.add_child = function(request_args) {
                    var Child, _this = this;
                    Child = this.node.model.constructor.prototype.Children.prototype.model;
                    $("#overlay").show().fadeTo(250, .5);
                    return socket.request("add_" + Child.name.toLowerCase(), request_args, function(err, attributes) {
                        var child, node, tree;
                        $("#overlay").fadeTo(250, 0, function() {
                            return $(this).hide();
                        });
                        if (err) return console.log(String(err));
                        child = new Child($.extend({}, attributes, {
                            parent: _this.node.model
                        }));
                        node = new Tree.Node(child.get("name"));
                        node.model = child;
                        _this.node.model.children().add(child);
                        tree = _this.toolbox.graph.tree;
                        tree.insert_node(node, _this.node);
                        _this.toolbox.graph.sort_children(_this.node);
                        tree.animate();
                        return tree.bind_once("anim:after", function() {
                            return _this.toolbox.graph.node_click(node);
                        });
                    });
                };
                return Section;
            }(Backbone.View);
        })).call(this);
    });
    register({
        "templates\\toolbox": [ "../../lib/vendor/jade_runtime" ],
        templates: [ "../lib/vendor/jade_runtime" ]
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
        "views\\server\\toolbox": [ "../../../templates/toolbox/database" ]
    }, "templates\\toolbox", function(global, module, exports, require, window) {
        var jade = require("../../lib/vendor/jade_runtime");
        module.exports = function anonymous(locals, attrs, escape, rethrow) {
            var attrs = jade.attrs, escape = jade.escape, rethrow = jade.rethrow;
            var __jade = [ {
                lineno: 1,
                filename: "C:\\Users\\Minty\\Code\\projects\\honours\\client\\scripts\\templates\\toolbox\\database.jade"
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
                        "class": "database"
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
                    buf.push("<h1>" + escape((interp = name) == null ? "" : interp) + "");
                    __jade.unshift({
                        lineno: undefined,
                        filename: __jade[0].filename
                    });
                    __jade.shift();
                    buf.push("</h1>");
                    __jade.shift();
                    __jade.unshift({
                        lineno: 4,
                        filename: __jade[0].filename
                    });
                    buf.push("<ul>");
                    __jade.unshift({
                        lineno: undefined,
                        filename: __jade[0].filename
                    });
                    __jade.unshift({
                        lineno: 5,
                        filename: __jade[0].filename
                    });
                    buf.push("<li>");
                    __jade.unshift({
                        lineno: undefined,
                        filename: __jade[0].filename
                    });
                    __jade.unshift({
                        lineno: 5,
                        filename: __jade[0].filename
                    });
                    buf.push("<a");
                    buf.push(attrs({
                        "class": "rename"
                    }));
                    buf.push(">Rename");
                    __jade.unshift({
                        lineno: undefined,
                        filename: __jade[0].filename
                    });
                    __jade.shift();
                    buf.push("</a>");
                    __jade.shift();
                    __jade.shift();
                    buf.push("</li>");
                    __jade.shift();
                    __jade.unshift({
                        lineno: 7,
                        filename: __jade[0].filename
                    });
                    buf.push("<li>");
                    __jade.unshift({
                        lineno: undefined,
                        filename: __jade[0].filename
                    });
                    __jade.unshift({
                        lineno: 7,
                        filename: __jade[0].filename
                    });
                    buf.push("<a");
                    buf.push(attrs({
                        "class": "drop"
                    }));
                    buf.push(">Drop");
                    __jade.unshift({
                        lineno: undefined,
                        filename: __jade[0].filename
                    });
                    __jade.shift();
                    buf.push("</a>");
                    __jade.shift();
                    __jade.shift();
                    buf.push("</li>");
                    __jade.shift();
                    __jade.unshift({
                        lineno: 9,
                        filename: __jade[0].filename
                    });
                    buf.push("<li>");
                    __jade.unshift({
                        lineno: undefined,
                        filename: __jade[0].filename
                    });
                    __jade.unshift({
                        lineno: 9,
                        filename: __jade[0].filename
                    });
                    buf.push("<a");
                    buf.push(attrs({
                        "class": "add"
                    }));
                    buf.push(">Add Table");
                    __jade.unshift({
                        lineno: undefined,
                        filename: __jade[0].filename
                    });
                    __jade.shift();
                    buf.push("</a>");
                    __jade.shift();
                    __jade.shift();
                    buf.push("</li>");
                    __jade.shift();
                    __jade.shift();
                    buf.push("</ul>");
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
        "views\\server\\toolbox": [ "./database_section" ]
    }, "views\\server\\toolbox", function(global, module, exports, require, window) {
        ((function() {
            var DatabaseSection, Section, Table, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
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
            Section = require("./section");
            Table = require("../../../models/table");
            module.exports = DatabaseSection = function(_super) {
                __extends(DatabaseSection, _super);
                function DatabaseSection() {
                    DatabaseSection.__super__.constructor.apply(this, arguments);
                }
                DatabaseSection.prototype.template = require("../../../templates/toolbox/database");
                DatabaseSection.prototype.events = {
                    "click .add": "add_child",
                    "click .drop": "drop_database",
                    "click .rename": "rename_database"
                };
                DatabaseSection.prototype.add_child = function() {
                    return DatabaseSection.__super__.add_child.call(this, {
                        database: this.node.model.get("name")
                    });
                };
                DatabaseSection.prototype.drop_database = function() {
                    var _this = this;
                    $("#overlay").show().fadeTo(250, .5);
                    return global.socket.request("drop_database", {
                        database: this.node.model.get("name")
                    }, function(err) {
                        var parent;
                        $("#overlay").fadeTo(250, 0, function() {
                            return $(this).hide();
                        });
                        if (err) return console.log(String(err));
                        parent = _this.node.parent;
                        _this.toolbox.graph.tree.remove_node(_this.node);
                        return _this.toolbox.graph.node_click(parent);
                    });
                };
                DatabaseSection.prototype.rename_database = function() {
                    var $input, rename, _this = this;
                    rename = function(e) {
                        var new_name;
                        if (e.type === "keypress" && e.which !== 13) return;
                        new_name = $input.val().toLowerCase();
                        if (new_name === _this.node.model.get("name")) {
                            _this.node.$label.text(new_name);
                            return;
                        }
                        $input.val(new_name);
                        $("#overlay").show().fadeTo(250, .5);
                        return global.socket.request("rename_database", {
                            old_name: _this.node.model.get("name"),
                            new_name: new_name
                        }, function(err, database) {
                            $("#overlay").fadeTo(250, 0, function() {
                                return $(this).hide();
                            });
                            if (err) return console.log(String(err));
                            _this.node.model.set(database);
                            _this.node.$label.text(database.name);
                            return _this.$("h1").text(database.name);
                        });
                    };
                    this.node.$label.html("");
                    return $input = $("<input/>").attr({
                        type: "text",
                        value: this.node.model.get("name")
                    }).appendTo(this.node.$label).focus().select().bind("blur", rename).bind("keypress", rename);
                };
                return DatabaseSection;
            }(Section);
        })).call(this);
    });
    register({
        "views\\server\\toolbox": [ "../../../templates/toolbox/field" ]
    }, "templates\\toolbox", function(global, module, exports, require, window) {
        var jade = require("../../lib/vendor/jade_runtime");
        module.exports = function anonymous(locals, attrs, escape, rethrow) {
            var attrs = jade.attrs, escape = jade.escape, rethrow = jade.rethrow;
            var __jade = [ {
                lineno: 1,
                filename: "C:\\Users\\Minty\\Code\\projects\\honours\\client\\scripts\\templates\\toolbox\\field.jade"
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
                        "class": "field"
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
                    buf.push("<h1>" + escape((interp = name) == null ? "" : interp) + "");
                    __jade.unshift({
                        lineno: undefined,
                        filename: __jade[0].filename
                    });
                    __jade.shift();
                    buf.push("</h1>");
                    __jade.shift();
                    __jade.unshift({
                        lineno: 4,
                        filename: __jade[0].filename
                    });
                    buf.push("<ul>");
                    __jade.unshift({
                        lineno: undefined,
                        filename: __jade[0].filename
                    });
                    __jade.unshift({
                        lineno: 5,
                        filename: __jade[0].filename
                    });
                    buf.push("<li>");
                    __jade.unshift({
                        lineno: undefined,
                        filename: __jade[0].filename
                    });
                    __jade.unshift({
                        lineno: 5,
                        filename: __jade[0].filename
                    });
                    buf.push("<a");
                    buf.push(attrs({
                        "class": "rename"
                    }));
                    buf.push(">Rename");
                    __jade.unshift({
                        lineno: undefined,
                        filename: __jade[0].filename
                    });
                    __jade.shift();
                    buf.push("</a>");
                    __jade.shift();
                    __jade.shift();
                    buf.push("</li>");
                    __jade.shift();
                    __jade.unshift({
                        lineno: 7,
                        filename: __jade[0].filename
                    });
                    buf.push("<li>");
                    __jade.unshift({
                        lineno: undefined,
                        filename: __jade[0].filename
                    });
                    __jade.unshift({
                        lineno: 7,
                        filename: __jade[0].filename
                    });
                    buf.push("<a");
                    buf.push(attrs({
                        "class": "drop"
                    }));
                    buf.push(">Drop");
                    __jade.unshift({
                        lineno: undefined,
                        filename: __jade[0].filename
                    });
                    __jade.shift();
                    buf.push("</a>");
                    __jade.shift();
                    __jade.shift();
                    buf.push("</li>");
                    __jade.shift();
                    __jade.unshift({
                        lineno: 9,
                        filename: __jade[0].filename
                    });
                    buf.push("<li>");
                    __jade.unshift({
                        lineno: undefined,
                        filename: __jade[0].filename
                    });
                    __jade.unshift({
                        lineno: 9,
                        filename: __jade[0].filename
                    });
                    buf.push("<a");
                    buf.push(attrs({
                        "class": "type"
                    }));
                    buf.push(">Set Type");
                    __jade.unshift({
                        lineno: undefined,
                        filename: __jade[0].filename
                    });
                    __jade.shift();
                    buf.push("</a>");
                    __jade.shift();
                    __jade.shift();
                    buf.push("</li>");
                    __jade.shift();
                    __jade.unshift({
                        lineno: 11,
                        filename: __jade[0].filename
                    });
                    buf.push("<li>");
                    __jade.unshift({
                        lineno: undefined,
                        filename: __jade[0].filename
                    });
                    __jade.unshift({
                        lineno: 11,
                        filename: __jade[0].filename
                    });
                    buf.push("<a");
                    buf.push(attrs({
                        "class": "default"
                    }));
                    buf.push(">Set Default");
                    __jade.unshift({
                        lineno: undefined,
                        filename: __jade[0].filename
                    });
                    __jade.shift();
                    buf.push("</a>");
                    __jade.shift();
                    __jade.shift();
                    buf.push("</li>");
                    __jade.shift();
                    __jade.unshift({
                        lineno: 13,
                        filename: __jade[0].filename
                    });
                    buf.push("<li>");
                    __jade.unshift({
                        lineno: undefined,
                        filename: __jade[0].filename
                    });
                    __jade.unshift({
                        lineno: 13,
                        filename: __jade[0].filename
                    });
                    buf.push("<a");
                    buf.push(attrs({
                        "class": "key"
                    }));
                    buf.push(">Add key");
                    __jade.unshift({
                        lineno: undefined,
                        filename: __jade[0].filename
                    });
                    __jade.shift();
                    buf.push("</a>");
                    __jade.shift();
                    __jade.shift();
                    buf.push("</li>");
                    __jade.shift();
                    __jade.unshift({
                        lineno: 15,
                        filename: __jade[0].filename
                    });
                    buf.push("<li>");
                    __jade.unshift({
                        lineno: undefined,
                        filename: __jade[0].filename
                    });
                    __jade.unshift({
                        lineno: 15,
                        filename: __jade[0].filename
                    });
                    buf.push("<a");
                    buf.push(attrs({
                        "class": "ai"
                    }));
                    buf.push(">Auto-increment");
                    __jade.unshift({
                        lineno: undefined,
                        filename: __jade[0].filename
                    });
                    __jade.shift();
                    buf.push("</a>");
                    __jade.shift();
                    __jade.shift();
                    buf.push("</li>");
                    __jade.shift();
                    __jade.shift();
                    buf.push("</ul>");
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
        "views\\server\\toolbox": [ "./field_section" ]
    }, "views\\server\\toolbox", function(global, module, exports, require, window) {
        ((function() {
            var FieldSection, Section, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
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
            Section = require("./section");
            module.exports = FieldSection = function(_super) {
                __extends(FieldSection, _super);
                function FieldSection() {
                    FieldSection.__super__.constructor.apply(this, arguments);
                }
                FieldSection.prototype.template = require("../../../templates/toolbox/field");
                return FieldSection;
            }(Section);
        })).call(this);
    });
    register({
        "views\\server\\toolbox": [ "../../../templates/toolbox/server" ]
    }, "templates\\toolbox", function(global, module, exports, require, window) {
        var jade = require("../../lib/vendor/jade_runtime");
        module.exports = function anonymous(locals, attrs, escape, rethrow) {
            var attrs = jade.attrs, escape = jade.escape, rethrow = jade.rethrow;
            var __jade = [ {
                lineno: 1,
                filename: "C:\\Users\\Minty\\Code\\projects\\honours\\client\\scripts\\templates\\toolbox\\server.jade"
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
                        "class": "server"
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
                    buf.push("<h1>" + escape((interp = name) == null ? "" : interp) + "");
                    __jade.unshift({
                        lineno: undefined,
                        filename: __jade[0].filename
                    });
                    __jade.shift();
                    buf.push("</h1>");
                    __jade.shift();
                    __jade.unshift({
                        lineno: 4,
                        filename: __jade[0].filename
                    });
                    buf.push("<ul>");
                    __jade.unshift({
                        lineno: undefined,
                        filename: __jade[0].filename
                    });
                    __jade.unshift({
                        lineno: 5,
                        filename: __jade[0].filename
                    });
                    buf.push("<li>");
                    __jade.unshift({
                        lineno: undefined,
                        filename: __jade[0].filename
                    });
                    __jade.unshift({
                        lineno: 5,
                        filename: __jade[0].filename
                    });
                    buf.push("<a");
                    buf.push(attrs({
                        "class": "add"
                    }));
                    buf.push(">Add Database");
                    __jade.unshift({
                        lineno: undefined,
                        filename: __jade[0].filename
                    });
                    __jade.shift();
                    buf.push("</a>");
                    __jade.shift();
                    __jade.shift();
                    buf.push("</li>");
                    __jade.shift();
                    __jade.shift();
                    buf.push("</ul>");
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
        "views\\server\\toolbox": [ "./server_section" ]
    }, "views\\server\\toolbox", function(global, module, exports, require, window) {
        ((function() {
            var Database, Section, ServerSection, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
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
            Database = require("../../../models/database");
            Section = require("./section");
            module.exports = ServerSection = function(_super) {
                __extends(ServerSection, _super);
                function ServerSection() {
                    ServerSection.__super__.constructor.apply(this, arguments);
                }
                ServerSection.prototype.template = require("../../../templates/toolbox/server");
                ServerSection.prototype.events = {
                    "click .add": "add_child"
                };
                ServerSection.prototype.add_child = function() {
                    return ServerSection.__super__.add_child.call(this);
                };
                return ServerSection;
            }(Section);
        })).call(this);
    });
    register({
        "views\\server\\toolbox": [ "../../../templates/toolbox/table" ]
    }, "templates\\toolbox", function(global, module, exports, require, window) {
        var jade = require("../../lib/vendor/jade_runtime");
        module.exports = function anonymous(locals, attrs, escape, rethrow) {
            var attrs = jade.attrs, escape = jade.escape, rethrow = jade.rethrow;
            var __jade = [ {
                lineno: 1,
                filename: "C:\\Users\\Minty\\Code\\projects\\honours\\client\\scripts\\templates\\toolbox\\table.jade"
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
                        "class": "table"
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
                    buf.push("<h1>" + escape((interp = name) == null ? "" : interp) + "");
                    __jade.unshift({
                        lineno: undefined,
                        filename: __jade[0].filename
                    });
                    __jade.shift();
                    buf.push("</h1>");
                    __jade.shift();
                    __jade.unshift({
                        lineno: 4,
                        filename: __jade[0].filename
                    });
                    buf.push("<ul>");
                    __jade.unshift({
                        lineno: undefined,
                        filename: __jade[0].filename
                    });
                    __jade.unshift({
                        lineno: 5,
                        filename: __jade[0].filename
                    });
                    buf.push("<li>");
                    __jade.unshift({
                        lineno: undefined,
                        filename: __jade[0].filename
                    });
                    __jade.unshift({
                        lineno: 5,
                        filename: __jade[0].filename
                    });
                    buf.push("<a");
                    buf.push(attrs({
                        "class": "rename"
                    }));
                    buf.push(">Rename");
                    __jade.unshift({
                        lineno: undefined,
                        filename: __jade[0].filename
                    });
                    __jade.shift();
                    buf.push("</a>");
                    __jade.shift();
                    __jade.shift();
                    buf.push("</li>");
                    __jade.shift();
                    __jade.unshift({
                        lineno: 7,
                        filename: __jade[0].filename
                    });
                    buf.push("<li>");
                    __jade.unshift({
                        lineno: undefined,
                        filename: __jade[0].filename
                    });
                    __jade.unshift({
                        lineno: 7,
                        filename: __jade[0].filename
                    });
                    buf.push("<a");
                    buf.push(attrs({
                        "class": "drop"
                    }));
                    buf.push(">Drop");
                    __jade.unshift({
                        lineno: undefined,
                        filename: __jade[0].filename
                    });
                    __jade.shift();
                    buf.push("</a>");
                    __jade.shift();
                    __jade.shift();
                    buf.push("</li>");
                    __jade.shift();
                    __jade.unshift({
                        lineno: 9,
                        filename: __jade[0].filename
                    });
                    buf.push("<li>");
                    __jade.unshift({
                        lineno: undefined,
                        filename: __jade[0].filename
                    });
                    __jade.unshift({
                        lineno: 9,
                        filename: __jade[0].filename
                    });
                    buf.push("<a");
                    buf.push(attrs({
                        "class": "add"
                    }));
                    buf.push(">Add Field");
                    __jade.unshift({
                        lineno: undefined,
                        filename: __jade[0].filename
                    });
                    __jade.shift();
                    buf.push("</a>");
                    __jade.shift();
                    __jade.shift();
                    buf.push("</li>");
                    __jade.shift();
                    __jade.shift();
                    buf.push("</ul>");
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
        "views\\server\\toolbox": [ "./table_section" ]
    }, "views\\server\\toolbox", function(global, module, exports, require, window) {
        ((function() {
            var Field, Section, TableSection, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
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
            Field = require("../../../models/field");
            Section = require("./section");
            module.exports = TableSection = function(_super) {
                __extends(TableSection, _super);
                function TableSection() {
                    TableSection.__super__.constructor.apply(this, arguments);
                }
                TableSection.prototype.template = require("../../../templates/toolbox/table");
                TableSection.prototype.events = {
                    "click .add": "add_child",
                    "click .drop": "drop_table",
                    "click .rename": "rename_table"
                };
                TableSection.prototype.add_child = function() {
                    var child, i, match, model, node, tree, _i, _len, _ref, _this = this;
                    i = 0;
                    _ref = this.node.children;
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        model = _ref[_i].model;
                        if ((match = model.get("name").match(/new field \((\d+)\)/i)) && parseInt(match[1]) > i) {
                            i = match[1];
                        }
                    }
                    child = new Field({
                        name: "new field (" + ++i + ")"
                    });
                    node = new Tree.Node(child.get("name"));
                    node.model = child;
                    this.node.model.children().add(child);
                    tree = this.toolbox.graph.tree;
                    tree.insert_node(node, this.node);
                    tree.animate();
                    return tree.bind_once("anim:after", function() {
                        return _this.toolbox.graph.node_click(node);
                    });
                };
                TableSection.prototype.drop_table = function() {
                    var _this = this;
                    $("#overlay").show().fadeTo(250, .5);
                    return global.socket.request("drop_table", {
                        database: this.node.model.get("parent").get("name"),
                        table: this.node.model.get("name")
                    }, function(err) {
                        var parent;
                        $("#overlay").fadeTo(250, 0, function() {
                            return $(this).hide();
                        });
                        if (err) return console.log(String(err));
                        parent = _this.node.parent;
                        _this.toolbox.graph.tree.remove_node(_this.node);
                        return _this.toolbox.graph.node_click(parent);
                    });
                };
                TableSection.prototype.rename_table = function() {
                    var $input, rename, _this = this;
                    rename = function(e) {
                        var new_name;
                        if (e.type === "keypress" && e.which !== 13) return;
                        new_name = $input.val().toLowerCase();
                        if (new_name === _this.node.model.get("name")) {
                            _this.node.$label.text(new_name);
                            return;
                        }
                        $input.val(new_name);
                        $("#overlay").show().fadeTo(250, .5);
                        return global.socket.request("rename_table", {
                            database: _this.node.model.get("parent").get("name"),
                            old_name: _this.node.model.get("name"),
                            new_name: new_name
                        }, function(err, table) {
                            $("#overlay").fadeTo(250, 0, function() {
                                return $(this).hide();
                            });
                            if (err) return console.log(String(err));
                            _this.node.model.set(table);
                            _this.node.$label.text(table.name);
                            return _this.$("h1").text(table.name);
                        });
                    };
                    this.node.$label.html("");
                    return $input = $("<input/>").attr({
                        type: "text",
                        value: this.node.model.get("name")
                    }).appendTo(this.node.$label).focus().select().bind("blur", rename).bind("keypress", rename);
                };
                return TableSection;
            }(Section);
        })).call(this);
    });
    register({
        "views\\server": [ "./toolbox" ]
    }, "views\\server\\toolbox", function(global, module, exports, require, window) {
        ((function() {
            var Sections, ToolboxView, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
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
            Sections = {};
            Sections.database = require("./database_section");
            Sections.field = require("./field_section");
            Sections.server = require("./server_section");
            Sections.table = require("./table_section");
            module.exports = ToolboxView = function(_super) {
                __extends(ToolboxView, _super);
                function ToolboxView(el, graph) {
                    this.el = el;
                    this.graph = graph;
                    ToolboxView.__super__.constructor.call(this);
                }
                ToolboxView.prototype.update = function(node) {
                    var k, nodes;
                    nodes = {};
                    switch (node.model.constructor.name) {
                      case "Server":
                        nodes.server = node;
                        break;
                      case "Database":
                        nodes.database = node;
                        break;
                      case "Table":
                        nodes.table = node;
                        break;
                      case "Field":
                        nodes.field = node;
                    }
                    if (nodes.field) nodes.table = nodes.field.parent;
                    this.sections = {};
                    for (k in nodes) {
                        node = nodes[k];
                        this.sections[k] = new Sections[k](this, node);
                    }
                    return this.render();
                };
                ToolboxView.prototype.render = function() {
                    var k, _i, _len, _ref, _results;
                    this.el.html("");
                    _ref = [ "server", "database", "table", "field" ];
                    _results = [];
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        k = _ref[_i];
                        if (this.sections[k]) {
                            _results.push(this.el.append(this.sections[k].render()));
                        } else {
                            _results.push(void 0);
                        }
                    }
                    return _results;
                };
                return ToolboxView;
            }(Backbone.View);
        })).call(this);
    });
    register({
        "views\\server": [ "./graph" ]
    }, "views\\server", function(global, module, exports, require, window) {
        ((function() {
            var GraphView, Server, Table, ToolboxView, __bind = function(fn, me) {
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
            }, __indexOf = Array.prototype.indexOf || function(item) {
                for (var i = 0, l = this.length; i < l; i++) {
                    if (i in this && this[i] === item) return i;
                }
                return -1;
            };
            Server = require("../../models/server");
            Table = require("../../models/table");
            ToolboxView = require("./toolbox");
            module.exports = GraphView = function(_super) {
                var default_node_cmp;
                __extends(GraphView, _super);
                default_node_cmp = function(a, b) {
                    var a_name, b_name;
                    a_name = a.model.get("name").toLowerCase();
                    b_name = b.model.get("name").toLowerCase();
                    if (a_name < b_name) return -1;
                    if (a_name > b_name) return +1;
                    return 0;
                };
                function GraphView(el) {
                    this.el = el;
                    this.node_click = __bind(this.node_click, this);
                    GraphView.__super__.constructor.call(this);
                }
                GraphView.prototype.initialize = function() {
                    var _this = this;
                    this.$ruler = $("<div/>").attr({
                        id: "ruler"
                    }).appendTo(this.el);
                    this.tree = global.tree = new Tree(this.el);
                    this.tree.bind("node:add", this.node_add.bind(this));
                    this.tree.bind("node:click", this.node_click.bind(this));
                    this.tree.bind("node:remove", this.node_remove.bind(this));
                    return socket.request("get_server", function(err, server) {
                        if (err) throw err;
                        _this.tree.set_root(server.name);
                        _this.tree.root.model = new Server(server);
                        _this.tree.set_centre(_this.tree.root);
                        _this.tree.refresh();
                        return _this.node_click(_this.tree.root);
                    });
                };
                GraphView.prototype.node_add = function(node, context) {
                    if (node.model == null) {
                        node.model = context != null ? context.model.children().find({
                            name: node.$label.text()
                        }) : void 0;
                    }
                    return this.set_label_text(node.$label);
                };
                GraphView.prototype.node_remove = function(node) {
                    return delete node.model;
                };
                GraphView.prototype.node_click = function(node) {
                    var direction, path, _i, _len, _ref;
                    if (node.$elem.hasClass("selected")) return;
                    if (parseInt(node.$elem.attr("data-depth")) < parseInt(this.$(".selected").attr("data-depth"))) {
                        direction = "up";
                    } else {
                        direction = "down";
                    }
                    this.tree.$wrapper.find(".in-path, .selected").removeClass("in-path selected");
                    node.$elem.addClass("selected");
                    _ref = [ node ].concat(node.parents());
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        path = _ref[_i];
                        path.$elem.addClass("in-path");
                    }
                    this.tree.unbind("node:click", this.node_click);
                    return this["move_" + direction](node);
                };
                GraphView.prototype.move_down = function(node) {
                    var sibling, _i, _len, _ref, _this = this;
                    if (node.model.constructor.name !== "Field") {
                        _ref = node.siblings();
                        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                            sibling = _ref[_i];
                            this.tree.remove_node(sibling);
                        }
                    }
                    this.tree.set_centre(node);
                    this.tree.animate();
                    return this.tree.bind_once("anim:after", function() {
                        if (!(node.model.id && node.model.children())) {
                            return _this.finish_move(node);
                        }
                        _this.$("#overlay").show().fadeTo(250, .5);
                        return node.model.fetch_children(function(err, children) {
                            _this.$("#overlay").fadeTo(250, 0, function() {
                                return $(this).hide();
                            });
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
                GraphView.prototype.move_up = function(node) {
                    var child, grandchild, ids, _i, _j, _len, _len2, _ref, _ref2, _this = this;
                    ids = [];
                    _ref = node.children.slice(0);
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        child = _ref[_i];
                        ids.push(child.model.id);
                        _ref2 = child.children.slice(0);
                        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
                            grandchild = _ref2[_j];
                            this.tree.remove_node(grandchild);
                        }
                    }
                    this.tree.set_centre(node);
                    this.tree.animate();
                    return this.tree.bind_once("anim:after", function() {
                        _this.$("#overlay").show().fadeTo(250, .5);
                        return node.model.fetch_children(function(err, children) {
                            _this.$("#overlay").fadeTo(250, 0, function() {
                                return $(this).hide();
                            });
                            if (err) return console.log(String(err));
                            children.each(function(child) {
                                var _ref3;
                                if (_ref3 = child.id, __indexOf.call(ids, _ref3) >= 0) return;
                                return _this.tree.insert_node(child.get("name"), node);
                            });
                            if (!(node.model instanceof Table)) _this.sort_children(node);
                            _this.tree.animate();
                            return _this.tree.bind_once("anim:after", function() {
                                return _this.finish_move(node);
                            });
                        });
                    });
                };
                GraphView.prototype.finish_move = function(node) {
                    this.tree.bind("node:click", this.node_click);
                    return this.toolbox.update(node);
                };
                GraphView.prototype.set_label_text = function($label) {
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
                GraphView.prototype.sort_children = function(node, cmp) {
                    if (cmp == null) cmp = default_node_cmp;
                    return node.children.sort(cmp);
                };
                return GraphView;
            }(Backbone.View);
        })).call(this);
    });
    register({
        "views\\server": [ "../../templates/server" ]
    }, "templates", function(global, module, exports, require, window) {
        var jade = require("../lib/vendor/jade_runtime");
        module.exports = function anonymous(locals, attrs, escape, rethrow) {
            var attrs = jade.attrs, escape = jade.escape, rethrow = jade.rethrow;
            var __jade = [ {
                lineno: 1,
                filename: "C:\\Users\\Minty\\Code\\projects\\honours\\client\\scripts\\templates\\server.jade"
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
                        id: "overlay"
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
                        lineno: 4,
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
                        lineno: 5,
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
        views: [ "../server" ],
        "": [ "./views/server" ]
    }, "views\\server", function(global, module, exports, require, window) {
        ((function() {
            var BaseView, Graph, ServerView, Toolbox, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
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
            BaseView = require("../base");
            Graph = require("./graph");
            Toolbox = require("./toolbox");
            module.exports = ServerView = function(_super) {
                __extends(ServerView, _super);
                function ServerView() {
                    ServerView.__super__.constructor.apply(this, arguments);
                }
                ServerView.prototype.template = require("../../templates/server");
                ServerView.prototype.initialize = function() {
                    this.graph = new Graph(this.$("#graph"));
                    return this.graph.toolbox = this.toolbox = new Toolbox(this.$("#toolbox"), this.graph);
                };
                return ServerView;
            }(BaseView);
        })).call(this);
    });
    register({
        views: [ "../../templates/login" ]
    }, "templates", function(global, module, exports, require, window) {
        var jade = require("../lib/vendor/jade_runtime");
        module.exports = function anonymous(locals, attrs, escape, rethrow) {
            var attrs = jade.attrs, escape = jade.escape, rethrow = jade.rethrow;
            var __jade = [ {
                lineno: 1,
                filename: "C:\\Users\\Minty\\Code\\projects\\honours\\client\\scripts\\templates\\login.jade"
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
        "": [ "./views/login" ]
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
            BaseView = require("../base");
            ServerView = require("../server");
            module.exports = LoginView = function(_super) {
                __extends(LoginView, _super);
                function LoginView() {
                    LoginView.__super__.constructor.apply(this, arguments);
                }
                LoginView.prototype.template = require("../../templates/login");
                LoginView.prototype.events = {
                    "keypress input": "login"
                };
                LoginView.prototype.initialize = function() {
                    this.$ring = this.$("#ring");
                    return this.$message = this.$("#message");
                };
                LoginView.prototype.login = function(event) {
                    var credentials, _this = this;
                    if (event.which !== 13) return;
                    this.$message.text("");
                    this.$ring.css({
                        "-webkit-animation-play-state": "running"
                    });
                    this.$("input").blur().attr({
                        disabled: "disabled"
                    });
                    credentials = {
                        host: this.$('input[name="host"]').val(),
                        user: this.$('input[name="user"]').val(),
                        password: this.$('input[name="password"]').val()
                    };
                    return socket.request("login", credentials, function(err) {
                        if (err) {
                            _this.$ring.animationPlayState("paused");
                            _this.$message.text(String(err)).css({
                                top: -_this.$("#message").outerHeight()
                            });
                            _this.$("input").removeAttr("disabled");
                            return;
                        }
                        _this.$ring.animationPlayState("paused");
                        _this.el.addClass("leaving");
                        return _this.el.animationEnd(function() {
                            _this.router.navigate("");
                            return (new ServerView(_this.router)).fade_in();
                        });
                    });
                };
                return LoginView;
            }(BaseView);
        })).call(this);
    });
    register({
        "": [ "../lib/support" ]
    }, "lib", function(global, module, exports, require, window) {
        ((function() {
            jQuery.fn.animationPlayState = function(state) {
                return this.css({
                    "animation-play-state": state,
                    "-moz-animation-play-state": state,
                    "-ms-animation-play-state": state,
                    "-webkit-animation-play-state": state
                });
            };
            jQuery.fn.animationEnd = function(handler) {
                if (!handler) throw new Error("animationEnd triggering not implemented");
                this.bind("animationend", handler);
                return this.bind("webkitAnimationEnd", handler);
            };
        })).call(this);
    });
    register({
        "": [ "app" ]
    }, "", function(global, module, exports, require, window) {
        ((function() {
            var LoginView, Router, ServerView, socket_request, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
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
            LoginView = require("./views/login");
            ServerView = require("./views/server");
            require("../lib/support");
            socket_request = function(request, request_data, callback) {
                var data;
                if (callback == null) callback = request_data;
                if (request_data === callback) request_data = null;
                data = {
                    id: _.uniqueId("request_"),
                    request: request,
                    request_data: request_data
                };
                this.once("response_" + data.id, function(_arg) {
                    var err, result;
                    err = _arg.err, result = _arg.result;
                    if (err) return callback($.extend(new Error, err));
                    return callback(null, result);
                });
                return this.emit("request", data);
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
                    var _this = this;
                    return socket.request("check_login", function(err, response) {
                        if (err) return console.log(err.stack);
                        if (!response) return _this.navigate("/login", true);
                        return (new ServerView(_this)).fade_in();
                    });
                };
                Router.prototype.login = function() {
                    return (new LoginView(this)).fade_in();
                };
                return Router;
            }(Backbone.Router);
            jQuery(function() {
                var router;
                global.socket = io.connect();
                socket.request = socket_request.bind(global.socket);
                router = new Router;
                if (location.hash.length < 2) location.hash = "#/";
                return Backbone.history.start();
            });
        })).call(this);
    });
    root["app"] = require_from(null, "")("app");
})).call(this);