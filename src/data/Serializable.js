(function (nx, global) {

  nx.declare('nx.data.Serializable', {
    methods: {
      init: function () {
        this.base();
        this.resetSerialize();
      },
      resetSerialize: function () {
        var propertyMeta;
        var selfProperties = this.getMeta('properties');
        nx.each(selfProperties, function (meta, name) {
          propertyMeta = this.memberMeta(name);
          if (propertyMeta.serialize === undefined) {
            propertyMeta.serialize = true;
          }
        }, this);
      },
      serialize: function () {
        var result = {};
        var value, propertyMeta;
        var selfProperties = this.getMeta('properties');
        nx.each(selfProperties, function (meta, name) {
          propertyMeta = this.memberMeta(name);
          if (propertyMeta.serialize) {
            value = nx.get(this, name);
            switch (true) {
              case propertyMeta.serialize && nx.is(value, 'nx.RootClass'):
                if (value.has('serialize')) {
                  result[name] = value.serialize();
                }
                break;
              case propertyMeta.serialize === true:
                result[name] = value;
                break;
              case nx.is(propertyMeta.serialize, 'function'):
                result[name] = propertyMeta.serialize.call(this);
                break;
            }
          }

        }, this);

        return result;
      }
    }
  });


}(nx, nx.global));
