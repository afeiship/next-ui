(function (nx, global) {

  var Binder = nx.Binder;
  var bindings = [];
  nx.declare('nx.ui.ComponentFactoryPropsProcessor', {
    statics: {
      propsProcess: function (inRoot, inView) {
        var owner = inRoot.owner();
        this.propsMapProcess(inRoot, inView.props, owner);
      },
      propProcess: function (inRoot, inOwner, inName, inValue) {
        switch (true) {
          case nx.is(inValue, 'object') && inName === 'style':
            this.propsMapProcess(inRoot.style(), inValue, inOwner);
            break;
          case nx.is(inValue, 'array') && inName === 'class':
            this.propsArrayProcess(inRoot.class(), inValue, inOwner);
            break;
          default :
            bindings.unshift({
              root: inRoot,
              owner: inOwner,
              name: inName,
              value: inValue
            });
        }
      },
      propsArrayProcess: function (inRoot, inArray, inOwner) {
        nx.each(inArray, function (value, index) {
          this.propProcess(inRoot, inOwner, '' + index, value);
        }, this);
      },
      propsMapProcess: function (inRoot, inPropsMap, inOwner) {
        nx.each(inPropsMap, function (value, name) {
          this.propProcess(inRoot, inOwner, name, value);
        }, this);
      },
      setNormalProperty: function (inRoot, inOwner, inPropertyName, inPropertyValue) {
        inRoot.set(inPropertyName, inPropertyValue);
      },
      setBindingProperty: function (inRoot, inOwner, inPropertyName, inPropertyValue) {
        var bindingMeta = Binder.bindingMeta(inPropertyValue);
        var context = bindingMeta.context(inOwner);
        var converter = bindingMeta.converterVal(inOwner);
        //console.log(inPropertyName,inPropertyValue,bindingMeta);
        return new nx.ui.DOMBinding({
          target: context,
          targetPath: bindingMeta.property,
          source: inRoot,
          sourcePath: inPropertyName,
          converter: converter,
          direction: bindingMeta.direction || '<>'
        });
      },
      asyncPropsBinding: function () {
        var value,
          method;
        var i, len = bindings.length,
          item;
        var copyBindings = bindings.slice(0);
        for (i = 0; i < len; i++) {
          item = copyBindings[i];
          value = item.value;
          method = Binder.hasBinding(value) ? 'setBindingProperty' : 'setNormalProperty';
          this[method](item.root, item.owner, item.name, value);
        }
        bindings = bindings.slice(0, bindings.length - len);

        if (bindings.length > 0) {
          this.applyBinding();
        }
      }
    }
  });

}(nx, nx.global));
