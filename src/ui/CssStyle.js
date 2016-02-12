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

}(nx, nx.GLOBAL));
