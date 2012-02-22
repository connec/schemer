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
        models: [ "./node_model" ]
    }, "models", function(global, module, exports, require, window) {
        ((function() {
            var Children, NodeModel, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
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
            module.exports = NodeModel = function(_super) {
                var k, v, _ref;
                __extends(NodeModel, _super);
                _ref = Tree.Node.prototype;
                for (k in _ref) {
                    v = _ref[k];
                    NodeModel.prototype[k] = v;
                }
                function NodeModel(properties) {
                    var _this = this;
                    if (properties == null) properties = {};
                    NodeModel.__super__.constructor.call(this, properties);
                    Tree.Node.call(this, this.get("name"));
                    this.bind("change:name", function() {
                        return _this.$label.text(_this.get("name"));
                    });
                    if (this.constructor.Child) {
                        this.set({
                            children: new Children(this)
                        });
                    }
                }
                return NodeModel;
            }(Backbone.Model);
            Children = function(_super) {
                __extends(Children, _super);
                function Children(parent) {
                    this.parent = parent;
                    Children.__super__.constructor.call(this);
                    this.model = this.parent.constructor.Child;
                    this.bind("add", this.on_add.bind(this));
                    this.bind("reset", this.on_reset.bind(this));
                }
                Children.prototype.comparator = function(model) {
                    return model.get("name");
                };
                Children.prototype.on_add = function(model, collection, options) {
                    var _ref;
                    model.parent = this.parent;
                    return this.parent.tree.insert_node(model, this.parent, (_ref = options.index) != null ? _ref : this.indexOf(model));
                };
                Children.prototype.on_reset = function() {
                    var skip, _this = this;
                    skip = this.parent.children.map(function(child) {
                        return child.id;
                    });
                    return this.each(function(model, index) {
                        var _ref;
                        if (_ref = model.id, __indexOf.call(skip, _ref) >= 0) return;
                        model.parent = _this.parent;
                        return _this.parent.tree.insert_node(model, _this.parent, index);
                    });
                };
                return Children;
            }(Backbone.Collection);
        })).call(this);
    });
    register({
        "views\\server": [ "../../models/field" ],
        models: [ "./field" ],
        "views\\server\\toolbox": [ "../../../models/field" ],
        lib: [ "../models/field" ]
    }, "models", function(global, module, exports, require, window) {
        ((function() {
            var Field, NodeModel, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
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
            NodeModel = require("./node_model");
            module.exports = Field = function(_super) {
                __extends(Field, _super);
                function Field() {
                    Field.__super__.constructor.apply(this, arguments);
                }
                return Field;
            }(NodeModel);
        })).call(this);
    });
    register({
        models: [ "./table" ],
        "views\\server": [ "../../models/table" ],
        "views\\server\\toolbox": [ "../../../models/table" ],
        lib: [ "../models/table" ]
    }, "models", function(global, module, exports, require, window) {
        ((function() {
            var Field, NodeModel, Table, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
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
            Field = require("./field");
            NodeModel = require("./node_model");
            module.exports = Table = function(_super) {
                __extends(Table, _super);
                Table.Child = Field;
                function Table() {
                    Table.__super__.constructor.apply(this, arguments);
                    this.get("children").comparator = null;
                }
                return Table;
            }(NodeModel);
        })).call(this);
    });
    register({
        models: [ "./database" ],
        "views\\server\\toolbox": [ "../../../models/database" ],
        lib: [ "../models/database" ]
    }, "models", function(global, module, exports, require, window) {
        ((function() {
            var Database, NodeModel, Table, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
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
            NodeModel = require("./node_model");
            Table = require("./table");
            module.exports = Database = function(_super) {
                __extends(Database, _super);
                function Database() {
                    Database.__super__.constructor.apply(this, arguments);
                }
                Database.Child = Table;
                return Database;
            }(NodeModel);
        })).call(this);
    });
    register({
        "views\\server": [ "../../models/server" ],
        "views\\server\\toolbox": [ "../../../models/server" ]
    }, "models", function(global, module, exports, require, window) {
        ((function() {
            var Database, NodeModel, Server, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
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
            Database = require("./database");
            NodeModel = require("./node_model");
            module.exports = Server = function(_super) {
                __extends(Server, _super);
                function Server() {
                    Server.__super__.constructor.apply(this, arguments);
                }
                Server.Child = Database;
                return Server;
            }(NodeModel);
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
                        name: this.node.get("name")
                    }));
                    Section.__super__.constructor.call(this);
                }
                Section.prototype.render = function() {
                    return this.el;
                };
                Section.prototype.add_child = function() {
                    var Child, _this = this;
                    Child = this.node.constructor.Child;
                    return this.toolbox.graph.transition(function(done) {
                        var child;
                        child = new Child;
                        child.parent = _this.node;
                        return child.save({}, {
                            complete: done,
                            success: function(model) {
                                _this.node.get("children").add(model);
                                _this.node.tree.animate();
                                return _this.node.tree.bind_once("anim:after", function() {
                                    return _this.toolbox.graph.node_click(model);
                                });
                            },
                            error: function(_, err) {
                                return console.log(err.stack);
                            }
                        });
                    });
                };
                Section.prototype.drop = function() {
                    var _this = this;
                    return this.toolbox.graph.transition(function(done) {
                        return _this.node.destroy({
                            complete: done,
                            success: function() {
                                var parent;
                                parent = _this.node.parent;
                                _this.node.tree.remove_node(_this.node);
                                return _this.toolbox.graph.node_click(parent);
                            },
                            error: function(_, err) {
                                return console.log(err.stack);
                            }
                        });
                    });
                };
                Section.prototype.rename = function() {
                    var $input, rename, _this = this;
                    rename = function(e) {
                        var new_name, old_name;
                        if (e.type === "keypress" && e.which !== 13) return;
                        old_name = _this.node.get("name");
                        new_name = $input.val().toLowerCase();
                        _this.node.set({
                            name: new_name
                        });
                        if (old_name === new_name) return;
                        return _this.toolbox.graph.transition(function(done) {
                            var child, _i, _len, _ref;
                            _ref = _this.node.children;
                            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                                child = _ref[_i];
                                _this.node.tree.remove_node(child);
                            }
                            _this.node.tree.animate();
                            return _this.node.tree.bind_once("anim:after", function() {
                                return _this.node.save({}, {
                                    success: function(model) {
                                        return model.get("children").fetch({
                                            complete: done,
                                            success: function() {
                                                _this.$("h1").text(model.get("name"));
                                                return _this.node.tree.animate();
                                            },
                                            error: function(_, err) {
                                                return console.log(err.stack);
                                            }
                                        });
                                    },
                                    error: function(_, err) {
                                        done();
                                        return console.log(err.stack);
                                    }
                                });
                            });
                        });
                    };
                    this.node.$label.html("");
                    return $input = $("<input/>").attr({
                        type: "text",
                        value: this.node.get("name")
                    }).appendTo(this.node.$label).focus().select().bind("blur", rename).bind("keypress", rename);
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
        "views\\server\\toolbox": [ "./database" ]
    }, "views\\server\\toolbox", function(global, module, exports, require, window) {
        ((function() {
            var DatabaseSection, Section, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
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
            module.exports = DatabaseSection = function(_super) {
                __extends(DatabaseSection, _super);
                function DatabaseSection() {
                    DatabaseSection.__super__.constructor.apply(this, arguments);
                }
                DatabaseSection.prototype.template = require("../../../templates/toolbox/database");
                DatabaseSection.prototype.events = {
                    "click .add": "add_child",
                    "click .drop": "drop",
                    "click .rename": "rename"
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
        "views\\server\\toolbox": [ "./field" ]
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
        "views\\server\\toolbox": [ "./server" ]
    }, "views\\server\\toolbox", function(global, module, exports, require, window) {
        ((function() {
            var Section, ServerSection, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
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
            module.exports = ServerSection = function(_super) {
                __extends(ServerSection, _super);
                function ServerSection() {
                    ServerSection.__super__.constructor.apply(this, arguments);
                }
                ServerSection.prototype.template = require("../../../templates/toolbox/server");
                ServerSection.prototype.events = {
                    "click .add": "add_child"
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
        "views\\server\\toolbox": [ "./table" ]
    }, "views\\server\\toolbox", function(global, module, exports, require, window) {
        ((function() {
            var Section, TableSection, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
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
            module.exports = TableSection = function(_super) {
                __extends(TableSection, _super);
                function TableSection() {
                    TableSection.__super__.constructor.apply(this, arguments);
                }
                TableSection.prototype.template = require("../../../templates/toolbox/table");
                TableSection.prototype.events = {
                    "click .add": "add_child",
                    "click .drop": "drop",
                    "click .rename": "rename"
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
                return TableSection;
            }(Section);
        })).call(this);
    });
    register({
        "views\\server": [ "./toolbox" ]
    }, "views\\server\\toolbox", function(global, module, exports, require, window) {
        ((function() {
            var Database, Field, Sections, Server, Table, ToolboxView, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
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
            Field = require("../../../models/field");
            Server = require("../../../models/server");
            Table = require("../../../models/table");
            Sections = {};
            Sections.database = require("./database");
            Sections.field = require("./field");
            Sections.server = require("./server");
            Sections.table = require("./table");
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
                    switch (node.constructor) {
                      case Server:
                        nodes.server = node;
                        break;
                      case Database:
                        nodes.database = node;
                        break;
                      case Table:
                        nodes.table = node;
                        break;
                      case Field:
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
            var Field, GraphView, Server, Table, ToolboxView, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
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
            Field = require("../../models/field");
            Server = require("../../models/server");
            Table = require("../../models/table");
            ToolboxView = require("./toolbox");
            module.exports = GraphView = function(_super) {
                __extends(GraphView, _super);
                function GraphView(el) {
                    this.el = el;
                    GraphView.__super__.constructor.call(this);
                }
                GraphView.prototype.initialize = function() {
                    var _this = this;
                    this.tree = global.tree = new Tree(this.el);
                    this.tree.bind("node:click", this.node_click.bind(this));
                    return socket.request("get_server", function(err, server) {
                        if (err) console.log(err.stack);
                        _this.tree.set_root(new Server(server));
                        _this.tree.set_centre(_this.tree.root);
                        _this.tree.refresh();
                        return _this.node_click(_this.tree.root);
                    });
                };
                GraphView.prototype.node_click = function(node) {
                    var child, direction, finish_move, grandchild, ids, path, sibling, _i, _j, _len, _len2, _ref, _ref2, _this = this;
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
                    if (direction === "down") {
                        if (!(node instanceof Field)) {
                            _ref2 = node.siblings();
                            for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
                                sibling = _ref2[_j];
                                this.tree.remove_node(sibling);
                            }
                        }
                    } else {
                        ids = function() {
                            var _k, _l, _len3, _len4, _ref3, _ref4, _results;
                            _ref3 = node.children;
                            _results = [];
                            for (_k = 0, _len3 = _ref3.length; _k < _len3; _k++) {
                                child = _ref3[_k];
                                _ref4 = child.children.slice(0);
                                for (_l = 0, _len4 = _ref4.length; _l < _len4; _l++) {
                                    grandchild = _ref4[_l];
                                    this.tree.remove_node(grandchild);
                                }
                                _results.push(child.id);
                            }
                            return _results;
                        }.call(this);
                    }
                    this.tree.set_centre(node);
                    this.tree.animate();
                    finish_move = function(node) {
                        _this.tree.bind("node:click", _this.node_click.bind(_this));
                        return _this.toolbox.update(node);
                    };
                    return this.tree.bind_once("anim:after", function() {
                        if (!(node.id && node.get("children"))) return finish_move(node);
                        return _this.transition(function(done) {
                            return node.get("children").fetch({
                                complete: done,
                                success: function() {
                                    _this.tree.animate();
                                    return _this.tree.bind_once("anim:after", function() {
                                        return finish_move(node);
                                    });
                                },
                                error: function(_, err) {
                                    return console.log(err.stack);
                                }
                            });
                        });
                    });
                };
                GraphView.prototype.transition = function(callback) {
                    var done;
                    done = function() {
                        return $("#overlay").fadeTo(250, 0, function() {
                            return $(this).hide();
                        });
                    };
                    $("#overlay").show().fadeTo(250, .5);
                    return callback(done);
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
        "": [ "../lib/compatibility" ]
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
        "": [ "../lib/sync" ]
    }, "lib", function(global, module, exports, require, window) {
        ((function() {
            var Database, Field, Table, create_model, delete_model, read_collection, update_model;
            Database = require("../models/database");
            Field = require("../models/field");
            Table = require("../models/table");
            Backbone.sync = function(method, model, options) {
                var callback;
                callback = function(err, results) {
                    if (typeof options.complete === "function") options.complete(err, results);
                    if (err) return options.error(null, err);
                    return options.success(results);
                };
                switch (method) {
                  case "create":
                    return create_model(model, callback);
                  case "delete":
                    return delete_model(model, callback);
                  case "read":
                    if (model.model != null) return read_collection(model, callback);
                    break;
                  case "update":
                    return update_model(model, callback);
                  default:
                    console.log("unhandled method", method);
                }
                return console.log("unhandled sync", method, model);
            };
            create_model = function(model, callback) {
                switch (model.constructor) {
                  case Database:
                    return socket.request("add_database", callback);
                  case Table:
                    return socket.request("add_table", {
                        database: model.parent.get("name")
                    }, callback);
                  default:
                    return console.log("unhandled model create", model);
                }
            };
            delete_model = function(model, callback) {
                switch (model.constructor) {
                  case Database:
                    return socket.request("drop_database", {
                        database: model.get("name")
                    }, callback);
                  case Table:
                    return socket.request("drop_table", {
                        database: model.parent.get("name"),
                        table: model.get("name")
                    }, callback);
                  default:
                    return console.log("unhandled model delete", model);
                }
            };
            read_collection = function(collection, callback) {
                switch (collection.model) {
                  case Database:
                    return socket.request("get_databases", callback);
                  case Table:
                    return socket.request("get_tables", {
                        database: collection.parent.get("name")
                    }, callback);
                  case Field:
                    return socket.request("get_fields", {
                        database: collection.parent.parent.get("name"),
                        table: collection.parent.get("name")
                    }, callback);
                  default:
                    return console.log("unhandled collection read", collection);
                }
            };
            update_model = function(model, callback) {
                switch (model.constructor) {
                  case Database:
                    return socket.request("rename_database", {
                        old_name: model.id.replace("" + model.parent.id + "/", ""),
                        new_name: model.get("name")
                    }, callback);
                  case Table:
                    return socket.request("rename_table", {
                        database: model.parent.get("name"),
                        old_name: model.id.replace("" + model.parent.id + "/", ""),
                        new_name: model.get("name")
                    }, callback);
                  default:
                    return console.log("unhandled model update", model);
                }
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
            require("../lib/compatibility");
            require("../lib/sync");
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