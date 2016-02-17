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
