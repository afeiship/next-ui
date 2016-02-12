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

}(nx, nx.GLOBAL));
