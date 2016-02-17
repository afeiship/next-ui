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