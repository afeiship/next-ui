(function (nx, global) {

    var __ = {
        parseNames: function (names, inOwner) {
            return names == '*' ? Object.keys(inOwner.__properties__) : [].concat(names);
        }
    };
    var Observable = nx.declare('nx.Observable', {
        methods: {
            init: function () {
                this.__watchers__ = {};
            },
            destroy: function () {
                this.__watchers__ = {};
            },
            watch: function (inNames, inHandler, inContext) {
                var names = __.parseNames(inNames, this);
                nx.each(names, function (name) {
                    this._watch(name, inHandler, inContext);
                }, this);
            },
            unwatch: function (inNames, inHandler, inContext) {
                var names = __.parseNames(inNames, this);
                nx.each(names, function (name) {
                    this._unwatch(name, inHandler, inContext);
                }, this);
            },
            notify: function (inNames) {
                var names = __.parseNames(inNames, this);
                nx.each(names, function (name) {
                    this._notify(name);
                }, this);
            },
            _watch: function (inName, inHandler, inContext) {
                var map = this.__watchers__;
                var watchers = map[inName] = map[inName] || [];
                var member = this.member(inName);
                var memberType = this.memberType(inName);

                watchers.push({
                    owner: this,
                    handler: inHandler,
                    context: inContext
                });

                if (member && memberType === 'property') {
                    //property will watch one time default.
                    //so we need minus this condition.
                    if (!member.__watched__) {
                        var setter = member.__setter__;
                        member.__setter__ = function (value, params) {
                            var oldValue = this.get(inName);
                            if (oldValue !== value) {
                                if (setter && setter.call(this, value, params) !== false) {
                                    this.notify(inName);
                                }
                            }
                        };
                        member.__watched__ = true;
                    }
                }
            },
            _unwatch: function (inName, inHandler, inContext) {
                var map = this.__watchers__;
                var watchers = map[inName];

                if (watchers) {
                    if (inHandler) {
                        nx.each(watchers, function (watcher, index) {
                            if (watcher.handler == inHandler && watcher.context == inContext) {
                                watchers.splice(index, 1);
                                return nx.$breaker;
                            }
                        });
                    } else {
                        watchers.length = 0;
                    }
                }
            },
            _notify: function (inName) {
                var map = this.__watchers__;
                nx.each(map[inName], function (watcher) {
                    if (watcher && watcher.handler) {
                        watcher.handler.call(watcher.context, inName, this.get(inName), watcher.owner);
                    }
                }, this);
            }
        }
    });

}(nx, nx.global));