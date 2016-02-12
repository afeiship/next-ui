(function (nx, global) {

  nx.declare('nx.ui.ComponentFactoryViewProcessor', {
    statics: {
      viewProcess: function (inRoot, inView) {
        var itemComp;
        var owner = inRoot.owner;
        if (nx.is(inView, 'array')) {
          nx.each(inView, function (index, item) {
            itemComp = this.createComponent(item, owner);
            itemComp.attach(inRoot);
          }, this);
        }
      }
    }
  });

}(nx, nx.GLOBAL));
