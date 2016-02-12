(function (nx, global) {

  nx.declare('nx.ui.DOMBinding', {
    extend: nx.Binding,
    methods: {
      init: function (inConfig) {
        this.base(inConfig);
        this.initDomValue();
        this.initDomProperty();
      },
      initDomProperty: function () {
        var direction = this.direction;
        if (direction.charAt(0) === '<') {
          this.redefineDomProperty(
            this.target,
            this.targetPath,
            this.source,
            this.sourcePath
          );
        }
      },
      initDomValue: function () {
        var target = this.target,
          targetPath = this.targetPath;
        var value = target.get(targetPath);
        this.onTargetChange(targetPath, value);
      },
      canRedefine: function (inTarget, inTargetPath) {
        var type = inTarget.memberType(inTargetPath);
        var propertyMeta = inTarget.memberMeta(inTargetPath);
        if (type !== 'property') {
          return true;
        } else {
          return propertyMeta.generated;
        }
      },
      redefineDomProperty: function (inTarget, inTargetProperty, inSource, inSourceProperty) {
        //var propertyMeta = inTarget.memberMeta(inTargetProperty);
        var propertyMeta = inTarget['@' + inTargetProperty];
        var value = propertyMeta && propertyMeta.value;
        if (this.canRedefine(inTarget, inTargetProperty)) {
          nx.mix(propertyMeta, {
            redefined: true,
            get: function () {
              var result = inSource.get(inSourceProperty);
              if (result == null) {
                return value;
              }
              return result;
            },
            set: function (inValue) {
              inSource.set(inSourceProperty, inValue);
            }
          });
          nx.defineProperty(inTarget, inTargetProperty, propertyMeta);
        }
      }
    }
  });

}(nx, nx.GLOBAL));
