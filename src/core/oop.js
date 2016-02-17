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