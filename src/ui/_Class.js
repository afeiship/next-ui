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
