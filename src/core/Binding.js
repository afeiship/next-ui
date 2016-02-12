(function (nx, global) {

  nx.declare('nx.Binding', {
    properties: {
      target: null,
      targetPath: null,
      source: null,
      sourcePath: null,
      convert: null,
      convertBack: null,
      direction: '<>'
    },
    methods: {
      init: function (inConfig) {
        this.sets(inConfig);
        this.dispatch();
      },
      dispatch: function () {
        switch (this.direction) {
          case '->':
            this.forward();
            break;
          case '<-':
            this.backward();
            break;
          case '<>':
            this.forward();
            this.backward();
            break;
        }
      },
      backward: function () {
        var source = this.source,
          sourcePath = this.sourcePath;
        if (source.watch) {
          source.watch(sourcePath, this.onSourceChange, this);
        }
      },
      forward: function () {
        var target = this.target,
          targetPath = this.targetPath;
        if (target.watch) {
          target.watch(targetPath, this.onTargetChange, this);
        }
      },
      onSourceChange: function (inProperty, inValue) {
        var value = inValue;
        var convertBack = this.convertBack;
        if (convertBack) {
          value = convertBack.call(this.target, value);
        }
        this.updateTarget(value);
      },
      onTargetChange: function (inProperty, inValue) {
        var value = inValue;
        var convert = this.convert;
        if (convert) {
          value = convert.call(this.source, value);
        }
        this.updateSource(value);
      },
      updateSource: function (inValue) {
        nx.path(this.source, this.sourcePath, inValue);
      },
      updateTarget: function (inValue) {
        nx.path(this.target, this.targetPath, inValue);
      }
    }
  });

}(nx, nx.GLOBAL));
