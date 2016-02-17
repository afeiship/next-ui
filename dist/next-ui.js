nx = {
  $breaker: {},
  version: '0.0.1',
  global: (function () {
    return this;
  }).call(null),
  noop: function () {
  }
};
(function (nx, global) {

  var toString = Object.prototype.toString;
  var class2type = {
    '[object Boolean]': 'Boolean',
    '[object Number]': 'Number',
    '[object String]': 'String',
    '[object Function]': 'Function',
    '[object Array]': 'Array',
    '[object Date]': 'Date',
    '[object RegExp]': 'RegExp',
    '[object Object]': 'Object',
    '[object Error]': 'Error'
  };

  var __ = {
    typeString: function (inTarget) {
      return toString.call(inTarget).slice(8, -1);
    }
  };

  nx.each = function (inTarget, inCallback, inContext) {
    var key, length;
    if (inTarget) {
      if (inTarget.__each__) {
        try {
          inTarget.__each__(inCallback, inContext);
        } catch (_) {
        }
      } else {
        length = inTarget.length;
        if (length >= 0) {
          for (key = 0; key < length; key++) {
            if (inCallback.call(inContext, inTarget[key], key) === nx.$breaker) {
              break;
            }
          }
        } else {
          for (key in inTarget) {
            if (inTarget.hasOwnProperty(key)) {
              if (inCallback.call(inContext, inTarget[key], key) === nx.$breaker) {
                break;
              }
            }
          }
        }
      }
    }
  };

  nx.clone = function (inTarget) {
    if (inTarget) {
      if (inTarget.__clone__) {
        try {
          return inTarget.__clone__();
        } catch (_) {
        }
      } else {
        if (nx.is(inTarget, 'array')) {
          return inTarget.slice(0);
        } else {
          return nx.mix({}, inTarget);
        }
      }
    } else {
      return inTarget;
    }
  };

  nx.mix = function (inTarget) {
    var i, length;
    for (i = 1, length = arguments.length; i < length; i++) {
      nx.each(arguments[i], function (val, key) {
        inTarget[key] = val;
      });
    }
    return inTarget;
  };

  nx.is = function (inTarget, inType) {
    if (inTarget && inTarget.__is__) {
      return inTarget.__is__(inType);
    } else {
      if (typeof inType === 'string') {
        switch (inType) {
          case 'undefined':
            return inTarget === undefined;
          case 'null':
            return inTarget === null;
          case 'object':
            return inTarget && (typeof inTarget === 'object');
          case 'plain':
            return inTarget && inTarget.constructor === Object;
          case 'string':
          case 'boolean':
          case 'number':
          case 'function':
            return typeof inTarget === inType;
          case 'array':
            return inTarget instanceof Array;
          default:
            return __.typeString(inTarget).toLowerCase() === inType;
        }
      } else if (typeof inType === 'function') {
        return inTarget instanceof inType;
      }
    }
  };

  nx.type = function (inTarget) {
    var typeString;
    if (inTarget && inTarget.__type__) {
      return inTarget.__type__;
    } else {
      if (inTarget === null) {
        return 'Null';
      }
      if (inTarget === undefined) {
        return 'Undefined';
      }
      typeString = toString.call(inTarget);
      return class2type[typeString] || __.typeString(inTarget);
    }
  };

  nx.isType = function (inType) {
    return function (inTarget) {
      return toString.call(inTarget) === '[object ' + inType + ']';
    }
  };


  nx.has = function (inTarget, inName) {
    if (inTarget) {
      if (inTarget.__has__) {
        return inTarget.__has__(inName);
      } else {
        return inName in inTarget;
      }
    }
    return false;
  };

  nx.get = function (inTarget, inName) {
    if (inTarget) {
      if (inTarget.__get__) {
        return inTarget.__get__(inName);
      } else {
        return inTarget[inName];
      }
    }
  };

  nx.set = function (inTarget, inName, inValue) {
    if (inTarget) {
      if (inTarget.__set__) {
        return inTarget.__set__(inName, inValue);
      } else {
        return inTarget[inName] = inValue;
      }
    }
  };

  nx.gets = function (inTarget) {
    if (inTarget) {
      if (inTarget.__gets__) {
        return inTarget.__gets__();
      } else {
        return nx.mix({}, inTarget);
      }
    }
  };

  nx.sets = function (inTarget, inObject) {
    if (inTarget) {
      if (inTarget.__sets__) {
        return inTarget.__sets__(inObject);
      } else {
        return nx.mix(inTarget, inObject);
      }
    }
  };

  nx.path = function (inTarget, inPath, inValue) {
    if (typeof inPath !== 'string') {
      throw new Error('Path must be a string!');
    }

    var paths = inPath.split('.'),
      result = inTarget || nx.global,
      last;

    if (undefined === inValue) {
      nx.each(paths, function (path) {
        result = nx.get(result, path);
      });
    } else {
      last = paths.pop();
      nx.each(paths, function (path) {
        result = result[path] = result[path] || {};
      });
      nx.set(result, last, inValue);
    }
    return result;
  };

}(nx, nx.global));

/**
 * Export the "nx" object
 */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = nx;
}

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
(function (nx, global) {

    function RootClass() {
    }


    var metaMethods = {
        constructor: RootClass,
        init: function () {
            //will be implement
        },
        destroy: function () {
            //will be implement
        },
        base: function () {
            var method = this.base.caller.__base__;
            if (method) {
                return method.apply(this, arguments);
            }
        },
        is: function (inType) {
            var selfType = this.__type__;
            if (selfType === inType) {
                return true;
            } else {
                var base = this.__base__;
                if (base) {
                    return nx.is(base.prototype, inType);
                } else {
                    return false;
                }
            }
        },
        has: function (inName) {
            return inName in this;
        },
        get: function (inName) {
            var type = this.memberType(inName);
            switch (type) {
                case 'method':
                    return this[inName];
                case 'property':
                    return this[inName].call(this);
            }
        },
        gets: function () {
            var result = {};
            nx.each(this.__properties__, function (val, name) {
                result[name] = this.get(name);
            }, this);
            return result;
        },
        set: function (inName, inValue) {
            var type = this.memberType(inName);
            if (type === 'property') {
                this[inName].call(this,inValue)
            } else {
                this[inName] = inValue;
            }
        },
        sets: function (inObject) {
            nx.each(inObject, function (val, name) {
                this.set(name, val);
            }, this);
        },
        invoke: function (inName) {
            var method = this[inName],
                args;
            if (method) {
                args = Array.prototype.slice.call(arguments, 1);
                return method.apply(this, args);
            }
        },
        getMeta: function (inName) {
            var meta = this.__meta__;
            return meta[inName];
        },
        member: function (inName) {
            return this[inName] || this['@on' + inName];
        },
        memberMeta: function (inName) {
            var member = this.member(inName);
            return member ? member.__meta__ : member;
        },
        memberType: function (inName) {
            var meta = this.memberMeta(inName);
            switch (typeof meta) {
                case 'object':
                    return 'property';
                case 'string':
                    return 'event';
                case 'function':
                    return 'method';
                case 'undefined':
                    return 'undefined';
            }
        },
        toString: function () {
            return '[Class@' + this.__type__ + ']';
        }
    };

    metaMethods = nx.mix(metaMethods, nx.event);

    var classMeta = {
        __classId__: 0,
        __type__: 'nx.RootClass',
        __static__: false,
        __init__: nx.noop,
        __mixins__: [],
        __statics__: {},
        __events__: [],
        __properties__: {},
        __methods__: nx.mix({}, metaMethods)
    };


    var prototype = RootClass.prototype = nx.mix(metaMethods, {
        __is__: function (type) {
            return this.is(type);
        },
        __has__: function (name) {
            return this.has(name);
        },
        __get__: function (name) {
            return this.get(name);
        },
        __set__: function (name, value) {
            return this.set(name, value);
        },
        __gets__: function () {
            return this.gets();
        },
        __sets__: function (inObject) {
            return this.sets(inObject);
        }
    });


    nx.mix(RootClass, classMeta);
    nx.mix(prototype, classMeta);

    nx.RootClass = RootClass;

}(nx, nx.global));
(function (nx, global) {

    //private container:
    var classId = 1,
        instanceId = 0;
    var instanceMap = {};
    var ArraySlice = Array.prototype.slice;
    var __ = {
        normalizePropertyMeta: function (inName, inMeta) {
            var meta = inMeta,
                key;
            if (typeof meta !== 'object' || meta === null) {
                meta = {
                    value: inMeta
                };
            }
            meta.name = inName;
            if (!meta.redefined) {
                meta.generated = !(meta.set || meta.get);
                if (meta.generated) {
                    nx.defaultSetter = meta.set = function (inValue) {
                        this['_' + inName] = inValue;
                    };
                }
            }

            if (!meta.redefined) {
                //when somebody set ''/null/undefined/0/false and so on
                if (meta.generated) {
                    meta.get = function () {
                        key = '_' + inName;
                        if (key in this) {
                            return this[key];
                        } else {
                            return meta.value;
                        }
                    };
                }
            }
            return meta;
        },
        defineMethod: function (inTarget, inName, inMethod) {
            var member = inTarget[inName] = inMethod;
            member.__meta__ = inMethod;
            return member;
        },
        defineProperty: function (inTarget, inName, inMeta) {
            var meta = __.normalizePropertyMeta(inName, inMeta);
            var member = inTarget[inName] = function (inValue) {
                if (inValue === undefined) {
                    return member.__getter__.call(this);
                } else {
                    member.__setter__.call(this, inValue);
                }
            };
            member.__setter__ = meta.set;
            member.__getter__ = meta.get;
            member.__meta__ = meta;
            return member;
        },
        defineEvent: function (inTarget, inName) {
            var name = '@on' + inName;
            var member = inTarget[name] = function (handler, context) {
                var map = this.__listeners__;
                var listeners = map[name] = map[name] || [
                    {owner: null, handler: null, context: null}
                ];

                listeners[0] = {
                    owner: this,
                    handler: handler,
                    context: context
                };
            };
            member.__meta__ = inName;
            return member;
        },
        distinct: function (inArray) {
            var result = [],
                map = {},
                type,
                key;
            nx.each(inArray, function (val) {
                type = typeof(val);
                if (type === 'string') {
                    key = type + val;
                } else {
                    key = val.__type__;
                }
                if (!map[key]) {
                    map[key] = true;
                    result.push(val);
                }
            });
            return result || inArray;
        },
        indexOf: function (inArray, inItem) {
            var result = -1;
            nx.each(inArray, function (item, index) {
                if (inItem === item) {
                    result = index;
                    return nx.$breaker;
                }
            });
            return result;
        },
        union: function () {
            var result = [];
            nx.each(arguments, function (item) {
                result = result.concat(item || [])
            });
            return __.distinct(result);
        },
        keys: (function () {
            return Object.keys || function (obj) {
                    var result = [];
                    for (result[result.length] in obj);
                    return result;
                };
        }())
    };

    function LifeCycle() {
    }

    LifeCycle.prototype = {
        constructor: LifeCycle,
        destroy: function () {
            this.__Class__ = null;
            this.__constructor__ = null;
            this.__target__ = null;
        },
        initMetaProcessor: function (inMeta, inClassMeta) {
            var base = inClassMeta.__base__ = inMeta.extend || nx.RootClass;
            var methods = inMeta.methods,
                statics = inMeta.statics;
            var isStatic = inClassMeta.__static__ = inMeta.static || false;
            inClassMeta.__classId__ = classId++;
            inClassMeta.__init__ = (isStatic ? (statics && statics.init) : (methods && methods.init )) || base.__init__;
            if (isStatic) {
                if (inMeta.methods) {
                    throw new Error('Static class can not use `methods` keywords');
                }
            }
        },
        createClassProcessor: function (inMeta, inClassMeta) {
            var self = this;
            var base = inClassMeta.__base__;
            if (base.__static__) {
                throw new Error('Static class cannot be inherited.');
            }
            if (inClassMeta.__static__) {
                this.__Class__ = function () {
                    throw new Error('Cannot instantiate static class.');
                };
                this.__target__ = this.__Class__;
            } else {
                this.__Class__ = function () {
                    this.__id__ = ++instanceId;
                    instanceMap[instanceId] = this;
                    this.__listeners__ = {};
                    self.__constructor__.apply(this, ArraySlice.call(arguments));
                };
                this.__target__ = this.__Class__.prototype;
            }
        },

        registerDefineMetaMethod: function () {
            var target = this.__target__;
            nx.mix(target, {
                defineProperty: function (inName, inMeta) {
                    return __.defineProperty(this, inName, inMeta);
                },
                defineMethod: function (inName, inMethod) {
                    return __.defineMethod(this, inName, inMethod);
                }
            });
        },
        mixinItemsProcessor: function (inMeta, inClassMeta) {
            var base = inClassMeta.__base__;
            var mixins = inMeta.mixins;
            var mixinTarget = {},
                mixinMixins = [],
                mixinEvents = [],
                mixinMethods = {},
                mixinProperties = {},
                mixinStatics = {},

                mixItemTarget = {},
                mixItemMixins = [],
                mixinItemEvents = [],
                mixinItemMethods = {},
                mixinItemProperties = {},
                mixinItemStatics = {};

            nx.each(mixins, function (mixinItem) {
                mixItemTarget = mixinItem.__static__ ? mixinItem : mixinItem.prototype;
                mixItemMixins = mixinItem.__mixins__;
                mixinItemEvents = mixinItem.__events__;
                mixinItemMethods = mixinItem.__methods__;
                mixinItemProperties = mixinItem.__properties__;
                mixinItemStatics = mixinItem.__statics__;

                mixinMixins = mixinMixins.concat(mixItemMixins);
                mixinEvents = mixinEvents.concat(mixinItemEvents);
                nx.mix(mixinMethods, mixinItemMethods);
                nx.mix(mixinProperties, mixinItemProperties);
                nx.mix(mixinStatics, mixinItemStatics);
                nx.mix(mixinTarget, mixItemTarget);
            });

            inClassMeta.__mixins__ = __.union(mixinMixins, base.__mixins__, inMeta.mixins);
            inClassMeta.__events__ = __.union(mixinEvents, base.__events__, inMeta.events);
            inClassMeta.__methods__ = nx.mix(mixinMethods, base.__methods__);
            inClassMeta.__properties__ = nx.mix(mixinProperties, base.__properties__);
            inClassMeta.__statics__ = nx.mix(mixinStatics, base.__statics__, inMeta.statics);
            this.__target__ = nx.mix(this.__target__, mixinTarget, base.prototype);
        },
        inheritProcessor: function (inMeta, inClassMeta) {
            if (inClassMeta.__static__) {
                nx.mix(inClassMeta.__statics__, inMeta.statics);
            } else {
                this.defineMethods(inMeta, inClassMeta);
            }
            this.defineProperties(inMeta, inClassMeta);
            this.defineEvents(inMeta, inClassMeta);
            this.defineStatics(inMeta, inClassMeta);
        },
        defineEvents: function (inMeta, inClassMeta) {
            var events = inClassMeta.__events__;
            var target = this.__target__;
            nx.each(events, function (eventName) {
                __.defineEvent(target, eventName);
            });
        },
        defineMethods: function (inMeta, inClassMeta) {
            var metaMethods = inMeta.methods || {};
            var methods = __.keys(metaMethods);
            var extendMethods = inClassMeta.__methods__;
            var target = this.__target__;
            nx.each(extendMethods, function (method, name) {
                target.defineMethod(name, method);
                if (__.indexOf(methods, name) > -1) {
                    target.defineMethod(name, metaMethods[name]);
                    target[name].__base__ = method;
                }
            });

            nx.each(metaMethods, function (method, name) {
                if (!target[name]) {
                    target.defineMethod(name, method);
                }
            });

            inClassMeta.__methods__ = nx.mix(extendMethods, metaMethods);
        },
        defineProperties: function (inMeta, inClassMeta) {
            var metaProperties = inMeta.properties || {};
            var properties = __.keys(metaProperties);
            var extendProperties = inClassMeta.__properties__;
            var target = this.__target__;
            nx.each(extendProperties, function (prop, name) {
                var member,
                    extendMember;
                member = target.defineProperty(name, prop);
                if (__.indexOf(properties, name) > -1) {
                    extendMember = target.defineProperty(name, metaProperties[name]);
                    if (extendMember.__setter__) {
                        extendMember.__setter__.__base__ = member.__setter__;
                    }
                    extendMember.__getter__.__base__ = member.__getter__;
                }
            });
            nx.each(metaProperties, function (prop, name) {
                if (!target[name]) {
                    target.defineProperty(name, prop);
                }
            });
            inClassMeta.__properties__ = nx.mix(extendProperties, inMeta.properties);
        },
        defineStatics: function (inMeta, inClassMeta) {
            this.__Class__ = nx.mix(this.__Class__, inClassMeta.__statics__);
        },
        constructorProcessor: function (inMeta, inClassMeta) {
            var mixins = inClassMeta.__mixins__;
            this.__constructor__ = function () {
                nx.each(mixins, function (mixItem) {
                    mixItem.__init__.call(this);
                }, this);
                inClassMeta.__init__.apply(this, ArraySlice.call(arguments));
            };
        },
        staticConstructorProcessor: function (inMeta, inClassMeta) {
            if (inClassMeta.__static__) {
                this.__constructor__.call(this.__Class__);
            }
        },
        registerNamespace: function (inMeta, inClassMeta) {
            var type = inClassMeta.__type__,
                Class = this.__Class__;

            if (!inClassMeta.__static__) {
                nx.mix(Class.prototype, inClassMeta, {
                    constructor: this.__constructor__
                });
            }

            nx.mix(Class, inClassMeta);
            if (type !== 'Anonymous') {
                nx.path(global, type, Class);
            }
        }
    };

    nx.declare = function (inType, inMeta) {
        var Class, classMeta = {},
            meta = classMeta.__meta__ = inMeta || inType;
        var lifeCycle = new LifeCycle();
        classMeta.__type__ = typeof(inType) === 'string' ? inType : "Anonymous";
        lifeCycle.initMetaProcessor(meta, classMeta);
        lifeCycle.createClassProcessor(meta, classMeta);
        lifeCycle.registerDefineMetaMethod(meta, classMeta);
        lifeCycle.mixinItemsProcessor(meta, classMeta);
        lifeCycle.inheritProcessor(meta, classMeta);
        lifeCycle.constructorProcessor(meta, classMeta);
        lifeCycle.staticConstructorProcessor(meta, classMeta);
        lifeCycle.registerNamespace(meta, classMeta);
        Class = lifeCycle.__Class__;
        //lifeCycle.destroy();
        return Class;
    };

    nx.defineProperty = __.defineProperty;
    nx.defineMethod = __.defineMethod;
    nx.defineEvent = __.defineEvent;
    nx.$ = function (inId) {
        return instanceMap[inId];
    };

}(nx, nx.global));
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
(function (nx, global) {

    var Binding = nx.declare('nx.Binding', {
        statics: {
            converters: {
                boolean: {
                    convert: function (inValue) {
                        return !!inValue;
                    },
                    revert: function (inValue) {
                        return !!inValue;
                    }
                },
                inverted: {
                    convert: function (inValue) {
                        return !inValue;
                    },
                    revert: function (inValue) {
                        return !inValue;
                    }
                },
                number: {
                    convert: function (inValue) {
                        return Number(inValue);
                    },
                    revert: function (inValue) {
                        return inValue;
                    }
                }
            }
        },
        properties: {
            target: {
                value: null
            },
            targetPath: null,
            source: {
                value: null
            },
            sourcePath: null,
            direction: null,
            converter: {
                value: null
            }
        },
        methods: {
            init: function (inConfig) {
                this.sets(inConfig);
                this.router();
            },
            router: function () {
                switch (this.direction()) {
                    case '->':
                        this.forward();
                        break;
                    case '<-':
                        this.backward();
                        break;
                    case '<>':
                        this.forward();
                        this.backward();
                        break;
                }
            },
            backward: function () {
                var source = this.source(),
                    sourcePath = this.sourcePath();
                if (source.watch) {
                    source.watch(sourcePath, this.onSourceChange, this);
                }
            },
            forward: function () {
                var target = this.target(),
                    targetPath = this.targetPath();
                if (target.watch) {
                    target.watch(targetPath, this.onTargetChange, this);
                }
            },
            onSourceChange: function (inProperty, inValue) {
                var value = inValue;
                var converter = this.converter();
                if (converter && converter.revert) {
                    value = converter.revert(value);
                }
                this.updateTarget(value);
            },
            onTargetChange: function (inProperty, inValue) {
                var value = inValue;
                var converter = this.converter();
                if (converter && converter.convert) {
                    value = converter.convert(value);
                }
                this.updateSource(value);
            },
            updateSource: function (inValue) {
                nx.path(this.source(), this.sourcePath(), inValue);
            },
            updateTarget: function (inValue) {
                nx.path(this.target(), this.targetPath(), inValue);
            }
        }
    });

}(nx, nx.global));
(function (nx, global) {

    nx.declare('nx.ResourceManager', {
        methods: {
            init: function () {
                this.base();
                this.__resources__ = {};
            },
            destroy: function () {
                this.base();
                this.__resources__ = {};
            },
            setResource: function (inName, inValue) {
                if (inName && !nx.is(inValue, 'undefined')) {
                    this.__resources__[inName] = inValue;
                }
            },
            getResource: function (inName) {
                return this.__resources__[inName];
            },
            removeResource: function (inName) {
                delete this.__resources__[inName];
            }
        }
    });

}(nx, nx.global));
(function (nx, global) {

    var Binder = nx.declare('nx.Binder', {
        extend: nx.Observable,
        statics: {
            hasBinding: function (inString) {
                return nx.is(inString, 'string') && inString.charAt(0) === '{' && inString.slice(-1) === '}';
            },
            getConverter: function (inOwner, inName) {
                return inOwner[inName] ||
                    inOwner.parent().owner()[inName] ||
                    inOwner.absOwner()[inName] ||
                    nx.Binding.converters;
            },
            bindingMeta: function (inString) {
                var params = {};
                var bindingString = inString.slice(1, -1);
                var tokens = bindingString.split(',');
                var path = tokens[0];
                var paths = path.split('.');
                var i = 1, length = tokens.length;

                for (; i < length; i++) {
                    var pair = tokens[i].split('=');
                    params[pair[0]] = pair[1];
                }
                params.fullPath = path;
                params.direction = params.direction || '<>';
                params.property = paths.pop();
                params.path = paths.join('.');
                params.converterVal = function (inOwner) {
                    var converterName = params.converter;
                    var owner = inOwner.absOwner();
                    if (converterName) {
                        return owner[converterName].call(owner) || nx.Binding.converters[converterName];
                    }
                    return null;
                };
                params.context = function (inOwner) {
                    if (!params.path) {
                        //owner binding
                        return inOwner;
                    }
                    //path binding
                    return nx.path(inOwner, params.path);
                };
                params.val = function (inOwner) {
                    return nx.path(inOwner, params.fullPath);
                };
                return params;
            }
        }
    });

}(nx, nx.global));
(function (nx, global) {

    nx.declare('nx.data._Index', {
        properties: {
            index: 0
        }
    })

}(nx, nx.global));
(function (nx, global) {

    nx.declare('nx.data.Serializable', {
        methods: {
            init: function () {
                this.base();
                this.resetSerialize();
            },
            resetSerialize: function () {
                var propertyMeta;
                var selfProperties = this.getMeta('properties');
                nx.each(selfProperties, function (meta, name) {
                    propertyMeta = this.memberMeta(name);
                    if (propertyMeta.serialize === undefined) {
                        propertyMeta.serialize = true;
                    }
                }, this);
            },
            serialize: function () {
                var result = {};
                var value, propertyMeta;
                var selfProperties = this.getMeta('properties');
                nx.each(selfProperties, function (meta, name) {
                    propertyMeta = this.memberMeta(name);
                    if (propertyMeta.serialize) {
                        value = nx.get(this, name);
                        switch (true) {
                            case propertyMeta.serialize && nx.is(value, 'nx.RootClass'):
                                if (value.has('serialize')) {
                                    result[name] = value.serialize();
                                }
                                break;
                            case propertyMeta.serialize === true:
                                result[name] = value;
                                break;
                            case nx.is(propertyMeta.serialize, 'function'):
                                result[name] = propertyMeta.serialize.call(this);
                                break;
                        }
                    }

                }, this);

                return result;
            }
        }
    });


}(nx, nx.global));
(function (nx, global) {

    nx.declare('nx.data.Collection', {
        extend: nx.data.Iterable,
        properties:{
            count:{
                get:function(){
                    return this._data.length;
                }
            }
        },
        methods: {
            init: function (inData) {
                this.base();
                this._data = inData || [];
                this.updateIndex();
            },
            updateIndex: function () {
                this.each(function (item, index) {
                    if (item.index) {
                        item.index(index);
                    }
                });
            },
            add: function (inItem) {
                return this._data.push(inItem);
            },
            addRange: function (inItems) {
                var data = this._data;
                return this._data = data.concat(inItems);
            },
            insert: function (inItem, inIndex) {
                return this._data.splice(inIndex || 0, 0, inItem);
            },
            insertRange: function (inItems, inIndex) {
                var data = this._data;
                return data.splice.apply(data, [inIndex || 0, 0].concat(inItems));
            },
            attach: function (inItem, inIndex) {
                if (inIndex > -1) {
                    this.insert(inItem, inIndex);
                } else {
                    this.add(inItem);
                }
            },
            remove: function (inItem) {
                var index = this.index(inItem);
                if (index >= 0) {
                    this._data.splice(index, 1);
                    return index;
                } else {
                    return -1;
                }
            },
            removeAt: function (inIndex) {
                return this._data.splice(inIndex, 1)[0];
            },
            index: function (inItem) {
                var result = -1;
                nx.each(this._data, function (item, index) {
                    if (inItem === item) {
                        result = index;
                        return nx.$breaker;
                    }
                });
                return result;
            },
            contains: function (inItem) {
                var index = this.index(inItem);
                return !!(~index);
            },
            item: function (inIndex, inItem) {
                if (typeof inItem === 'undefined') {
                    return this._data[inIndex];
                } else {
                    this._data[inIndex] = inItem;
                }
            },
            clear: function () {
                return this._data.length = 0;
            },
            each: function (inCallback, inContext) {
                nx.each(this._data, inCallback, inContext);
            },
            toArray: function () {
                return this._data;
            },
            serialize: function () {
                var result = [];
                this.each(function (item) {
                    if (item.serialize) {
                        result.push(item.serialize());
                    } else {
                        result.push(item);
                    }
                }, this);
                return result;
            }
        }
    });

})(nx, nx.global);
(function (nx, global) {

    nx.declare('nx.data.ObservableCollection', {
        events: ['change'],
        extend: nx.data.Collection,
        mixins: [
            nx.Observable
        ],
        methods: {
            init: function (inData) {
                this.base(inData);
                this.watch('count', this.updateIndex, this);
            },
            add: function (inItem) {
                var index = this.count();
                var result = this.base(inItem);
                this.notify('count');
                this.fire('change', {
                    action: 'add',
                    items: [inItem],
                    index: index
                });
                return result;
            },
            addRange: function (inItems) {
                var index = this.count();
                var result = this.base(inItems);
                this.notify('count');
                this.fire('change', {
                    action: 'add',
                    items: inItems,
                    index: index
                });
                return result;
            },
            insert: function (inItem, inIndex) {
                var result = this.base(inItem, inIndex);
                this.notify('count');
                this.fire('change', {
                    action: 'add',
                    items: [inItem],
                    index: inIndex
                });
                return result;
            },
            insertRange: function (inItems, inIndex) {
                var result = this.base(inItems, inIndex);
                this.notify('count');
                this.fire('change', {
                    action: 'add',
                    items: result,
                    index: inIndex
                });
                return result;
            },
            remove: function (inItem) {
                var result = this.base(inItem);
                if (result >= 0) {
                    this.notify('count');
                    this.fire('change', {
                        action: 'remove',
                        items: [inItem],
                        index: result
                    });
                }
                return result;
            },
            removeAt: function (inIndex) {
                var result = this.base(inIndex);
                if (result !== undefined) {
                    this.notify('count');
                    this.fire('change', {
                        action: 'remove',
                        items: [result],
                        index: inIndex
                    });
                }
                return result;
            },
            clear: function () {
                var result = this.base();
                this.notify('count');
                this.fire('change', {
                    action: 'clear',
                    items: result
                });
                return result;
            }
        }
    })

}(nx, nx.global));
(function (nx, global) {

    var Node = nx.declare('nx.dom.Node', {
        methods: {
            init: function (inNode) {
                this.$dom = inNode;
            },
            index: function () {
                var node,
                    index = 0;
                if (this.parentNode() !== null) {
                    while ((node = this.previousSibling()) !== null) {
                        ++index;
                    }
                } else {
                    index = -1;
                }
                return index;
            },
            childAt: function (inIndex) {
                var node = null;
                if (inIndex >= 0) {
                    node = this.firstChild();
                    while (node && --inIndex >= 0) {
                        node = node.nextSibling();
                        break;
                    }
                }
                return node;
            },
            firstChild: function () {
                return new Node(this.$dom.firstElementChild);
            },
            lastChild: function () {
                return new Node(this.$dom.lastElementChild);
            },
            previousSibling: function () {
                return new Node(this.$dom.previousElementSibling);
            },
            nextSibling: function () {
                return new Node(this.$dom.nextElementSibling);
            },
            parentNode: function () {
                return new Node(this.$dom.parentNode);
            },
            children: function () {
                return new Collection(this.$dom.children);
            },
            cloneNode: function (deep) {
                return new Node(this.$dom.cloneNode(deep));
            },
            hasChild: function (child) {
                return child.$dom.parentNode == this.$dom;
            },
            appendChild: function (child) {
                this.$dom.appendChild(child.$dom);
            },
            insertBefore: function (child, ref) {
                this.$dom.insertBefore(child.$dom, ref.$dom);
            },
            removeChild: function (child) {
                if (this.hasChild(child)) {
                    this.$dom.removeChild(child.$dom);
                }
            },
            empty: function () {
                this.children().each(function (child) {
                    this.removeChild(child);
                }, this);
            }
        }
    })

}(nx, nx.global));
(function (nx, global) {

    var document = global.document;
    nx.declare('nx.dom.FormElement', {
        methods: {
            getCheckedStatus: function () {
                return this.getAttribute('data-checked-status') || 'unchecked';
            },
            setCheckedStatus: function (inValue) {
                this.$dom.indeterminate = false;
                switch (inValue) {
                    case 'checked':
                        this.$dom.checked = true;
                        break;
                    case 'unchecked':
                        this.$dom.checked = false;
                        break;
                    case 'indeterminate':
                        this.$dom.indeterminate = true;
                }
                this.setAttribute('data-checked-status', inValue);
            },
            setProperty: function (inName, inValue) {
                this.$dom[inName] = inValue;
            },
            getProperty: function (inName) {
                return this.$dom[inName];
            },
            getValue: function () {
                return this.$dom.value;
            },
            setValue: function (inValue) {
                this.$dom.value = inValue;
            },
            setFocused: function (inValue) {
                if (inValue) {
                    this.$dom.focus();
                } else {
                    this.$dom.blur();
                }
            },
            getFocused: function () {
                return this.$dom === document.activeElement;
            }
        }
    });


}(nx, nx.global));
(function (nx, global) {

    var document = global.document;
    var STYLE_NUMBER = 1;

    var styleTypes = {
        'float': 'cssFloat',
        'columnCount': STYLE_NUMBER,
        'columns': STYLE_NUMBER,
        'fontWeight': STYLE_NUMBER,
        'lineHeight': STYLE_NUMBER,
        'opacity': STYLE_NUMBER,
        'order': STYLE_NUMBER,
        'orphans': STYLE_NUMBER,
        'widows': STYLE_NUMBER,
        'zIndex': STYLE_NUMBER,
        'zoom': STYLE_NUMBER
    };

    nx.declare('nx.dom.Element', {
        extend: nx.dom.Node,
        mixins: [
            nx.dom.FormElement
        ],
        methods: {
            get: function (inName) {
                switch (inName) {
                    case 'text':
                        return this.getText();
                    case 'html':
                        return this.getHtml();
                    case 'value':
                        return this.getValue();
                    case 'data-checked-status':
                        return this.getCheckedStatus();
                    case 'focused':
                        return this.getFocused();
                    case 'multiple':
                    case 'selectedIndex':
                    case 'checked':
                    case 'disabled':
                    case 'selected':
                        return this.getProperty(inName);
                    default:
                        return this.getAttribute(inName);
                }
            },
            set: function (inName, inValue) {
                switch (inName) {
                    case 'text':
                        return this.setText(inValue);
                    case 'html':
                        return this.setHtml(inValue);
                    case 'value':
                        return this.setValue(inValue);
                    case 'data-checked-status':
                        return this.setCheckedStatus(inValue);
                    case 'focused':
                        return this.setFocused(inValue);
                    case 'multiple':
                    case 'selectedIndex':
                    case 'checked':
                    case 'disabled':
                    case 'selected':
                        return this.setProperty(inName,inValue);
                    default:
                        return this.setAttribute(inName, inValue);
                }
            },
            getStyle: function (inName, inIsComputed) {
                var style = inIsComputed ? getComputedStyle(this.$dom, null) : this.$dom.style;
                var styleType = styleTypes[inName];

                if (typeof styleType == 'string') {
                    return style[styleType];
                } else {
                    return style[inName];
                }
            },
            setCssText: function (inCssText) {
                this.$dom.style.cssText = inCssText;
            },
            getCssText: function () {
                return this.$dom.style.cssText;
            },
            setClass: function (inValue) {
                this.$dom.className = inValue;
            },
            getClass: function () {
                return this.$dom.className;
            },
            setStyles: function (inObject) {
                nx.each(inObject, function (val, name) {
                    this.setStyle(name, val);
                }, this);
            },
            setStyle: function (inName, inValue) {
                var styleType = styleTypes[inName];
                if (typeof styleType == 'string') {
                    this.$dom.style[styleType] = inValue;
                }
                else if (styleType === STYLE_NUMBER || typeof inValue !== 'number') {
                    this.$dom.style[inName] = inValue;
                }
                else {
                    this.$dom.style[inName] = inValue + 'px';
                }
            },
            getAttribute: function (inName) {
                return this.$dom.getAttribute(inName);
            },
            setAttribute: function (inName, inValue) {
                this.$dom.setAttribute(inName, inValue);
            },
            getAttributes: function () {
                var attrs = {};
                nx.each(this.$dom.attributes, function (attr) {
                    attrs[attr.name] = attr.value;
                });
            },
            setAttributes: function (inAttrs) {
                nx.each(inAttrs, function (value, key) {
                    this.setAttribute(key, value);
                }, this);
            },
            getText: function () {
                return this.$dom.textContent;
            },
            setText: function (inText) {
                this.$dom.textContent = inText;
            },
            getHtml: function () {
                return this.$dom.innerHTML;
            },
            setHtml: function (inHtml) {
                this.$dom.innerHTML = inHtml;
            },
            addEventListener: (function () {
                if (document.addEventListener) {
                    return function (inName, inHandler, inCapture) {
                        this.$dom.addEventListener(inName, inHandler, inCapture || false);
                    };
                } else {
                    return function (inName, inHandler) {
                        this.$dom.attachEvent("on" + inName, inHandler);
                    };
                }
            })(),
            removeEventListener: (function () {
                if (document.removeEventListener) {
                    return function (inName, inHandler, inCapture) {
                        this.$dom.removeEventListener(inName, inHandler, inCapture || false);
                    };
                } else {
                    return function (inName, inHandler) {
                        this.$dom.detachEvent("on" + inName, inHandler);
                    };
                }
            })()
        }
    });

})(nx, nx.global);
(function (nx, global) {

    nx.declare('nx.dom.Fragment', {
        extend: nx.dom.Node,
        methods: {
            /**
             * Get collection child nodes.
             * @returns {nx.data.Collection}
             */
            children: function () {
                var result = new Collection();
                nx.each(this.$dom.childNodes, function (child) {
                    result.add(new this.constructor(child));
                }, this);
                return result;
            }
        }
    });

})(nx, nx.global);
(function (nx,global) {

    nx.declare('nx.dom.Text',{
        extend:nx.dom.Node
    });

})(nx,nx.global);
(function (nx, global) {

    var Element = nx.dom.Element;
    var Fragment = nx.dom.Fragment;
    var Text = nx.dom.Text;
    var document = global.document;

    nx.declare('nx.dom.Document', {
        'static': true,
        properties: {
            body: {
                get: function () {
                    return new Element(document.body);
                }
            }
        },
        statics: {
            createFragment: function () {
                return new Fragment(document.createDocumentFragment());
            },
            createElement: function (inTag) {
                return new Element(document.createElement(inTag));
            },
            createText: function (inText) {
                return new Text(document.createTextNode(inText));
            }
        }
    });

})(nx, nx.global);
(function (nx, global) {

  var Binder = nx.Binder;
  var bindings = [];
  nx.declare('nx.ui.ComponentFactoryContentProcessor', {
    statics: {
      contentProcess: function (inRoot, inView) {
        var owner = inRoot.owner();
        var content = inView.content;
        var itemRoot;
        if (!nx.is(content, 'undefined')) {
          if (nx.is(content, 'string')) {
            this.propProcess(inRoot, owner, 'content', content);
          } else {
            itemRoot = this.createComponent(inView.content, owner);
            itemRoot.attach(inRoot);
          }
        }
      }
    }
  });

}(nx, nx.global));

(function (nx, global) {

  var Binder = nx.Binder;
  var bindings = [];
  nx.declare('nx.ui.ComponentFactoryEventsProcessor', {
    statics: {
      eventsProcess: function (inRoot, inView) {
        var owner = inRoot.owner();
        nx.each(inView.events, function (val, name) {
          bindings.push({
            root: inRoot,
            owner: owner,
            value: val,
            name: name
          });
        }, this);
      },
      eventBindProperty: function (inRoot, inContext, inName, inProperty) {
        inRoot.on(inName, function (sender, event) {
          inContext.notify(inProperty);
        });
      },
      eventBindMethod: function (inRoot, inContext, inName, inHandler) {
        inRoot.on(inName, function (sender, event) {
          inHandler.call(inContext, inRoot, event);
        });
      },
      asyncEventsBinding: function () {
        var handler,
          context,
          bindingMeta,
          root;
        var memberType;
        nx.each(bindings, function (item) {
          bindingMeta = Binder.bindingMeta(item.value);
          context = bindingMeta.context(item.owner);
          handler = context.member(bindingMeta.property);
          memberType = context.memberType(bindingMeta.property);
          switch (memberType) {
            case 'method':
              this.eventBindMethod(item.root, context, item.name, handler);
              break;
            case 'property':
              this.eventBindProperty(item.root, context, item.name, bindingMeta.property);
          }
        }, this);

        //clear the queue
        bindings.length = 0;
      }
    }
  });

}(nx, nx.global));

(function (nx, global) {

  var Binder = nx.Binder;
  var bindings = [];
  nx.declare('nx.ui.ComponentFactoryPropsProcessor', {
    statics: {
      propsProcess: function (inRoot, inView) {
        var owner = inRoot.owner();
        this.propsMapProcess(inRoot, inView.props, owner);
      },
      propProcess: function (inRoot, inOwner, inName, inValue) {
        switch (true) {
          case nx.is(inValue, 'object') && inName === 'style':
            this.propsMapProcess(inRoot.style(), inValue, inOwner);
            break;
          case nx.is(inValue, 'array') && inName === 'class':
            this.propsArrayProcess(inRoot.class(), inValue, inOwner);
            break;
          default :
            bindings.unshift({
              root: inRoot,
              owner: inOwner,
              name: inName,
              value: inValue
            });
        }
      },
      propsArrayProcess: function (inRoot, inArray, inOwner) {
        nx.each(inArray, function (value, index) {
          this.propProcess(inRoot, inOwner, '' + index, value);
        }, this);
      },
      propsMapProcess: function (inRoot, inPropsMap, inOwner) {
        nx.each(inPropsMap, function (value, name) {
          this.propProcess(inRoot, inOwner, name, value);
        }, this);
      },
      setNormalProperty: function (inRoot, inOwner, inPropertyName, inPropertyValue) {
        inRoot.set(inPropertyName, inPropertyValue);
      },
      setBindingProperty: function (inRoot, inOwner, inPropertyName, inPropertyValue) {
        var bindingMeta = Binder.bindingMeta(inPropertyValue);
        var context = bindingMeta.context(inOwner);
        var converter = bindingMeta.converterVal(inOwner);
        //console.log(inPropertyName,inPropertyValue,bindingMeta);
        return new nx.ui.DOMBinding({
          target: context,
          targetPath: bindingMeta.property,
          source: inRoot,
          sourcePath: inPropertyName,
          converter: converter,
          direction: bindingMeta.direction || '<>'
        });
      },
      asyncPropsBinding: function () {
        var value,
          method;
        var i, len = bindings.length,
          item;
        var copyBindings = bindings.slice(0);
        for (i = 0; i < len; i++) {
          item = copyBindings[i];
          value = item.value;
          method = Binder.hasBinding(value) ? 'setBindingProperty' : 'setNormalProperty';
          this[method](item.root, item.owner, item.name, value);
        }
        bindings = bindings.slice(0, bindings.length - len);

        if (bindings.length > 0) {
          this.applyBinding();
        }
      }
    }
  });

}(nx, nx.global));

(function (nx, global) {

  nx.declare('nx.ui.ComponentFactoryViewProcessor', {
    statics: {
      viewProcess: function (inRoot, inView) {
        var itemComp;
        var owner = inRoot.owner();
        if (nx.is(inView, 'array')) {
          nx.each(inView, function (item) {
            itemComp = this.createComponent(item, owner);
            itemComp.attach(inRoot);
          }, this);
        }
      }
    }
  });

}(nx, nx.global));

(function (nx, global) {

    nx.declare('nx.ui.ComponentFactory', {
        mixins: [
            nx.ui.ComponentFactoryViewProcessor,
            nx.ui.ComponentFactoryEventsProcessor,
            nx.ui.ComponentFactoryPropsProcessor,
            nx.ui.ComponentFactoryContentProcessor
        ],
        statics: {
            ready: false,
            createComponent: function (inView, inOwner) {
                var root = null;
                if (inView) {
                    root = this.createRoot(inView, inOwner);
                    this.viewProcess(root, inView);
                    this.propsProcess(root, inView);
                    this.eventsProcess(root, inView);
                    this.contentProcess(root, inView);
                }
                return root;
            },
            createRoot: function (inView, inOwner) {
                var root;
                switch (nx.type(inView)) {
                    case 'Array':
                        root = new nx.ui.DOMComponent('fragment');
                        break;
                    case 'Object':
                        if (nx.is(inView.tag, 'function')) {
                            //debugger;
                            root = new inView.tag();
                        } else {
                            if (inView.tag === 'fragment') {
                                root = new nx.ui.DOMComponent('fragment');
                            } else {
                                root = new nx.ui.DOMComponent('element', inView.tag);
                            }
                        }
                        break;
                    default :
                        root = new nx.ui.DOMComponent('text', inView);
                }
                root.setResource('@view', inView);
                if (inOwner) {
                    inOwner.setResource(inView.name, root);
                    root.owner(inOwner);
                } else {
                    //template:
                    root.owner(root);
                }
                return root;
            },
            applyBinding: function () {
                this.asyncEventsBinding();
                this.asyncPropsBinding();
                this.ready = true;
            }
        }
    });

}(nx, nx.global));
(function (nx, global) {

  nx.declare('nx.ui._Class', {
    properties: {
      'class': {
        get: function () {
          return this._class;
        },
        set: function (inValue) {
          switch (nx.type(inValue)) {
            case 'Array':
              this._class.set(inValue.join(''));
              break;
            default:
              this._class.set(0, inValue);
          }
        }
      }
    },
    methods: {
      init: function () {
        this._class = new nx.ui.CssClass(this);
      },
      destroy: function () {
        this._class = null;
        this.base();
      }
    }
  });

}(nx, nx.global));

(function (nx, global) {

  nx.declare('nx.ui._Style', {
    properties: {
      style: {
        get: function () {
          return this._style;
        },
        set: function (inValue) {
          nx.each(inValue, function (value, name) {
            this._style.set(name, value);
          }, this);
        }
      }
    },
    methods: {
      init: function () {
        this._style = new nx.ui.CssStyle(this);
      },
      destroy: function () {
        this._style = null;
        this.base();
      }
    }
  });

}(nx, nx.global));

(function (nx, global) {

    var ComponentFactory = nx.ui.ComponentFactory;
    nx.declare('nx.ui._Template', {
        properties: {
            items: {
                get: function () {
                    return this._items;
                },
                set: function (inValue) {
                    var items = this._items;
                    if (items && items.off) {
                        items.off('change', this.onItemsChange, this);
                    }
                    items = this._items = inValue;
                    if (items && items.on) {
                        items.on('change', this.onItemsChange, this);
                    }
                    this.generateContent();
                }
            },
            itemTemplate: {
                get: function () {
                    return this._itemTemplate;
                },
                set: function (inValue) {
                    this._itemTemplate = inValue;
                    this.generateContent();
                }
            }
        },
        methods: {
            createItem: function () {
                var itemComp = ComponentFactory.createComponent(this._itemTemplate);
                var parent = this.parent();
                var absOwner = parent ? parent.owner() : this.owner();
                itemComp.setResource('@absOwner', absOwner);
                return itemComp;
            },
            generateContent: function () {
                var items = this._items;
                var itemTemplate = this._itemTemplate;
                var itemComp,
                    itemOwner;
                if (items && itemTemplate) {
                    this.empty();
                    items.each(function (item) {
                        itemComp = this.createItem();
                        itemOwner = itemComp.owner();
                        itemOwner.model(item);
                        itemComp.attach(this);
                    }, this);
                }
            },
            empty: function () {
                var _content = this._content.toArray();
                var i = 0,
                    item;
                for (; i < _content.length; i++) {
                    item = _content[i];
                    item.destroy();
                    i--;
                }
            },
            onItemsChange: function (inSender, inEvent) {
                var action = inEvent.action;
                var index = inEvent.index;
                if (action === 'add') {
                    nx.each(inEvent.items, function (item) {
                        var comp = this.createItem();
                        comp.model(item);
                        comp.attach(this, index++);
                    }, this);
                } else if (action === 'remove') {
                    nx.each(inEvent.items, function () {
                        var comp = this.content().item(index);
                        if (comp) {
                            comp.detach();
                        }
                    }, this);
                } else {
                    this.generateContent();
                }

                if (ComponentFactory.ready) {
                    ComponentFactory.applyBinding();
                }
            },
            destroy: function () {
                this._items = null;
                this._itemTemplate = null;
                this.base();
            }
        }
    });

}(nx, nx.global));
(function (nx, global) {

  nx.declare('nx.ui.AbstractDOMCss', {
    extend: nx.Observable,
    methods: {
      init: function (inValue) {
        this.base();
        this._component = inValue;
      },
      get: function (inName) {
        //To be implement
      },
      set: function (inName, inValue) {
        //To be implement
      },
      destroy: function () {
        this._component = null;
        this.base();
      }
    }
  });

}(nx, nx.global));

(function (nx, global) {

  nx.declare('nx.ui.CssClass', {
    extend: nx.ui.AbstractDOMCss,
    methods: {
      init: function (inValue) {
        this.base(inValue);
        this._classList = [];
      },
      has: function (inName) {
        return inName in this._classList;
      },
      get: function (inName) {
        return this._classList[inName];
      },
      set: function (inName, inValue) {
        var root = this._component.getResource('@dom');
        this._classList[inName] = inValue;
        root.set('class', this._classList.join(''));
      }
    }
  });

}(nx, nx.global));

(function (nx, global) {

  nx.declare('nx.ui.CssStyle', {
    extend: nx.ui.AbstractDOMCss,
    methods: {
      get: function (inName) {
        var root = this._component.getResource('@dom');
        return root.getStyle(inName);
      },
      set: function (inName, inValue) {
        var root = this._component.getResource('@dom');
        root.setStyle(inName, inValue);
        this.notify(inName);
      }
    }
  });

}(nx, nx.global));

(function (nx, global) {

  nx.declare('nx.ui.DOMBinding', {
    extend: nx.Binding,
    methods: {
      init: function (inConfig) {
        this.base(inConfig);
        this.initDomValue();
        this.initDomProperty();
      },
      initDomProperty: function () {
        var direction = this.direction();
        if (direction.charAt(0) === '<') {
          this.redefineDomProperty(
            this.target(),
            this.targetPath(),
            this.source(),
            this.sourcePath()
          );
        }
      },
      initDomValue: function () {
        var target = this.target(),
          targetPath = this.targetPath();
        var value = target.get(targetPath);
        this.onTargetChange(targetPath, value);
      },
      canRedefine: function (inTarget, inTargetPath) {
        var type = inTarget.memberType(inTargetPath);
        var propertyMeta = inTarget.memberMeta(inTargetPath);
        if (type !== 'property') {
          return true;
        } else {
          return propertyMeta.generated;
        }
      },
      redefineDomProperty: function (inTarget, inTargetProperty, inSource, inSourceProperty) {
        var propertyMeta = inTarget.memberMeta(inTargetProperty);
        var value = propertyMeta && propertyMeta.value;
        if (this.canRedefine(inTarget, inTargetProperty)) {
          nx.mix(propertyMeta, {
            redefined: true,
            get: function () {
              var result = inSource.get(inSourceProperty);
              if (result == null) {
                return value;
              }
              return result;
            },
            set: function (inValue) {
              inSource.set(inSourceProperty, inValue);
            }
          });
          inTarget.defineProperty(inTargetProperty, propertyMeta);
        }
      }
    }
  });

}(nx, nx.global));

(function (nx, global) {

  var ComponentFactory = nx.ui.ComponentFactory;
  nx.declare('nx.ui.ComponentBase', {
    extend: nx.Observable,
    mixins: [
      nx.ResourceManager,
      nx.ui._Class,
      nx.ui._Style,
      nx.ui._Template
    ],
    properties: {
      content: {
        get: function () {
          return this._content;
        },
        set: function (inValue) {
          nx.each(this._content.toArray(), function (item) {
            item.destroy();
          });
          if (nx.is(inValue, 'nx.ui.ComponentBase')) {
            inValue.attach(this);
          } else if (inValue) {
            ComponentFactory.createComponent(
              inValue,
              this.owner()
            ).attach(this);
          }
        }
      },
      model: {
        get: function () {
          return this._model;
        },
        set: function (inValue) {
          this._content.each(function (item) {
            if (!nx.is(item, 'String')) {
              item.model(inValue);
            }
          });
          this._model = inValue;
        }
      },
      absOwner: {
        get: function () {
          //attention that the not attached element.
          var absOwner = this.getResource('@absOwner');
          var owner;
          if (!absOwner) {
            owner = this.owner();
            if (this === owner) {
              owner = this.parent();
            }
            return owner.absOwner();
          }
          return absOwner;
        }
      },
      owner: {
        value: null
      },
      parent: {
        get: function () {
          return this.getResource('@parent');
        }
      },
      dom: {
        get: function () {
          return this.getResource('@dom');
        }
      }
    },
    methods: {
      init: function () {
        this.base();
        this._content = new nx.data.Collection();
        this.__attached__ = false;
        this._domListeners = {};
      },
      attach: function (inParent, inIndex) {
        if (nx.is(inParent, 'nx.ui.ComponentBase')) {
          var name = this.getResource('@name');
          var owner = this.owner() || inParent;
          var root = this.getResource('@dom');
          var container = inParent.getContainer();

          if (root) {
            if (inIndex >= 0) {
              var ref = inParent.content().item(inIndex);

              if (ref && ref.getResource('@tag') === 'fragment') {
                ref = ref.content().getItem(0);
              }

              if (ref) {
                container.insertBefore(root, ref.getResource('@dom'));
                inParent.content().insert(this, inIndex);
              } else {
                container.appendChild(root);
                inParent.content().add(this);
              }
            } else {
              container.appendChild(root);
              inParent.content().add(this);
            }
          }


          this.owner(owner);
          this.setResource('@parent', inParent);
          if (nx.is(inParent, 'nx.ui.Application')) {
            this.setResource('@absOwner', this);
          }
          this.__attached__ = true;
        }
      },
      on: function (name, handler, context) {
        this.attachDomListener(name);
        this.base(name, handler, context);
      },
      upon: function (name, handler, context) {
        this.attachDomListener(name);
        this.base(name, handler, context);
      },
      attachDomListener: function (name) {
        var domListeners = this._domListeners;
        if (!(name in domListeners)) {
          var self = this;
          var root = this.getResource('@dom');
          var listener = domListeners[name] = function (event) {
            self.fire(name, event);
          };

          root.addEventListener(name, listener);
        }
      },
      detach: function () {
        if (this.__attached__) {
          var name = this.getResource('@name');
          var owner = this.owner();
          var parent = this.getResource('@parent');

          if (parent) {
            parent.getContainer().removeChild(this.getResource('@dom'));
            parent.content().remove(this);
          }

          if (this.getResource('@tag') === 'fragment') {
            var root = this.getResource('@dom');
            this.content().each(function (child) {
              root.appendChild(child.getResource('@dom'));
            });
          }

          owner && owner.removeResource(name);
          //this.removeResource('@owner');
          this.removeResource('@parent');
          this.__attached__ = false;
        }
      },
      getContainer: function () {
        if (this.getResource('@tag') === 'fragment') {
          var parent = this.getResource('@parent');
          if (parent) {
            return parent.getContainer();
          }
        }
        return this.getResource('@dom');
      },
      destroy: function () {
        this.base();
        this.detach();
        this._content = null;
        this._model = null;
        this.__attached__ = false;
        this._domListeners = null;
      }
    }
  });

}(nx, nx.global));

(function (nx, global) {

  var Document = nx.dom.Document;
  nx.declare('nx.ui.DOMComponent', {
    extend: nx.ui.ComponentBase,
    methods: {
      init: function (inTag, inValue) {
        this.base();
        this.create(inTag, inValue);
      },
      get: function (inName) {
        if (this.has(inName)) {
          return this.base(inName);
        } else {
          return this.dom().get(inName);
        }
      },
      set: function (inName, inValue) {
        if (this.has(inName)) {
          this.base(inName, inValue);
        } else {
          this.dom().set(inName, inValue);
        }
      },
      create: function (inType, inValue) {
        var root;
        switch (inType) {
          case 'text':
            root = Document.createText(inValue);
            break;
          case 'fragment':
            root = Document.createFragment();
            break;
          default :
            root = Document.createElement(inValue || 'div');
        }
        this.setResource('@dom', root);
        this.setResource('@tag', inType);
      }
    }
  });

}(nx, nx.global));

(function (nx, global) {

  var ComponentFactory = nx.ui.ComponentFactory;
  nx.declare('nx.ui.Component', {
    extend: nx.ui.ComponentBase,
    methods: {
      init: function () {
        this.base();
        var view = this.view();
        if (view) {
          var comp = ComponentFactory.createComponent(view, this);
          this.setResource('@dom', comp.getResource('@dom'));
          this.setResource('@tag', comp.getResource('@tag'));
          this.setResource('root', comp);
        }
      },
      $: function (inName) {
        return this.getResource(inName || 'root');
      },
      view: function () {
        var viewMeta = this.getMeta('view');
        var viewInstance;
        if (nx.is(viewMeta, 'function')) {
          viewInstance = new viewMeta();
          return viewInstance.getViewMeta.call(this);
          //return (new viewMeta).getViewMeta();
        } else {
          var base = this.__base__;
          if (base !== nx.ui.Component) {
            return base.prototype.view();
          }
          return viewMeta;
        }
      },
      get: function (inName) {
        if (this.has(inName)) {
          return this.base(inName);
        } else {
          return this.getResource('@dom').get(inName);
        }
      },
      set: function (inName, inValue) {
        if (this.has(inName)) {
          this.base(inName, inValue);
        } else {
          this.getResource('@dom').set(inName, inValue);
          this.notify(inName);
        }
      },
      getRootContainer: function () {
        var comp = this.getResource();
        console.log(comp);
      }
    }
  })

}(nx, nx.global));

(function (nx, global) {

  nx.declare('nx.ui.Application', {
    extend: nx.ui.ComponentBase,
    methods: {
      getContainer: function () {
        return nx.dom.Document.body();
      },
      start: function () {
        nx.ui.ComponentFactory.applyBinding();
      }
    }
  });

}(nx, nx.global));

(function (nx, global) {

  nx.declare('nx.widget.Input', {
    extend: nx.ui.Component,
    view: {
      tag: 'input',
      props: {
        type: '{type}',
        placeholder: '{placeholder}',
        value: '{value}',
        focused: '{focused}'
      },
      events: {
        input: '{value}'
      }
    },
    properties: {
      focused: false,
      type: 'text',
      placeholder: 'search..',
      value: ''
    }
  });

}(nx, nx.global));

(function (nx, global) {

  nx.declare('nx.widget.InputCheckbox', {
    extend: nx.ui.Component,
    view: {
      tag: 'input',
      props: {
        type: 'checkbox',
        placeholder: '{placeholder}',
        value: '{value}',
        focused: '{focused}',
        checked: '{checked}'
      },
      events: {
        click: '{_click}'
      }
    },
    properties: {
      focused: false,
      placeholder: 'search..',
      value: '',
      checked: false
    },
    methods: {
      _click: function () {
        console.log(this.checked());
      }
    }
  });

}(nx, nx.global));
