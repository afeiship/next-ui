(function (nx, global) {

  nx.declare('nx.Resources', {
    methods: {
      init: function () {
        this.__resources__ = {};
      },
      setResource: function (inName, inValue) {
        this.__resources__[inName] = inValue;
      },
      getResource: function (inName) {
        return this.__resources__[inName];
      },
      removeResource: function (inName) {
        delete this.__resources__[inName];
      },
      destroy: function () {
        this.__resources__ = {};
      }
    }
  });

}(nx, nx.GLOBAL));
