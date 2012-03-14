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
        views: [ "./base" ],
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
                NodeModel.prototype.open = function(callback) {
                    if (!this.constructor.Child) {
                        return typeof callback === "function" ? callback() : void 0;
                    }
                    return this.refresh(callback);
                };
                NodeModel.prototype.close = function() {
                    if (!this.constructor.Child) return;
                    return this.get("children").remove(this.children.slice(0));
                };
                NodeModel.prototype.refresh = function(callback) {
                    var _this = this;
                    if (!this.$elem.hasClass("open")) {
                        return typeof callback === "function" ? callback() : void 0;
                    }
                    this.get("children").fetch({
                        add: true,
                        error: function(_, err) {
                            return typeof callback === "function" ? callback(err) : void 0;
                        },
                        success: function() {
                            return async.forEach(_this.children, function(child, sync) {
                                return child.refresh(sync);
                            }, function() {
                                return typeof callback === "function" ? callback() : void 0;
                            });
                        }
                    });
                };
                return NodeModel;
            }(Backbone.Model);
            Children = function(_super) {
                __extends(Children, _super);
                function Children(parent) {
                    this.parent = parent;
                    Children.__super__.constructor.call(this);
                    this.model = this.parent.constructor.Child;
                    this.bind("add", this.on_add.bind(this));
                    this.bind("remove", this.on_remove.bind(this));
                }
                Children.prototype.fetch = function(options) {
                    var initial_ids, k, success, _this = this;
                    initial_ids = {};
                    for (k in this._byId) {
                        initial_ids[k] = null;
                    }
                    success = options.success;
                    options.success = function(_, updated) {
                        var id, model, _i, _len;
                        for (_i = 0, _len = updated.length; _i < _len; _i++) {
                            model = updated[_i];
                            delete initial_ids[model.id];
                        }
                        for (id in initial_ids) {
                            _this.remove(_this._byId[id]);
                        }
                        return success.apply(null, arguments);
                    };
                    return Children.__super__.fetch.apply(this, arguments);
                };
                Children.prototype.comparator = function(model) {
                    return model.get("name");
                };
                Children.prototype.add = function(models) {
                    var _this = this;
                    if (Array.isArray(models)) {
                        models = models.filter(function(model) {
                            return !(model.id in _this._byId);
                        });
                    } else {
                        if (models.id in this._byId) return;
                    }
                    return Children.__super__.add.apply(this, arguments);
                };
                Children.prototype.on_add = function(model, collection, options) {
                    var _ref;
                    model.parent = this.parent;
                    return this.parent.tree.insert_node(model, this.parent, (_ref = options.index) != null ? _ref : this.indexOf(model));
                };
                Children.prototype.on_remove = function(model) {
                    if (__indexOf.call(this.parent.children, model) >= 0) {
                        return this.parent.tree.remove_node(model);
                    }
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
                    var _this = this;
                    Field.__super__.constructor.apply(this, arguments);
                    if (this.get("key") === "primary") this.$elem.addClass("pk");
                    this.bind("change:key", function() {
                        if (_this.get("key") === "primary") {
                            return _this.$elem.addClass("pk");
                        } else {
                            return _this.$elem.removeClass("pk");
                        }
                    });
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
                        node: this.node
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
                                return on_error(err);
                            }
                        });
                    });
                };
                Section.prototype.drop = function() {
                    var parent, _this = this;
                    parent = this.node.parent;
                    if (!this.node.id) {
                        parent.get("children").remove(this.node);
                        return this.toolbox.graph.node_click(parent);
                    }
                    return this.toolbox.graph.transition(function(done) {
                        return _this.node.destroy({
                            complete: done,
                            success: function() {
                                return _this.toolbox.graph.node_click(parent);
                            },
                            error: function(_, err) {
                                return on_error(err);
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
                        if (_this.node.id) return _this.update();
                    };
                    this.node.$label.html("");
                    return $input = $("<input/>").attr({
                        type: "text",
                        value: this.node.get("name")
                    }).appendTo(this.node.$label).focus().select().bind("blur", rename).bind("keypress", rename);
                };
                Section.prototype.update = function() {
                    var _this = this;
                    return this.toolbox.graph.transition(function(done) {
                        _this.node.close();
                        _this.node.tree.animate();
                        return _this.node.tree.bind_once("anim:after", function() {
                            return _this.node.save({}, {
                                success: function(model) {
                                    _this.node.$elem.removeClass("changed");
                                    _this.el.replaceWith(_this.el = $(_this.template({
                                        node: _this.node
                                    })));
                                    _this.delegateEvents();
                                    if (!model.get("children")) return done();
                                    return model.get("children").fetch({
                                        add: true,
                                        complete: done,
                                        success: function() {
                                            return _this.node.tree.animate();
                                        },
                                        error: function(_, err) {
                                            return on_error(err);
                                        }
                                    });
                                },
                                error: function(_, err) {
                                    _this.node.set({
                                        name: _this.node.id.slice(_this.node.id.lastIndexOf("/") + 1)
                                    });
                                    on_error(err);
                                    return done();
                                }
                            });
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
                    buf.push("<h1>" + escape((interp = node.get("name")) == null ? "" : interp) + "");
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
                    buf.push("<h1>" + escape((interp = node.get("name")) == null ? "" : interp) + "");
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
                    __jade.shift();
                    buf.push("</ul>");
                    __jade.shift();
                    __jade.unshift({
                        lineno: 8,
                        filename: __jade[0].filename
                    });
                    buf.push("<h2>Properties");
                    __jade.unshift({
                        lineno: undefined,
                        filename: __jade[0].filename
                    });
                    __jade.shift();
                    buf.push("</h2>");
                    __jade.shift();
                    __jade.unshift({
                        lineno: 9,
                        filename: __jade[0].filename
                    });
                    buf.push("<ul");
                    buf.push(attrs({
                        "class": "properties"
                    }));
                    buf.push(">");
                    __jade.unshift({
                        lineno: undefined,
                        filename: __jade[0].filename
                    });
                    __jade.unshift({
                        lineno: 10,
                        filename: __jade[0].filename
                    });
                    buf.push("<li");
                    buf.push(attrs({
                        "class": "type"
                    }));
                    buf.push(">");
                    __jade.unshift({
                        lineno: undefined,
                        filename: __jade[0].filename
                    });
                    __jade.unshift({
                        lineno: 11,
                        filename: __jade[0].filename
                    });
                    var types = {};
                    __jade.shift();
                    __jade.unshift({
                        lineno: 12,
                        filename: __jade[0].filename
                    });
                    types.Boolean = [ "tinyint", 1 ];
                    __jade.shift();
                    __jade.unshift({
                        lineno: 13,
                        filename: __jade[0].filename
                    });
                    types.Date = [ "date" ];
                    __jade.shift();
                    __jade.unshift({
                        lineno: 14,
                        filename: __jade[0].filename
                    });
                    types.DateTime = [ "datetime" ];
                    __jade.shift();
                    __jade.unshift({
                        lineno: 15,
                        filename: __jade[0].filename
                    });
                    types.Float = [ "float" ];
                    __jade.shift();
                    __jade.unshift({
                        lineno: 16,
                        filename: __jade[0].filename
                    });
                    types.Integer = [ "int", 11 ];
                    __jade.shift();
                    __jade.unshift({
                        lineno: 17,
                        filename: __jade[0].filename
                    });
                    types.String = [ "varchar", 256 ];
                    __jade.shift();
                    __jade.unshift({
                        lineno: 18,
                        filename: __jade[0].filename
                    });
                    types.Text = [ "text" ];
                    __jade.shift();
                    __jade.unshift({
                        lineno: 19,
                        filename: __jade[0].filename
                    });
                    types.Time = [ "time" ];
                    __jade.shift();
                    __jade.unshift({
                        lineno: 20,
                        filename: __jade[0].filename
                    });
                    buf.push("<select");
                    buf.push(attrs({
                        "class": "type"
                    }));
                    buf.push(">");
                    __jade.unshift({
                        lineno: undefined,
                        filename: __jade[0].filename
                    });
                    __jade.unshift({
                        lineno: 21,
                        filename: __jade[0].filename
                    });
                    ((function() {
                        if ("number" == typeof types.length) {
                            for (var type = 0, $$l = types.length; type < $$l; type++) {
                                var def = types[type];
                                __jade.unshift({
                                    lineno: 21,
                                    filename: __jade[0].filename
                                });
                                __jade.unshift({
                                    lineno: 22,
                                    filename: __jade[0].filename
                                });
                                buf.push("<option");
                                buf.push(attrs({
                                    "data-type": def[0],
                                    "data-length": def[1],
                                    selected: node.get("type") == def[0]
                                }));
                                buf.push(">");
                                var __val__ = type;
                                buf.push(escape(null == __val__ ? "" : __val__));
                                __jade.unshift({
                                    lineno: undefined,
                                    filename: __jade[0].filename
                                });
                                __jade.shift();
                                buf.push("</option>");
                                __jade.shift();
                                __jade.shift();
                            }
                        } else {
                            for (var type in types) {
                                var def = types[type];
                                __jade.unshift({
                                    lineno: 21,
                                    filename: __jade[0].filename
                                });
                                __jade.unshift({
                                    lineno: 22,
                                    filename: __jade[0].filename
                                });
                                buf.push("<option");
                                buf.push(attrs({
                                    "data-type": def[0],
                                    "data-length": def[1],
                                    selected: node.get("type") == def[0]
                                }));
                                buf.push(">");
                                var __val__ = type;
                                buf.push(escape(null == __val__ ? "" : __val__));
                                __jade.unshift({
                                    lineno: undefined,
                                    filename: __jade[0].filename
                                });
                                __jade.shift();
                                buf.push("</option>");
                                __jade.shift();
                                __jade.shift();
                            }
                        }
                    })).call(this);
                    __jade.shift();
                    __jade.shift();
                    buf.push("</select>");
                    __jade.shift();
                    __jade.unshift({
                        lineno: 32,
                        filename: __jade[0].filename
                    });
                    buf.push("<script type=\"text/javascript\">\n(function() {\n  var option;\n\n  if (!$('select.type option[selected]').length) {\n    option = $('<option/>').attr({\n      selected: true,\n      'data-type': '" + escape((interp = node.get("type")) == null ? "" : interp) + "',\n      'data-length': '" + escape((interp = node.get("length")) == null ? "" : interp) + "'\n    }).text('" + escape((interp = node.get("type")) == null ? "" : interp) + "').appendTo($('select.type'));\n    if (option.attr('data-length')) option.append('(" + escape((interp = node.get("length")) == null ? "" : interp) + ")');\n  }\n\n}).call(this);\n</script>");
                    __jade.shift();
                    __jade.shift();
                    buf.push("</li>");
                    __jade.shift();
                    __jade.unshift({
                        lineno: 32,
                        filename: __jade[0].filename
                    });
                    buf.push("<li");
                    buf.push(attrs({
                        "class": "default"
                    }));
                    buf.push(">");
                    __jade.unshift({
                        lineno: undefined,
                        filename: __jade[0].filename
                    });
                    __jade.unshift({
                        lineno: 33,
                        filename: __jade[0].filename
                    });
                    buf.push("<input");
                    buf.push(attrs({
                        type: "text",
                        value: node.get("default"),
                        disabled: node.get("default") === null,
                        "class": "default"
                    }));
                    buf.push("/>");
                    __jade.shift();
                    __jade.unshift({
                        lineno: 34,
                        filename: __jade[0].filename
                    });
                    buf.push("<input");
                    buf.push(attrs({
                        type: "checkbox",
                        checked: node.get("default") !== null,
                        "class": "default_toggle"
                    }));
                    buf.push("/>");
                    __jade.shift();
                    __jade.shift();
                    buf.push("</li>");
                    __jade.shift();
                    __jade.unshift({
                        lineno: 35,
                        filename: __jade[0].filename
                    });
                    buf.push("<li");
                    buf.push(attrs({
                        "class": "key"
                    }));
                    buf.push(">");
                    __jade.unshift({
                        lineno: undefined,
                        filename: __jade[0].filename
                    });
                    __jade.unshift({
                        lineno: 36,
                        filename: __jade[0].filename
                    });
                    buf.push("<select");
                    buf.push(attrs({
                        "class": "key"
                    }));
                    buf.push(">");
                    __jade.unshift({
                        lineno: undefined,
                        filename: __jade[0].filename
                    });
                    __jade.unshift({
                        lineno: 37,
                        filename: __jade[0].filename
                    });
                    buf.push("<option");
                    buf.push(attrs({
                        value: ""
                    }));
                    buf.push(">None");
                    __jade.unshift({
                        lineno: undefined,
                        filename: __jade[0].filename
                    });
                    __jade.shift();
                    buf.push("</option>");
                    __jade.shift();
                    __jade.unshift({
                        lineno: 38,
                        filename: __jade[0].filename
                    });
                    buf.push("<option");
                    buf.push(attrs({
                        value: "index",
                        selected: node.get("key") == "index"
                    }));
                    buf.push(">Index");
                    __jade.unshift({
                        lineno: undefined,
                        filename: __jade[0].filename
                    });
                    __jade.shift();
                    buf.push("</option>");
                    __jade.shift();
                    __jade.unshift({
                        lineno: 39,
                        filename: __jade[0].filename
                    });
                    buf.push("<option");
                    buf.push(attrs({
                        value: "primary",
                        selected: node.get("key") == "primary"
                    }));
                    buf.push(">Primary");
                    __jade.unshift({
                        lineno: undefined,
                        filename: __jade[0].filename
                    });
                    __jade.shift();
                    buf.push("</option>");
                    __jade.shift();
                    __jade.unshift({
                        lineno: 40,
                        filename: __jade[0].filename
                    });
                    buf.push("<option");
                    buf.push(attrs({
                        value: "unique",
                        selected: node.get("key") == "unique"
                    }));
                    buf.push(">Unique");
                    __jade.unshift({
                        lineno: undefined,
                        filename: __jade[0].filename
                    });
                    __jade.shift();
                    buf.push("</option>");
                    __jade.shift();
                    __jade.shift();
                    buf.push("</select>");
                    __jade.shift();
                    __jade.shift();
                    buf.push("</li>");
                    __jade.shift();
                    __jade.unshift({
                        lineno: 41,
                        filename: __jade[0].filename
                    });
                    buf.push("<li");
                    buf.push(attrs({
                        "class": "null"
                    }));
                    buf.push(">");
                    __jade.unshift({
                        lineno: undefined,
                        filename: __jade[0].filename
                    });
                    __jade.unshift({
                        lineno: 42,
                        filename: __jade[0].filename
                    });
                    buf.push("<input");
                    buf.push(attrs({
                        type: "checkbox",
                        checked: node.get("null"),
                        "class": "null"
                    }));
                    buf.push("/>");
                    __jade.shift();
                    __jade.shift();
                    buf.push("</li>");
                    __jade.shift();
                    __jade.unshift({
                        lineno: 43,
                        filename: __jade[0].filename
                    });
                    buf.push("<li");
                    buf.push(attrs({
                        "class": "ai"
                    }));
                    buf.push(">");
                    __jade.unshift({
                        lineno: undefined,
                        filename: __jade[0].filename
                    });
                    __jade.unshift({
                        lineno: 44,
                        filename: __jade[0].filename
                    });
                    buf.push("<input");
                    buf.push(attrs({
                        type: "checkbox",
                        checked: node.get("ai"),
                        "class": "ai"
                    }));
                    buf.push("/>");
                    __jade.shift();
                    __jade.shift();
                    buf.push("</li>");
                    __jade.shift();
                    __jade.unshift({
                        lineno: 45,
                        filename: __jade[0].filename
                    });
                    buf.push("<li");
                    buf.push(attrs({
                        "class": "save"
                    }));
                    buf.push(">");
                    __jade.unshift({
                        lineno: undefined,
                        filename: __jade[0].filename
                    });
                    __jade.unshift({
                        lineno: 46,
                        filename: __jade[0].filename
                    });
                    buf.push("<input");
                    buf.push(attrs({
                        type: "button",
                        value: "Save",
                        "class": "save"
                    }));
                    buf.push("/>");
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
                FieldSection.prototype.events = {
                    "change select.type": "change",
                    "change input.default": "change",
                    "change select.key": "change",
                    "change input.null": "change",
                    "change input.ai": "change",
                    "change input.default_toggle": "toggle_default",
                    "click input.save": "update",
                    "click .drop": "drop",
                    "click .rename": "rename"
                };
                FieldSection.prototype.change = function(e) {
                    var $elem, $selected, on_change, _this = this;
                    on_change = function() {
                        return _this.node.$elem.addClass("changed");
                    };
                    this.node.bind("change", on_change);
                    $elem = $(e.target);
                    $selected = $elem.find(":selected");
                    if ($elem.hasClass("type")) {
                        this.node.set({
                            type: $selected.attr("data-type"),
                            length: $selected.attr("data-length")
                        });
                    } else if ($elem.hasClass("default")) {
                        this.node.set({
                            "default": $elem.is(":disabled") ? null : $elem.val()
                        });
                    } else if ($elem.hasClass("key")) {
                        this.node.set({
                            key: $elem.val() ? $elem.val() : null
                        });
                    } else if ($elem.hasClass("null")) {
                        this.node.set({
                            "null": $elem.is(":checked")
                        });
                    } else if ($elem.hasClass("ai")) {
                        this.node.set({
                            ai: $elem.is(":checked")
                        });
                    } else {
                        console.log("bad element");
                    }
                    return this.node.unbind("change", on_change);
                };
                FieldSection.prototype.toggle_default = function(e) {
                    if ($(e.target).is(":checked")) {
                        this.node.$elem.addClass("changed");
                        return this.$("input.default").removeAttr("disabled").focus();
                    } else {
                        this.node.set({
                            "default": null
                        });
                        this.node.$elem.addClass("changed");
                        return this.$("input.default").val("").attr({
                            disabled: "disabled"
                        });
                    }
                };
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
                    buf.push("<h1>" + escape((interp = node.get("name")) == null ? "" : interp) + "");
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
                    buf.push("<h1>" + escape((interp = node.get("name")) == null ? "" : interp) + "");
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
                    "click .drop": "drop",
                    "click .rename": "rename"
                };
                TableSection.prototype.add_child = function() {
                    var child, i, match, _i, _len, _ref, _this = this;
                    i = 0;
                    _ref = this.node.children;
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        child = _ref[_i];
                        if ((match = child.get("name").match(/new field \((\d+)\)/i)) && parseInt(match[1]) > i) {
                            i = match[1];
                        }
                    }
                    child = new Field({
                        name: "new field (" + ++i + ")",
                        type: "int",
                        length: 11,
                        "null": false,
                        "default": null,
                        ai: false,
                        key: false
                    });
                    child.parent = this.node;
                    child.$elem.addClass("changed");
                    this.node.get("children").add(child);
                    this.node.tree.animate();
                    return this.node.tree.bind_once("anim:after", function() {
                        return _this.toolbox.graph.node_click(child);
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
                    if (nodes.table) nodes.database = nodes.table.parent;
                    if (nodes.database) nodes.server = nodes.database.parent;
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
                    _ref = [ "field", "table", "database", "server" ];
                    _results = [];
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        k = _ref[_i];
                        if (this.sections[k]) {
                            _results.push(this.el.append(this.sections[k].render().fadeTo(0, 0).fadeTo(250, 1)));
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
                    this.tree.bind("node:add", this.set_label_text.bind(this));
                    return socket.request("get_server", function(err, server) {
                        if (err) return on_error(err);
                        _this.tree.set_root(new Server(server));
                        _this.tree.set_centre(_this.tree.root);
                        _this.tree.refresh();
                        _this.setup_panning();
                        return _this.node_click(_this.tree.root);
                    });
                };
                GraphView.prototype.setup_panning = function() {
                    var start_graph, start_mouse, _this = this;
                    start_mouse = start_graph = false;
                    this.el.mousemove(function(e) {
                        if (!(start_mouse || start_graph)) return;
                        return _this.tree.$wrapper.css({
                            left: start_graph.x - start_mouse.x + e.clientX,
                            top: start_graph.y - start_mouse.y + e.clientY
                        });
                    });
                    this.el.mousedown(function(e) {
                        if (!$(e.target).is(_this.el)) return;
                        start_mouse = {
                            x: e.clientX,
                            y: e.clientY
                        };
                        start_graph = {
                            x: _this.tree.$wrapper.position().left,
                            y: _this.tree.$wrapper.position().top
                        };
                        return _this.tree.$wrapper.css({
                            left: start_graph.x,
                            top: start_graph.y,
                            right: "auto"
                        });
                    });
                    return this.el.mouseup(function() {
                        start_mouse = start_graph = false;
                        return _this.tree.$wrapper.css({
                            left: "auto",
                            right: _this.el.width() - _this.tree.$wrapper.width() - _this.tree.$wrapper.position().left
                        });
                    });
                };
                GraphView.prototype.node_click = function(node) {
                    var child, _i, _len, _ref, _this = this;
                    if (!node.$elem.hasClass("open")) {
                        this.node_select(node);
                        this.transition(function(done) {
                            return async.series([ function(sync) {
                                _this.tree.bind_once("anim:after", sync);
                                return _this.tree.animate();
                            }, function(sync) {
                                return node.open(sync);
                            }, function(sync) {
                                this.tree.bind_once("anim:after", sync);
                                return this.tree.animate();
                            } ], function(err) {
                                if (err) on_error(err);
                                return done();
                            });
                        });
                        return;
                    }
                    if (node !== this.tree.root) {
                        node.close();
                        node.$elem.removeClass("selected open");
                        if (this.tree.$wrapper.find(".selected").length === 0) {
                            this.node_select(node.parent);
                        }
                        this.transition(function(done) {
                            _this.tree.bind_once("anim:after", function() {
                                if (_this.tree.$wrapper.find(".selected").length === 0) {
                                    _this.node_select(node.parent);
                                }
                                _this.tree.bind_once("anim:after", done);
                                return _this.tree.animate();
                            });
                            return _this.tree.animate();
                        });
                        return;
                    }
                    this.tree.$wrapper.find(".open").removeClass("open");
                    this.node_select(node);
                    _ref = node.children;
                    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
                        child = _ref[_i];
                        child.close();
                    }
                    return this.transition(function(done) {
                        _this.tree.bind_once("anim:after", done);
                        return _this.tree.animate();
                    });
                };
                GraphView.prototype.node_select = function(node) {
                    this.tree.$wrapper.find(".selected").each(function() {
                        if (!($(this).data("node").children.length > 0)) {
                            $(this).removeClass("open");
                        }
                        return $(this).removeClass("selected");
                    });
                    node.$elem.addClass("selected open");
                    this.toolbox.update(node);
                    return this.tree.set_centre(node);
                };
                GraphView.prototype.transition = function(callback) {
                    var done, _this = this;
                    done = function() {
                        return $("#overlay").fadeTo(250, 0, function() {
                            _this.tree.bind("node:click", _this.node_click.bind(_this));
                            return $("#overlay").hide();
                        });
                    };
                    this.tree.unbind("node:click");
                    $("#overlay").show().fadeTo(250, .5);
                    return callback(done);
                };
                GraphView.prototype.set_label_text = function(node) {
                    var $label, label, ratio;
                    $label = node.$label;
                    label = $label.text();
                    $("#ruler").text(label);
                    if ((ratio = 140 / $("#ruler").width()) < 1) {
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
        views: [ "./server" ],
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
                    var _this = this;
                    this.graph = new Graph(this.$("#graph"));
                    this.graph.toolbox = this.toolbox = new Toolbox(this.$("#toolbox"), this.graph);
                    return $(global).resize(function() {
                        _this.resize();
                        return _this.graph.tree.refresh();
                    });
                };
                ServerView.prototype.render = function() {
                    ServerView.__super__.render.apply(this, arguments);
                    return this.resize();
                };
                ServerView.prototype.resize = function() {
                    var toolbox_width;
                    toolbox_width = this.toolbox.el.outerWidth(true);
                    return this.$("#overlay, #graph").css({
                        left: toolbox_width,
                        width: $(global).innerWidth() - toolbox_width
                    });
                };
                return ServerView;
            }(BaseView);
        })).call(this);
    });
    register({
        views: [ "../templates/login" ]
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
            BaseView = require("./base");
            ServerView = require("./server");
            module.exports = LoginView = function(_super) {
                __extends(LoginView, _super);
                function LoginView() {
                    LoginView.__super__.constructor.apply(this, arguments);
                }
                LoginView.prototype.template = require("../templates/login");
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
                            console.log(err.stack);
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
        "": [ "./lib/compatibility" ]
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
        "": [ "./lib/sync" ]
    }, "lib", function(global, module, exports, require, window) {
        ((function() {
            var Database, Field, Table, create_model, delete_model, read_collection, update_model;
            Database = require("../models/database");
            Field = require("../models/field");
            Table = require("../models/table");
            Backbone.sync = function(method, model, options) {
                var callback;
                callback = function(err, results) {
                    if (typeof options.complete === "function") options.complete(results, err);
                    if (err) return options.error(err);
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
                  case Field:
                    return socket.request("save_field", {
                        database: model.parent.parent.get("name"),
                        table: model.parent.get("name"),
                        field: model.get("name"),
                        attributes: model.attributes
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
                  case Field:
                    return socket.request("drop_field", {
                        database: model.parent.parent.get("name"),
                        table: model.parent.get("name"),
                        field: model.get("name")
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
                  case Field:
                    return socket.request("save_field", {
                        database: model.parent.parent.get("name"),
                        table: model.parent.get("name"),
                        field: model.id.replace("" + model.parent.id + "/", ""),
                        attributes: model.attributes
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
            var LoginView, Router, ServerView, on_error, socket_request, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
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
            require("./lib/compatibility");
            require("./lib/sync");
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
            on_error = function(err) {
                console.log(err.stack);
                return alert(String(err));
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
                        if (err) return on_error(err);
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
                global.on_error = on_error;
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