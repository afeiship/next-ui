nx = {
  $breaker: {},
  version: '0.0.1',
  global: (function () {
    return this;
  }).call(null),
  noop: function () {
  }
};
(function (nx, global) {

  var toString = Object.prototype.toString;
  var class2type = {
    '[object Boolean]': 'Boolean',
    '[object Number]': 'Number',
    '[object String]': 'String',
    '[object Function]': 'Function',
    '[object Array]': 'Array',
    '[object Date]': 'Date',
    '[object RegExp]': 'RegExp',
    '[object Object]': 'Object',
    '[object Error]': 'Error'
  };

  var __ = {
    typeString: function (inTarget) {
      return toString.call(inTarget).slice(8, -1);
    }
  };

  nx.each = function (inTarget, inCallback, inContext) {
    var key, length;
    if (inTarget) {
      if (inTarget.__each__) {
        try {
          inTarget.__each__(inCallback, inContext);
        } catch (_) {
        }
      } else {
        length = inTarget.length;
        if (length >= 0) {
          for (key = 0; key < length; key++) {
            if (inCallback.call(inContext, inTarget[key], key) === nx.$breaker) {
              break;
            }
          }
        } else {
          for (key in inTarget) {
            if (inTarget.hasOwnProperty(key)) {
              if (inCallback.call(inContext, inTarget[key], key) === nx.$breaker) {
                break;
              }
            }
          }
        }
      }
    }
  };

  nx.clone = function (inTarget) {
    if (inTarget) {
      if (inTarget.__clone__) {
        try {
          return inTarget.__clone__();
        } catch (_) {
        }
      } else {
        if (nx.is(inTarget, 'array')) {
          return inTarget.slice(0);
        } else {
          return nx.mix({}, inTarget);
        }
      }
    } else {
      return inTarget;
    }
  };

  nx.mix = function (inTarget) {
    var i, length;
    for (i = 1, length = arguments.length; i < length; i++) {
      nx.each(arguments[i], function (val, key) {
        inTarget[key] = val;
      });
    }
    return inTarget;
  };

  nx.is = function (inTarget, inType) {
    if (inTarget && inTarget.__is__) {
      return inTarget.__is__(inType);
    } else {
      if (typeof inType === 'string') {
        switch (inType) {
          case 'undefined':
            return inTarget === undefined;
          case 'null':
            return inTarget === null;
          case 'object':
            return inTarget && (typeof inTarget === 'object');
          case 'plain':
            return inTarget && inTarget.constructor === Object;
          case 'string':
          case 'boolean':
          case 'number':
          case 'function':
            return typeof inTarget === inType;
          case 'array':
            return inTarget instanceof Array;
          default:
            return __.typeString(inTarget).toLowerCase() === inType;
        }
      } else if (typeof inType === 'function') {
        return inTarget instanceof inType;
      }
    }
  };

  nx.type = function (inTarget) {
    var typeString;
    if (inTarget && inTarget.__type__) {
      return inTarget.__type__;
    } else {
      if (inTarget === null) {
        return 'Null';
      }
      if (inTarget === undefined) {
        return 'Undefined';
      }
      typeString = toString.call(inTarget);
      return class2type[typeString] || __.typeString(inTarget);
    }
  };

  nx.isType = function (inType) {
    return function (inTarget) {
      return toString.call(inTarget) === '[object ' + inType + ']';
    }
  };


  nx.has = function (inTarget, inName) {
    if (inTarget) {
      if (inTarget.__has__) {
        return inTarget.__has__(inName);
      } else {
        return inName in inTarget;
      }
    }
    return false;
  };

  nx.get = function (inTarget, inName) {
    if (inTarget) {
      if (inTarget.__get__) {
        return inTarget.__get__(inName);
      } else {
        return inTarget[inName];
      }
    }
  };

  nx.set = function (inTarget, inName, inValue) {
    if (inTarget) {
      if (inTarget.__set__) {
        return inTarget.__set__(inName, inValue);
      } else {
        return inTarget[inName] = inValue;
      }
    }
  };

  nx.gets = function (inTarget) {
    if (inTarget) {
      if (inTarget.__gets__) {
        return inTarget.__gets__();
      } else {
        return nx.mix({}, inTarget);
      }
    }
  };

  nx.sets = function (inTarget, inObject) {
    if (inTarget) {
      if (inTarget.__sets__) {
        return inTarget.__sets__(inObject);
      } else {
        return nx.mix(inTarget, inObject);
      }
    }
  };

  nx.path = function (inTarget, inPath, inValue) {
    if (typeof inPath !== 'string') {
      throw new Error('Path must be a string!');
    }

    var paths = inPath.split('.'),
      result = inTarget || nx.global,
      last;

    if (undefined === inValue) {
      nx.each(paths, function (path) {
        result = nx.get(result, path);
      });
    } else {
      last = paths.pop();
      nx.each(paths, function (path) {
        result = result[path] = result[path] || {};
      });
      nx.set(result, last, inValue);
    }
    return result;
  };

}(nx, nx.global));

/**
 * Export the "nx" object
 */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = nx;
}
