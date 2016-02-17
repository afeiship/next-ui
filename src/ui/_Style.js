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
