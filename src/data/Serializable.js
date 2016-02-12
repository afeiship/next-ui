(function (nx, global) {

  nx.declare('nx.data.Serializable', {
    methods: {
      init: function () {
        this.base();
        this.resetSerialize();
      },
      resetSerialize: function () {
        var selfProperties = this.getMeta('properties');
        nx.each(selfProperties, function (name, meta) {
          if (meta && meta.serialize === undefined) {
            meta.serialize = true;
          }
        }, this);
      },
      serialize: function () {
        var result = {};
        var value;
        var selfProperties = this.getMeta('properties');
        nx.each(selfProperties, function (name, meta) {
          //propertyMeta = this.memberMeta(name);
          if (meta.serialize) {
            value = nx.get(this, name);
            switch (true) {
              case meta.serialize && nx.is(value, 'nx.RootClass'):
                if (value.has('serialize')) {
                  result[name] = value.serialize();
                }
                break;
              case meta.serialize === true:
                result[name] = value;
                break;
              case nx.is(meta.serialize, 'function'):
                result[name] = meta.serialize.call(this);
                break;
            }
          }

        }, this);

        return result;
      }
    }
  });


}(nx, nx.global));
