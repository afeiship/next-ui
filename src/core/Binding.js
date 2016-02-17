(function (nx, global) {

    var Binding = nx.declare('nx.Binding', {
        statics: {
            converters: {
                boolean: {
                    convert: function (inValue) {
                        return !!inValue;
                    },
                    revert: function (inValue) {
                        return !!inValue;
                    }
                },
                inverted: {
                    convert: function (inValue) {
                        return !inValue;
                    },
                    revert: function (inValue) {
                        return !inValue;
                    }
                },
                number: {
                    convert: function (inValue) {
                        return Number(inValue);
                    },
                    revert: function (inValue) {
                        return inValue;
                    }
                }
            }
        },
        properties: {
            target: {
                value: null
            },
            targetPath: null,
            source: {
                value: null
            },
            sourcePath: null,
            direction: null,
            converter: {
                value: null
            }
        },
        methods: {
            init: function (inConfig) {
                this.sets(inConfig);
                this.router();
            },
            router: function () {
                switch (this.direction()) {
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
                var source = this.source(),
                    sourcePath = this.sourcePath();
                if (source.watch) {
                    source.watch(sourcePath, this.onSourceChange, this);
                }
            },
            forward: function () {
                var target = this.target(),
                    targetPath = this.targetPath();
                if (target.watch) {
                    target.watch(targetPath, this.onTargetChange, this);
                }
            },
            onSourceChange: function (inProperty, inValue) {
                var value = inValue;
                var converter = this.converter();
                if (converter && converter.revert) {
                    value = converter.revert(value);
                }
                this.updateTarget(value);
            },
            onTargetChange: function (inProperty, inValue) {
                var value = inValue;
                var converter = this.converter();
                if (converter && converter.convert) {
                    value = converter.convert(value);
                }
                this.updateSource(value);
            },
            updateSource: function (inValue) {
                nx.path(this.source(), this.sourcePath(), inValue);
            },
            updateTarget: function (inValue) {
                nx.path(this.target(), this.targetPath(), inValue);
            }
        }
    });

}(nx, nx.global));