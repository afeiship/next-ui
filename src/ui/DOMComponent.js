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
          return this.dom.get(inName);
        }
      },
      set: function (inName, inValue) {
        if (this.has(inName)) {
          this.base(inName, inValue);
        } else {
          this.dom.set(inName, inValue);
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

}(nx, nx.GLOBAL));
