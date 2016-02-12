(function (nx, global) {

  var Binder = nx.declare('nx.Binder', {
    extend: nx.Observable,
    statics: {
      hasBinding: function (inString) {
        return nx.is(inString, 'string') && inString.charAt(0) === '{' && inString.slice(-1) === '}';
      },
      getConverter: function (inOwner, inName) {
        return inOwner[inName] ||
          inOwner.parent().owner()[inName] ||
          inOwner.absOwner()[inName] ||
          nx.Binding.converters;
      },
      bindingMeta: function (inString) {
        var params = {};
        var bindingString = inString.slice(1, -1);
        var tokens = bindingString.split(',');
        var path = tokens[0];
        var paths = path.split('.');
        var i = 1, length = tokens.length;

        for (; i < length; i++) {
          var pair = tokens[i].split('=');
          params[pair[0]] = pair[1];
        }
        params.fullPath = path;
        params.direction = params.direction || '<>';
        params.property = paths.pop();
        params.path = paths.join('.');
        params.converterVal = function (inOwner) {
          var converterName = params.converter;
          var owner = inOwner.absOwner;
          if (converterName) {
            return owner[converterName].call(owner) || nx.Binding.converters[converterName];
          }
          return null;
        };
        params.context = function (inOwner) {
          if (!params.path) {
            //owner binding
            return inOwner;
          }
          //path binding
          return nx.path(inOwner, params.path);
        };
        params.val = function (inOwner) {
          return nx.path(inOwner, params.fullPath);
        };
        return params;
      }
    }
  });

}(nx, nx.GLOBAL));
