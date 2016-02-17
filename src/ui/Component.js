(function (nx, global) {

  var ComponentFactory = nx.ui.ComponentFactory;
  nx.declare('nx.ui.Component', {
    extend: nx.ui.ComponentBase,
    methods: {
      init: function () {
        this.base();
        var view = this.view();
        if (view) {
          var comp = ComponentFactory.createComponent(view, this);
          this.setResource('@dom', comp.getResource('@dom'));
          this.setResource('@tag', comp.getResource('@tag'));
          this.setResource('root', comp);
        }
      },
      $: function (inName) {
        return this.getResource(inName || 'root');
      },
      view: function () {
        var viewMeta = this.getMeta('view');
        var viewInstance;
        if (nx.is(viewMeta, 'function')) {
          viewInstance = new viewMeta();
          return viewInstance.getViewMeta.call(this);
          //return (new viewMeta).getViewMeta();
        } else {
          var base = this.__base__;
          if (base !== nx.ui.Component) {
            return base.prototype.view();
          }
          return viewMeta;
        }
      },
      get: function (inName) {
        if (this.has(inName)) {
          return this.base(inName);
        } else {
          return this.getResource('@dom').get(inName);
        }
      },
      set: function (inName, inValue) {
        if (this.has(inName)) {
          this.base(inName, inValue);
        } else {
          this.getResource('@dom').set(inName, inValue);
          this.notify(inName);
        }
      },
      getRootContainer: function () {
        var comp = this.getResource();
        console.log(comp);
      }
    }
  })

}(nx, nx.global));
