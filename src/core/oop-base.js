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