(function (nx, global) {

    nx.event = {
        destroy: function () {
            this.__listeners__ = {};
        },
        on: function (inName, inHandler, inContext) {
            var map = this.__listeners__;
            var listeners = map[inName] = map[inName] || [{owner: null, handler: null, context: null}];
            listeners.push({
                owner: this,
                handler: inHandler,
                context: inContext
            });
        },
        off: function (inName, inHandler, inContext) {
            var listeners = this.__listeners__[inName];
            if (inHandler) {
                nx.each(listeners, function (listener, index) {
                    if (index > 0) {
                        if (listener.handler === inHandler && (!inContext || listener.context === inContext )) {
                            listeners.splice(index, 1);
                            return nx.$breaker;
                        }
                    }
                });
            } else {
                listeners.length = 1;
            }
        },
        upon: function (inName, inHandler, inContext) {
            var map = this.__listeners__;
            var listeners = map[inName] = map[inName] || [
                {owner: null, handler: null, context: null}
            ];

            listeners[0] = {
                owner: this,
                handler: inHandler,
                context: inContext
            };
        },
        fire: function (inName, inArgs) {
            var listeners = this.__listeners__[inName];
            if (listeners) {
                nx.each(listeners, function (listener) {
                    if (listener && listener.handler) {
                        if (listener.handler.call(listener.context || listener.owner, listener.owner, inArgs) === false) {
                            return nx.$breaker;
                        }
                    }
                });
            }
        }
    };

}(nx, nx.global));