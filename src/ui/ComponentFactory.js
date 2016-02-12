(function (nx, global) {

  nx.declare('nx.ui.ComponentFactory', {
    mixins: [
      nx.ui.ComponentFactoryViewProcessor,
      nx.ui.ComponentFactoryEventsProcessor,
      nx.ui.ComponentFactoryPropsProcessor,
      nx.ui.ComponentFactoryContentProcessor
    ],
    statics: {
      ready: false,
      createComponent: function (inView, inOwner) {
        var root = null;
        if (inView) {
          root = this.createRoot(inView, inOwner);
          this.viewProcess(root, inView);
          this.propsProcess(root, inView);
          this.eventsProcess(root, inView);
          this.contentProcess(root, inView);
        }
        return root;
      },
      createRoot: function (inView, inOwner) {
        var root;
        switch (nx.type(inView)) {
          case 'array':
            root = new nx.ui.DOMComponent('fragment');
            break;
          case 'object':
            if (nx.is(inView.tag, 'function')) {
              //debugger;
              root = new inView.tag();
            } else {
              if (inView.tag === 'fragment') {
                root = new nx.ui.DOMComponent('fragment');
              } else {
                root = new nx.ui.DOMComponent('element', inView.tag);
              }
            }
            break;
          default :
            root = new nx.ui.DOMComponent('text', inView);
        }
        root.setResource('@view', inView);
        if (inOwner) {
          inOwner.setResource(inView.name, root);
          root.owner = inOwner;
        } else {
          //template:
          root.owner = root;
        }
        return root;
      },
      applyBinding: function () {
        this.asyncEventsBinding();
        this.asyncPropsBinding();
        this.ready = true;
      }
    }
  });

}(nx, nx.GLOBAL));
