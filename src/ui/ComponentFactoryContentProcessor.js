(function (nx, global) {

  var Binder = nx.Binder;
  var bindings = [];
  nx.declare('nx.ui.ComponentFactoryContentProcessor', {
    statics: {
      contentProcess: function (inRoot, inView) {
        var owner = inRoot.owner();
        var content = inView.content;
        var itemRoot;
        if (!nx.is(content, 'undefined')) {
          if (nx.is(content, 'string')) {
            this.propProcess(inRoot, owner, 'content', content);
          } else {
            itemRoot = this.createComponent(inView.content, owner);
            itemRoot.attach(inRoot);
          }
        }
      }
    }
  });

}(nx, nx.global));
