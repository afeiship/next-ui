(function (nx, global) {

  var Binder = nx.Binder;
  var bindings = [];
  nx.declare('nx.ui.ComponentFactoryEventsProcessor', {
    statics: {
      eventsProcess: function (inRoot, inView) {
        var owner = inRoot.owner();
        nx.each(inView.events, function (val, name) {
          bindings.push({
            root: inRoot,
            owner: owner,
            value: val,
            name: name
          });
        }, this);
      },
      eventBindProperty: function (inRoot, inContext, inName, inProperty) {
        inRoot.on(inName, function (sender, event) {
          inContext.notify(inProperty);
        });
      },
      eventBindMethod: function (inRoot, inContext, inName, inHandler) {
        inRoot.on(inName, function (sender, event) {
          inHandler.call(inContext, inRoot, event);
        });
      },
      asyncEventsBinding: function () {
        var handler,
          context,
          bindingMeta,
          root;
        var memberType;
        nx.each(bindings, function (item) {
          bindingMeta = Binder.bindingMeta(item.value);
          context = bindingMeta.context(item.owner);
          handler = context.member(bindingMeta.property);
          memberType = context.memberType(bindingMeta.property);
          switch (memberType) {
            case 'method':
              this.eventBindMethod(item.root, context, item.name, handler);
              break;
            case 'property':
              this.eventBindProperty(item.root, context, item.name, bindingMeta.property);
          }
        }, this);

        //clear the queue
        bindings.length = 0;
      }
    }
  });

}(nx, nx.global));
