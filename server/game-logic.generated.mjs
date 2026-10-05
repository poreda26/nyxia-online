// OTOMATİK ÜRETİLDİ — elle düzenleme. Kaynak: src/game (npm run build:logic)

var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// <define:import.meta.env>
var define_import_meta_env_default;
var init_define_import_meta_env = __esm({
  "<define:import.meta.env>"() {
    define_import_meta_env_default = {};
  }
});

// node_modules/react/cjs/react.production.min.js
var require_react_production_min = __commonJS({
  "node_modules/react/cjs/react.production.min.js"(exports) {
    "use strict";
    init_define_import_meta_env();
    var l = Symbol.for("react.element");
    var n = Symbol.for("react.portal");
    var p = Symbol.for("react.fragment");
    var q = Symbol.for("react.strict_mode");
    var r = Symbol.for("react.profiler");
    var t = Symbol.for("react.provider");
    var u = Symbol.for("react.context");
    var v = Symbol.for("react.forward_ref");
    var w = Symbol.for("react.suspense");
    var x = Symbol.for("react.memo");
    var y = Symbol.for("react.lazy");
    var z = Symbol.iterator;
    function A(a) {
      if (null === a || "object" !== typeof a) return null;
      a = z && a[z] || a["@@iterator"];
      return "function" === typeof a ? a : null;
    }
    var B = { isMounted: function() {
      return false;
    }, enqueueForceUpdate: function() {
    }, enqueueReplaceState: function() {
    }, enqueueSetState: function() {
    } };
    var C = Object.assign;
    var D = {};
    function E(a, b, e) {
      this.props = a;
      this.context = b;
      this.refs = D;
      this.updater = e || B;
    }
    E.prototype.isReactComponent = {};
    E.prototype.setState = function(a, b) {
      if ("object" !== typeof a && "function" !== typeof a && null != a) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
      this.updater.enqueueSetState(this, a, b, "setState");
    };
    E.prototype.forceUpdate = function(a) {
      this.updater.enqueueForceUpdate(this, a, "forceUpdate");
    };
    function F() {
    }
    F.prototype = E.prototype;
    function G(a, b, e) {
      this.props = a;
      this.context = b;
      this.refs = D;
      this.updater = e || B;
    }
    var H = G.prototype = new F();
    H.constructor = G;
    C(H, E.prototype);
    H.isPureReactComponent = true;
    var I = Array.isArray;
    var J = Object.prototype.hasOwnProperty;
    var K = { current: null };
    var L = { key: true, ref: true, __self: true, __source: true };
    function M(a, b, e) {
      var d, c = {}, k = null, h2 = null;
      if (null != b) for (d in void 0 !== b.ref && (h2 = b.ref), void 0 !== b.key && (k = "" + b.key), b) J.call(b, d) && !L.hasOwnProperty(d) && (c[d] = b[d]);
      var g = arguments.length - 2;
      if (1 === g) c.children = e;
      else if (1 < g) {
        for (var f = Array(g), m = 0; m < g; m++) f[m] = arguments[m + 2];
        c.children = f;
      }
      if (a && a.defaultProps) for (d in g = a.defaultProps, g) void 0 === c[d] && (c[d] = g[d]);
      return { $$typeof: l, type: a, key: k, ref: h2, props: c, _owner: K.current };
    }
    function N(a, b) {
      return { $$typeof: l, type: a.type, key: b, ref: a.ref, props: a.props, _owner: a._owner };
    }
    function O(a) {
      return "object" === typeof a && null !== a && a.$$typeof === l;
    }
    function escape(a) {
      var b = { "=": "=0", ":": "=2" };
      return "$" + a.replace(/[=:]/g, function(a2) {
        return b[a2];
      });
    }
    var P = /\/+/g;
    function Q(a, b) {
      return "object" === typeof a && null !== a && null != a.key ? escape("" + a.key) : b.toString(36);
    }
    function R(a, b, e, d, c) {
      var k = typeof a;
      if ("undefined" === k || "boolean" === k) a = null;
      var h2 = false;
      if (null === a) h2 = true;
      else switch (k) {
        case "string":
        case "number":
          h2 = true;
          break;
        case "object":
          switch (a.$$typeof) {
            case l:
            case n:
              h2 = true;
          }
      }
      if (h2) return h2 = a, c = c(h2), a = "" === d ? "." + Q(h2, 0) : d, I(c) ? (e = "", null != a && (e = a.replace(P, "$&/") + "/"), R(c, b, e, "", function(a2) {
        return a2;
      })) : null != c && (O(c) && (c = N(c, e + (!c.key || h2 && h2.key === c.key ? "" : ("" + c.key).replace(P, "$&/") + "/") + a)), b.push(c)), 1;
      h2 = 0;
      d = "" === d ? "." : d + ":";
      if (I(a)) for (var g = 0; g < a.length; g++) {
        k = a[g];
        var f = d + Q(k, g);
        h2 += R(k, b, e, f, c);
      }
      else if (f = A(a), "function" === typeof f) for (a = f.call(a), g = 0; !(k = a.next()).done; ) k = k.value, f = d + Q(k, g++), h2 += R(k, b, e, f, c);
      else if ("object" === k) throw b = String(a), Error("Objects are not valid as a React child (found: " + ("[object Object]" === b ? "object with keys {" + Object.keys(a).join(", ") + "}" : b) + "). If you meant to render a collection of children, use an array instead.");
      return h2;
    }
    function S(a, b, e) {
      if (null == a) return a;
      var d = [], c = 0;
      R(a, d, "", "", function(a2) {
        return b.call(e, a2, c++);
      });
      return d;
    }
    function T(a) {
      if (-1 === a._status) {
        var b = a._result;
        b = b();
        b.then(function(b2) {
          if (0 === a._status || -1 === a._status) a._status = 1, a._result = b2;
        }, function(b2) {
          if (0 === a._status || -1 === a._status) a._status = 2, a._result = b2;
        });
        -1 === a._status && (a._status = 0, a._result = b);
      }
      if (1 === a._status) return a._result.default;
      throw a._result;
    }
    var U = { current: null };
    var V = { transition: null };
    var W = { ReactCurrentDispatcher: U, ReactCurrentBatchConfig: V, ReactCurrentOwner: K };
    function X() {
      throw Error("act(...) is not supported in production builds of React.");
    }
    exports.Children = { map: S, forEach: function(a, b, e) {
      S(a, function() {
        b.apply(this, arguments);
      }, e);
    }, count: function(a) {
      var b = 0;
      S(a, function() {
        b++;
      });
      return b;
    }, toArray: function(a) {
      return S(a, function(a2) {
        return a2;
      }) || [];
    }, only: function(a) {
      if (!O(a)) throw Error("React.Children.only expected to receive a single React element child.");
      return a;
    } };
    exports.Component = E;
    exports.Fragment = p;
    exports.Profiler = r;
    exports.PureComponent = G;
    exports.StrictMode = q;
    exports.Suspense = w;
    exports.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = W;
    exports.act = X;
    exports.cloneElement = function(a, b, e) {
      if (null === a || void 0 === a) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + a + ".");
      var d = C({}, a.props), c = a.key, k = a.ref, h2 = a._owner;
      if (null != b) {
        void 0 !== b.ref && (k = b.ref, h2 = K.current);
        void 0 !== b.key && (c = "" + b.key);
        if (a.type && a.type.defaultProps) var g = a.type.defaultProps;
        for (f in b) J.call(b, f) && !L.hasOwnProperty(f) && (d[f] = void 0 === b[f] && void 0 !== g ? g[f] : b[f]);
      }
      var f = arguments.length - 2;
      if (1 === f) d.children = e;
      else if (1 < f) {
        g = Array(f);
        for (var m = 0; m < f; m++) g[m] = arguments[m + 2];
        d.children = g;
      }
      return { $$typeof: l, type: a.type, key: c, ref: k, props: d, _owner: h2 };
    };
    exports.createContext = function(a) {
      a = { $$typeof: u, _currentValue: a, _currentValue2: a, _threadCount: 0, Provider: null, Consumer: null, _defaultValue: null, _globalName: null };
      a.Provider = { $$typeof: t, _context: a };
      return a.Consumer = a;
    };
    exports.createElement = M;
    exports.createFactory = function(a) {
      var b = M.bind(null, a);
      b.type = a;
      return b;
    };
    exports.createRef = function() {
      return { current: null };
    };
    exports.forwardRef = function(a) {
      return { $$typeof: v, render: a };
    };
    exports.isValidElement = O;
    exports.lazy = function(a) {
      return { $$typeof: y, _payload: { _status: -1, _result: a }, _init: T };
    };
    exports.memo = function(a, b) {
      return { $$typeof: x, type: a, compare: void 0 === b ? null : b };
    };
    exports.startTransition = function(a) {
      var b = V.transition;
      V.transition = {};
      try {
        a();
      } finally {
        V.transition = b;
      }
    };
    exports.unstable_act = X;
    exports.useCallback = function(a, b) {
      return U.current.useCallback(a, b);
    };
    exports.useContext = function(a) {
      return U.current.useContext(a);
    };
    exports.useDebugValue = function() {
    };
    exports.useDeferredValue = function(a) {
      return U.current.useDeferredValue(a);
    };
    exports.useEffect = function(a, b) {
      return U.current.useEffect(a, b);
    };
    exports.useId = function() {
      return U.current.useId();
    };
    exports.useImperativeHandle = function(a, b, e) {
      return U.current.useImperativeHandle(a, b, e);
    };
    exports.useInsertionEffect = function(a, b) {
      return U.current.useInsertionEffect(a, b);
    };
    exports.useLayoutEffect = function(a, b) {
      return U.current.useLayoutEffect(a, b);
    };
    exports.useMemo = function(a, b) {
      return U.current.useMemo(a, b);
    };
    exports.useReducer = function(a, b, e) {
      return U.current.useReducer(a, b, e);
    };
    exports.useRef = function(a) {
      return U.current.useRef(a);
    };
    exports.useState = function(a) {
      return U.current.useState(a);
    };
    exports.useSyncExternalStore = function(a, b, e) {
      return U.current.useSyncExternalStore(a, b, e);
    };
    exports.useTransition = function() {
      return U.current.useTransition();
    };
    exports.version = "18.3.1";
  }
});

// node_modules/react/cjs/react.development.js
var require_react_development = __commonJS({
  "node_modules/react/cjs/react.development.js"(exports, module) {
    "use strict";
    init_define_import_meta_env();
    if (process.env.NODE_ENV !== "production") {
      (function() {
        "use strict";
        if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ !== "undefined" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart === "function") {
          __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(new Error());
        }
        var ReactVersion = "18.3.1";
        var REACT_ELEMENT_TYPE = Symbol.for("react.element");
        var REACT_PORTAL_TYPE = Symbol.for("react.portal");
        var REACT_FRAGMENT_TYPE = Symbol.for("react.fragment");
        var REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode");
        var REACT_PROFILER_TYPE = Symbol.for("react.profiler");
        var REACT_PROVIDER_TYPE = Symbol.for("react.provider");
        var REACT_CONTEXT_TYPE = Symbol.for("react.context");
        var REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref");
        var REACT_SUSPENSE_TYPE = Symbol.for("react.suspense");
        var REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list");
        var REACT_MEMO_TYPE = Symbol.for("react.memo");
        var REACT_LAZY_TYPE = Symbol.for("react.lazy");
        var REACT_OFFSCREEN_TYPE = Symbol.for("react.offscreen");
        var MAYBE_ITERATOR_SYMBOL = Symbol.iterator;
        var FAUX_ITERATOR_SYMBOL = "@@iterator";
        function getIteratorFn(maybeIterable) {
          if (maybeIterable === null || typeof maybeIterable !== "object") {
            return null;
          }
          var maybeIterator = MAYBE_ITERATOR_SYMBOL && maybeIterable[MAYBE_ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL];
          if (typeof maybeIterator === "function") {
            return maybeIterator;
          }
          return null;
        }
        var ReactCurrentDispatcher = {
          /**
           * @internal
           * @type {ReactComponent}
           */
          current: null
        };
        var ReactCurrentBatchConfig = {
          transition: null
        };
        var ReactCurrentActQueue = {
          current: null,
          // Used to reproduce behavior of `batchedUpdates` in legacy mode.
          isBatchingLegacy: false,
          didScheduleLegacyUpdate: false
        };
        var ReactCurrentOwner = {
          /**
           * @internal
           * @type {ReactComponent}
           */
          current: null
        };
        var ReactDebugCurrentFrame = {};
        var currentExtraStackFrame = null;
        function setExtraStackFrame(stack) {
          {
            currentExtraStackFrame = stack;
          }
        }
        {
          ReactDebugCurrentFrame.setExtraStackFrame = function(stack) {
            {
              currentExtraStackFrame = stack;
            }
          };
          ReactDebugCurrentFrame.getCurrentStack = null;
          ReactDebugCurrentFrame.getStackAddendum = function() {
            var stack = "";
            if (currentExtraStackFrame) {
              stack += currentExtraStackFrame;
            }
            var impl = ReactDebugCurrentFrame.getCurrentStack;
            if (impl) {
              stack += impl() || "";
            }
            return stack;
          };
        }
        var enableScopeAPI = false;
        var enableCacheElement = false;
        var enableTransitionTracing = false;
        var enableLegacyHidden = false;
        var enableDebugTracing = false;
        var ReactSharedInternals = {
          ReactCurrentDispatcher,
          ReactCurrentBatchConfig,
          ReactCurrentOwner
        };
        {
          ReactSharedInternals.ReactDebugCurrentFrame = ReactDebugCurrentFrame;
          ReactSharedInternals.ReactCurrentActQueue = ReactCurrentActQueue;
        }
        function warn(format) {
          {
            {
              for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                args[_key - 1] = arguments[_key];
              }
              printWarning("warn", format, args);
            }
          }
        }
        function error(format) {
          {
            {
              for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                args[_key2 - 1] = arguments[_key2];
              }
              printWarning("error", format, args);
            }
          }
        }
        function printWarning(level, format, args) {
          {
            var ReactDebugCurrentFrame2 = ReactSharedInternals.ReactDebugCurrentFrame;
            var stack = ReactDebugCurrentFrame2.getStackAddendum();
            if (stack !== "") {
              format += "%s";
              args = args.concat([stack]);
            }
            var argsWithFormat = args.map(function(item) {
              return String(item);
            });
            argsWithFormat.unshift("Warning: " + format);
            Function.prototype.apply.call(console[level], console, argsWithFormat);
          }
        }
        var didWarnStateUpdateForUnmountedComponent = {};
        function warnNoop(publicInstance, callerName) {
          {
            var _constructor = publicInstance.constructor;
            var componentName = _constructor && (_constructor.displayName || _constructor.name) || "ReactClass";
            var warningKey = componentName + "." + callerName;
            if (didWarnStateUpdateForUnmountedComponent[warningKey]) {
              return;
            }
            error("Can't call %s on a component that is not yet mounted. This is a no-op, but it might indicate a bug in your application. Instead, assign to `this.state` directly or define a `state = {};` class property with the desired state in the %s component.", callerName, componentName);
            didWarnStateUpdateForUnmountedComponent[warningKey] = true;
          }
        }
        var ReactNoopUpdateQueue = {
          /**
           * Checks whether or not this composite component is mounted.
           * @param {ReactClass} publicInstance The instance we want to test.
           * @return {boolean} True if mounted, false otherwise.
           * @protected
           * @final
           */
          isMounted: function(publicInstance) {
            return false;
          },
          /**
           * Forces an update. This should only be invoked when it is known with
           * certainty that we are **not** in a DOM transaction.
           *
           * You may want to call this when you know that some deeper aspect of the
           * component's state has changed but `setState` was not called.
           *
           * This will not invoke `shouldComponentUpdate`, but it will invoke
           * `componentWillUpdate` and `componentDidUpdate`.
           *
           * @param {ReactClass} publicInstance The instance that should rerender.
           * @param {?function} callback Called after component is updated.
           * @param {?string} callerName name of the calling function in the public API.
           * @internal
           */
          enqueueForceUpdate: function(publicInstance, callback, callerName) {
            warnNoop(publicInstance, "forceUpdate");
          },
          /**
           * Replaces all of the state. Always use this or `setState` to mutate state.
           * You should treat `this.state` as immutable.
           *
           * There is no guarantee that `this.state` will be immediately updated, so
           * accessing `this.state` after calling this method may return the old value.
           *
           * @param {ReactClass} publicInstance The instance that should rerender.
           * @param {object} completeState Next state.
           * @param {?function} callback Called after component is updated.
           * @param {?string} callerName name of the calling function in the public API.
           * @internal
           */
          enqueueReplaceState: function(publicInstance, completeState, callback, callerName) {
            warnNoop(publicInstance, "replaceState");
          },
          /**
           * Sets a subset of the state. This only exists because _pendingState is
           * internal. This provides a merging strategy that is not available to deep
           * properties which is confusing. TODO: Expose pendingState or don't use it
           * during the merge.
           *
           * @param {ReactClass} publicInstance The instance that should rerender.
           * @param {object} partialState Next partial state to be merged with state.
           * @param {?function} callback Called after component is updated.
           * @param {?string} Name of the calling function in the public API.
           * @internal
           */
          enqueueSetState: function(publicInstance, partialState, callback, callerName) {
            warnNoop(publicInstance, "setState");
          }
        };
        var assign = Object.assign;
        var emptyObject = {};
        {
          Object.freeze(emptyObject);
        }
        function Component(props, context, updater) {
          this.props = props;
          this.context = context;
          this.refs = emptyObject;
          this.updater = updater || ReactNoopUpdateQueue;
        }
        Component.prototype.isReactComponent = {};
        Component.prototype.setState = function(partialState, callback) {
          if (typeof partialState !== "object" && typeof partialState !== "function" && partialState != null) {
            throw new Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
          }
          this.updater.enqueueSetState(this, partialState, callback, "setState");
        };
        Component.prototype.forceUpdate = function(callback) {
          this.updater.enqueueForceUpdate(this, callback, "forceUpdate");
        };
        {
          var deprecatedAPIs = {
            isMounted: ["isMounted", "Instead, make sure to clean up subscriptions and pending requests in componentWillUnmount to prevent memory leaks."],
            replaceState: ["replaceState", "Refactor your code to use setState instead (see https://github.com/facebook/react/issues/3236)."]
          };
          var defineDeprecationWarning = function(methodName, info) {
            Object.defineProperty(Component.prototype, methodName, {
              get: function() {
                warn("%s(...) is deprecated in plain JavaScript React classes. %s", info[0], info[1]);
                return void 0;
              }
            });
          };
          for (var fnName in deprecatedAPIs) {
            if (deprecatedAPIs.hasOwnProperty(fnName)) {
              defineDeprecationWarning(fnName, deprecatedAPIs[fnName]);
            }
          }
        }
        function ComponentDummy() {
        }
        ComponentDummy.prototype = Component.prototype;
        function PureComponent(props, context, updater) {
          this.props = props;
          this.context = context;
          this.refs = emptyObject;
          this.updater = updater || ReactNoopUpdateQueue;
        }
        var pureComponentPrototype = PureComponent.prototype = new ComponentDummy();
        pureComponentPrototype.constructor = PureComponent;
        assign(pureComponentPrototype, Component.prototype);
        pureComponentPrototype.isPureReactComponent = true;
        function createRef() {
          var refObject = {
            current: null
          };
          {
            Object.seal(refObject);
          }
          return refObject;
        }
        var isArrayImpl = Array.isArray;
        function isArray(a) {
          return isArrayImpl(a);
        }
        function typeName(value) {
          {
            var hasToStringTag = typeof Symbol === "function" && Symbol.toStringTag;
            var type = hasToStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
            return type;
          }
        }
        function willCoercionThrow(value) {
          {
            try {
              testStringCoercion(value);
              return false;
            } catch (e) {
              return true;
            }
          }
        }
        function testStringCoercion(value) {
          return "" + value;
        }
        function checkKeyStringCoercion(value) {
          {
            if (willCoercionThrow(value)) {
              error("The provided key is an unsupported type %s. This value must be coerced to a string before before using it here.", typeName(value));
              return testStringCoercion(value);
            }
          }
        }
        function getWrappedName(outerType, innerType, wrapperName) {
          var displayName = outerType.displayName;
          if (displayName) {
            return displayName;
          }
          var functionName = innerType.displayName || innerType.name || "";
          return functionName !== "" ? wrapperName + "(" + functionName + ")" : wrapperName;
        }
        function getContextName(type) {
          return type.displayName || "Context";
        }
        function getComponentNameFromType(type) {
          if (type == null) {
            return null;
          }
          {
            if (typeof type.tag === "number") {
              error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue.");
            }
          }
          if (typeof type === "function") {
            return type.displayName || type.name || null;
          }
          if (typeof type === "string") {
            return type;
          }
          switch (type) {
            case REACT_FRAGMENT_TYPE:
              return "Fragment";
            case REACT_PORTAL_TYPE:
              return "Portal";
            case REACT_PROFILER_TYPE:
              return "Profiler";
            case REACT_STRICT_MODE_TYPE:
              return "StrictMode";
            case REACT_SUSPENSE_TYPE:
              return "Suspense";
            case REACT_SUSPENSE_LIST_TYPE:
              return "SuspenseList";
          }
          if (typeof type === "object") {
            switch (type.$$typeof) {
              case REACT_CONTEXT_TYPE:
                var context = type;
                return getContextName(context) + ".Consumer";
              case REACT_PROVIDER_TYPE:
                var provider = type;
                return getContextName(provider._context) + ".Provider";
              case REACT_FORWARD_REF_TYPE:
                return getWrappedName(type, type.render, "ForwardRef");
              case REACT_MEMO_TYPE:
                var outerName = type.displayName || null;
                if (outerName !== null) {
                  return outerName;
                }
                return getComponentNameFromType(type.type) || "Memo";
              case REACT_LAZY_TYPE: {
                var lazyComponent = type;
                var payload = lazyComponent._payload;
                var init = lazyComponent._init;
                try {
                  return getComponentNameFromType(init(payload));
                } catch (x) {
                  return null;
                }
              }
            }
          }
          return null;
        }
        var hasOwnProperty = Object.prototype.hasOwnProperty;
        var RESERVED_PROPS = {
          key: true,
          ref: true,
          __self: true,
          __source: true
        };
        var specialPropKeyWarningShown, specialPropRefWarningShown, didWarnAboutStringRefs;
        {
          didWarnAboutStringRefs = {};
        }
        function hasValidRef(config) {
          {
            if (hasOwnProperty.call(config, "ref")) {
              var getter = Object.getOwnPropertyDescriptor(config, "ref").get;
              if (getter && getter.isReactWarning) {
                return false;
              }
            }
          }
          return config.ref !== void 0;
        }
        function hasValidKey(config) {
          {
            if (hasOwnProperty.call(config, "key")) {
              var getter = Object.getOwnPropertyDescriptor(config, "key").get;
              if (getter && getter.isReactWarning) {
                return false;
              }
            }
          }
          return config.key !== void 0;
        }
        function defineKeyPropWarningGetter(props, displayName) {
          var warnAboutAccessingKey = function() {
            {
              if (!specialPropKeyWarningShown) {
                specialPropKeyWarningShown = true;
                error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", displayName);
              }
            }
          };
          warnAboutAccessingKey.isReactWarning = true;
          Object.defineProperty(props, "key", {
            get: warnAboutAccessingKey,
            configurable: true
          });
        }
        function defineRefPropWarningGetter(props, displayName) {
          var warnAboutAccessingRef = function() {
            {
              if (!specialPropRefWarningShown) {
                specialPropRefWarningShown = true;
                error("%s: `ref` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://reactjs.org/link/special-props)", displayName);
              }
            }
          };
          warnAboutAccessingRef.isReactWarning = true;
          Object.defineProperty(props, "ref", {
            get: warnAboutAccessingRef,
            configurable: true
          });
        }
        function warnIfStringRefCannotBeAutoConverted(config) {
          {
            if (typeof config.ref === "string" && ReactCurrentOwner.current && config.__self && ReactCurrentOwner.current.stateNode !== config.__self) {
              var componentName = getComponentNameFromType(ReactCurrentOwner.current.type);
              if (!didWarnAboutStringRefs[componentName]) {
                error('Component "%s" contains the string ref "%s". Support for string refs will be removed in a future major release. This case cannot be automatically converted to an arrow function. We ask you to manually fix this case by using useRef() or createRef() instead. Learn more about using refs safely here: https://reactjs.org/link/strict-mode-string-ref', componentName, config.ref);
                didWarnAboutStringRefs[componentName] = true;
              }
            }
          }
        }
        var ReactElement = function(type, key, ref, self, source, owner, props) {
          var element = {
            // This tag allows us to uniquely identify this as a React Element
            $$typeof: REACT_ELEMENT_TYPE,
            // Built-in properties that belong on the element
            type,
            key,
            ref,
            props,
            // Record the component responsible for creating this element.
            _owner: owner
          };
          {
            element._store = {};
            Object.defineProperty(element._store, "validated", {
              configurable: false,
              enumerable: false,
              writable: true,
              value: false
            });
            Object.defineProperty(element, "_self", {
              configurable: false,
              enumerable: false,
              writable: false,
              value: self
            });
            Object.defineProperty(element, "_source", {
              configurable: false,
              enumerable: false,
              writable: false,
              value: source
            });
            if (Object.freeze) {
              Object.freeze(element.props);
              Object.freeze(element);
            }
          }
          return element;
        };
        function createElement(type, config, children) {
          var propName;
          var props = {};
          var key = null;
          var ref = null;
          var self = null;
          var source = null;
          if (config != null) {
            if (hasValidRef(config)) {
              ref = config.ref;
              {
                warnIfStringRefCannotBeAutoConverted(config);
              }
            }
            if (hasValidKey(config)) {
              {
                checkKeyStringCoercion(config.key);
              }
              key = "" + config.key;
            }
            self = config.__self === void 0 ? null : config.__self;
            source = config.__source === void 0 ? null : config.__source;
            for (propName in config) {
              if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
                props[propName] = config[propName];
              }
            }
          }
          var childrenLength = arguments.length - 2;
          if (childrenLength === 1) {
            props.children = children;
          } else if (childrenLength > 1) {
            var childArray = Array(childrenLength);
            for (var i = 0; i < childrenLength; i++) {
              childArray[i] = arguments[i + 2];
            }
            {
              if (Object.freeze) {
                Object.freeze(childArray);
              }
            }
            props.children = childArray;
          }
          if (type && type.defaultProps) {
            var defaultProps = type.defaultProps;
            for (propName in defaultProps) {
              if (props[propName] === void 0) {
                props[propName] = defaultProps[propName];
              }
            }
          }
          {
            if (key || ref) {
              var displayName = typeof type === "function" ? type.displayName || type.name || "Unknown" : type;
              if (key) {
                defineKeyPropWarningGetter(props, displayName);
              }
              if (ref) {
                defineRefPropWarningGetter(props, displayName);
              }
            }
          }
          return ReactElement(type, key, ref, self, source, ReactCurrentOwner.current, props);
        }
        function cloneAndReplaceKey(oldElement, newKey) {
          var newElement = ReactElement(oldElement.type, newKey, oldElement.ref, oldElement._self, oldElement._source, oldElement._owner, oldElement.props);
          return newElement;
        }
        function cloneElement(element, config, children) {
          if (element === null || element === void 0) {
            throw new Error("React.cloneElement(...): The argument must be a React element, but you passed " + element + ".");
          }
          var propName;
          var props = assign({}, element.props);
          var key = element.key;
          var ref = element.ref;
          var self = element._self;
          var source = element._source;
          var owner = element._owner;
          if (config != null) {
            if (hasValidRef(config)) {
              ref = config.ref;
              owner = ReactCurrentOwner.current;
            }
            if (hasValidKey(config)) {
              {
                checkKeyStringCoercion(config.key);
              }
              key = "" + config.key;
            }
            var defaultProps;
            if (element.type && element.type.defaultProps) {
              defaultProps = element.type.defaultProps;
            }
            for (propName in config) {
              if (hasOwnProperty.call(config, propName) && !RESERVED_PROPS.hasOwnProperty(propName)) {
                if (config[propName] === void 0 && defaultProps !== void 0) {
                  props[propName] = defaultProps[propName];
                } else {
                  props[propName] = config[propName];
                }
              }
            }
          }
          var childrenLength = arguments.length - 2;
          if (childrenLength === 1) {
            props.children = children;
          } else if (childrenLength > 1) {
            var childArray = Array(childrenLength);
            for (var i = 0; i < childrenLength; i++) {
              childArray[i] = arguments[i + 2];
            }
            props.children = childArray;
          }
          return ReactElement(element.type, key, ref, self, source, owner, props);
        }
        function isValidElement(object) {
          return typeof object === "object" && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
        }
        var SEPARATOR = ".";
        var SUBSEPARATOR = ":";
        function escape(key) {
          var escapeRegex = /[=:]/g;
          var escaperLookup = {
            "=": "=0",
            ":": "=2"
          };
          var escapedString = key.replace(escapeRegex, function(match) {
            return escaperLookup[match];
          });
          return "$" + escapedString;
        }
        var didWarnAboutMaps = false;
        var userProvidedKeyEscapeRegex = /\/+/g;
        function escapeUserProvidedKey(text) {
          return text.replace(userProvidedKeyEscapeRegex, "$&/");
        }
        function getElementKey(element, index) {
          if (typeof element === "object" && element !== null && element.key != null) {
            {
              checkKeyStringCoercion(element.key);
            }
            return escape("" + element.key);
          }
          return index.toString(36);
        }
        function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
          var type = typeof children;
          if (type === "undefined" || type === "boolean") {
            children = null;
          }
          var invokeCallback = false;
          if (children === null) {
            invokeCallback = true;
          } else {
            switch (type) {
              case "string":
              case "number":
                invokeCallback = true;
                break;
              case "object":
                switch (children.$$typeof) {
                  case REACT_ELEMENT_TYPE:
                  case REACT_PORTAL_TYPE:
                    invokeCallback = true;
                }
            }
          }
          if (invokeCallback) {
            var _child = children;
            var mappedChild = callback(_child);
            var childKey = nameSoFar === "" ? SEPARATOR + getElementKey(_child, 0) : nameSoFar;
            if (isArray(mappedChild)) {
              var escapedChildKey = "";
              if (childKey != null) {
                escapedChildKey = escapeUserProvidedKey(childKey) + "/";
              }
              mapIntoArray(mappedChild, array, escapedChildKey, "", function(c) {
                return c;
              });
            } else if (mappedChild != null) {
              if (isValidElement(mappedChild)) {
                {
                  if (mappedChild.key && (!_child || _child.key !== mappedChild.key)) {
                    checkKeyStringCoercion(mappedChild.key);
                  }
                }
                mappedChild = cloneAndReplaceKey(
                  mappedChild,
                  // Keep both the (mapped) and old keys if they differ, just as
                  // traverseAllChildren used to do for objects as children
                  escapedPrefix + // $FlowFixMe Flow incorrectly thinks React.Portal doesn't have a key
                  (mappedChild.key && (!_child || _child.key !== mappedChild.key) ? (
                    // $FlowFixMe Flow incorrectly thinks existing element's key can be a number
                    // eslint-disable-next-line react-internal/safe-string-coercion
                    escapeUserProvidedKey("" + mappedChild.key) + "/"
                  ) : "") + childKey
                );
              }
              array.push(mappedChild);
            }
            return 1;
          }
          var child;
          var nextName;
          var subtreeCount = 0;
          var nextNamePrefix = nameSoFar === "" ? SEPARATOR : nameSoFar + SUBSEPARATOR;
          if (isArray(children)) {
            for (var i = 0; i < children.length; i++) {
              child = children[i];
              nextName = nextNamePrefix + getElementKey(child, i);
              subtreeCount += mapIntoArray(child, array, escapedPrefix, nextName, callback);
            }
          } else {
            var iteratorFn = getIteratorFn(children);
            if (typeof iteratorFn === "function") {
              var iterableChildren = children;
              {
                if (iteratorFn === iterableChildren.entries) {
                  if (!didWarnAboutMaps) {
                    warn("Using Maps as children is not supported. Use an array of keyed ReactElements instead.");
                  }
                  didWarnAboutMaps = true;
                }
              }
              var iterator = iteratorFn.call(iterableChildren);
              var step;
              var ii = 0;
              while (!(step = iterator.next()).done) {
                child = step.value;
                nextName = nextNamePrefix + getElementKey(child, ii++);
                subtreeCount += mapIntoArray(child, array, escapedPrefix, nextName, callback);
              }
            } else if (type === "object") {
              var childrenString = String(children);
              throw new Error("Objects are not valid as a React child (found: " + (childrenString === "[object Object]" ? "object with keys {" + Object.keys(children).join(", ") + "}" : childrenString) + "). If you meant to render a collection of children, use an array instead.");
            }
          }
          return subtreeCount;
        }
        function mapChildren(children, func, context) {
          if (children == null) {
            return children;
          }
          var result = [];
          var count = 0;
          mapIntoArray(children, result, "", "", function(child) {
            return func.call(context, child, count++);
          });
          return result;
        }
        function countChildren(children) {
          var n = 0;
          mapChildren(children, function() {
            n++;
          });
          return n;
        }
        function forEachChildren(children, forEachFunc, forEachContext) {
          mapChildren(children, function() {
            forEachFunc.apply(this, arguments);
          }, forEachContext);
        }
        function toArray(children) {
          return mapChildren(children, function(child) {
            return child;
          }) || [];
        }
        function onlyChild(children) {
          if (!isValidElement(children)) {
            throw new Error("React.Children.only expected to receive a single React element child.");
          }
          return children;
        }
        function createContext(defaultValue) {
          var context = {
            $$typeof: REACT_CONTEXT_TYPE,
            // As a workaround to support multiple concurrent renderers, we categorize
            // some renderers as primary and others as secondary. We only expect
            // there to be two concurrent renderers at most: React Native (primary) and
            // Fabric (secondary); React DOM (primary) and React ART (secondary).
            // Secondary renderers store their context values on separate fields.
            _currentValue: defaultValue,
            _currentValue2: defaultValue,
            // Used to track how many concurrent renderers this context currently
            // supports within in a single renderer. Such as parallel server rendering.
            _threadCount: 0,
            // These are circular
            Provider: null,
            Consumer: null,
            // Add these to use same hidden class in VM as ServerContext
            _defaultValue: null,
            _globalName: null
          };
          context.Provider = {
            $$typeof: REACT_PROVIDER_TYPE,
            _context: context
          };
          var hasWarnedAboutUsingNestedContextConsumers = false;
          var hasWarnedAboutUsingConsumerProvider = false;
          var hasWarnedAboutDisplayNameOnConsumer = false;
          {
            var Consumer = {
              $$typeof: REACT_CONTEXT_TYPE,
              _context: context
            };
            Object.defineProperties(Consumer, {
              Provider: {
                get: function() {
                  if (!hasWarnedAboutUsingConsumerProvider) {
                    hasWarnedAboutUsingConsumerProvider = true;
                    error("Rendering <Context.Consumer.Provider> is not supported and will be removed in a future major release. Did you mean to render <Context.Provider> instead?");
                  }
                  return context.Provider;
                },
                set: function(_Provider) {
                  context.Provider = _Provider;
                }
              },
              _currentValue: {
                get: function() {
                  return context._currentValue;
                },
                set: function(_currentValue) {
                  context._currentValue = _currentValue;
                }
              },
              _currentValue2: {
                get: function() {
                  return context._currentValue2;
                },
                set: function(_currentValue2) {
                  context._currentValue2 = _currentValue2;
                }
              },
              _threadCount: {
                get: function() {
                  return context._threadCount;
                },
                set: function(_threadCount) {
                  context._threadCount = _threadCount;
                }
              },
              Consumer: {
                get: function() {
                  if (!hasWarnedAboutUsingNestedContextConsumers) {
                    hasWarnedAboutUsingNestedContextConsumers = true;
                    error("Rendering <Context.Consumer.Consumer> is not supported and will be removed in a future major release. Did you mean to render <Context.Consumer> instead?");
                  }
                  return context.Consumer;
                }
              },
              displayName: {
                get: function() {
                  return context.displayName;
                },
                set: function(displayName) {
                  if (!hasWarnedAboutDisplayNameOnConsumer) {
                    warn("Setting `displayName` on Context.Consumer has no effect. You should set it directly on the context with Context.displayName = '%s'.", displayName);
                    hasWarnedAboutDisplayNameOnConsumer = true;
                  }
                }
              }
            });
            context.Consumer = Consumer;
          }
          {
            context._currentRenderer = null;
            context._currentRenderer2 = null;
          }
          return context;
        }
        var Uninitialized = -1;
        var Pending = 0;
        var Resolved = 1;
        var Rejected = 2;
        function lazyInitializer(payload) {
          if (payload._status === Uninitialized) {
            var ctor = payload._result;
            var thenable = ctor();
            thenable.then(function(moduleObject2) {
              if (payload._status === Pending || payload._status === Uninitialized) {
                var resolved = payload;
                resolved._status = Resolved;
                resolved._result = moduleObject2;
              }
            }, function(error2) {
              if (payload._status === Pending || payload._status === Uninitialized) {
                var rejected = payload;
                rejected._status = Rejected;
                rejected._result = error2;
              }
            });
            if (payload._status === Uninitialized) {
              var pending = payload;
              pending._status = Pending;
              pending._result = thenable;
            }
          }
          if (payload._status === Resolved) {
            var moduleObject = payload._result;
            {
              if (moduleObject === void 0) {
                error("lazy: Expected the result of a dynamic import() call. Instead received: %s\n\nYour code should look like: \n  const MyComponent = lazy(() => import('./MyComponent'))\n\nDid you accidentally put curly braces around the import?", moduleObject);
              }
            }
            {
              if (!("default" in moduleObject)) {
                error("lazy: Expected the result of a dynamic import() call. Instead received: %s\n\nYour code should look like: \n  const MyComponent = lazy(() => import('./MyComponent'))", moduleObject);
              }
            }
            return moduleObject.default;
          } else {
            throw payload._result;
          }
        }
        function lazy(ctor) {
          var payload = {
            // We use these fields to store the result.
            _status: Uninitialized,
            _result: ctor
          };
          var lazyType = {
            $$typeof: REACT_LAZY_TYPE,
            _payload: payload,
            _init: lazyInitializer
          };
          {
            var defaultProps;
            var propTypes;
            Object.defineProperties(lazyType, {
              defaultProps: {
                configurable: true,
                get: function() {
                  return defaultProps;
                },
                set: function(newDefaultProps) {
                  error("React.lazy(...): It is not supported to assign `defaultProps` to a lazy component import. Either specify them where the component is defined, or create a wrapping component around it.");
                  defaultProps = newDefaultProps;
                  Object.defineProperty(lazyType, "defaultProps", {
                    enumerable: true
                  });
                }
              },
              propTypes: {
                configurable: true,
                get: function() {
                  return propTypes;
                },
                set: function(newPropTypes) {
                  error("React.lazy(...): It is not supported to assign `propTypes` to a lazy component import. Either specify them where the component is defined, or create a wrapping component around it.");
                  propTypes = newPropTypes;
                  Object.defineProperty(lazyType, "propTypes", {
                    enumerable: true
                  });
                }
              }
            });
          }
          return lazyType;
        }
        function forwardRef(render) {
          {
            if (render != null && render.$$typeof === REACT_MEMO_TYPE) {
              error("forwardRef requires a render function but received a `memo` component. Instead of forwardRef(memo(...)), use memo(forwardRef(...)).");
            } else if (typeof render !== "function") {
              error("forwardRef requires a render function but was given %s.", render === null ? "null" : typeof render);
            } else {
              if (render.length !== 0 && render.length !== 2) {
                error("forwardRef render functions accept exactly two parameters: props and ref. %s", render.length === 1 ? "Did you forget to use the ref parameter?" : "Any additional parameter will be undefined.");
              }
            }
            if (render != null) {
              if (render.defaultProps != null || render.propTypes != null) {
                error("forwardRef render functions do not support propTypes or defaultProps. Did you accidentally pass a React component?");
              }
            }
          }
          var elementType = {
            $$typeof: REACT_FORWARD_REF_TYPE,
            render
          };
          {
            var ownName;
            Object.defineProperty(elementType, "displayName", {
              enumerable: false,
              configurable: true,
              get: function() {
                return ownName;
              },
              set: function(name) {
                ownName = name;
                if (!render.name && !render.displayName) {
                  render.displayName = name;
                }
              }
            });
          }
          return elementType;
        }
        var REACT_MODULE_REFERENCE;
        {
          REACT_MODULE_REFERENCE = Symbol.for("react.module.reference");
        }
        function isValidElementType(type) {
          if (typeof type === "string" || typeof type === "function") {
            return true;
          }
          if (type === REACT_FRAGMENT_TYPE || type === REACT_PROFILER_TYPE || enableDebugTracing || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || enableLegacyHidden || type === REACT_OFFSCREEN_TYPE || enableScopeAPI || enableCacheElement || enableTransitionTracing) {
            return true;
          }
          if (typeof type === "object" && type !== null) {
            if (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || // This needs to include all possible module reference object
            // types supported by any Flight configuration anywhere since
            // we don't know which Flight build this will end up being used
            // with.
            type.$$typeof === REACT_MODULE_REFERENCE || type.getModuleId !== void 0) {
              return true;
            }
          }
          return false;
        }
        function memo(type, compare) {
          {
            if (!isValidElementType(type)) {
              error("memo: The first argument must be a component. Instead received: %s", type === null ? "null" : typeof type);
            }
          }
          var elementType = {
            $$typeof: REACT_MEMO_TYPE,
            type,
            compare: compare === void 0 ? null : compare
          };
          {
            var ownName;
            Object.defineProperty(elementType, "displayName", {
              enumerable: false,
              configurable: true,
              get: function() {
                return ownName;
              },
              set: function(name) {
                ownName = name;
                if (!type.name && !type.displayName) {
                  type.displayName = name;
                }
              }
            });
          }
          return elementType;
        }
        function resolveDispatcher() {
          var dispatcher = ReactCurrentDispatcher.current;
          {
            if (dispatcher === null) {
              error("Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://reactjs.org/link/invalid-hook-call for tips about how to debug and fix this problem.");
            }
          }
          return dispatcher;
        }
        function useContext(Context) {
          var dispatcher = resolveDispatcher();
          {
            if (Context._context !== void 0) {
              var realContext = Context._context;
              if (realContext.Consumer === Context) {
                error("Calling useContext(Context.Consumer) is not supported, may cause bugs, and will be removed in a future major release. Did you mean to call useContext(Context) instead?");
              } else if (realContext.Provider === Context) {
                error("Calling useContext(Context.Provider) is not supported. Did you mean to call useContext(Context) instead?");
              }
            }
          }
          return dispatcher.useContext(Context);
        }
        function useState(initialState) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useState(initialState);
        }
        function useReducer(reducer, initialArg, init) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useReducer(reducer, initialArg, init);
        }
        function useRef(initialValue) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useRef(initialValue);
        }
        function useEffect(create, deps) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useEffect(create, deps);
        }
        function useInsertionEffect(create, deps) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useInsertionEffect(create, deps);
        }
        function useLayoutEffect(create, deps) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useLayoutEffect(create, deps);
        }
        function useCallback(callback, deps) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useCallback(callback, deps);
        }
        function useMemo(create, deps) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useMemo(create, deps);
        }
        function useImperativeHandle(ref, create, deps) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useImperativeHandle(ref, create, deps);
        }
        function useDebugValue(value, formatterFn) {
          {
            var dispatcher = resolveDispatcher();
            return dispatcher.useDebugValue(value, formatterFn);
          }
        }
        function useTransition() {
          var dispatcher = resolveDispatcher();
          return dispatcher.useTransition();
        }
        function useDeferredValue(value) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useDeferredValue(value);
        }
        function useId3() {
          var dispatcher = resolveDispatcher();
          return dispatcher.useId();
        }
        function useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot) {
          var dispatcher = resolveDispatcher();
          return dispatcher.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
        }
        var disabledDepth = 0;
        var prevLog;
        var prevInfo;
        var prevWarn;
        var prevError;
        var prevGroup;
        var prevGroupCollapsed;
        var prevGroupEnd;
        function disabledLog() {
        }
        disabledLog.__reactDisabledLog = true;
        function disableLogs() {
          {
            if (disabledDepth === 0) {
              prevLog = console.log;
              prevInfo = console.info;
              prevWarn = console.warn;
              prevError = console.error;
              prevGroup = console.group;
              prevGroupCollapsed = console.groupCollapsed;
              prevGroupEnd = console.groupEnd;
              var props = {
                configurable: true,
                enumerable: true,
                value: disabledLog,
                writable: true
              };
              Object.defineProperties(console, {
                info: props,
                log: props,
                warn: props,
                error: props,
                group: props,
                groupCollapsed: props,
                groupEnd: props
              });
            }
            disabledDepth++;
          }
        }
        function reenableLogs() {
          {
            disabledDepth--;
            if (disabledDepth === 0) {
              var props = {
                configurable: true,
                enumerable: true,
                writable: true
              };
              Object.defineProperties(console, {
                log: assign({}, props, {
                  value: prevLog
                }),
                info: assign({}, props, {
                  value: prevInfo
                }),
                warn: assign({}, props, {
                  value: prevWarn
                }),
                error: assign({}, props, {
                  value: prevError
                }),
                group: assign({}, props, {
                  value: prevGroup
                }),
                groupCollapsed: assign({}, props, {
                  value: prevGroupCollapsed
                }),
                groupEnd: assign({}, props, {
                  value: prevGroupEnd
                })
              });
            }
            if (disabledDepth < 0) {
              error("disabledDepth fell below zero. This is a bug in React. Please file an issue.");
            }
          }
        }
        var ReactCurrentDispatcher$1 = ReactSharedInternals.ReactCurrentDispatcher;
        var prefix;
        function describeBuiltInComponentFrame(name, source, ownerFn) {
          {
            if (prefix === void 0) {
              try {
                throw Error();
              } catch (x) {
                var match = x.stack.trim().match(/\n( *(at )?)/);
                prefix = match && match[1] || "";
              }
            }
            return "\n" + prefix + name;
          }
        }
        var reentry = false;
        var componentFrameCache;
        {
          var PossiblyWeakMap = typeof WeakMap === "function" ? WeakMap : Map;
          componentFrameCache = new PossiblyWeakMap();
        }
        function describeNativeComponentFrame(fn, construct) {
          if (!fn || reentry) {
            return "";
          }
          {
            var frame = componentFrameCache.get(fn);
            if (frame !== void 0) {
              return frame;
            }
          }
          var control;
          reentry = true;
          var previousPrepareStackTrace = Error.prepareStackTrace;
          Error.prepareStackTrace = void 0;
          var previousDispatcher;
          {
            previousDispatcher = ReactCurrentDispatcher$1.current;
            ReactCurrentDispatcher$1.current = null;
            disableLogs();
          }
          try {
            if (construct) {
              var Fake = function() {
                throw Error();
              };
              Object.defineProperty(Fake.prototype, "props", {
                set: function() {
                  throw Error();
                }
              });
              if (typeof Reflect === "object" && Reflect.construct) {
                try {
                  Reflect.construct(Fake, []);
                } catch (x) {
                  control = x;
                }
                Reflect.construct(fn, [], Fake);
              } else {
                try {
                  Fake.call();
                } catch (x) {
                  control = x;
                }
                fn.call(Fake.prototype);
              }
            } else {
              try {
                throw Error();
              } catch (x) {
                control = x;
              }
              fn();
            }
          } catch (sample) {
            if (sample && control && typeof sample.stack === "string") {
              var sampleLines = sample.stack.split("\n");
              var controlLines = control.stack.split("\n");
              var s = sampleLines.length - 1;
              var c = controlLines.length - 1;
              while (s >= 1 && c >= 0 && sampleLines[s] !== controlLines[c]) {
                c--;
              }
              for (; s >= 1 && c >= 0; s--, c--) {
                if (sampleLines[s] !== controlLines[c]) {
                  if (s !== 1 || c !== 1) {
                    do {
                      s--;
                      c--;
                      if (c < 0 || sampleLines[s] !== controlLines[c]) {
                        var _frame = "\n" + sampleLines[s].replace(" at new ", " at ");
                        if (fn.displayName && _frame.includes("<anonymous>")) {
                          _frame = _frame.replace("<anonymous>", fn.displayName);
                        }
                        {
                          if (typeof fn === "function") {
                            componentFrameCache.set(fn, _frame);
                          }
                        }
                        return _frame;
                      }
                    } while (s >= 1 && c >= 0);
                  }
                  break;
                }
              }
            }
          } finally {
            reentry = false;
            {
              ReactCurrentDispatcher$1.current = previousDispatcher;
              reenableLogs();
            }
            Error.prepareStackTrace = previousPrepareStackTrace;
          }
          var name = fn ? fn.displayName || fn.name : "";
          var syntheticFrame = name ? describeBuiltInComponentFrame(name) : "";
          {
            if (typeof fn === "function") {
              componentFrameCache.set(fn, syntheticFrame);
            }
          }
          return syntheticFrame;
        }
        function describeFunctionComponentFrame(fn, source, ownerFn) {
          {
            return describeNativeComponentFrame(fn, false);
          }
        }
        function shouldConstruct(Component2) {
          var prototype = Component2.prototype;
          return !!(prototype && prototype.isReactComponent);
        }
        function describeUnknownElementTypeFrameInDEV(type, source, ownerFn) {
          if (type == null) {
            return "";
          }
          if (typeof type === "function") {
            {
              return describeNativeComponentFrame(type, shouldConstruct(type));
            }
          }
          if (typeof type === "string") {
            return describeBuiltInComponentFrame(type);
          }
          switch (type) {
            case REACT_SUSPENSE_TYPE:
              return describeBuiltInComponentFrame("Suspense");
            case REACT_SUSPENSE_LIST_TYPE:
              return describeBuiltInComponentFrame("SuspenseList");
          }
          if (typeof type === "object") {
            switch (type.$$typeof) {
              case REACT_FORWARD_REF_TYPE:
                return describeFunctionComponentFrame(type.render);
              case REACT_MEMO_TYPE:
                return describeUnknownElementTypeFrameInDEV(type.type, source, ownerFn);
              case REACT_LAZY_TYPE: {
                var lazyComponent = type;
                var payload = lazyComponent._payload;
                var init = lazyComponent._init;
                try {
                  return describeUnknownElementTypeFrameInDEV(init(payload), source, ownerFn);
                } catch (x) {
                }
              }
            }
          }
          return "";
        }
        var loggedTypeFailures = {};
        var ReactDebugCurrentFrame$1 = ReactSharedInternals.ReactDebugCurrentFrame;
        function setCurrentlyValidatingElement(element) {
          {
            if (element) {
              var owner = element._owner;
              var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
              ReactDebugCurrentFrame$1.setExtraStackFrame(stack);
            } else {
              ReactDebugCurrentFrame$1.setExtraStackFrame(null);
            }
          }
        }
        function checkPropTypes(typeSpecs, values, location, componentName, element) {
          {
            var has = Function.call.bind(hasOwnProperty);
            for (var typeSpecName in typeSpecs) {
              if (has(typeSpecs, typeSpecName)) {
                var error$1 = void 0;
                try {
                  if (typeof typeSpecs[typeSpecName] !== "function") {
                    var err = Error((componentName || "React class") + ": " + location + " type `" + typeSpecName + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof typeSpecs[typeSpecName] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`.");
                    err.name = "Invariant Violation";
                    throw err;
                  }
                  error$1 = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED");
                } catch (ex) {
                  error$1 = ex;
                }
                if (error$1 && !(error$1 instanceof Error)) {
                  setCurrentlyValidatingElement(element);
                  error("%s: type specification of %s `%s` is invalid; the type checker function must return `null` or an `Error` but returned a %s. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).", componentName || "React class", location, typeSpecName, typeof error$1);
                  setCurrentlyValidatingElement(null);
                }
                if (error$1 instanceof Error && !(error$1.message in loggedTypeFailures)) {
                  loggedTypeFailures[error$1.message] = true;
                  setCurrentlyValidatingElement(element);
                  error("Failed %s type: %s", location, error$1.message);
                  setCurrentlyValidatingElement(null);
                }
              }
            }
          }
        }
        function setCurrentlyValidatingElement$1(element) {
          {
            if (element) {
              var owner = element._owner;
              var stack = describeUnknownElementTypeFrameInDEV(element.type, element._source, owner ? owner.type : null);
              setExtraStackFrame(stack);
            } else {
              setExtraStackFrame(null);
            }
          }
        }
        var propTypesMisspellWarningShown;
        {
          propTypesMisspellWarningShown = false;
        }
        function getDeclarationErrorAddendum() {
          if (ReactCurrentOwner.current) {
            var name = getComponentNameFromType(ReactCurrentOwner.current.type);
            if (name) {
              return "\n\nCheck the render method of `" + name + "`.";
            }
          }
          return "";
        }
        function getSourceInfoErrorAddendum(source) {
          if (source !== void 0) {
            var fileName = source.fileName.replace(/^.*[\\\/]/, "");
            var lineNumber = source.lineNumber;
            return "\n\nCheck your code at " + fileName + ":" + lineNumber + ".";
          }
          return "";
        }
        function getSourceInfoErrorAddendumForProps(elementProps) {
          if (elementProps !== null && elementProps !== void 0) {
            return getSourceInfoErrorAddendum(elementProps.__source);
          }
          return "";
        }
        var ownerHasKeyUseWarning = {};
        function getCurrentComponentErrorInfo(parentType) {
          var info = getDeclarationErrorAddendum();
          if (!info) {
            var parentName = typeof parentType === "string" ? parentType : parentType.displayName || parentType.name;
            if (parentName) {
              info = "\n\nCheck the top-level render call using <" + parentName + ">.";
            }
          }
          return info;
        }
        function validateExplicitKey(element, parentType) {
          if (!element._store || element._store.validated || element.key != null) {
            return;
          }
          element._store.validated = true;
          var currentComponentErrorInfo = getCurrentComponentErrorInfo(parentType);
          if (ownerHasKeyUseWarning[currentComponentErrorInfo]) {
            return;
          }
          ownerHasKeyUseWarning[currentComponentErrorInfo] = true;
          var childOwner = "";
          if (element && element._owner && element._owner !== ReactCurrentOwner.current) {
            childOwner = " It was passed a child from " + getComponentNameFromType(element._owner.type) + ".";
          }
          {
            setCurrentlyValidatingElement$1(element);
            error('Each child in a list should have a unique "key" prop.%s%s See https://reactjs.org/link/warning-keys for more information.', currentComponentErrorInfo, childOwner);
            setCurrentlyValidatingElement$1(null);
          }
        }
        function validateChildKeys(node, parentType) {
          if (typeof node !== "object") {
            return;
          }
          if (isArray(node)) {
            for (var i = 0; i < node.length; i++) {
              var child = node[i];
              if (isValidElement(child)) {
                validateExplicitKey(child, parentType);
              }
            }
          } else if (isValidElement(node)) {
            if (node._store) {
              node._store.validated = true;
            }
          } else if (node) {
            var iteratorFn = getIteratorFn(node);
            if (typeof iteratorFn === "function") {
              if (iteratorFn !== node.entries) {
                var iterator = iteratorFn.call(node);
                var step;
                while (!(step = iterator.next()).done) {
                  if (isValidElement(step.value)) {
                    validateExplicitKey(step.value, parentType);
                  }
                }
              }
            }
          }
        }
        function validatePropTypes(element) {
          {
            var type = element.type;
            if (type === null || type === void 0 || typeof type === "string") {
              return;
            }
            var propTypes;
            if (typeof type === "function") {
              propTypes = type.propTypes;
            } else if (typeof type === "object" && (type.$$typeof === REACT_FORWARD_REF_TYPE || // Note: Memo only checks outer props here.
            // Inner props are checked in the reconciler.
            type.$$typeof === REACT_MEMO_TYPE)) {
              propTypes = type.propTypes;
            } else {
              return;
            }
            if (propTypes) {
              var name = getComponentNameFromType(type);
              checkPropTypes(propTypes, element.props, "prop", name, element);
            } else if (type.PropTypes !== void 0 && !propTypesMisspellWarningShown) {
              propTypesMisspellWarningShown = true;
              var _name = getComponentNameFromType(type);
              error("Component %s declared `PropTypes` instead of `propTypes`. Did you misspell the property assignment?", _name || "Unknown");
            }
            if (typeof type.getDefaultProps === "function" && !type.getDefaultProps.isReactClassApproved) {
              error("getDefaultProps is only used on classic React.createClass definitions. Use a static property named `defaultProps` instead.");
            }
          }
        }
        function validateFragmentProps(fragment) {
          {
            var keys = Object.keys(fragment.props);
            for (var i = 0; i < keys.length; i++) {
              var key = keys[i];
              if (key !== "children" && key !== "key") {
                setCurrentlyValidatingElement$1(fragment);
                error("Invalid prop `%s` supplied to `React.Fragment`. React.Fragment can only have `key` and `children` props.", key);
                setCurrentlyValidatingElement$1(null);
                break;
              }
            }
            if (fragment.ref !== null) {
              setCurrentlyValidatingElement$1(fragment);
              error("Invalid attribute `ref` supplied to `React.Fragment`.");
              setCurrentlyValidatingElement$1(null);
            }
          }
        }
        function createElementWithValidation(type, props, children) {
          var validType = isValidElementType(type);
          if (!validType) {
            var info = "";
            if (type === void 0 || typeof type === "object" && type !== null && Object.keys(type).length === 0) {
              info += " You likely forgot to export your component from the file it's defined in, or you might have mixed up default and named imports.";
            }
            var sourceInfo = getSourceInfoErrorAddendumForProps(props);
            if (sourceInfo) {
              info += sourceInfo;
            } else {
              info += getDeclarationErrorAddendum();
            }
            var typeString;
            if (type === null) {
              typeString = "null";
            } else if (isArray(type)) {
              typeString = "array";
            } else if (type !== void 0 && type.$$typeof === REACT_ELEMENT_TYPE) {
              typeString = "<" + (getComponentNameFromType(type.type) || "Unknown") + " />";
              info = " Did you accidentally export a JSX literal instead of a component?";
            } else {
              typeString = typeof type;
            }
            {
              error("React.createElement: type is invalid -- expected a string (for built-in components) or a class/function (for composite components) but got: %s.%s", typeString, info);
            }
          }
          var element = createElement.apply(this, arguments);
          if (element == null) {
            return element;
          }
          if (validType) {
            for (var i = 2; i < arguments.length; i++) {
              validateChildKeys(arguments[i], type);
            }
          }
          if (type === REACT_FRAGMENT_TYPE) {
            validateFragmentProps(element);
          } else {
            validatePropTypes(element);
          }
          return element;
        }
        var didWarnAboutDeprecatedCreateFactory = false;
        function createFactoryWithValidation(type) {
          var validatedFactory = createElementWithValidation.bind(null, type);
          validatedFactory.type = type;
          {
            if (!didWarnAboutDeprecatedCreateFactory) {
              didWarnAboutDeprecatedCreateFactory = true;
              warn("React.createFactory() is deprecated and will be removed in a future major release. Consider using JSX or use React.createElement() directly instead.");
            }
            Object.defineProperty(validatedFactory, "type", {
              enumerable: false,
              get: function() {
                warn("Factory.type is deprecated. Access the class directly before passing it to createFactory.");
                Object.defineProperty(this, "type", {
                  value: type
                });
                return type;
              }
            });
          }
          return validatedFactory;
        }
        function cloneElementWithValidation(element, props, children) {
          var newElement = cloneElement.apply(this, arguments);
          for (var i = 2; i < arguments.length; i++) {
            validateChildKeys(arguments[i], newElement.type);
          }
          validatePropTypes(newElement);
          return newElement;
        }
        function startTransition(scope, options) {
          var prevTransition = ReactCurrentBatchConfig.transition;
          ReactCurrentBatchConfig.transition = {};
          var currentTransition = ReactCurrentBatchConfig.transition;
          {
            ReactCurrentBatchConfig.transition._updatedFibers = /* @__PURE__ */ new Set();
          }
          try {
            scope();
          } finally {
            ReactCurrentBatchConfig.transition = prevTransition;
            {
              if (prevTransition === null && currentTransition._updatedFibers) {
                var updatedFibersCount = currentTransition._updatedFibers.size;
                if (updatedFibersCount > 10) {
                  warn("Detected a large number of updates inside startTransition. If this is due to a subscription please re-write it to use React provided hooks. Otherwise concurrent mode guarantees are off the table.");
                }
                currentTransition._updatedFibers.clear();
              }
            }
          }
        }
        var didWarnAboutMessageChannel = false;
        var enqueueTaskImpl = null;
        function enqueueTask(task) {
          if (enqueueTaskImpl === null) {
            try {
              var requireString = ("require" + Math.random()).slice(0, 7);
              var nodeRequire = module && module[requireString];
              enqueueTaskImpl = nodeRequire.call(module, "timers").setImmediate;
            } catch (_err) {
              enqueueTaskImpl = function(callback) {
                {
                  if (didWarnAboutMessageChannel === false) {
                    didWarnAboutMessageChannel = true;
                    if (typeof MessageChannel === "undefined") {
                      error("This browser does not have a MessageChannel implementation, so enqueuing tasks via await act(async () => ...) will fail. Please file an issue at https://github.com/facebook/react/issues if you encounter this warning.");
                    }
                  }
                }
                var channel = new MessageChannel();
                channel.port1.onmessage = callback;
                channel.port2.postMessage(void 0);
              };
            }
          }
          return enqueueTaskImpl(task);
        }
        var actScopeDepth = 0;
        var didWarnNoAwaitAct = false;
        function act(callback) {
          {
            var prevActScopeDepth = actScopeDepth;
            actScopeDepth++;
            if (ReactCurrentActQueue.current === null) {
              ReactCurrentActQueue.current = [];
            }
            var prevIsBatchingLegacy = ReactCurrentActQueue.isBatchingLegacy;
            var result;
            try {
              ReactCurrentActQueue.isBatchingLegacy = true;
              result = callback();
              if (!prevIsBatchingLegacy && ReactCurrentActQueue.didScheduleLegacyUpdate) {
                var queue = ReactCurrentActQueue.current;
                if (queue !== null) {
                  ReactCurrentActQueue.didScheduleLegacyUpdate = false;
                  flushActQueue(queue);
                }
              }
            } catch (error2) {
              popActScope(prevActScopeDepth);
              throw error2;
            } finally {
              ReactCurrentActQueue.isBatchingLegacy = prevIsBatchingLegacy;
            }
            if (result !== null && typeof result === "object" && typeof result.then === "function") {
              var thenableResult = result;
              var wasAwaited = false;
              var thenable = {
                then: function(resolve, reject) {
                  wasAwaited = true;
                  thenableResult.then(function(returnValue2) {
                    popActScope(prevActScopeDepth);
                    if (actScopeDepth === 0) {
                      recursivelyFlushAsyncActWork(returnValue2, resolve, reject);
                    } else {
                      resolve(returnValue2);
                    }
                  }, function(error2) {
                    popActScope(prevActScopeDepth);
                    reject(error2);
                  });
                }
              };
              {
                if (!didWarnNoAwaitAct && typeof Promise !== "undefined") {
                  Promise.resolve().then(function() {
                  }).then(function() {
                    if (!wasAwaited) {
                      didWarnNoAwaitAct = true;
                      error("You called act(async () => ...) without await. This could lead to unexpected testing behaviour, interleaving multiple act calls and mixing their scopes. You should - await act(async () => ...);");
                    }
                  });
                }
              }
              return thenable;
            } else {
              var returnValue = result;
              popActScope(prevActScopeDepth);
              if (actScopeDepth === 0) {
                var _queue = ReactCurrentActQueue.current;
                if (_queue !== null) {
                  flushActQueue(_queue);
                  ReactCurrentActQueue.current = null;
                }
                var _thenable = {
                  then: function(resolve, reject) {
                    if (ReactCurrentActQueue.current === null) {
                      ReactCurrentActQueue.current = [];
                      recursivelyFlushAsyncActWork(returnValue, resolve, reject);
                    } else {
                      resolve(returnValue);
                    }
                  }
                };
                return _thenable;
              } else {
                var _thenable2 = {
                  then: function(resolve, reject) {
                    resolve(returnValue);
                  }
                };
                return _thenable2;
              }
            }
          }
        }
        function popActScope(prevActScopeDepth) {
          {
            if (prevActScopeDepth !== actScopeDepth - 1) {
              error("You seem to have overlapping act() calls, this is not supported. Be sure to await previous act() calls before making a new one. ");
            }
            actScopeDepth = prevActScopeDepth;
          }
        }
        function recursivelyFlushAsyncActWork(returnValue, resolve, reject) {
          {
            var queue = ReactCurrentActQueue.current;
            if (queue !== null) {
              try {
                flushActQueue(queue);
                enqueueTask(function() {
                  if (queue.length === 0) {
                    ReactCurrentActQueue.current = null;
                    resolve(returnValue);
                  } else {
                    recursivelyFlushAsyncActWork(returnValue, resolve, reject);
                  }
                });
              } catch (error2) {
                reject(error2);
              }
            } else {
              resolve(returnValue);
            }
          }
        }
        var isFlushing = false;
        function flushActQueue(queue) {
          {
            if (!isFlushing) {
              isFlushing = true;
              var i = 0;
              try {
                for (; i < queue.length; i++) {
                  var callback = queue[i];
                  do {
                    callback = callback(true);
                  } while (callback !== null);
                }
                queue.length = 0;
              } catch (error2) {
                queue = queue.slice(i + 1);
                throw error2;
              } finally {
                isFlushing = false;
              }
            }
          }
        }
        var createElement$1 = createElementWithValidation;
        var cloneElement$1 = cloneElementWithValidation;
        var createFactory = createFactoryWithValidation;
        var Children = {
          map: mapChildren,
          forEach: forEachChildren,
          count: countChildren,
          toArray,
          only: onlyChild
        };
        exports.Children = Children;
        exports.Component = Component;
        exports.Fragment = REACT_FRAGMENT_TYPE;
        exports.Profiler = REACT_PROFILER_TYPE;
        exports.PureComponent = PureComponent;
        exports.StrictMode = REACT_STRICT_MODE_TYPE;
        exports.Suspense = REACT_SUSPENSE_TYPE;
        exports.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = ReactSharedInternals;
        exports.act = act;
        exports.cloneElement = cloneElement$1;
        exports.createContext = createContext;
        exports.createElement = createElement$1;
        exports.createFactory = createFactory;
        exports.createRef = createRef;
        exports.forwardRef = forwardRef;
        exports.isValidElement = isValidElement;
        exports.lazy = lazy;
        exports.memo = memo;
        exports.startTransition = startTransition;
        exports.unstable_act = act;
        exports.useCallback = useCallback;
        exports.useContext = useContext;
        exports.useDebugValue = useDebugValue;
        exports.useDeferredValue = useDeferredValue;
        exports.useEffect = useEffect;
        exports.useId = useId3;
        exports.useImperativeHandle = useImperativeHandle;
        exports.useInsertionEffect = useInsertionEffect;
        exports.useLayoutEffect = useLayoutEffect;
        exports.useMemo = useMemo;
        exports.useReducer = useReducer;
        exports.useRef = useRef;
        exports.useState = useState;
        exports.useSyncExternalStore = useSyncExternalStore;
        exports.useTransition = useTransition;
        exports.version = ReactVersion;
        if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ !== "undefined" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop === "function") {
          __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(new Error());
        }
      })();
    }
  }
});

// node_modules/react/index.js
var require_react = __commonJS({
  "node_modules/react/index.js"(exports, module) {
    "use strict";
    init_define_import_meta_env();
    if (process.env.NODE_ENV === "production") {
      module.exports = require_react_production_min();
    } else {
      module.exports = require_react_development();
    }
  }
});

// src/game/index.js
init_define_import_meta_env();

// src/utils/player.js
init_define_import_meta_env();

// src/data/firstPurchaseWeapons.js
init_define_import_meta_env();
var FIRST_PURCHASE_WEAPONS = {
  warrior: { name: "Kurucu Topuzu", appearance: "Totem Topuzu", reference: "K\u0131r\u0131c\u0131 G\xFCrz" },
  rogue: { name: "\u015Eafak Kanad\u0131", appearance: "Yelkanat", reference: "Boynuz Arbalet" },
  mage: { name: "Y\u0131ld\u0131z Yemini", appearance: "Cennetbah\xE7e", reference: "Demir U\xE7lu Asa" }
};
var isFirstPurchaseWeapon = (item) => item?.kind === "weapon" && Object.values(FIRST_PURCHASE_WEAPONS).some((w) => w.name === item.name);

// src/data/classes.js
init_define_import_meta_env();

// src/components/icons/ClassEmblems.jsx
init_define_import_meta_env();
var import_react = __toESM(require_react(), 1);
function Emblem({ type, size = 24, color, ...props }) {
  const id = (0, import_react.useId)(), accent = type === "warrior" ? "#e99b68" : type === "rogue" ? "#8be0ae" : "#b9a1ff";
  return /* @__PURE__ */ React.createElement("svg", { ...props, width: size, height: size, viewBox: "0 0 64 64", fill: "none", "aria-hidden": "true" }, /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("linearGradient", { id, x2: ".8", y2: "1" }, /* @__PURE__ */ React.createElement("stop", { stopColor: "#fff2cb" }), /* @__PURE__ */ React.createElement("stop", { offset: ".48", stopColor: "#c5a473" }), /* @__PURE__ */ React.createElement("stop", { offset: "1", stopColor: "#725130" }))), /* @__PURE__ */ React.createElement("path", { d: "M32 3L56 15V37L45 52L32 61L19 52L8 37V15Z", fill: "#121c26", stroke: `url(#${id})`, strokeWidth: "2" }), /* @__PURE__ */ React.createElement("path", { d: "M32 8L51 18V36L41 48L32 55L23 48L13 36V18Z", fill: accent, fillOpacity: ".13", stroke: accent, strokeOpacity: ".35" }), type === "warrior" ? /* @__PURE__ */ React.createElement("g", { strokeLinejoin: "round" }, /* @__PURE__ */ React.createElement("path", { d: "M32 10L38 22L34 41H30L26 22Z", fill: "#dceaf0", stroke: "#738a9d" }), /* @__PURE__ */ React.createElement("path", { d: "M21 37L32 41L43 37L41 43L34 45V53H30V45L23 43Z", fill: `url(#${id})` }), /* @__PURE__ */ React.createElement("path", { d: "M32 14V37", stroke: "white" })) : type === "rogue" ? /* @__PURE__ */ React.createElement("g", { strokeLinecap: "round", strokeLinejoin: "round" }, /* @__PURE__ */ React.createElement("path", { d: "M22 12Q53 32 22 52", stroke: `url(#${id})`, strokeWidth: "5" }), /* @__PURE__ */ React.createElement("path", { d: "M22 12L30 32L22 52", stroke: "#d5ecdc", strokeWidth: "1.4" }), /* @__PURE__ */ React.createElement("path", { d: "M14 40L46 23", stroke: "#d6e7dd", strokeWidth: "3" }), /* @__PURE__ */ React.createElement("path", { d: "M47 22L40 24L44 29Z", fill: accent }), /* @__PURE__ */ React.createElement("path", { d: "M14 40L14 34M18 38L18 32", stroke: accent, strokeWidth: "2" })) : /* @__PURE__ */ React.createElement("g", null, /* @__PURE__ */ React.createElement("path", { d: "M28 34L24 53L30 55L35 34", fill: `url(#${id})` }), /* @__PURE__ */ React.createElement("path", { d: "M34 10L43 24L34 39L24 24Z", fill: accent, stroke: "#efe5ff", strokeWidth: "1.5" }), /* @__PURE__ */ React.createElement("path", { d: "M34 10L33 26L43 24M33 26L34 39L24 24Z", fill: "#6659b4" }), /* @__PURE__ */ React.createElement("path", { d: "M20 19L17 22M47 34L50 37M46 13V18M44 15H49", stroke: "#e6d2ff", strokeWidth: "2" })));
}
var WarriorEmblem = (props) => /* @__PURE__ */ React.createElement(Emblem, { ...props, type: "warrior" });
var RogueEmblem = (props) => /* @__PURE__ */ React.createElement(Emblem, { ...props, type: "rogue" });
var MageEmblem = (props) => /* @__PURE__ */ React.createElement(Emblem, { ...props, type: "mage" });

// src/data/classes.js
var CLASSES = {
  warrior: {
    name: "Warrior",
    icon: WarriorEmblem,
    color: "#C97A3D",
    atk: 13,
    def: 9,
    maxHp: 130,
    maxMp: 20,
    crit: 0.05,
    mainStat: "str",
    baseStats: { str: 65, sta: 60, dex: 60, int: 50, mag: 50 },
    desc: "Kal\u0131n z\u0131rh, sa\u011Flam yumruk. \xD6n safta durur."
  },
  rogue: {
    name: "Rogue",
    icon: RogueEmblem,
    color: "#8B6FC9",
    atk: 15,
    def: 5,
    maxHp: 95,
    maxMp: 30,
    crit: 0.28,
    mainStat: "dex",
    baseStats: { str: 60, sta: 60, dex: 70, int: 50, mag: 50 },
    desc: "Yay kullanan menzilli ok\xE7u. H\u0131zl\u0131 at\u0131\u015Flar ve g\xFC\xE7l\xFC kritikler."
  },
  mage: {
    name: "Mage",
    icon: MageEmblem,
    color: "#4FC3D9",
    atk: 19,
    def: 3,
    maxHp: 75,
    maxMp: 65,
    crit: 0.1,
    mainStat: "mag",
    baseStats: { str: 50, sta: 50, dex: 60, int: 70, mag: 70 },
    desc: "Y\xFCksek hasar, d\xFC\u015F\xFCk can. Mana y\xF6netimi \u015Fart."
  }
};

// src/data/stats.js
init_define_import_meta_env();
var STAT_KEYS = ["str", "sta", "dex", "int", "mag"];
var STAT_LABELS = { str: "STR", sta: "STA", dex: "DEX", int: "INT", mag: "MPW", hp: "HP", mp: "MP", level: "Lv." };
var POINTS_PER_LEVEL = 3;
var STAT_CAP = 255;

// src/utils/inventory.js
init_define_import_meta_env();

// src/data/potions.js
init_define_import_meta_env();
var HP_POTION_TIERS = [90, 180, 360, 720];
var MP_POTION_TIERS = [240, 480, 960, 1920];
var POTION_TIER_NAMES = {
  tr: {
    hp: ["K\xFC\xE7\xFCk Can \u0130ksiri", "Can \u0130ksiri", "B\xFCy\xFCk Can \u0130ksiri", "Muazzam Can \u0130ksiri"],
    mp: ["Mana \u0130ksiri", "B\xFCy\xFCk Mana \u0130ksiri", "Muazzam Mana \u0130ksiri", "Efsanevi Mana \u0130ksiri"]
  },
  en: {
    hp: ["Small Health Potion", "Health Potion", "Greater Health Potion", "Superior Health Potion"],
    mp: ["Mana Potion", "Greater Mana Potion", "Superior Mana Potion", "Legendary Mana Potion"]
  }
};
var POTION_TIER_PRICES = {
  hp: [12, 24, 48, 96],
  mp: [32, 64, 128, 256]
};
function potionTiersFor(potionType) {
  return potionType === "hp" ? HP_POTION_TIERS : MP_POTION_TIERS;
}
function potionAmount(potionType, tier) {
  return potionTiersFor(potionType)[tier - 1] || 0;
}
function potionName(potionType, tier, lang = "tr") {
  const names = POTION_TIER_NAMES[lang] || POTION_TIER_NAMES.tr;
  return names[potionType]?.[tier - 1] || (potionType === "hp" ? names.hp[1] : names.mp[0]);
}
function potionPrice(potionType, tier) {
  return POTION_TIER_PRICES[potionType]?.[tier - 1] || 0;
}

// src/data/clanDungeon.js
init_define_import_meta_env();
var CLAN_DUNGEON_COOLDOWN_MS = 20 * 60 * 1e3;
var CLAN_DUNGEON_LOCK_TIMEOUT_MS = 90 * 1e3;
var CLAN_DUNGEON_MATERIALS = {
  wood: { key: "wood", id: "clan-material-wood", name: "Odun", tier: 1, color: "#8B5A2B", dropChance: 0.35 },
  silver: { key: "silver", id: "clan-material-silver", name: "G\xFCm\xFC\u015F", tier: 2, color: "#B8C2CC", dropChance: 1 },
  iron: { key: "iron", id: "clan-material-iron", name: "Demir", tier: 3, color: "#8C92AC", dropChance: 0.35 },
  goldBar: { key: "goldBar", id: "clan-material-gold-bar", name: "Alt\u0131n K\xFCl\xE7esi", tier: 4, color: "#D4AF6A", dropChance: 1 }
};

// src/utils/random.js
init_define_import_meta_env();
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function uid() {
  return Math.random().toString(36).slice(2, 10);
}

// src/utils/inventory.js
var BAG_COLUMNS = 8;
var BAG_ROWS = 4;
var BAG_SLOTS = BAG_COLUMNS * BAG_ROWS;
var CLASS_BASE_WEIGHT = { warrior: 180, rogue: 140, mage: 100 };
var STR_WEIGHT_FACTOR = 1.6;
var LEVEL_WEIGHT_PER_LEVEL = 3;
function bagWeightCapacity(player) {
  const equippedStr = Object.values(player.equipped).reduce((s, it) => s + (it?.statBonus?.str || 0), 0);
  const totalStr = (player.stats?.str || 0) + equippedStr;
  const base = CLASS_BASE_WEIGHT[player.class] ?? 60;
  return Math.round(base + player.level * LEVEL_WEIGHT_PER_LEVEL + totalStr * STR_WEIGHT_FACTOR);
}
function bagWeightUsed(player) {
  return player.inventory.reduce((sum, it) => sum + (it.weight || 0) * (it.count || 1), 0);
}
function potionStackKey(potionType, tier) {
  return `potion:${potionType}:${tier}`;
}
function makePotionStack(potionType, tier, count) {
  return {
    id: potionStackKey(potionType, tier),
    kind: "potion",
    potionType,
    tier,
    name: potionName(potionType, tier),
    count,
    weight: 1,
    stackable: true,
    stackKey: potionStackKey(potionType, tier)
  };
}
function scrollStackKey(tier) {
  return `scroll:${tier}`;
}
function makeScrollStack(tier, count) {
  return {
    id: scrollStackKey(tier),
    kind: "scroll",
    tier,
    name: `T${tier} Y\xFCkseltme Par\u015F\xF6meni`,
    count,
    weight: 0.5,
    stackable: true,
    stackKey: scrollStackKey(tier)
  };
}
var RACE_SCROLL_ID = "race-change-scroll";
function makeRaceScroll(count = 1) {
  return {
    id: RACE_SCROLL_ID,
    kind: "raceScroll",
    name: "Irk De\u011Fi\u015Ftirme Par\u015F\xF6meni",
    count,
    weight: 0.5,
    stackable: true,
    stackKey: RACE_SCROLL_ID
  };
}
var JOB_SCROLL_ID = "job-change-scroll";
function makeJobScroll(count = 1) {
  return {
    id: JOB_SCROLL_ID,
    kind: "jobScroll",
    name: "Job De\u011Fi\u015Ftirme Ka\u011F\u0131d\u0131",
    count,
    weight: 0.5,
    stackable: true,
    stackKey: JOB_SCROLL_ID
  };
}
function makeBonusScrollStack() {
  return {
    id: uid(),
    kind: "bonusScroll",
    name: "Bonus Par\u015F\xF6men",
    desc: "Silah ve z\u0131rh y\xFCkseltmesinde kullan\u0131lan bir e\u015Fya. Bu, e\u015Fyan\u0131n yok olmayaca\u011F\u0131n\u0131n garantisi de\u011Fildir. Sadece y\xFCkseltme \u015Fans\u0131n\u0131 art\u0131r\u0131r.",
    weight: 0.5,
    stackable: false
  };
}
var ACCESSORY_SCROLL_ID = "accessory-upgrade-scroll";
function makeAccessoryScrollStack(count = 1) {
  return {
    id: ACCESSORY_SCROLL_ID,
    kind: "accessoryScroll",
    name: "Aksesuar Y\xFCkseltme Ka\u011F\u0131d\u0131",
    count,
    weight: 0.5,
    stackable: true,
    stackKey: ACCESSORY_SCROLL_ID
  };
}
function makeClanMaterialStack(materialKey, count = 1) {
  const def = CLAN_DUNGEON_MATERIALS[materialKey];
  return {
    id: `clanMaterial:${materialKey}`,
    kind: "clanMaterial",
    materialKey,
    name: def.name,
    tier: def.tier,
    color: def.color,
    count,
    weight: 0.2,
    stackable: true,
    stackKey: `clanMaterial:${materialKey}`
  };
}
function stackKeyOf(item) {
  return item.stackable ? item.stackKey || `${item.kind}:${item.name}` : null;
}
function addItemToInventory(player, item) {
  const weightCap = bagWeightCapacity(player);
  const usedWeight = bagWeightUsed(player);
  const incomingWeight = (item.weight || 0) * (item.count || 1);
  if (item.stackable) {
    const key = stackKeyOf(item);
    const existingIdx = player.inventory.findIndex((i) => i.stackable && stackKeyOf(i) === key);
    if (existingIdx >= 0) {
      if (usedWeight + incomingWeight > weightCap) {
        return { player, added: false, reason: "a\u011F\u0131rl\u0131k kapasitesi dolu." };
      }
      const inventory = player.inventory.map(
        (i, idx) => idx === existingIdx ? { ...i, count: (i.count || 1) + (item.count || 1) } : i
      );
      return { player: { ...player, inventory }, added: true };
    }
  }
  if (player.inventory.length >= BAG_SLOTS) {
    return { player, added: false, reason: "\xE7anta dolu." };
  }
  if (usedWeight + incomingWeight > weightCap) {
    return { player, added: false, reason: "a\u011F\u0131rl\u0131k kapasitesi dolu." };
  }
  return { player: { ...player, inventory: [...player.inventory, item] }, added: true };
}
var BANK_PAGE_SLOTS = BAG_SLOTS;
function depositToBank(player, item, bank, pageIndex) {
  const page = bank[pageIndex];
  if (item.stackable) {
    const key = stackKeyOf(item);
    const existingIdx = page.findIndex((i) => i.stackable && stackKeyOf(i) === key);
    if (existingIdx >= 0) {
      const nextBank2 = bank.map((p, idx) => idx !== pageIndex ? p : p.map((i, j) => j === existingIdx ? { ...i, count: (i.count || 1) + (item.count || 1) } : i));
      const inventory2 = player.inventory.filter((i) => i.id !== item.id);
      return { player: { ...player, inventory: inventory2 }, bank: nextBank2, moved: true };
    }
  }
  if (page.length >= BANK_PAGE_SLOTS) return { player, bank, moved: false, reason: "bankPageFull" };
  const inventory = player.inventory.filter((i) => i.id !== item.id);
  const nextBank = bank.map((p, idx) => idx !== pageIndex ? p : [...p, item]);
  return { player: { ...player, inventory }, bank: nextBank, moved: true };
}
function addItemToAnyBankPage(item, bank) {
  if (item.stackable) {
    const key = stackKeyOf(item);
    for (let i = 0; i < bank.length; i++) {
      const existingIdx = bank[i].findIndex((it) => it.stackable && stackKeyOf(it) === key);
      if (existingIdx >= 0) {
        const nextBank2 = bank.map((p, idx) => idx !== i ? p : p.map((it, j) => j === existingIdx ? { ...it, count: (it.count || 1) + (item.count || 1) } : it));
        return { bank: nextBank2, added: true };
      }
    }
  }
  const pageIdx = bank.findIndex((p) => p.length < BANK_PAGE_SLOTS);
  if (pageIdx === -1) return { bank, added: false, reason: "depo dolu." };
  const nextBank = bank.map((p, idx) => idx !== pageIdx ? p : [...p, item]);
  return { bank: nextBank, added: true };
}
var EXTRA_BANK_PAGE_COST_DIAMONDS = 400;
var MAX_BANK_PAGES = 8;
function buyExtraBankPage(player, bank) {
  if (bank.length >= MAX_BANK_PAGES) return { player, bank, bought: false, reason: "maxBankPages" };
  if (player.diamonds < EXTRA_BANK_PAGE_COST_DIAMONDS) return { player, bank, bought: false, reason: "notEnoughDiamonds" };
  const nextPlayer = { ...player, diamonds: player.diamonds - EXTRA_BANK_PAGE_COST_DIAMONDS };
  const nextBank = [...bank, []];
  return { player: nextPlayer, bank: nextBank, bought: true };
}
function withdrawFromBank(player, item, bank, pageIndex) {
  const result = addItemToInventory(player, item);
  if (!result.added) return { player, bank, moved: false, reason: result.reason };
  const nextBank = bank.map((p, idx) => idx !== pageIndex ? p : p.filter((i) => i.id !== item.id));
  return { player: result.player, bank: nextBank, moved: true };
}

// src/data/itemNameTranslations.js
init_define_import_meta_env();

// src/utils/itemDisplay.js
init_define_import_meta_env();

// src/data/armor.js
init_define_import_meta_env();

// src/components/icons/CatalogIcons.js
init_define_import_meta_env();
var import_react2 = __toESM(require_react(), 1);
var art = { "Sparkles": "M16 2L20 12L30 16L20 20L16 30L12 20L2 16L12 12Z", "Flame": "M16 2Q24 10 18 15L25 10Q35 28 16 30Q0 28 6 15L12 9Q8 23 15 19Q20 13 16 2Z", "Moon": "M23 3A14 14 0 1 0 29 24A16 16 0 0 1 23 3Z", "Shield": "M16 3L28 8V18Q27 25 16 30Q5 25 4 18V8Z", "ShieldHalf": "M16 3L28 8V18Q27 25 16 30Q5 25 4 18V8ZM16 4V29", "Skull": "M8 21Q0 5 16 3Q32 5 24 21L23 29H9ZM10 12L14 15L10 18L7 15ZM22 12L18 15L22 18L25 15Z", "Compass": "M30 16A14 14 0 1 1 2 16A14 14 0 1 1 30 16ZM21 10L18 20L10 23L13 13Z", "Mountain": "M2 28L13 4L19 17L24 9L31 28ZM9 14L13 17L17 14", "Crown": "M3 8L10 15L16 3L22 15L29 8L25 28H7Z", "Hammer": "M8 29L21 12M15 5L22 1L31 12L25 18Z", "Swords": "M4 2L8 4L26 25L23 28L5 9ZM28 2L24 4L6 25L9 28L27 9Z", "Gift": "M3 12H29V29H3ZM2 8H30V15H2ZM16 8V29M16 8C1 5 9 -4 16 8C31 5 23 -4 16 8" };
function icon(name) {
  return function CatalogIcon({ size = 24, ...props }) {
    const id = (0, import_react2.useId)();
    return (0, import_react2.createElement)("svg", { viewBox: "0 0 32 32", width: size, height: size, fill: `url(#${id})`, stroke: "#f2d99c", strokeWidth: 1.5, strokeLinejoin: "round", "aria-hidden": true, ...props }, (0, import_react2.createElement)("defs", null, (0, import_react2.createElement)("linearGradient", { id, x2: "1", y2: "1" }, (0, import_react2.createElement)("stop", { stopColor: "#f9e4aa" }), (0, import_react2.createElement)("stop", { offset: ".55", stopColor: "#bca16a" }), (0, import_react2.createElement)("stop", { offset: "1", stopColor: "#735137" }))), (0, import_react2.createElement)("path", { d: art[name] }));
  };
}
var Sparkles = icon("Sparkles");
var Flame = icon("Flame");
var Moon = icon("Moon");
var Shield = icon("Shield");
var ShieldHalf = icon("ShieldHalf");
var Skull = icon("Skull");
var Compass = icon("Compass");
var Mountain = icon("Mountain");
var Crown = icon("Crown");
var Hammer = icon("Hammer");
var Swords = icon("Swords");
var Gift = icon("Gift");

// src/data/armor.js
var SLOTS = [
  { key: "head", label: "Kask", icon: Shield },
  { key: "chest", label: "G\xF6\u011F\xFCsl\xFCk", icon: ShieldHalf },
  { key: "legs", label: "Don/Bacakl\u0131k", icon: Shield },
  { key: "gauntlets", label: "Eldiven", icon: Shield },
  { key: "boots", label: "Bot", icon: Shield }
];

// src/data/warriorWeapons.js
init_define_import_meta_env();
var WEAPON_TYPE_ICON = {
  dagger: "dagger",
  sword: "sword",
  axe: "axe",
  mace: "hammer",
  spear: "spear",
  longspear: "spear",
  shield: "shield",
  bow: "bow",
  longbow: "bow",
  staff: "staff",
  javelin: "spear"
};
var WEAPON_TYPE_SPEED = {
  dagger: "H\u0131zl\u0131",
  sword: "Yava\u015F",
  axe: "Yava\u015F",
  mace: "Yava\u015F",
  hammer: "Yava\u015F",
  spear: "Normal",
  longspear: "\xC7ok Yava\u015F",
  shield: "Normal",
  bow: "Yava\u015F",
  longbow: "Yava\u015F",
  staff: "Yava\u015F",
  javelin: "Normal",
  book: "Yava\u015F",
  orb: "Yava\u015F",
  talisman: "Normal"
};
var WEAPON_TYPE_RANGE = {
  dagger: 2,
  sword: 1.5,
  axe: 1.5,
  mace: 1.5,
  hammer: 2.5,
  spear: 3.5,
  longspear: 2,
  shield: 2,
  bow: 40,
  longbow: 45,
  staff: 3,
  javelin: 12,
  book: 3,
  orb: 3,
  talisman: 2.5
};
function weaponDurability(tierId) {
  return tierId * 1500;
}
function gianticAxeLevel(atk, strBonus, hp, lightning, reqStr, resFrom6) {
  return {
    atk,
    hp,
    mp: hp,
    elementBonus: lightning,
    statBonus: { str: strBonus },
    reqStats: [{ key: "str", value: reqStr }],
    resistances: resFrom6 ? { flame: resFrom6, glacier: resFrom6, lightning: resFrom6 } : { flame: 0, glacier: 0, lightning: 0 }
  };
}
function simpleWeaponLevel(atk, elementDmg, reqStr, durability, itemGrade) {
  return { atk, elementBonus: elementDmg, reqStats: [{ key: "str", value: reqStr }], durability, itemGrade };
}
function avedonLevel(atk, hp, glacier, reqStr, durability) {
  return {
    atk,
    hp,
    mp: hp,
    elementBonus: glacier,
    reqStats: [{ key: "str", value: reqStr }, { key: "hp", value: 80 }],
    durability
  };
}
function stormweaverLevel(atk, bonus, lightning, reqStr, durability, glacierRes) {
  return {
    atk,
    hp: bonus,
    statBonus: { str: bonus },
    elementBonus: lightning,
    reqStats: [{ key: "str", value: reqStr }],
    resistances: { flame: 0, glacier: glacierRes, lightning: 0 },
    durability
  };
}
function hellBreakerLevel(atk, strBonus, flame, reqStr, durability) {
  return {
    atk,
    statBonus: { str: strBonus },
    elementBonus: flame,
    reqStats: [{ key: "str", value: reqStr }],
    durability
  };
}
var WARRIOR_WEAPONS = [
  // Giantic Axe — kullanıcının isteğiyle YENİDEN tasarlandı: eski hali
  // (tek el, yan el/offHand slotu, Mızrak'ın yanında ikinci silah olarak)
  // tamamen kaldırıldı — oyun artık tek silah slotlu (bkz.
  // utils/player.js#equipItem, data/paperdoll.js). Yeni hali çift el
  // (twoHand), "Axe" kategorisinde, T6 Eşsiz. Aynı pixel-art görseli
  // (src/assets/items/giantic-axe.svg, isim aynı kaldığı için
  // data/itemImages.js'te değişiklik gerekmedi). Kullanıcının ekran
  // görüntüsündeki +1'den +10'a TAM tablo birebir girildi (levels dizisi,
  // bkz. utils/upgrade.js#statsAtLevel/applyLevelData). Durability 15000 ve
  // Ağırlık 12.00 her seviyede sabit. Oyunun asıl forge tavanı hâlâ +8
  // (MAX_UPGRADE_LEVEL) — +9/+10 verisi burada duruyor ama GmItemPanel
  // dışında normal forge ile henüz erişilemiyor. Tier 6 eşyalar takas/satış
  // edilebilir (kullanıcının kuralı) — noTrade yok.
  {
    tier: 6,
    levelMin: 60,
    levelMax: 65,
    name: "G\xF6kdev Baltas\u0131",
    weaponType: "axe",
    weaponSlot: "twoHand",
    durability: 15e3,
    weight: 12,
    element: "lightning",
    lore: "*Devlerin d\xF6vd\xFC\u011F\xFC bu balta, tek elle savrulacak kadar hafif de\u011Fil \u2014 ama onu kald\u0131rabilen i\xE7in y\u0131ld\u0131r\u0131m kadar h\u0131zl\u0131 d\xFC\u015Fer.*",
    levels: [
      gianticAxeLevel(134, 5, 100, 50, 142),
      // +1
      gianticAxeLevel(140, 6, 130, 60, 143),
      // +2
      gianticAxeLevel(146, 7, 160, 70, 144),
      // +3
      gianticAxeLevel(152, 8, 190, 80, 145),
      // +4
      gianticAxeLevel(158, 9, 220, 90, 146),
      // +5
      gianticAxeLevel(164, 10, 250, 100, 147, 10),
      // +6
      gianticAxeLevel(172, 11, 280, 110, 148, 15),
      // +7
      gianticAxeLevel(184, 12, 310, 120, 149, 20),
      // +8
      gianticAxeLevel(202, 13, 350, 130, 150, 25),
      // +9
      gianticAxeLevel(232, 14, 400, 140, 151, 30)
      // +10
    ]
  },
  // Uzun Mızrak (Long Spear) — sadece Warrior, iki elle kullanılıyor
  // (twoHand), "Normal" kalite (Unique değil — bu yüzden lore yok, diğer
  // tüm eşyalar gibi takas/satış/forge edilebilir). Kullanıcının ekran
  // görüntüsündeki +1'den +10'a TAM tablo birebir girildi. Tier 3
  // (kullanıcının düzeltmesi). Attack Speed "Very Slow" ve Menzil 2.00
  // real KO'nun Spear'dan ayrı "Long Spear" Kind'ına özel — bkz. yukarıdaki
  // WEAPON_TYPE_* tablolarına eklenen "longspear" girdisi (bow/longbow'daki
  // aynı desen).
  {
    tier: 3,
    levelMin: 30,
    levelMax: 45,
    name: "Kara Diken",
    weaponType: "longspear",
    weaponSlot: "twoHand",
    weight: 15,
    element: "poison",
    levels: [
      simpleWeaponLevel(127, 10, 190, 8e3),
      // +1
      simpleWeaponLevel(133, 20, 194, 9e3),
      // +2
      simpleWeaponLevel(139, 30, 198, 1e4),
      // +3
      simpleWeaponLevel(145, 40, 202, 11e3),
      // +4
      simpleWeaponLevel(151, 50, 206, 12e3),
      // +5
      simpleWeaponLevel(157, 60, 210, 13e3),
      // +6
      simpleWeaponLevel(165, 70, 214, 14e3),
      // +7
      simpleWeaponLevel(177, 80, 218, 15e3),
      // +8
      simpleWeaponLevel(195, 90, 222, 16e3),
      // +9
      simpleWeaponLevel(225, 100, 226, 17e3)
      // +10
    ]
  },
  // Halberd — Glave'in aynı ailesinden (Long Spear), Tier 2. Kullanıcının
  // ekran görüntüsündeki +1'den +10'a TAM tablo birebir girildi. "Item
  // Grade" satırı +1..+7 "Middle Class", +8..+10 "High Class" — itemGrade
  // olarak dormant veri (bkz. longspearLevel).
  {
    tier: 2,
    levelMin: 15,
    levelMax: 30,
    name: "Y\u0131lan Ucu",
    weaponType: "longspear",
    weaponSlot: "twoHand",
    weight: 15,
    element: "poison",
    levels: [
      simpleWeaponLevel(107, 10, 168, 8e3, "middle"),
      // +1
      simpleWeaponLevel(113, 20, 172, 9e3, "middle"),
      // +2
      simpleWeaponLevel(119, 30, 176, 1e4, "middle"),
      // +3
      simpleWeaponLevel(125, 40, 180, 11e3, "middle"),
      // +4
      simpleWeaponLevel(131, 50, 184, 12e3, "middle"),
      // +5
      simpleWeaponLevel(137, 60, 188, 13e3, "middle"),
      // +6
      simpleWeaponLevel(145, 70, 192, 14e3, "middle"),
      // +7
      simpleWeaponLevel(157, 80, 196, 15e3, "high"),
      // +8
      simpleWeaponLevel(175, 90, 200, 16e3, "high"),
      // +9
      simpleWeaponLevel(205, 100, 204, 17e3, "high")
      // +10
    ]
  },
  // Raptor — kullanıcının kendi sözleriyle oyunun en ikonik silahlarından
  // biri, Warrior'ın en yüksek ATK'lı silahlarından (T5, +10'da 235 —
  // şu ana kadarki her şeyden yüksek: Giantic Axe 121, Glave 225,
  // Halberd 205). Aynı Long Spear ailesi (Glave/Halberd) ama kendine özel,
  // daha detaylı bir pixel-art aldı (bkz. src/assets/items/raptor.svg —
  // pençe biçimli kavisli kama, altın kenar çizgisi, kırmızı göz taşı).
  // Kullanıcının ekran görüntüsündeki +1'den +10'a TAM tablo birebir
  // girildi (aynı +3 dayanıklılık yazım hatası düzeltmesi burada da var).
  {
    tier: 5,
    levelMin: 55,
    levelMax: 65,
    name: "Y\u0131rt\u0131c\u0131 Pen\xE7e",
    weaponType: "longspear",
    weaponSlot: "twoHand",
    weight: 15,
    element: "poison",
    levels: [
      simpleWeaponLevel(137, 10, 200, 8e3),
      // +1
      simpleWeaponLevel(143, 20, 204, 9e3),
      // +2
      simpleWeaponLevel(149, 30, 208, 1e4),
      // +3
      simpleWeaponLevel(155, 40, 212, 11e3),
      // +4
      simpleWeaponLevel(161, 50, 216, 12e3),
      // +5
      simpleWeaponLevel(167, 60, 220, 13e3),
      // +6
      simpleWeaponLevel(175, 70, 224, 14e3),
      // +7
      simpleWeaponLevel(187, 80, 228, 15e3),
      // +8
      simpleWeaponLevel(205, 90, 232, 16e3),
      // +9
      simpleWeaponLevel(235, 100, 236, 17e3)
      // +10
    ]
  },
  // Blade Axe — Giantic Axe ile aynı kategori (Axe, çift el) ama
  // kullanıcının isteğiyle bilinçli olarak FARKLI bir pixel-art aldı: tek
  // geniş düz bıçaklı bir savaş baltası, buzul mavisi tonlarda (bkz.
  // src/assets/items/blade-axe.svg) — Giantic Axe'ın çift kanatlı/mor-
  // altın tasarımından ayrışsın diye. Tier 4, "Normal" kalite. Kullanıcının
  // ekran görüntüsündeki +1'den +10'a TAM tablo birebir girildi — bu
  // sefer +3 dayanıklılık hücresinde yazım hatası YOK (7000→16000 düz
  // +1000). "Glacier Damage" bizim element sistemimizde "ice" karşılığı.
  {
    tier: 4,
    levelMin: 45,
    levelMax: 55,
    name: "Ayaz Balta",
    weaponType: "axe",
    weaponSlot: "twoHand",
    weight: 12,
    element: "ice",
    levels: [
      simpleWeaponLevel(117, 10, 172, 7e3),
      // +1
      simpleWeaponLevel(123, 20, 176, 8e3),
      // +2
      simpleWeaponLevel(129, 30, 180, 9e3),
      // +3
      simpleWeaponLevel(135, 40, 184, 1e4),
      // +4
      simpleWeaponLevel(141, 50, 188, 11e3),
      // +5
      simpleWeaponLevel(147, 60, 192, 12e3),
      // +6
      simpleWeaponLevel(155, 70, 196, 13e3),
      // +7
      simpleWeaponLevel(167, 80, 200, 14e3),
      // +8
      simpleWeaponLevel(185, 90, 204, 15e3),
      // +9
      simpleWeaponLevel(215, 100, 208, 16e3)
      // +10
    ]
  },
  // Avedon — kullanıcının kendi sözleriyle "oldukça değerli" bir T6 Eşsiz.
  // Aynı Axe kategorisi (Giantic Axe/Blade Axe) ama kendine has, en detaylı
  // pixel-art'ı aldı (bkz. src/assets/items/avedon.svg — simetrik çift
  // kanat, lacivert-altın kraliyet paleti, ortada büyüyen mavi güç taşı).
  // Ağırlığı (80) diğer tüm Axe'lardan (12) kat kat fazla — bu ağırlığı
  // taşıyabilmek ciddi bir STR yatırımı gerektiriyor, tam "değerli/zor
  // kazanılan eşya" hissi. Kullanıcının ekran görüntüsündeki +1'den +10'a
  // TAM tablo birebir girildi.
  {
    tier: 6,
    levelMin: 60,
    levelMax: 65,
    name: "Buzul K\u0131ran",
    weaponType: "axe",
    weaponSlot: "twoHand",
    weight: 80,
    element: "ice",
    lore: "*Bir zamanlar bir kral\u0131n elindeydi \u2014 \u015Fimdi onu ancak bir kral kadar g\xFC\xE7l\xFC olan kald\u0131rabilir.*",
    levels: [
      avedonLevel(134, 50, 20, 188, 12e3),
      // +1
      avedonLevel(140, 75, 30, 192, 12500),
      // +2
      avedonLevel(146, 100, 40, 196, 13e3),
      // +3
      avedonLevel(152, 125, 50, 200, 13500),
      // +4
      avedonLevel(158, 150, 60, 204, 14e3),
      // +5
      avedonLevel(164, 175, 70, 208, 14500),
      // +6
      avedonLevel(172, 200, 80, 212, 15e3),
      // +7
      avedonLevel(184, 225, 90, 216, 15500),
      // +8
      avedonLevel(202, 250, 100, 220, 16e3),
      // +9
      avedonLevel(232, 275, 110, 224, 16500)
      // +10
    ]
  },
  // Durandal — kataloğumuzdaki ilk "Sword" kategorisi eşya, bu yüzden
  // WEAPON_TYPE_SPEED/RANGE.sword'u da (Slow/1.50) buradan aldı — Giantic
  // Axe'ın "axe" tipini ilk kez tanımlamasıyla aynı desen. Tier 3, "Normal"
  // kalite, tek el (mainHand). Kullanıcının ekran görüntüsündeki +1'den
  // +10'a TAM tablo birebir girildi — yazım hatası yok, düz +1000
  // dayanıklılık artışı. Kendine özel, klasik dikey kılıç silüetinde bir
  // pixel-art aldı (bkz. src/assets/items/durandal.svg — alev turuncusu
  // parıltılı, Flame Damage temasına uygun).
  {
    tier: 3,
    levelMin: 30,
    levelMax: 45,
    name: "Ate\u015F Dili",
    weaponType: "sword",
    weaponSlot: "mainHand",
    weight: 10,
    element: "flame",
    levels: [
      simpleWeaponLevel(112, 10, 166, 5e3),
      // +1
      simpleWeaponLevel(118, 20, 170, 6e3),
      // +2
      simpleWeaponLevel(124, 30, 174, 7e3),
      // +3
      simpleWeaponLevel(130, 40, 178, 8e3),
      // +4
      simpleWeaponLevel(136, 50, 182, 9e3),
      // +5
      simpleWeaponLevel(142, 60, 186, 1e4),
      // +6
      simpleWeaponLevel(150, 70, 190, 11e3),
      // +7
      simpleWeaponLevel(162, 80, 194, 12e3),
      // +8
      simpleWeaponLevel(180, 90, 198, 13e3),
      // +9
      simpleWeaponLevel(210, 100, 202, 14e3)
      // +10
    ]
  },
  // Mirage — Durandal'ın aynı ailesinden (Sword, tek el), Tier 5. Kullanıcı
  // "güzel bir görsel" istediği için Durandal'ın düz bıçağından bilinçli
  // olarak ayrışan, eğri bir saber tasarladım — parlak mor-mavi-gümüş bir
  // "serap" ışıltısı, ince bir alev kenar parıltısıyla (bkz.
  // src/assets/items/mirage.svg). Kullanıcının ekran görüntüsündeki
  // +1'den +10'a TAM tablo birebir girildi.
  {
    tier: 5,
    levelMin: 55,
    levelMax: 65,
    name: "Serap",
    weaponType: "sword",
    weaponSlot: "mainHand",
    weight: 10,
    element: "flame",
    levels: [
      simpleWeaponLevel(123, 10, 178, 5e3),
      // +1
      simpleWeaponLevel(129, 20, 182, 6e3),
      // +2
      simpleWeaponLevel(135, 30, 186, 7e3),
      // +3
      simpleWeaponLevel(141, 40, 190, 8e3),
      // +4
      simpleWeaponLevel(147, 50, 194, 9e3),
      // +5
      simpleWeaponLevel(153, 60, 198, 1e4),
      // +6
      simpleWeaponLevel(161, 70, 202, 11e3),
      // +7
      simpleWeaponLevel(173, 80, 206, 12e3),
      // +8
      simpleWeaponLevel(191, 90, 210, 13e3),
      // +9
      simpleWeaponLevel(221, 100, 214, 14e3)
      // +10
    ]
  },
  // Stormweaver — kullanıcının kendi sözleriyle "çok güçlü" bir T6 Eşsiz,
  // Mirage'ın çift-el/ihtişamlı versiyonu. Görseli bilinçli olarak Mirage'ı
  // büyütüp fırtına/yıldırım temasına (bkz. src/assets/items/
  // stormweaver.svg — elektrik mavisi-beyaz enerji, altın el siperi,
  // parlayan yıldırım çekirdeği) çevirdi. Kullanıcının ekran görüntüsündeki
  // +1'den +10'a TAM tablo birebir girildi.
  {
    tier: 6,
    levelMin: 60,
    levelMax: 65,
    name: "F\u0131rt\u0131na Ustas\u0131",
    weaponType: "sword",
    weaponSlot: "twoHand",
    weight: 10,
    element: "lightning",
    lore: "*F\u0131rt\u0131nan\u0131n kendisinden d\xF6v\xFClm\xFC\u015F \u2014 her savuru\u015Funda g\xF6ky\xFCz\xFC bir an i\xE7in susar.*",
    levels: [
      stormweaverLevel(134, 1, 10, 200, 5e3, 2),
      // +1
      stormweaverLevel(140, 2, 20, 204, 6e3, 4),
      // +2
      stormweaverLevel(146, 3, 30, 208, 7e3, 6),
      // +3
      stormweaverLevel(152, 4, 40, 212, 8e3, 8),
      // +4
      stormweaverLevel(158, 5, 50, 216, 9e3, 10),
      // +5
      stormweaverLevel(164, 6, 60, 220, 1e4, 12),
      // +6
      stormweaverLevel(172, 7, 70, 224, 11e3, 14),
      // +7
      stormweaverLevel(184, 8, 80, 228, 12e3, 16),
      // +8
      stormweaverLevel(202, 9, 90, 232, 13e3, 18),
      // +9
      stormweaverLevel(232, 10, 100, 236, 14e3, 20)
      // +10
    ]
  },
  // Hell Breaker — kullanıcının kendi sözleriyle "oldukça epik ve ikonik"
  // bir T6 Eşsiz, Club (Balyoz) kategorisi. Bu yüzden özenle, diğer T6
  // eşyalardan (Giantic Axe'ın mor-altın, Avedon'un lacivert-altın,
  // Stormweaver'ın mavi-beyaz) bilinçli olarak ayrışan cehennemi bir
  // renk şemasıyla tasarlandı: dikenli, kafatası motifli, için için yanan
  // kor-kırmızı bir savaş topuzu (bkz. src/assets/items/hell-breaker.svg).
  // Ekran görüntüsünde "Intelligence Bonus" yazıyordu ama kullanıcı
  // "değişecek tek şey INT yerine STR bonusu" dedi — aynı sayılar (5→30),
  // sadece STR'ye bağlandı. Kullanıcının ekran görüntüsündeki +1'den
  // +10'a TAM tablo birebir girildi.
  {
    tier: 6,
    levelMin: 60,
    levelMax: 65,
    name: "Cehennem K\u0131ran",
    weaponType: "mace",
    weaponSlot: "twoHand",
    weight: 16,
    element: "flame",
    lore: "*Cehennemin kendi demirhanesinde d\xF6v\xFCld\xFC \u2014 her darbesi bir ruhu daha s\xF6nd\xFCr\xFCr.*",
    levels: [
      hellBreakerLevel(131, 5, 50, 150, 15e3),
      // +1
      hellBreakerLevel(137, 7, 65, 154, 15500),
      // +2
      hellBreakerLevel(143, 9, 80, 158, 16e3),
      // +3
      hellBreakerLevel(149, 11, 95, 162, 16500),
      // +4
      hellBreakerLevel(155, 13, 110, 166, 17e3),
      // +5
      hellBreakerLevel(161, 15, 125, 170, 17500),
      // +6
      hellBreakerLevel(169, 17, 140, 174, 18e3),
      // +7
      hellBreakerLevel(181, 20, 155, 178, 18500),
      // +8
      hellBreakerLevel(199, 24, 170, 182, 19e3),
      // +9
      hellBreakerLevel(229, 30, 185, 186, 19500)
      // +10
    ]
  },
  // Iron Impact — Hell Breaker'ın aynı kategorisi (Club/Balyoz, çift el)
  // ama kullanıcının isteğiyle bilinçli olarak FARKLI bir pixel-art aldı:
  // Hell Breaker'ın dikenli/kafatası/kor-kırmızı cehennemi temasından
  // ayrışan, sade ve endüstriyel bir demir flanşlı gürz, çelik-gri gövde,
  // çatırdayan sarı-beyaz yıldırım enerjisiyle (bkz. src/assets/items/
  // iron-impact.svg). Tier 5, "Normal" kalite (Hell Breaker gibi Eşsiz
  // değil — bu yüzden lore/statBonus yok, sade simpleWeaponLevel yeterli).
  // Kullanıcının ekran görüntüsündeki +1'den +10'a TAM tablo birebir
  // girildi — Gerekli STR bu sefer +2/seviye artıyor (diğer çoğu eşyada
  // +4'tü), tabloya sadık kalındı.
  {
    tier: 5,
    levelMin: 55,
    levelMax: 65,
    name: "\u015Eim\u015Fek Yumru\u011Fu",
    weaponType: "mace",
    weaponSlot: "twoHand",
    weight: 14,
    element: "lightning",
    levels: [
      simpleWeaponLevel(130, 10, 176, 1e4),
      // +1
      simpleWeaponLevel(136, 20, 178, 11e3),
      // +2
      simpleWeaponLevel(142, 30, 180, 12e3),
      // +3
      simpleWeaponLevel(148, 40, 182, 13e3),
      // +4
      simpleWeaponLevel(154, 50, 184, 14e3),
      // +5
      simpleWeaponLevel(160, 60, 186, 15e3),
      // +6
      simpleWeaponLevel(168, 70, 188, 16e3),
      // +7
      simpleWeaponLevel(180, 80, 190, 17e3),
      // +8
      simpleWeaponLevel(198, 90, 192, 18e3),
      // +9
      simpleWeaponLevel(228, 100, 194, 19e3)
      // +10
    ]
  },
  // Totamic Club — Iron Impact/Hell Breaker'ın aynı kategorisi (Club/
  // Balyoz, çift el) ama üçünden de ayrışan üçüncü bir stil: oyulmuş
  // ahşap bir kabile topuzu, totem oymaları, tüy püskülü, kemik süsü
  // (bkz. src/assets/items/totamic-club.svg) — Iron Impact'in
  // endüstriyel çeliğinden ve Hell Breaker'ın cehennemi metalinden
  // bilinçli olarak farklı. Tier 3, "Normal" kalite. Kullanıcının ekran
  // görüntüsündeki +1'den +10'a TAM tablo birebir girildi — Gerekli STR
  // yine +2/seviye (Iron Impact'le aynı oran).
  {
    tier: 3,
    levelMin: 30,
    levelMax: 45,
    name: "Totem Topuzu",
    weaponType: "mace",
    weaponSlot: "twoHand",
    weight: 14,
    element: "lightning",
    levels: [
      simpleWeaponLevel(117, 10, 164, 1e4),
      // +1
      simpleWeaponLevel(123, 20, 166, 11e3),
      // +2
      simpleWeaponLevel(129, 30, 168, 12e3),
      // +3
      simpleWeaponLevel(135, 40, 170, 13e3),
      // +4
      simpleWeaponLevel(141, 50, 172, 14e3),
      // +5
      simpleWeaponLevel(147, 60, 174, 15e3),
      // +6
      simpleWeaponLevel(155, 70, 176, 16e3),
      // +7
      simpleWeaponLevel(167, 80, 178, 17e3),
      // +8
      simpleWeaponLevel(185, 90, 180, 18e3),
      // +9
      simpleWeaponLevel(215, 100, 182, 19e3)
      // +10
    ]
  },
  // Large Hacker — Club ailesinin dördüncü üyesi (Hell Breaker/Iron
  // Impact/Totamic Club ile aynı Durability/Weight/Lightning kalıbı,
  // sadece tier'a göre atk/reqStr ölçekleniyor) — kullanıcı bu turda
  // kategoriyi tekrar yazmadı ama tablo deseni (Dayanıklılık 10000-19000,
  // Ağırlık 14.00, Yıldırım Hasarı 10-100, +2/seviye ReqStr) birebir aynı
  // aile, bu yüzden yine "mace"/twoHand. Tier 2, "Normal" kalite. Kendine
  // özel geniş düz yüzeyli, "Hacker" adına uygun keskin köşeli bir savaş
  // çekici tasarlandı (bkz. src/assets/items/large-hacker.svg) — diğer
  // üç Club'dan farklı bir silüet. Kullanıcının ekran görüntüsündeki
  // +1'den +10'a TAM tablo birebir girildi.
  {
    tier: 2,
    levelMin: 15,
    levelMax: 30,
    name: "K\u0131r\u0131c\u0131 G\xFCrz",
    weaponType: "mace",
    weaponSlot: "twoHand",
    weight: 14,
    element: "lightning",
    levels: [
      simpleWeaponLevel(107, 10, 154, 1e4),
      // +1
      simpleWeaponLevel(113, 20, 156, 11e3),
      // +2
      simpleWeaponLevel(119, 30, 158, 12e3),
      // +3
      simpleWeaponLevel(125, 40, 160, 13e3),
      // +4
      simpleWeaponLevel(131, 50, 162, 14e3),
      // +5
      simpleWeaponLevel(137, 60, 164, 15e3),
      // +6
      simpleWeaponLevel(145, 70, 166, 16e3),
      // +7
      simpleWeaponLevel(157, 80, 168, 17e3),
      // +8
      simpleWeaponLevel(175, 90, 170, 18e3),
      // +9
      simpleWeaponLevel(205, 100, 172, 19e3)
      // +10
    ]
  },
  // Weight Hammer — Club ailesinin beşinci üyesi, Tier 1 (giriş seviyesi).
  // Aynı Durability/Weight/Lightning kalıbı (10000-19000 / 14.00 / 10-100)
  // ama ATK eğrisi diğerlerinden farklı: ilk 5 seviye +6/adım, sonra
  // +8/+12/+18/+30 şeklinde hızlanıyor (48,54,60,66,72,78,86,98,116,146) —
  // kullanıcının ekran görüntüsündeki tabloya birebir. Gerekli STR yine
  // +2/seviye ama en düşük tabanla başlıyor (114), ailenin en giriş
  // seviyesi silahı olduğunu yansıtıyor.
  {
    tier: 1,
    levelMin: 1,
    levelMax: 15,
    name: "A\u011F\u0131r \xC7eki\xE7",
    weaponType: "mace",
    weaponSlot: "twoHand",
    weight: 14,
    element: "lightning",
    levels: [
      simpleWeaponLevel(48, 10, 114, 1e4),
      // +1
      simpleWeaponLevel(54, 20, 116, 11e3),
      // +2
      simpleWeaponLevel(60, 30, 118, 12e3),
      // +3
      simpleWeaponLevel(66, 40, 120, 13e3),
      // +4
      simpleWeaponLevel(72, 50, 122, 14e3),
      // +5
      simpleWeaponLevel(78, 60, 124, 15e3),
      // +6
      simpleWeaponLevel(86, 70, 126, 16e3),
      // +7
      simpleWeaponLevel(98, 80, 128, 17e3),
      // +8
      simpleWeaponLevel(116, 90, 130, 18e3),
      // +9
      simpleWeaponLevel(146, 100, 132, 19e3)
      // +10
    ]
  },
  // Rusty Sword / Iron Axe — Weight Hammer Tier 1'in TEK tier1 seçenek
  // olması, oyun test edilirken "her seferinde aynı silah düşüyor" olarak
  // fark edildi (bkz. utils/loot.js#rollWeapon — bir tier'da tek satır
  // varsa pick() hep onu döner, RNG'de bir bug yoktu, havuz gerçekten
  // tek kişilikti). Elimizde bu ikisi için gerçek KO'nun decrypted verisi
  // yok, bu yüzden Weight Hammer'la aynı güç bandına kalibre edilmiş basit
  // (levels dizisiz, forge'un ×1.18 tahminiyle yükselen) giriş silahları —
  // amaç sadece havuzu 1'den 3'e çıkarıp çeşitlilik katmak.
  {
    tier: 1,
    levelMin: 1,
    levelMax: 15,
    name: "Pasl\u0131 K\u0131l\u0131\xE7",
    weaponType: "sword",
    weaponSlot: "twoHand",
    weight: 10,
    atk: 44,
    hp: 8,
    reqStats: [{ key: "str", value: 108 }]
  },
  {
    tier: 1,
    levelMin: 1,
    levelMax: 15,
    name: "Demir Balta",
    weaponType: "axe",
    weaponSlot: "twoHand",
    weight: 13,
    atk: 52,
    hp: 12,
    reqStats: [{ key: "str", value: 120 }]
  }
];
var WARRIOR_SHIELDS = [];

// src/data/itemRarity.js
init_define_import_meta_env();
var ITEM_TIER_LABEL = {
  tr: { 1: "S\u0131radan", 2: "Nadide", 3: "Nadir", 4: "Destans\u0131", 5: "Efsanevi", 6: "Mitik" },
  en: { 1: "Common", 2: "Uncommon", 3: "Rare", 4: "Epic", 5: "Legendary", 6: "Mythic" }
};
function tierName(lang, tierId) {
  return ITEM_TIER_LABEL[lang]?.[tierId] || String(tierId);
}
var TIER_PREFIX = {
  1: ["Sisli", "Puslu", "Solgun"],
  2: ["K\xFClden", "Kavrulmu\u015F", "Volkanik"],
  3: ["G\xF6lgeli", "Karanl\u0131k", "Sessiz"],
  4: ["Kristal", "Arkane", "Par\u0131ldayan"],
  5: ["Kaotik", "K\u0131yamet", "\u015Eeytani"]
};

// src/utils/itemDisplay.js
function isConsumable(item) {
  return item.kind === "accessoryScroll" || item.kind === "potion" || item.kind === "scroll" || item.kind === "raceScroll" || item.kind === "jobScroll" || item.kind === "bonusScroll" || item.kind === "boostScroll" || item.kind === "clanMaterial";
}

// src/data/maps.js
init_define_import_meta_env();
var GATE_TELEPORT_COST = 10;
var TIER_HP_MULT = { 1: 0.9, 2: 1.1, 3: 1.5, 4: 1.85, 5: 1.9, 6: 1.9 };
var TIER_DEF_MULT = { 1: 2, 2: 2.3, 3: 2.6, 4: 3, 5: 3.4, 6: 3.8 };
var TIER_ATK_MULT = { 1: 0.85, 2: 1.1, 3: 1.38, 4: 2.07, 5: 2.76, 6: 3.6 };
function scaleMonster(m, tier) {
  return {
    ...m,
    hp: Math.round(m.hp * TIER_HP_MULT[tier] * { 1: 0.8, 2: 0.85, 3: 0.9, 4: 1.1, 5: 1.15, 6: 1.25 }[tier]),
    atk: Math.round(m.atk * TIER_ATK_MULT[tier]),
    def: Math.round(m.def * TIER_DEF_MULT[tier])
  };
}
var RAW_MAPS = [
  {
    id: "fallow_valley",
    name: "Fallow Valley",
    levelMin: 1,
    levelMax: 15,
    tier: 1,
    color: "#8FA35E",
    glow: "rgba(143,163,94,0.45)",
    dropChance: 0.1,
    chestChance: 0.04,
    monsters: [
      { id: "sis_kurdu", name: "Sis Kurdu", hp: 113, atk: 9, def: 6, xp: 21, goldMin: 6, goldMax: 11 },
      { id: "kabuklu_golem", name: "Kabuklu Golem", hp: 143, atk: 10, def: 8, xp: 27, goldMin: 7, goldMax: 14 },
      { id: "otlak_yabanisi", name: "Otlak Yabanisi", hp: 184, atk: 12, def: 10, xp: 34, goldMin: 9, goldMax: 17 },
      { id: "bataklik_surungeni", name: "Batakl\u0131k S\xFCr\xFCngeni", hp: 235, atk: 14, def: 13, xp: 43, goldMin: 12, goldMax: 22 },
      { id: "nadas_devi", name: "Nadas Devi", hp: 299, atk: 18, def: 15, xp: 55, goldMin: 15, goldMax: 28 }
    ]
  },
  {
    id: "ashen_canyon",
    name: "Ashen Canyon",
    levelMin: 15,
    levelMax: 25,
    tier: 2,
    color: "#C97A3D",
    glow: "rgba(201,122,61,0.45)",
    dropChance: 0.1,
    chestChance: 0.04,
    monsters: [
      { id: "kul_yaratigi", name: "K\xFCl Yarat\u0131\u011F\u0131", hp: 361, atk: 21, def: 19, xp: 66, goldMin: 18, goldMax: 33 },
      { id: "volkan_suru", name: "Volkan S\xFCr\xFCngeni", hp: 409, atk: 22, def: 21, xp: 76, goldMin: 20, goldMax: 37 },
      { id: "kanyon_akrebi", name: "Kanyon Akrebi", hp: 462, atk: 25, def: 23, xp: 87, goldMin: 22, goldMax: 42 },
      { id: "lav_ruhu", name: "Lav Ruhu", hp: 522, atk: 27, def: 27, xp: 99, goldMin: 25, goldMax: 47 }
    ]
  },
  {
    id: "frostburn_summit",
    name: "Frostburn Summit",
    levelMin: 25,
    levelMax: 40,
    tier: 3,
    color: "#6FD1E0",
    glow: "rgba(111,209,224,0.45)",
    dropChance: 0.075,
    chestChance: 0.03,
    monsters: [
      { id: "buzul_kurdu", name: "Buzul Kurdu", hp: 600, atk: 30, def: 30, xp: 116, goldMin: 29, goldMax: 54 },
      { id: "alev_orumcegi", name: "Alev \xD6r\xFCmce\u011Fi", hp: 695, atk: 34, def: 34, xp: 136, goldMin: 33, goldMax: 62 },
      { id: "don_devi", name: "Don Devi", hp: 770, atk: 36, def: 36, xp: 156, goldMin: 37, goldMax: 70 },
      { id: "kor_salamanderi", name: "Kor Salamanderi", hp: 846, atk: 42, def: 40, xp: 178, goldMin: 42, goldMax: 78 },
      { id: "zirve_muhafizi", name: "Zirve Muhaf\u0131z\u0131", hp: 929, atk: 46, def: 44, xp: 202, goldMin: 46, goldMax: 87 }
    ]
  },
  {
    id: "ruined_sanctuary",
    name: "Ruined Sanctuary",
    levelMin: 40,
    levelMax: 50,
    tier: 4,
    color: "#8B6FC9",
    glow: "rgba(139,111,201,0.45)",
    dropChance: 0.05,
    chestChance: 0.02,
    monsters: [
      { id: "harabe_iskeleti", name: "Harabe \u0130skeleti", hp: 1012, atk: 51, def: 46, xp: 228, goldMin: 51, goldMax: 96 },
      { id: "lanetli_rahip", name: "Lanetli Rahip", hp: 1095, atk: 56, def: 49, xp: 253, goldMin: 56, goldMax: 106 },
      { id: "tapinak_bekcisi", name: "Tap\u0131nak Bek\xE7isi", hp: 1210, atk: 61, def: 53, xp: 283, goldMin: 62, goldMax: 117 },
      { id: "golge_vaizi", name: "G\xF6lge Vaizi", hp: 1366, atk: 65, def: 57, xp: 316, goldMin: 70, goldMax: 131 }
    ]
  },
  {
    id: "abyssal_pit",
    name: "Abyssal Pit",
    levelMin: 50,
    levelMax: 60,
    tier: 5,
    color: "#A34FD9",
    glow: "rgba(163,79,217,0.45)",
    dropChance: 0.025,
    chestChance: 0.015,
    monsters: [
      { id: "ucurum_solucani", name: "U\xE7urum Solucan\u0131", hp: 1523, atk: 70, def: 63, xp: 349, goldMin: 77, goldMax: 145 },
      { id: "karanlik_cagirici", name: "Karanl\u0131k \xC7a\u011F\u0131r\u0131c\u0131", hp: 1679, atk: 74, def: 67, xp: 381, goldMin: 84, goldMax: 158 },
      { id: "dip_iblisi", name: "Dip \u0130blisi", hp: 1849, atk: 79, def: 70, xp: 417, goldMin: 92, goldMax: 173 },
      { id: "kabus_golgesi", name: "Kabus G\xF6lgesi", hp: 2038, atk: 85, def: 74, xp: 455, goldMin: 101, goldMax: 189 },
      { id: "ucurum_efendisi", name: "U\xE7urum Efendisi", hp: 2245, atk: 90, def: 80, xp: 497, goldMin: 110, goldMax: 207 }
    ]
  },
  {
    id: "crimson_battlefront",
    name: "Crimson Battlefront",
    levelMin: 60,
    levelMax: 65,
    tier: 5,
    color: "#C9425A",
    glow: "rgba(201,66,90,0.5)",
    dropChance: 0.01,
    chestChance: 0.01,
    monsters: [
      { id: "kizil_muhafiz", name: "K\u0131z\u0131l Muhaf\u0131z", hp: 2431, atk: 94, def: 84, xp: 535, goldMin: 118, goldMax: 222 },
      { id: "alev_cellati", name: "Alev Cellad\u0131", hp: 2583, atk: 98, def: 87, xp: 565, goldMin: 125, goldMax: 235 },
      { id: "kaos_iblisi", name: "Kaos \u0130blisi", hp: 2744, atk: 101, def: 89, xp: 597, goldMin: 132, goldMax: 248 },
      { id: "kiyamet_ejderha", name: "K\u0131yamet Ejderhas\u0131", hp: 2914, atk: 105, def: 93, xp: 631, goldMin: 140, goldMax: 262 }
    ]
  }
];
var MAPS = RAW_MAPS.map((map, i) => ({ ...map, monsters: map.monsters.map((m) => scaleMonster(m, i + 1)) }));
function findMap(mapId) {
  return MAPS.find((m) => m.id === mapId) || MAPS[0];
}
function highestUnlockedMap(level) {
  let best = MAPS[0];
  for (const m of MAPS) if (level >= m.levelMin) best = m;
  return best;
}

// src/utils/week.js
init_define_import_meta_env();
function currentWeekId(date = /* @__PURE__ */ new Date()) {
  const ist = new Date(date.getTime() + 3 * 60 * 60 * 1e3);
  const d = new Date(Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((d - yearStart) / 864e5 + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

// src/utils/nationalPointConstants.js
init_define_import_meta_env();
var STARTING_NATIONAL_POINT = 500;
var NP_LOSS_PENALTY = 50;
var NP_RECOVERY_GOLD_COST = 1500;
var NP_RECOVERY_NP_AMOUNT = 250;

// src/utils/loot.js
init_define_import_meta_env();

// src/data/lootAdminCatalog.js
init_define_import_meta_env();

// src/data/balancedWeapons.js
init_define_import_meta_env();

// src/data/rogueWeapons.js
init_define_import_meta_env();
function simpleBowLevel(atk, poison, reqDex, durability, itemGrade) {
  return { atk, elementBonus: poison, reqStats: [{ key: "dex", value: reqDex }], durability, itemGrade };
}
function scorpionBowLevel(atk, hp, poison, resPoison, reqDex) {
  return {
    atk,
    hp,
    mp: 0,
    elementBonus: poison,
    resistances: { poison: resPoison },
    reqStats: [{ key: "dex", value: reqDex }],
    durability: 13e3
  };
}
function chitinBowLevel(atk, mp, flame, resPoison, reqDex) {
  return {
    atk,
    hp: 0,
    mp,
    elementBonus: flame,
    resistances: { poison: resPoison },
    reqStats: [{ key: "dex", value: reqDex }],
    durability: 13e3
  };
}
function enionBowLevel(atk, strBonus, lightning, reqDex, durability) {
  return {
    atk,
    statBonus: { str: strBonus },
    elementBonus: lightning,
    reqStats: [{ key: "dex", value: reqDex }],
    durability
  };
}
function eaglesEyeLevel(atk, strBonus, hpmp, poison, defAbility, res, reqDex, durability) {
  return {
    atk,
    statBonus: { str: strBonus },
    hp: hpmp,
    mp: hpmp,
    elementBonus: poison,
    defenseAbility: defAbility ? { vs: "sword", value: defAbility } : null,
    resistances: { flame: res, glacier: res },
    reqStats: [{ key: "dex", value: reqDex }],
    durability
  };
}
function helenidLevel(atk, glacier, reqDex, durability) {
  return {
    atk,
    elementBonus: glacier,
    reqStats: [{ key: "dex", value: reqDex }, { key: "hp", value: 80 }],
    durability
  };
}
var ROGUE_WEAPONS = [
  // Bow — oyunumuzdaki en güçsüz bow, Tier 1. Basit, süslemesiz bir avcı
  // yayı tasarlandı: düz ahşap gövde, gergin kiriş, hiç metal/süsleme yok.
  {
    tier: 1,
    levelMin: 1,
    levelMax: 15,
    name: "Avc\u0131 Yay\u0131",
    weaponType: "bow",
    weaponSlot: "twoHand",
    weight: 3,
    range: 35,
    element: "poison",
    levels: [
      simpleBowLevel(8, 10, 56, 5e3, "low"),
      // +1
      simpleBowLevel(12, 20, 60, 6e3, "low"),
      // +2
      simpleBowLevel(16, 30, 64, 7e3, "low"),
      // +3
      simpleBowLevel(20, 40, 68, 8e3, "low"),
      // +4
      simpleBowLevel(24, 50, 72, 9e3, "low"),
      // +5
      simpleBowLevel(28, 60, 76, 1e4, "middle"),
      // +6
      simpleBowLevel(34, 70, 80, 11e3, "middle"),
      // +7
      simpleBowLevel(43, 80, 84, 12e3, "middle"),
      // +8
      simpleBowLevel(56, 90, 88, 13e3, "middle"),
      // +9
      simpleBowLevel(76, 100, 92, 14e3, "middle")
      // +10
    ]
  },
  // Bamboo Bow — Bow'un biraz daha güçlü hali, Tier 1. Bow'a göre çok az
  // daha ihtişamlı: bambu-yeşili gövde, ince desenli sarım.
  {
    tier: 1,
    levelMin: 1,
    levelMax: 15,
    name: "Bambu Yay",
    weaponType: "bow",
    weaponSlot: "twoHand",
    weight: 3,
    range: 35,
    element: "poison",
    levels: [
      simpleBowLevel(15, 10, 64, 5e3, "low"),
      // +1
      simpleBowLevel(19, 20, 68, 6e3, "low"),
      // +2
      simpleBowLevel(23, 30, 72, 7e3, "low"),
      // +3
      simpleBowLevel(27, 40, 76, 8e3, "low"),
      // +4
      simpleBowLevel(31, 50, 80, 9e3, "low"),
      // +5
      simpleBowLevel(35, 60, 84, 1e4, "middle"),
      // +6
      simpleBowLevel(41, 70, 88, 11e3, "middle"),
      // +7
      simpleBowLevel(50, 80, 92, 12e3, "middle"),
      // +8
      simpleBowLevel(63, 90, 96, 13e3, "middle"),
      // +9
      simpleBowLevel(83, 100, 100, 14e3, "middle")
      // +10
    ]
  },
  // Iron Crossbow (Normal) — Tier 3, Bamboo Bow'dan daha ihtişamlı: demir
  // gövdeli, gerçek bir mekanik germe kolu olan bir arbalet görünümü.
  {
    tier: 3,
    levelMin: 30,
    levelMax: 45,
    name: "Demir Arbalet",
    weaponType: "bow",
    weaponSlot: "twoHand",
    weight: 4,
    element: "poison",
    levels: [
      simpleBowLevel(84, 10, 130, 5e3, "middle"),
      // +1
      simpleBowLevel(88, 20, 134, 6e3, "middle"),
      // +2
      simpleBowLevel(92, 30, 138, 7e3, "middle"),
      // +3
      simpleBowLevel(96, 40, 142, 8e3, "middle"),
      // +4
      simpleBowLevel(100, 50, 146, 9e3, "middle"),
      // +5
      simpleBowLevel(104, 60, 150, 1e4, "high"),
      // +6
      simpleBowLevel(110, 70, 154, 11e3, "high"),
      // +7
      simpleBowLevel(119, 80, 158, 12e3, "high"),
      // +8
      simpleBowLevel(132, 90, 162, 13e3, "high"),
      // +9
      simpleBowLevel(152, 100, 166, 14e3, "high")
      // +10
    ]
  },
  // Scorpion Bow (Unique) — Tier 4. HP Bonusu olduğu için AP'si düşük ama
  // fena değil. Iron Crossbow'dan daha ihtişamlı: zehirli-yeşil parlayan
  // bir akrep kuyruğu siluetiyle şekillendirilmiş yay kolları.
  {
    tier: 4,
    levelMin: 45,
    levelMax: 55,
    name: "Zehir Dikeni",
    weaponType: "bow",
    weaponSlot: "twoHand",
    weight: 3,
    element: "poison",
    levels: [
      scorpionBowLevel(71, 100, 45, 30, 94),
      // +1
      scorpionBowLevel(75, 130, 55, 35, 95),
      // +2
      scorpionBowLevel(79, 160, 65, 40, 96),
      // +3
      scorpionBowLevel(83, 190, 75, 45, 97),
      // +4
      scorpionBowLevel(87, 220, 85, 50, 98),
      // +5
      scorpionBowLevel(91, 250, 95, 55, 99),
      // +6
      scorpionBowLevel(97, 280, 105, 60, 100),
      // +7
      scorpionBowLevel(106, 310, 115, 65, 101),
      // +8
      scorpionBowLevel(119, 350, 125, 70, 102),
      // +9
      scorpionBowLevel(139, 400, 135, 75, 103)
      // +10
    ]
  },
  // Iron Bow (Normal) — Tier 5, oldukça güçlü ve güzel. İhtişamlı bir
  // görünüm: parlak çelik uçlu, gergin çift kiriş.
  {
    tier: 5,
    levelMin: 55,
    levelMax: 65,
    name: "\xC7elik Yay",
    weaponType: "bow",
    weaponSlot: "twoHand",
    weight: 4,
    element: "poison",
    levels: [
      simpleBowLevel(93, 10, 140, 5e3),
      // +1
      simpleBowLevel(97, 20, 144, 6e3),
      // +2
      simpleBowLevel(101, 30, 148, 7e3),
      // +3
      simpleBowLevel(105, 40, 152, 8e3),
      // +4
      simpleBowLevel(109, 50, 156, 9e3),
      // +5
      simpleBowLevel(113, 60, 160, 1e4),
      // +6
      simpleBowLevel(119, 70, 164, 11e3),
      // +7
      simpleBowLevel(128, 80, 168, 12e3),
      // +8
      simpleBowLevel(141, 90, 172, 13e3),
      // +9
      simpleBowLevel(161, 100, 176, 14e3)
      // +10
    ]
  },
  // Chitin Bow (Unique) — Tier 6, müthiş bir eşya, gerçekten alev alev
  // parlayan bir bow. Kitin-kabuk dokulu koyu kahve gövde, uçları ateşle
  // kaplı.
  {
    tier: 6,
    levelMin: 60,
    levelMax: 65,
    name: "K\xF6z Yay\u0131",
    weaponType: "bow",
    weaponSlot: "twoHand",
    weight: 3,
    element: "flame",
    levels: [
      chitinBowLevel(101, 100, 10, 30, 94),
      // +1
      chitinBowLevel(103, 130, 20, 35, 95),
      // +2
      chitinBowLevel(105, 160, 30, 40, 96),
      // +3
      chitinBowLevel(107, 190, 40, 45, 97),
      // +4
      chitinBowLevel(109, 220, 50, 50, 98),
      // +5
      chitinBowLevel(111, 250, 60, 55, 99),
      // +6
      chitinBowLevel(116, 280, 70, 60, 100),
      // +7
      chitinBowLevel(125, 310, 80, 65, 101),
      // +8
      chitinBowLevel(138, 350, 90, 70, 102),
      // +9
      chitinBowLevel(158, 400, 100, 75, 103)
      // +10
    ]
  },
  // Enion Bow (Unique) — Tier 6, Chitin Bow gibi muazzam. STR Bonusu +
  // Yıldırım hasarı, çok ihtişamlı bir görünüm: elektrik-mavi parıltılı,
  // yıldırım çatlaklı bir gövde.
  {
    tier: 6,
    levelMin: 60,
    levelMax: 65,
    name: "Y\u0131ld\u0131r\u0131m Teli",
    weaponType: "bow",
    weaponSlot: "twoHand",
    weight: 4,
    element: "lightning",
    levels: [
      enionBowLevel(91, 5, 30, 130, 1e4),
      // +1
      enionBowLevel(95, 7, 40, 134, 10500),
      // +2
      enionBowLevel(99, 9, 50, 138, 11e3),
      // +3
      enionBowLevel(103, 11, 60, 142, 11500),
      // +4
      enionBowLevel(107, 13, 70, 146, 12e3),
      // +5
      enionBowLevel(111, 15, 80, 150, 12500),
      // +6
      enionBowLevel(117, 17, 90, 154, 13e3),
      // +7
      enionBowLevel(126, 20, 100, 158, 13500),
      // +8
      enionBowLevel(139, 24, 110, 162, 14e3),
      // +9
      enionBowLevel(159, 30, 120, 166, 14500)
      // +10
    ]
  },
  // Eagle's Eye (Unique) — Tier 6, en güçlü ve en karmaşık bow. Sword'a
  // karşı yeni "Defense Ability" mekaniği (henüz dormant, ileride anti-def
  // sistemi kurulunca devreye girecek) taşıyan tek eşya. Çok ihtişamlı bir
  // görünüm: altın-beyaz kartal tüyü motifli, gerilimde parlayan bir yay.
  {
    tier: 6,
    levelMin: 60,
    levelMax: 65,
    name: "Kartal Bak\u0131\u015F\u0131",
    weaponType: "bow",
    weaponSlot: "twoHand",
    weight: 4,
    element: "poison",
    levels: [
      eaglesEyeLevel(95, 1, 70, 11, 0, 13, 140, 1e4),
      // +1
      eaglesEyeLevel(99, 2, 80, 20, 0, 14, 144, 10500),
      // +2
      eaglesEyeLevel(103, 3, 90, 30, 1, 15, 148, 11e3),
      // +3
      eaglesEyeLevel(107, 5, 100, 40, 2, 16, 152, 11500),
      // +4
      eaglesEyeLevel(111, 7, 110, 50, 3, 17, 156, 12e3),
      // +5
      eaglesEyeLevel(115, 9, 130, 60, 4, 18, 160, 12500),
      // +6
      eaglesEyeLevel(121, 11, 150, 71, 5, 20, 164, 13e3),
      // +7
      eaglesEyeLevel(130, 13, 170, 90, 7, 22, 168, 13500),
      // +8
      eaglesEyeLevel(143, 16, 200, 110, 10, 30, 172, 14e3),
      // +9
      eaglesEyeLevel(163, 20, 250, 140, 14, 46, 176, 14500)
      // +10
    ]
  },
  // Crossbow — Tier 2. İsminde "Arbalet" geçse de kullanıcı isteğiyle
  // kategori/weaponType hâlâ "bow" (Iron Crossbow'daki aynı karar) — gerçek
  // bir Crossbow silah türü henüz yok. Görseli sade/işlenmemiş bir arbalet:
  // ham ahşap dipçik, süslemesiz düz gri demir kollar.
  {
    tier: 2,
    levelMin: 15,
    levelMax: 30,
    name: "Arbalet",
    weaponType: "bow",
    weaponSlot: "twoHand",
    weight: 4.5,
    element: "poison",
    levels: [
      simpleBowLevel(63, 10, 110, 5e3),
      // +1
      simpleBowLevel(67, 20, 114, 6e3),
      // +2
      simpleBowLevel(71, 30, 118, 7e3),
      // +3
      simpleBowLevel(75, 40, 122, 8e3),
      // +4
      simpleBowLevel(79, 50, 126, 9e3),
      // +5
      simpleBowLevel(83, 60, 130, 1e4),
      // +6
      simpleBowLevel(89, 70, 134, 11e3),
      // +7
      simpleBowLevel(98, 80, 138, 12e3),
      // +8
      simpleBowLevel(111, 90, 142, 13e3),
      // +9
      simpleBowLevel(131, 100, 146, 14e3)
      // +10
    ]
  },
  // Horn Crossbow — Tier 2, normal Crossbow'dan daha ihtişamlı: boynuz/kemik
  // kollu, cilalı ahşap dipçikli daha zarif bir arbalet.
  {
    tier: 2,
    levelMin: 15,
    levelMax: 30,
    name: "Boynuz Arbalet",
    weaponType: "bow",
    weaponSlot: "twoHand",
    weight: 4.5,
    element: "poison",
    levels: [
      simpleBowLevel(74, 10, 120, 5e3),
      // +1
      simpleBowLevel(78, 20, 124, 6e3),
      // +2
      simpleBowLevel(82, 30, 128, 7e3),
      // +3
      simpleBowLevel(86, 40, 132, 8e3),
      // +4
      simpleBowLevel(90, 50, 136, 9e3),
      // +5
      simpleBowLevel(94, 60, 140, 1e4),
      // +6
      simpleBowLevel(100, 70, 144, 11e3),
      // +7
      simpleBowLevel(109, 80, 148, 12e3),
      // +8
      simpleBowLevel(122, 90, 152, 13e3),
      // +9
      simpleBowLevel(142, 100, 156, 14e3)
      // +10
    ]
  },
  // Helenid (Unique) — Tier 6, üçüncü ve en güçlü crossbow'umuz. Oldukça
  // ihtişamlı bir görünüm: buz-mavi parıldayan, donmuş kristal kollu bir
  // arbalet — diğer iki Crossbow'un (ham ahşap, boynuz/altın) sıcak
  // paletlerinden bilinçli olarak ayrışan soğuk bir tasarım.
  {
    tier: 6,
    levelMin: 60,
    levelMax: 65,
    name: "Ayaz Yay\u0131",
    weaponType: "bow",
    weaponSlot: "twoHand",
    weight: 4,
    element: "ice",
    levels: [
      helenidLevel(95, 30, 188, 1e4),
      // +1
      helenidLevel(99, 40, 192, 10500),
      // +2
      helenidLevel(103, 50, 196, 11e3),
      // +3
      helenidLevel(107, 60, 200, 11500),
      // +4
      helenidLevel(111, 70, 204, 12e3),
      // +5
      helenidLevel(115, 80, 208, 12500),
      // +6
      helenidLevel(121, 90, 212, 13e3),
      // +7
      helenidLevel(130, 100, 216, 13500),
      // +8
      helenidLevel(143, 110, 220, 14e3),
      // +9
      helenidLevel(163, 120, 224, 14500)
      // +10
    ]
  }
];

// src/data/casterWeapons.js
init_define_import_meta_env();
function staffLevel(atk, hp, elementDmg, defAbility, reqMag, durability) {
  return {
    atk,
    hp,
    mp: 0,
    elementBonus: elementDmg,
    defenseAbility: defAbility ? { vs: "dagger", value: defAbility } : null,
    reqStats: [{ key: "mag", value: reqMag }, { key: "int", value: 112 }],
    durability
  };
}
var CASTER_WEAPONS = [
  // Wooden Staff — Tier 1 giriş asası. Kullanıcı testinde ortaya çıktı:
  // bu tabloda T6 Unique'lerden ÖNCE hiçbir alt tier yoktu, yani Mage'in T1
  // canavarlardan HİÇ silah düşmüyordu (rollFromWeaponTable boş dönüyordu).
  // Elimizde gerçek KO'nun decrypted T1 staff verisi yok (altta ki
  // uniqueler ekran görüntüsünden birebir alındı) — bu basit giriş eşyası
  // onun yerine komşu tier1 silahların (Weight Hammer/Bow) güç bandına
  // kalibre edildi, sabit tek satır (levels dizisi yok, forge'un ×1.18
  // tahminiyle yükseliyor, bkz. utils/upgrade.js#bumpedStats).
  {
    tier: 1,
    levelMin: 1,
    levelMax: 15,
    name: "Tahta Asa",
    weaponType: "staff",
    weaponSlot: "twoHand",
    weight: 3,
    atk: 10,
    mp: 5,
    reqStats: [{ key: "mag", value: 50 }, { key: "int", value: 50 }]
  },
  // Apprentice Staff — Wooden Staff'la aynı sebepten (tek tier1 seçenek =
  // her seferinde aynı silah) ikinci bir tier1 alternatif olarak eklendi.
  {
    tier: 1,
    levelMin: 1,
    levelMax: 15,
    name: "\xC7\u0131rak Asas\u0131",
    weaponType: "staff",
    weaponSlot: "twoHand",
    weight: 3,
    atk: 13,
    mp: 3,
    reqStats: [{ key: "mag", value: 58 }, { key: "int", value: 46 }]
  },
  // T2-T5 giriş asaları — kullanıcının bildirdiği "bazı sandıklarda siyah
  // bir kutucuk kalıyor" bug'ının kök nedeniydi: bu tablo T1'in HEMEN
  // ÜSTÜNDE (T2-T5) TAMAMEN boştu, T6 uniqueler dışında hiçbir şey yoktu.
  // Mage bir T2-T5 sandık/canavar dropunda silah dalını çekince rollWeapon
  // null dönüyordu, ChestModal da null bir sonucu boş bir kutu olarak
  // render ediyordu (bkz. ChestModal.jsx'teki düzeltme). Elimizde gerçek
  // veri yok — reqStats mage zırhının aynı tier'daki int gereksinimiyle
  // (bkz. data/armorSets.js) hizalandı, atk Rogue'un T2-T5 eğrisine yakın
  // bir bantta kalibre edildi.
  {
    tier: 2,
    levelMin: 15,
    levelMax: 25,
    name: "Demir U\xE7lu Asa",
    weaponType: "staff",
    weaponSlot: "twoHand",
    weight: 3,
    atk: 65,
    mp: 8,
    reqStats: [{ key: "mag", value: 105 }, { key: "int", value: 100 }]
  },
  {
    tier: 3,
    levelMin: 25,
    levelMax: 40,
    name: "\u0130pek Sar\u0131l\u0131 Asa",
    weaponType: "staff",
    weaponSlot: "twoHand",
    weight: 3,
    atk: 85,
    mp: 14,
    reqStats: [{ key: "mag", value: 130 }, { key: "int", value: 124 }]
  },
  {
    tier: 4,
    levelMin: 40,
    levelMax: 60,
    name: "K\u0131z\u0131l R\xFCn Asas\u0131",
    weaponType: "staff",
    weaponSlot: "twoHand",
    weight: 4,
    atk: 105,
    mp: 20,
    reqStats: [{ key: "mag", value: 168 }, { key: "int", value: 160 }]
  },
  {
    tier: 5,
    levelMin: 60,
    levelMax: 65,
    name: "Kabuk Dokuma Asa",
    weaponType: "staff",
    weaponSlot: "twoHand",
    weight: 4,
    atk: 120,
    mp: 26,
    reqStats: [{ key: "mag", value: 168 }, { key: "int", value: 160 }]
  },
  // Scorching Staff (Unique) — Flame. Görseli: kıvrık siyah-kızıl bir asa,
  // ucunda alevli bir kristal/kafatası motifi.
  {
    tier: 6,
    levelMin: 60,
    levelMax: 65,
    name: "Kavurucu Asa",
    weaponType: "staff",
    weaponSlot: "twoHand",
    weight: 4,
    element: "flame",
    attackSpeed: "\xC7ok Yava\u015F",
    range: 1,
    levels: [
      staffLevel(87, 0, 8, 0, 90, 6e3),
      // +1
      staffLevel(91, 0, 16, 0, 94, 7e3),
      // +2
      staffLevel(95, 1, 24, 1, 98, 8e3),
      // +3
      staffLevel(99, 2, 32, 2, 102, 9e3),
      // +4
      staffLevel(103, 3, 40, 3, 106, 1e4),
      // +5
      staffLevel(107, 4, 48, 4, 110, 11e3),
      // +6
      staffLevel(113, 5, 56, 5, 114, 12e3),
      // +7
      staffLevel(122, 6, 64, 7, 118, 13e3),
      // +8
      staffLevel(135, 8, 72, 10, 122, 14e3),
      // +9
      staffLevel(155, 11, 80, 14, 126, 15e3)
      // +10
    ]
  },
  // Oasis Staff (Unique) — Glacier (element "ice", bkz. data/elements.js).
  // Görseli: mavi-turkuaz buz kristalleriyle kaplı, serin bir asa.
  {
    tier: 6,
    levelMin: 60,
    levelMax: 65,
    name: "Buzvaha Asas\u0131",
    weaponType: "staff",
    weaponSlot: "twoHand",
    weight: 4,
    element: "ice",
    attackSpeed: "\xC7ok Yava\u015F",
    range: 1,
    levels: [
      staffLevel(87, 0, 8, 0, 90, 6e3),
      // +1
      staffLevel(91, 0, 16, 0, 94, 7e3),
      // +2
      staffLevel(95, 1, 24, 1, 98, 8e3),
      // +3
      staffLevel(99, 2, 32, 2, 102, 9e3),
      // +4
      staffLevel(103, 3, 40, 3, 106, 1e4),
      // +5
      staffLevel(107, 4, 48, 4, 110, 11e3),
      // +6
      staffLevel(113, 5, 56, 5, 114, 12e3),
      // +7
      staffLevel(122, 6, 64, 7, 118, 13e3),
      // +8
      staffLevel(135, 8, 72, 10, 122, 14e3),
      // +9
      staffLevel(155, 11, 80, 14, 126, 15e3)
      // +10
    ]
  },
  // Chaotic Staff (Unique) — Lightning. Görseli: mor-eflatun yıldırım
  // çatlaklarıyla kaplı, kaotik bir asa.
  {
    tier: 6,
    levelMin: 60,
    levelMax: 65,
    name: "Kaos Asas\u0131",
    weaponType: "staff",
    weaponSlot: "twoHand",
    weight: 4,
    element: "lightning",
    attackSpeed: "\xC7ok Yava\u015F",
    range: 1,
    levels: [
      staffLevel(87, 0, 8, 0, 90, 6e3),
      // +1
      staffLevel(91, 0, 16, 0, 94, 7e3),
      // +2
      staffLevel(95, 1, 24, 1, 98, 8e3),
      // +3
      staffLevel(99, 2, 32, 2, 102, 9e3),
      // +4
      staffLevel(103, 3, 40, 3, 106, 1e4),
      // +5
      staffLevel(107, 4, 48, 4, 110, 11e3),
      // +6
      staffLevel(113, 5, 56, 5, 114, 12e3),
      // +7
      staffLevel(122, 6, 64, 7, 118, 13e3),
      // +8
      staffLevel(135, 8, 72, 10, 122, 14e3),
      // +9
      staffLevel(155, 11, 80, 14, 126, 15e3)
      // +10
    ]
  }
];
function bloodStaffLevel(atk, intBonus, elementDmg, resKey, res, reqMag, durability) {
  return {
    atk,
    statBonus: { int: intBonus },
    elementBonus: elementDmg,
    resistances: { [resKey]: res },
    reqStats: [{ key: "mag", value: reqMag }, { key: "int", value: 138 }],
    durability
  };
}
CASTER_WEAPONS.push(
  // Hell Blood (Unique) — Flame. Görseli: kan-kızıl, kafatası-tepelikli
  // koyu bir asa — Scorching Staff'ın sade kristalinden bilinçli olarak
  // daha karanlık/organik.
  {
    tier: 6,
    levelMin: 60,
    levelMax: 65,
    name: "Cehennem Kan\u0131",
    weaponType: "staff",
    weaponSlot: "twoHand",
    weight: 3,
    element: "flame",
    attackSpeed: "\xC7ok Yava\u015F",
    range: 1,
    levels: [
      bloodStaffLevel(95, 10, 10, "flame", 20, 114, 1e4),
      // +1
      bloodStaffLevel(99, 12, 15, "flame", 22, 118, 10500),
      // +2
      bloodStaffLevel(103, 14, 20, "flame", 24, 122, 11e3),
      // +3
      bloodStaffLevel(107, 16, 25, "flame", 26, 126, 11500),
      // +4
      bloodStaffLevel(111, 18, 30, "flame", 28, 130, 12e3),
      // +5
      bloodStaffLevel(115, 20, 35, "flame", 30, 134, 12500),
      // +6
      bloodStaffLevel(121, 22, 40, "flame", 32, 138, 13e3),
      // +7
      bloodStaffLevel(130, 24, 45, "flame", 34, 142, 13500),
      // +8
      bloodStaffLevel(143, 26, 50, "flame", 36, 146, 14e3),
      // +9
      bloodStaffLevel(163, 28, 55, "flame", 38, 150, 14500)
      // +10
    ]
  },
  // Elysium (Unique) — Lightning. Görseli: mor-eflatun, elektrik çatlaklı
  // zarif bir asa.
  {
    tier: 6,
    levelMin: 60,
    levelMax: 65,
    name: "Cennetbah\xE7e",
    weaponType: "staff",
    weaponSlot: "twoHand",
    weight: 3,
    element: "lightning",
    attackSpeed: "\xC7ok Yava\u015F",
    range: 1,
    levels: [
      bloodStaffLevel(95, 10, 10, "lightning", 20, 114, 1e4),
      // +1
      bloodStaffLevel(99, 12, 15, "lightning", 22, 118, 10500),
      // +2
      bloodStaffLevel(103, 14, 20, "lightning", 24, 122, 11e3),
      // +3
      bloodStaffLevel(107, 16, 25, "lightning", 26, 126, 11500),
      // +4
      bloodStaffLevel(111, 18, 30, "lightning", 28, 130, 12e3),
      // +5
      bloodStaffLevel(115, 20, 35, "lightning", 30, 134, 12500),
      // +6
      bloodStaffLevel(121, 22, 40, "lightning", 32, 138, 13e3),
      // +7
      bloodStaffLevel(130, 24, 45, "lightning", 34, 142, 13500),
      // +8
      bloodStaffLevel(143, 26, 50, "lightning", 36, 146, 14e3),
      // +9
      bloodStaffLevel(163, 28, 55, "lightning", 38, 150, 14500)
      // +10
    ]
  },
  // Garp (Unique) — Glacier (element "ice"). Görseli: buz-beyaz, sivri
  // kristal uçlu soğuk bir asa.
  {
    tier: 6,
    levelMin: 60,
    levelMax: 65,
    name: "Poyraz",
    weaponType: "staff",
    weaponSlot: "twoHand",
    weight: 3,
    element: "ice",
    attackSpeed: "\xC7ok Yava\u015F",
    range: 1,
    levels: [
      bloodStaffLevel(95, 10, 10, "glacier", 20, 114, 1e4),
      // +1
      bloodStaffLevel(99, 12, 15, "glacier", 22, 118, 10500),
      // +2
      bloodStaffLevel(103, 14, 20, "glacier", 24, 122, 11e3),
      // +3
      bloodStaffLevel(107, 16, 25, "glacier", 26, 126, 11500),
      // +4
      bloodStaffLevel(111, 18, 30, "glacier", 28, 130, 12e3),
      // +5
      bloodStaffLevel(115, 20, 35, "glacier", 30, 134, 12500),
      // +6
      bloodStaffLevel(121, 22, 40, "glacier", 32, 138, 13e3),
      // +7
      bloodStaffLevel(130, 24, 45, "glacier", 34, 142, 13500),
      // +8
      bloodStaffLevel(143, 26, 50, "glacier", 36, 146, 14e3),
      // +9
      bloodStaffLevel(163, 28, 55, "glacier", 38, 150, 14500)
      // +10
    ]
  }
);
function selfnameStaffLevel(atk, magBonus, elemVal, resVal, reqMag, durability) {
  return {
    atk,
    statBonus: { mag: magBonus },
    elements: [
      { key: "flame", bonus: elemVal },
      { key: "ice", bonus: elemVal },
      { key: "lightning", bonus: elemVal }
    ],
    resistances: { flame: resVal, glacier: resVal, lightning: resVal },
    reqStats: [
      { key: "mag", value: reqMag },
      { key: "int", value: 100 }
    ],
    durability
  };
}
function ronsStaffLevel(atk, dexBonus, magBonus, mpBonus, elemVal, resVal, reqMag, durability) {
  return {
    atk,
    statBonus: { dex: dexBonus, mag: magBonus },
    mp: mpBonus,
    elements: [
      { key: "flame", bonus: elemVal },
      { key: "ice", bonus: elemVal },
      { key: "lightning", bonus: elemVal }
    ],
    resistances: { flame: resVal, glacier: resVal, lightning: resVal },
    reqStats: [{ key: "mag", value: reqMag }, { key: "int", value: 112 }],
    durability
  };
}
CASTER_WEAPONS.push(
  // Prismatic Triad Staff (Unique) — Tier 6. Kullanıcının sabitlediği isim
  // ("Staff of <selfname>" gerçek KO kalıbından, artık sade bir sabit ad).
  // Görseli: kişiselleştirilmiş, gösterişli bir asa (kullanıcı görselleri
  // sonradan Gemini ile ayrıca yenileyecek).
  {
    tier: 6,
    levelMin: 60,
    levelMax: 65,
    name: "G\xF6kku\u015Fa\u011F\u0131 Asas\u0131",
    weaponType: "staff",
    weaponSlot: "twoHand",
    weight: 3,
    attackSpeed: "\xC7ok Yava\u015F",
    range: 1,
    levels: [
      selfnameStaffLevel(85, 1, 8, 2, 150, 6e3),
      // +1
      selfnameStaffLevel(89, 2, 16, 4, 154, 7e3),
      // +2
      selfnameStaffLevel(93, 3, 24, 6, 158, 8e3),
      // +3
      selfnameStaffLevel(97, 4, 32, 8, 162, 9e3),
      // +4
      selfnameStaffLevel(101, 5, 40, 10, 166, 1e4),
      // +5
      selfnameStaffLevel(105, 6, 48, 12, 170, 11e3),
      // +6
      selfnameStaffLevel(111, 7, 56, 14, 174, 12e3),
      // +7
      selfnameStaffLevel(120, 8, 64, 16, 178, 13e3),
      // +8
      selfnameStaffLevel(133, 9, 72, 18, 182, 14e3),
      // +9
      selfnameStaffLevel(153, 10, 80, 20, 186, 15e3)
      // +10
    ]
  },
  // Ron's Staff (Unique) — Tier 6. Dexterity Bonus + Magic Power Bonus + MP
  // (mana havuzu) Bonusu bir arada taşıyan hibrit bir eşya, MP Bonusu
  // ekran görüntüsünde +2'den itibaren başlıyordu (+1'de yok).
  {
    tier: 6,
    levelMin: 60,
    levelMax: 65,
    name: "Kadim Asa",
    weaponType: "staff",
    weaponSlot: "twoHand",
    weight: 4,
    attackSpeed: "\xC7ok Yava\u015F",
    range: 1,
    levels: [
      ronsStaffLevel(60, 5, 1, 0, 20, 5, 86, 1e4),
      // +1
      ronsStaffLevel(64, 6, 2, 50, 25, 7, 90, 10500),
      // +2
      ronsStaffLevel(68, 7, 3, 80, 30, 9, 94, 11e3),
      // +3
      ronsStaffLevel(72, 8, 4, 110, 35, 11, 98, 11500),
      // +4
      ronsStaffLevel(76, 9, 5, 140, 40, 13, 102, 12e3),
      // +5
      ronsStaffLevel(80, 10, 6, 170, 45, 15, 106, 12500),
      // +6
      ronsStaffLevel(86, 11, 7, 200, 50, 17, 110, 13e3),
      // +7
      ronsStaffLevel(95, 13, 9, 240, 55, 19, 114, 13500),
      // +8
      ronsStaffLevel(108, 16, 12, 290, 60, 21, 118, 14e3),
      // +9
      ronsStaffLevel(128, 20, 16, 350, 65, 23, 122, 14500)
      // +10
    ]
  }
);

// src/data/originalWeapons.js
init_define_import_meta_env();
var ORIGINAL_WEAPONS = [
  {
    "id": "nyxia_emberfang",
    "cls": "warrior",
    "tier": 2,
    "name": "K\xF6zdi\u015F",
    "legacyName": "Halberd \xB7 Avc\u0131",
    "weaponType": "sword",
    "element": "flame",
    "lore": "K\xF6zle sertle\u015Fmi\u015F \xE7entikli a\u011F\u0131z. G\xFC\xE7 odakl\u0131 yak\u0131n d\xF6v\xFC\u015F k\u0131l\u0131c\u0131.",
    "powerFactor": 1.02,
    "hp": 0,
    "mp": 0,
    "reqOffset": -3
  },
  {
    "id": "nyxia_skyrend",
    "cls": "warrior",
    "tier": 4,
    "name": "G\xF6kyar\u0131k",
    "legacyName": "Blade Axe \xB7 Muhaf\u0131z",
    "weaponType": "axe",
    "element": "lightning",
    "lore": "Geni\u015F hilal ba\u015Fl\u0131 uzun balta. Can ve mana aras\u0131nda dengeli yap\u0131.",
    "powerFactor": 0.98,
    "hp": 6,
    "mp": 4,
    "reqOffset": -2
  },
  {
    "id": "nyxia_gravebreaker",
    "cls": "warrior",
    "tier": 4,
    "name": "Mezark\u0131ran",
    "legacyName": "Blade Axe \xB7 Avc\u0131",
    "weaponType": "mace",
    "element": "poison",
    "lore": "A\u011F\u0131r ta\u015F ba\u015Fl\u0131\u011F\u0131yla dayan\u0131kl\u0131l\u0131\u011F\u0131 destekleyen sava\u015F \xE7ekici.",
    "powerFactor": 0.94,
    "hp": 20,
    "mp": 0,
    "reqOffset": 2
  },
  {
    "id": "nyxia_briarclaw",
    "cls": "rogue",
    "tier": 1,
    "name": "\xC7al\u0131pen\xE7e",
    "legacyName": "Bow \xB7 Avc\u0131",
    "weaponType": "bow",
    "element": "poison",
    "lore": "K\u0131sa dikenli g\xF6vdesiyle hafif bir ba\u015Flang\u0131\xE7 yay\u0131.",
    "powerFactor": 1.01,
    "hp": 3,
    "mp": 0,
    "reqOffset": 2
  },
  {
    "id": "nyxia_dawnstring",
    "cls": "rogue",
    "tier": 2,
    "name": "\u015Eafak Teli",
    "legacyName": "Crossbow \xB7 Avc\u0131",
    "weaponType": "bow",
    "element": null,
    "lore": "Uzun alt\u0131n renkli kollar\u0131 ve mana deste\u011Fiyle av yay\u0131.",
    "powerFactor": 0.99,
    "hp": 0,
    "mp": 5,
    "reqOffset": 1
  },
  {
    "id": "nyxia_scorpionsting",
    "cls": "rogue",
    "tier": 3,
    "name": "Akrep \u0130\u011Fnesi",
    "legacyName": "Iron Crossbow \xB7 Muhaf\u0131z",
    "weaponType": "bow",
    "element": "poison",
    "lore": "Dar \xE7elik kollar\u0131 ve akrep bi\xE7imli g\xF6vdesiyle sald\u0131r\u0131 odakl\u0131 arbalet.",
    "powerFactor": 1.03,
    "hp": 0,
    "mp": 2,
    "reqOffset": 2
  },
  {
    "id": "nyxia_windwing",
    "cls": "rogue",
    "tier": 3,
    "name": "Yelkanat",
    "legacyName": "Iron Crossbow \xB7 Avc\u0131",
    "weaponType": "bow",
    "element": "lightning",
    "lore": "T\xFCy bi\xE7imli kollar\u0131yla can deste\u011Fi sunan yay.",
    "powerFactor": 0.96,
    "hp": 8,
    "mp": 0,
    "reqOffset": 3
  },
  {
    "id": "nyxia_nightstring",
    "cls": "rogue",
    "tier": 4,
    "name": "Gece Kiri\u015Fi",
    "legacyName": "Scorpion Bow \xB7 Muhaf\u0131z",
    "weaponType": "bow",
    "element": "ice",
    "lore": "Keskin a\xE7\u0131l\u0131 obsidyen kollar\u0131 olan mana destekli sava\u015F yay\u0131.",
    "powerFactor": 1.04,
    "hp": 0,
    "mp": 6,
    "reqOffset": -3
  },
  {
    "id": "nyxia_skyharpoon",
    "cls": "rogue",
    "tier": 4,
    "name": "G\xF6kz\u0131pk\u0131n",
    "legacyName": "Scorpion Bow \xB7 Avc\u0131",
    "weaponType": "bow",
    "element": "lightning",
    "lore": "Yuvarlak kurma mekanizmal\u0131, can destekli a\u011F\u0131r arbalet.",
    "powerFactor": 0.95,
    "hp": 12,
    "mp": 0,
    "reqOffset": -2
  },
  {
    "id": "nyxia_crimsoncrescent",
    "cls": "rogue",
    "tier": 5,
    "name": "K\u0131z\u0131l Hilal",
    "legacyName": "Iron Bow \xB7 Muhaf\u0131z",
    "weaponType": "bow",
    "element": "flame",
    "lore": "Ejder pulu kollar\u0131yla y\xFCksek sald\u0131r\u0131l\u0131 k\u0131z\u0131l sava\u015F yay\u0131.",
    "powerFactor": 1.02,
    "hp": 0,
    "mp": 3,
    "reqOffset": 0
  },
  {
    "id": "nyxia_stormeye",
    "cls": "rogue",
    "tier": 5,
    "name": "F\u0131rt\u0131na G\xF6z\xFC",
    "legacyName": "Iron Bow \xB7 Avc\u0131",
    "weaponType": "bow",
    "element": "lightning",
    "lore": "Halka ni\u015Fang\xE2hl\u0131, can ve mana destekli mekanik arbalet.",
    "powerFactor": 0.97,
    "hp": 10,
    "mp": 2,
    "reqOffset": 2
  },
  {
    "id": "nyxia_dewbranch",
    "cls": "mage",
    "tier": 1,
    "name": "\xC7iydal\u0131",
    "legacyName": "Wooden Staff \xB7 Avc\u0131",
    "weaponType": "staff",
    "element": "ice",
    "lore": "\u015Eeffaf \xE7iy damlas\u0131 ba\u015Fl\u0131\u011F\u0131yla can ve mana deste\u011Fi sa\u011Flar.",
    "powerFactor": 0.95,
    "hp": 8,
    "mp": 5,
    "reqOffset": 1
  },
  {
    "id": "nyxia_emberlantern",
    "cls": "mage",
    "tier": 2,
    "name": "Kor Feneri",
    "legacyName": "Iron-Tipped Staff \xB7 Muhaf\u0131z",
    "weaponType": "staff",
    "element": "flame",
    "lore": "Alev ta\u015F\u0131yan fener ba\u015Fl\u0131\u011F\u0131yla sald\u0131r\u0131 a\u011F\u0131rl\u0131kl\u0131 asa.",
    "powerFactor": 1.03,
    "hp": 0,
    "mp": 8,
    "reqOffset": 2
  },
  {
    "id": "nyxia_mooncoil",
    "cls": "mage",
    "tier": 2,
    "name": "Ay Sarmal\u0131",
    "legacyName": "Iron-Tipped Staff \xB7 Avc\u0131",
    "weaponType": "staff",
    "element": "ice",
    "lore": "Spiral ay ba\u015Fl\u0131\u011F\u0131yla geni\u015F mana deste\u011Fi sunar.",
    "powerFactor": 0.98,
    "hp": 4,
    "mp": 14,
    "reqOffset": 3
  },
  {
    "id": "nyxia_frostbell",
    "cls": "mage",
    "tier": 3,
    "name": "Buz \xC7an\u0131",
    "legacyName": "Silk-Bound Staff \xB7 Muhaf\u0131z",
    "weaponType": "staff",
    "element": "ice",
    "lore": "Kristal \xE7an ba\u015Fl\u0131\u011F\u0131yla can odakl\u0131 buz asas\u0131.",
    "powerFactor": 0.96,
    "hp": 10,
    "mp": 4,
    "reqOffset": -3
  },
  {
    "id": "nyxia_hourglass",
    "cls": "mage",
    "tier": 3,
    "name": "Kum Saati",
    "legacyName": "Silk-Bound Staff \xB7 Avc\u0131",
    "weaponType": "staff",
    "element": null,
    "lore": "Alt\u0131n kum dolu ba\u015Fl\u0131\u011F\u0131yla mana odakl\u0131 asa.",
    "powerFactor": 1.01,
    "hp": 0,
    "mp": 12,
    "reqOffset": -2
  },
  {
    "id": "nyxia_soullight",
    "cls": "mage",
    "tier": 4,
    "name": "Ruh Feneri",
    "legacyName": "Crimson-Runed Staff \xB7 Muhaf\u0131z",
    "weaponType": "staff",
    "element": "poison",
    "lore": "Kafes ba\u015Fl\u0131\u011F\u0131 i\xE7indeki ruh \u0131\u015F\u0131\u011F\u0131yla can deste\u011Fi sunar.",
    "powerFactor": 0.94,
    "hp": 16,
    "mp": 0,
    "reqOffset": -2
  },
  {
    "id": "nyxia_skyseal",
    "cls": "mage",
    "tier": 4,
    "name": "G\xF6k M\xFChr\xFC",
    "legacyName": "Crimson-Runed Staff \xB7 Avc\u0131",
    "weaponType": "staff",
    "element": "lightning",
    "lore": "\xDC\xE7 i\xE7 i\xE7e m\xFCh\xFCr ba\u015Fl\u0131\u011F\u0131yla y\xFCksek sald\u0131r\u0131l\u0131 asa.",
    "powerFactor": 1.04,
    "hp": 0,
    "mp": 6,
    "reqOffset": 2
  },
  {
    "id": "nyxia_voidcrown",
    "cls": "mage",
    "tier": 5,
    "name": "Hi\xE7lik Tac\u0131",
    "legacyName": "Chitin-Woven Staff \xB7 Muhaf\u0131z",
    "weaponType": "staff",
    "element": null,
    "lore": "Par\xE7al\u0131 ta\xE7 ba\u015Fl\u0131\u011F\u0131yla y\xFCksek mana deste\u011Fi sunar.",
    "powerFactor": 0.97,
    "hp": 12,
    "mp": 18,
    "reqOffset": 1
  },
  {
    "id": "nyxia_suncore",
    "cls": "mage",
    "tier": 5,
    "name": "G\xFCne\u015F \xC7ekirde\u011Fi",
    "legacyName": "Chitin-Woven Staff \xB7 Avc\u0131",
    "weaponType": "staff",
    "element": "flame",
    "lore": "I\u015F\u0131n bi\xE7imli ba\u015Fl\u0131\u011F\u0131yla sald\u0131r\u0131 ve mana aras\u0131nda dengeli asa.",
    "powerFactor": 1.02,
    "hp": 0,
    "mp": 10,
    "reqOffset": 2
  }
];

// src/data/balancedWeapons.js
var WEAPON_BALANCE_VERSION = 2;
var WEAPON_TIER_LEVEL = [0, 1, 15, 25, 40, 50, 60];
var power = [0, 20, 48, 76, 104, 132, 154];
var growth = [1, 1.07, 1.14, 1.22, 1.31, 1.42, 1.57, 1.78, 1.98, 2.2];
var bases = { warrior: 65, rogue: 70, mage: 70 };
var families = { warrior: WARRIOR_WEAPONS, rogue: ROGUE_WEAPONS, mage: CASTER_WEAPONS };
function balanceFamily(table, cls) {
  const expanded = [...table, ...ORIGINAL_WEAPONS.filter((w) => w.cls === cls)];
  return expanded.map((w) => {
    const peers = expanded.filter((x) => x.tier === w.tier);
    const rank = peers.indexOf(w);
    const factor = w.powerFactor ?? [1, 0.96, 1.04][rank % 3];
    const level = WEAPON_TIER_LEVEL[w.tier];
    const available = 10 + 3 * (level - 1);
    const req = cls === "mage" ? [
      { key: "int", value: w.tier === 1 ? 70 : 70 + Math.floor(available * 0.42) },
      { key: "mag", value: 70 + Math.floor(available * 0.2) }
    ] : [{ key: cls === "warrior" ? "str" : "dex", value: bases[cls] + Math.floor(available * 0.72) }];
    const offset = w.reqOffset ?? rank - 1;
    req[req.length - 1] = { ...req.at(-1), value: req.at(-1).value + offset };
    return {
      ...w,
      balanceVersion: WEAPON_BALANCE_VERSION,
      artName: w.artName || w.name,
      levels: growth.map((mult, i) => ({
        atk: Math.round(power[w.tier] * factor * mult * (cls === "mage" ? 1.12 : cls === "rogue" ? 0.94 : 1)),
        hp: Math.round((w.id ? w.hp : rank % 3 === 1 ? power[w.tier] * 0.35 : 0) * mult),
        mp: Math.round((w.id ? w.mp : rank % 3 === 0 ? power[w.tier] * 0.2 : 0) * mult),
        statBonus: null,
        elementBonus: Math.round(w.tier * 3 * mult),
        reqStats: req,
        durability: 3e3 + w.tier * 2e3 + i * 500
      })),
      reqStats: req
    };
  });
}
var BALANCED_WEAPONS = Object.fromEntries(Object.entries(families).map(([cls, table]) => [cls, balanceFamily(table, cls)]));

// src/data/armorSets.js
init_define_import_meta_env();
var ARMOR_SETS = [
  // warrior
  { cls: "warrior", slot: "chest", tier: 1, levelMin: 1, levelMax: 15, name: "Quilted Pauldron", def: 20, reqStats: [{ key: "str", value: 62 }] },
  { cls: "warrior", slot: "chest", tier: 2, levelMin: 15, levelMax: 25, name: "Half Plate Pauldron", def: 40, reqStats: [{ key: "str", value: 100 }] },
  { cls: "warrior", slot: "chest", tier: 3, levelMin: 25, levelMax: 40, name: "Plate Armor Pauldron", def: 66, reqStats: [{ key: "str", value: 124 }] },
  { cls: "warrior", slot: "chest", tier: 4, levelMin: 40, levelMax: 60, name: "Carapace Armor Pauldron", def: 135, reqStats: [{ key: "str", value: 160 }] },
  { cls: "warrior", slot: "chest", tier: 5, levelMin: 60, levelMax: 65, name: "Bone Shell Pauldron", def: 149, reqStats: [{ key: "str", value: 176 }] },
  { cls: "warrior", slot: "legs", tier: 1, levelMin: 1, levelMax: 15, name: "Leather Pads", def: 16, reqStats: [{ key: "str", value: 58 }] },
  { cls: "warrior", slot: "legs", tier: 2, levelMin: 15, levelMax: 25, name: "Half Plate Pads", def: 32, reqStats: [{ key: "str", value: 96 }] },
  { cls: "warrior", slot: "legs", tier: 3, levelMin: 25, levelMax: 40, name: "Plate Armor Pads", def: 52, reqStats: [{ key: "str", value: 120 }] },
  { cls: "warrior", slot: "legs", tier: 4, levelMin: 40, levelMax: 60, name: "Carapace Armor Pads", def: 108, reqStats: [{ key: "str", value: 156 }] },
  { cls: "warrior", slot: "legs", tier: 5, levelMin: 60, levelMax: 65, name: "Bone Shell Pads", def: 119, reqStats: [{ key: "str", value: 172 }] },
  { cls: "warrior", slot: "head", tier: 1, levelMin: 1, levelMax: 15, name: "Leather Cap", def: 12, reqStats: [{ key: "str", value: 54 }] },
  { cls: "warrior", slot: "head", tier: 2, levelMin: 15, levelMax: 25, name: "Half Plate Helmet", def: 24, reqStats: [{ key: "str", value: 92 }] },
  { cls: "warrior", slot: "head", tier: 3, levelMin: 25, levelMax: 40, name: "Plate Armor Helmet", def: 39, reqStats: [{ key: "str", value: 116 }] },
  { cls: "warrior", slot: "head", tier: 4, levelMin: 40, levelMax: 60, name: "Carapace Armor Helmet", def: 81, reqStats: [{ key: "str", value: 152 }] },
  { cls: "warrior", slot: "head", tier: 5, levelMin: 60, levelMax: 65, name: "Bone Shell Helmet", def: 89, reqStats: [{ key: "str", value: 168 }] },
  { cls: "warrior", slot: "gauntlets", tier: 1, levelMin: 1, levelMax: 15, name: "Leather Gloves", def: 8, reqStats: [{ key: "str", value: 46 }] },
  { cls: "warrior", slot: "gauntlets", tier: 2, levelMin: 15, levelMax: 25, name: "Half Plate Gauntlet", def: 16, reqStats: [{ key: "str", value: 84 }] },
  { cls: "warrior", slot: "gauntlets", tier: 3, levelMin: 25, levelMax: 40, name: "Plate Armor Gauntlet", def: 26, reqStats: [{ key: "str", value: 108 }] },
  { cls: "warrior", slot: "gauntlets", tier: 4, levelMin: 40, levelMax: 60, name: "Carapace Armor Gauntlet", def: 54, reqStats: [{ key: "str", value: 144 }] },
  { cls: "warrior", slot: "gauntlets", tier: 5, levelMin: 60, levelMax: 65, name: "Bone Shell Gauntlet", def: 60, reqStats: [{ key: "str", value: 160 }] },
  { cls: "warrior", slot: "boots", tier: 1, levelMin: 1, levelMax: 15, name: "Leather Shoes", def: 8, reqStats: [{ key: "str", value: 50 }] },
  { cls: "warrior", slot: "boots", tier: 2, levelMin: 15, levelMax: 25, name: "Half Plate Boots", def: 16, reqStats: [{ key: "str", value: 88 }] },
  { cls: "warrior", slot: "boots", tier: 3, levelMin: 25, levelMax: 40, name: "Plate Armor Boots", def: 26, reqStats: [{ key: "str", value: 112 }] },
  { cls: "warrior", slot: "boots", tier: 4, levelMin: 40, levelMax: 60, name: "Carapace Armor Boots", def: 54, reqStats: [{ key: "str", value: 148 }] },
  { cls: "warrior", slot: "boots", tier: 5, levelMin: 60, levelMax: 65, name: "Bone Shell Boots", def: 60, reqStats: [{ key: "str", value: 164 }] },
  // rogue
  { cls: "rogue", slot: "chest", tier: 1, levelMin: 1, levelMax: 15, name: "Rogue Shirt", def: 14, reqStats: [{ key: "dex", value: 62 }] },
  { cls: "rogue", slot: "chest", tier: 2, levelMin: 15, levelMax: 25, name: "Rogue Half Plate Pauldron", def: 28, reqStats: [{ key: "dex", value: 100 }] },
  { cls: "rogue", slot: "chest", tier: 3, levelMin: 25, levelMax: 40, name: "Rogue Plate Armor Pauldron", def: 46, reqStats: [{ key: "dex", value: 124 }] },
  { cls: "rogue", slot: "chest", tier: 4, levelMin: 40, levelMax: 60, name: "Rogue Carapace Armor Pauldron", def: 94, reqStats: [{ key: "dex", value: 160 }] },
  { cls: "rogue", slot: "chest", tier: 5, levelMin: 60, levelMax: 65, name: "Rogue Bone Shell Pauldron", def: 104, reqStats: [{ key: "dex", value: 176 }] },
  { cls: "rogue", slot: "legs", tier: 1, levelMin: 1, levelMax: 15, name: "Rogue Pads", def: 11, reqStats: [{ key: "dex", value: 58 }] },
  { cls: "rogue", slot: "legs", tier: 2, levelMin: 15, levelMax: 25, name: "Rogue Half Plate Pads", def: 22, reqStats: [{ key: "dex", value: 96 }] },
  { cls: "rogue", slot: "legs", tier: 3, levelMin: 25, levelMax: 40, name: "Rogue Plate Armor Pads", def: 36, reqStats: [{ key: "dex", value: 120 }] },
  { cls: "rogue", slot: "legs", tier: 4, levelMin: 40, levelMax: 60, name: "Rogue Carapace Armor Pads", def: 75, reqStats: [{ key: "dex", value: 156 }] },
  { cls: "rogue", slot: "legs", tier: 5, levelMin: 60, levelMax: 65, name: "Rogue Bone Shell Pads", def: 83, reqStats: [{ key: "dex", value: 172 }] },
  { cls: "rogue", slot: "head", tier: 1, levelMin: 1, levelMax: 15, name: "Rogue Cap", def: 8, reqStats: [{ key: "dex", value: 54 }] },
  { cls: "rogue", slot: "head", tier: 2, levelMin: 15, levelMax: 25, name: "Rogue Helmet", def: 16, reqStats: [{ key: "dex", value: 92 }] },
  { cls: "rogue", slot: "head", tier: 3, levelMin: 25, levelMax: 40, name: "Rogue Plate Helmet", def: 27, reqStats: [{ key: "dex", value: 116 }] },
  { cls: "rogue", slot: "head", tier: 4, levelMin: 40, levelMax: 60, name: "Rogue Carapace Armor Helmet", def: 56, reqStats: [{ key: "dex", value: 152 }] },
  { cls: "rogue", slot: "head", tier: 5, levelMin: 60, levelMax: 65, name: "Rogue Bone Shell Helmet", def: 63, reqStats: [{ key: "dex", value: 168 }] },
  { cls: "rogue", slot: "gauntlets", tier: 1, levelMin: 1, levelMax: 15, name: "Rogue Gloves", def: 5, reqStats: [{ key: "dex", value: 46 }] },
  { cls: "rogue", slot: "gauntlets", tier: 2, levelMin: 15, levelMax: 25, name: "Rogue Gauntlet", def: 11, reqStats: [{ key: "dex", value: 84 }] },
  { cls: "rogue", slot: "gauntlets", tier: 3, levelMin: 25, levelMax: 40, name: "Rogue Plate Gauntlet", def: 18, reqStats: [{ key: "dex", value: 108 }] },
  { cls: "rogue", slot: "gauntlets", tier: 4, levelMin: 40, levelMax: 60, name: "Rogue Carapace Armor Gauntlet", def: 37, reqStats: [{ key: "dex", value: 144 }] },
  { cls: "rogue", slot: "gauntlets", tier: 5, levelMin: 60, levelMax: 65, name: "Rogue Bone Shell Gauntlet", def: 42, reqStats: [{ key: "dex", value: 160 }] },
  { cls: "rogue", slot: "boots", tier: 1, levelMin: 1, levelMax: 15, name: "Rogue Shoes", def: 5, reqStats: [{ key: "dex", value: 50 }] },
  { cls: "rogue", slot: "boots", tier: 2, levelMin: 15, levelMax: 25, name: "Rogue Boots", def: 11, reqStats: [{ key: "dex", value: 88 }] },
  { cls: "rogue", slot: "boots", tier: 3, levelMin: 25, levelMax: 40, name: "Rogue Plate Boots", def: 18, reqStats: [{ key: "dex", value: 112 }] },
  { cls: "rogue", slot: "boots", tier: 4, levelMin: 40, levelMax: 60, name: "Rogue Carapace Armor Boots", def: 37, reqStats: [{ key: "dex", value: 148 }] },
  { cls: "rogue", slot: "boots", tier: 5, levelMin: 60, levelMax: 65, name: "Rogue Bone Shell Boots", def: 42, reqStats: [{ key: "dex", value: 164 }] },
  // mage
  { cls: "mage", slot: "chest", tier: 1, levelMin: 1, levelMax: 15, name: "Mage Cotton Robe", def: 12, reqStats: [{ key: "int", value: 62 }] },
  { cls: "mage", slot: "chest", tier: 2, levelMin: 15, levelMax: 25, name: "Mage Linen Robe", def: 24, reqStats: [{ key: "int", value: 100 }] },
  { cls: "mage", slot: "chest", tier: 3, levelMin: 25, levelMax: 40, name: "Mage Silk Robe", def: 39, reqStats: [{ key: "int", value: 124 }] },
  { cls: "mage", slot: "chest", tier: 4, levelMin: 40, levelMax: 60, name: "Crimson Robe", def: 81, reqStats: [{ key: "int", value: 160 }] },
  { cls: "mage", slot: "chest", tier: 5, levelMin: 60, levelMax: 65, name: "Complete Robe", def: 89, reqStats: [{ key: "int", value: 160 }] },
  { cls: "mage", slot: "legs", tier: 1, levelMin: 1, levelMax: 15, name: "Mage Cloth Pants", def: 9, reqStats: [{ key: "int", value: 58 }] },
  { cls: "mage", slot: "legs", tier: 2, levelMin: 15, levelMax: 25, name: "Mage Linen Pants", def: 19, reqStats: [{ key: "int", value: 96 }] },
  { cls: "mage", slot: "legs", tier: 3, levelMin: 25, levelMax: 40, name: "Mage Silk Pants", def: 31, reqStats: [{ key: "int", value: 120 }] },
  { cls: "mage", slot: "legs", tier: 4, levelMin: 40, levelMax: 60, name: "Crimson Pants", def: 64, reqStats: [{ key: "int", value: 156 }] },
  { cls: "mage", slot: "legs", tier: 5, levelMin: 60, levelMax: 65, name: "Complete Pants", def: 72, reqStats: [{ key: "int", value: 156 }] },
  { cls: "mage", slot: "head", tier: 1, levelMin: 1, levelMax: 15, name: "Mage Hat", def: 7, reqStats: [{ key: "int", value: 54 }] },
  { cls: "mage", slot: "head", tier: 2, levelMin: 15, levelMax: 25, name: "Mage Linen Cap", def: 14, reqStats: [{ key: "int", value: 92 }] },
  { cls: "mage", slot: "head", tier: 3, levelMin: 25, levelMax: 40, name: "Mage Helmet", def: 23, reqStats: [{ key: "int", value: 116 }] },
  { cls: "mage", slot: "head", tier: 4, levelMin: 40, levelMax: 60, name: "Crimson Helmet", def: 48, reqStats: [{ key: "int", value: 152 }] },
  { cls: "mage", slot: "head", tier: 5, levelMin: 60, levelMax: 65, name: "Complete Helmet", def: 54, reqStats: [{ key: "int", value: 152 }] },
  { cls: "mage", slot: "gauntlets", tier: 1, levelMin: 1, levelMax: 15, name: "Mage Gloves", def: 4, reqStats: [{ key: "int", value: 46 }] },
  { cls: "mage", slot: "gauntlets", tier: 2, levelMin: 15, levelMax: 25, name: "Mage Leather Gloves", def: 9, reqStats: [{ key: "int", value: 84 }] },
  { cls: "mage", slot: "gauntlets", tier: 3, levelMin: 25, levelMax: 40, name: "Mage Hard Leather Gloves", def: 15, reqStats: [{ key: "int", value: 108 }] },
  { cls: "mage", slot: "gauntlets", tier: 4, levelMin: 40, levelMax: 60, name: "Crimson Gloves", def: 32, reqStats: [{ key: "int", value: 144 }] },
  { cls: "mage", slot: "gauntlets", tier: 5, levelMin: 60, levelMax: 65, name: "Complete Glove", def: 36, reqStats: [{ key: "int", value: 144 }] },
  { cls: "mage", slot: "boots", tier: 1, levelMin: 1, levelMax: 15, name: "Mage Shoes", def: 4, reqStats: [{ key: "int", value: 50 }] },
  { cls: "mage", slot: "boots", tier: 2, levelMin: 15, levelMax: 25, name: "Mage Leather Boots", def: 9, reqStats: [{ key: "int", value: 88 }] },
  { cls: "mage", slot: "boots", tier: 3, levelMin: 25, levelMax: 40, name: "Mage Hard Leather Boots", def: 15, reqStats: [{ key: "int", value: 112 }] },
  { cls: "mage", slot: "boots", tier: 4, levelMin: 40, levelMax: 60, name: "Crimson Boots", def: 32, reqStats: [{ key: "int", value: 148 }] },
  { cls: "mage", slot: "boots", tier: 5, levelMin: 60, levelMax: 65, name: "Complete Boots", def: 36, reqStats: [{ key: "int", value: 148 }] }
];

// src/data/accessories.js
init_define_import_meta_env();
var SLOT_LABEL = { earring: "K\xFCpe", necklace: "Kolye", ring: "Y\xFCz\xFCk", belt: "Kemer" };
var FAMILIES = [
  { key: "guardian", names: ["Yol Muhaf\u0131z\u0131", "Kaya Muhaf\u0131z\u0131", "Kale Muhaf\u0131z\u0131", "Ejder Muhaf\u0131z\u0131", "Titan Muhaf\u0131z\u0131"], statBonus: (n) => ({ str: n }) },
  { key: "ranger", names: ["\u0130z S\xFCr\xFCc\xFC", "K\xFCl Avc\u0131s\u0131", "Gece Avc\u0131s\u0131", "F\u0131rt\u0131na Avc\u0131s\u0131", "Y\u0131ld\u0131z Avc\u0131s\u0131"], statBonus: (n) => ({ dex: n }) },
  { key: "arcane", names: ["\xC7\u0131rak Arkan\u0131", "S\u0131r Arkan\u0131", "R\xFCn Arkan\u0131", "Kristal Arkan\u0131", "Astral Arkan\u0131"], statBonus: (n) => ({ int: n, mag: n }) }
];
var SLOT_SCALE = { earring: 0.85, necklace: 1.2, ring: 1, belt: 1.1 };
var round = (n) => Math.max(1, Math.round(n));
var scaleStats = (stats, factor) => Object.fromEntries(Object.entries(stats).map(([key, value]) => [key, round(value * factor)]));
function statLine(tier, family, slot, level = 0) {
  const scale = SLOT_SCALE[slot];
  const statBase = tier + level * 0.55;
  return {
    def: round((tier * 2 + level * 1.4) * scale),
    hp: round((tier * 6 + level * 4) * scale),
    mp: family.key === "arcane" ? round((tier * 5 + level * 3) * scale) : 0,
    statBonus: scaleStats(family.statBonus(statBase), scale)
  };
}
function makeAccessory(family, slot, tier) {
  return {
    ...statLine(tier, family, slot),
    tier,
    slot,
    family: family.key,
    name: `${family.names[tier - 1]} ${SLOT_LABEL[slot]}`,
    levels: [1, 2, 3, 4, 5].map((level) => statLine(tier, family, slot, level))
  };
}
function catalogFor(slot) {
  return FAMILIES.flatMap((family) => [1, 2, 3, 4, 5].map((tier) => makeAccessory(family, slot, tier)));
}
var ACCESSORY_SETS = { earring: catalogFor("earring"), necklace: catalogFor("necklace"), ring: catalogFor("ring"), belt: catalogFor("belt") };
var MAP_ACCESSORIES = [
  { tier: 1, mapTier: 1, slot: "ring", family: "starter", name: "Y\u0131pranm\u0131\u015F G\xFC\xE7 Y\xFCz\xFC\u011F\xFC", def: 1, hp: 3, mp: 0, statBonus: { str: 6 }, upgradeLocked: true },
  { tier: 2, mapTier: 2, slot: "ring", family: "starter", name: "K\xFCl G\xFC\xE7 Y\xFCz\xFC\u011F\xFC", def: 2, hp: 5, mp: 0, statBonus: { str: 7 }, upgradeLocked: true },
  { tier: 2, mapTier: 2, slot: "ring", family: "starter", name: "Volkan G\xFC\xE7 Y\xFCz\xFC\u011F\xFC", def: 2, hp: 6, mp: 0, statBonus: { str: 8 }, upgradeLocked: true }
];
var WARDS = [
  { key: "sword", name: "Kesik Ay", stat: "str" },
  { key: "axe", name: "K\u0131r\u0131lmaz M\xFCh\xFCr", stat: "sta" },
  { key: "longspear", name: "M\u0131zrak K\u0131ran", stat: "dex" },
  { key: "mace", name: "Ta\u015F Y\xFCrek", stat: "sta" },
  { key: "bow", name: "R\xFCzg\xE2r Perdesi", stat: "dex" },
  { key: "staff", name: "Sessiz R\xFCn", stat: "mag" }
];
for (const tier of [5, 6]) for (const ward of WARDS) for (const slot of Object.keys(ACCESSORY_SETS)) {
  const stats = (level) => ({ def: Math.round((tier + level) * SLOT_SCALE[slot]), hp: Math.round((tier * 8 + level * 5) * SLOT_SCALE[slot]), mp: ward.key === "staff" ? tier * 4 + level * 3 : 0, statBonus: { [ward.stat]: Math.round((tier * 0.6 + level * 0.4) * SLOT_SCALE[slot]) }, defenseAbility: { vs: ward.key, value: (tier === 6 ? 6 : 4) + level } });
  ACCESSORY_SETS[slot].push({ ...stats(0), tier, slot, family: "ward_" + ward.key, name: `${tier === 6 ? "Kadim " : ""}${ward.name} ${SLOT_LABEL[slot]}`, levels: [1, 2, 3, 4, 5].map(stats) });
}

// src/data/lootAdminCatalog.js
var LOOT_ADMIN_CATALOG = [
  ...Object.entries(BALANCED_WEAPONS).flatMap(([cls, items]) => items.map((w) => ({ key: `weapon:${cls}:${w.name}`, kind: "weapon", class: cls, name: w.name, tier: w.tier }))),
  ...WARRIOR_SHIELDS.map((w) => ({ key: `shield:${w.name}`, kind: "shield", class: "warrior", name: w.name, tier: w.tier })),
  ...ARMOR_SETS.map((w) => ({ key: `armor:${w.cls}:${w.slot}:${w.tier}`, kind: "armor", class: w.cls, slot: w.slot, name: w.name, tier: w.tier })),
  ...Object.entries(ACCESSORY_SETS).flatMap(([slot, items]) => items.map((w) => ({ key: `accessory:${slot}:${w.name}`, kind: "accessory", slot, name: w.name, tier: w.tier, minLevel: 0, maxLevel: 3 }))),
  ...MAP_ACCESSORIES.map((w) => ({ key: `accessory:${w.slot}:${w.name}`, kind: "accessory", slot: w.slot, name: w.name, tier: w.tier, mapTier: w.mapTier, minLevel: 0, maxLevel: 1 }))
];

// src/data/weapons.js
init_define_import_meta_env();
var WEAPON_CATALOG = {
  warrior: {
    twoHand: ["Geni\u015F K\u0131l\u0131\xE7", "Sava\u015F Baltas\u0131", "Sava\u015F \xC7ekici", "\u0130ki Elli M\u0131zrak"],
    mainHand: ["Tek Elli K\u0131l\u0131\xE7", "M\u0131zrak", "Sava\u015F Baltas\u0131"],
    offHandWeapon: ["Tek Elli K\u0131l\u0131\xE7", "El Baltas\u0131", "Han\xE7er"],
    offHandShield: ["Kalkan", "Kule Kalkan\u0131", "Tokmak Kalkan"]
  },
  rogue: {
    twoHand: ["Uzun Yay", "Avc\u0131 Yay\u0131", "Sava\u015F Yay\u0131"],
    mainHand: ["Han\xE7er", "K\u0131sa K\u0131l\u0131\xE7"],
    offHandWeapon: ["Han\xE7er", "K\u0131sa K\u0131l\u0131\xE7"],
    offHandShield: []
  },
  mage: {
    twoHand: ["B\xFCy\xFC Asas\u0131", "Arkane Asa", "Kristal Asa"],
    mainHand: ["De\u011Fnek"],
    offHandWeapon: ["B\xFCy\xFC Kitab\u0131", "Grimoire", "Kristal K\xFCre"],
    offHandShield: []
  }
};

// src/data/weaponIcons.js
init_define_import_meta_env();
var WEAPON_ICON_MAP = {
  "Geni\u015F K\u0131l\u0131\xE7": "sword",
  "Tek Elli K\u0131l\u0131\xE7": "sword",
  "K\u0131sa K\u0131l\u0131\xE7": "sword",
  "Sava\u015F Baltas\u0131": "axe",
  "El Baltas\u0131": "axe",
  "Sava\u015F \xC7ekici": "hammer",
  "Kutsal \xC7eki\xE7": "hammer",
  "Topuz": "hammer",
  "Sava\u015F Topuzu": "hammer",
  "\u0130ki Elli M\u0131zrak": "spear",
  "M\u0131zrak": "spear",
  "Han\xE7er": "dagger",
  "Kalkan": "shield",
  "Kule Kalkan\u0131": "shield",
  "Tokmak Kalkan": "shield",
  "Kutsal Kalkan": "shield",
  "Uzun Yay": "bow",
  "Avc\u0131 Yay\u0131": "bow",
  "Sava\u015F Yay\u0131": "bow",
  "B\xFCy\xFC Asas\u0131": "staff",
  "Arkane Asa": "staff",
  "Kristal Asa": "staff",
  "De\u011Fnek": "staff",
  "Asa De\u011Fnek": "staff",
  "B\xFCy\xFC Kitab\u0131": "book",
  "Grimoire": "book",
  "Kristal K\xFCre": "orb",
  "Kutsal T\u0131ls\u0131m": "talisman"
};
function weaponIconKey(baseName) {
  return WEAPON_ICON_MAP[baseName] || "sword";
}

// src/utils/upgrade.js
init_define_import_meta_env();
var SCROLL_PRICES = { 1: 100, 2: 300, 3: 750, 4: 2e3, 5: 5e3, 6: 1e4 };
function scrollPrice(tierId) {
  return SCROLL_PRICES[tierId] ?? 0;
}
var MAX_UPGRADE_LEVEL = 8;
var UPGRADE_CHANCE = {
  0: 1,
  // +0 -> +1
  1: 1,
  // +1 -> +2
  2: 1,
  // +2 -> +3
  3: 0.9,
  // +3 -> +4
  4: 0.75,
  // +4 -> +5
  5: 0.5,
  // +5 -> +6
  6: 0.25,
  // +6 -> +7
  7: 0.08
  // +7 -> +8
};
var BONUS_SCROLL_CHANCE = {
  0: 1,
  1: 1,
  2: 1,
  3: 1,
  4: 1,
  // +0 through +5: guaranteed
  5: 0.65,
  // +5 -> +6
  6: 0.35,
  // +6 -> +7
  7: 0.15
  // +7 -> +8
};
function upgradeSuccessChance(level, useBonusScroll = false) {
  return useBonusScroll ? BONUS_SCROLL_CHANCE[level] ?? 0 : UPGRADE_CHANCE[level] ?? 0;
}
function bumpedStats(item) {
  return {
    atk: item.atk ? Math.round(item.atk * 1.18) : 0,
    def: item.def ? Math.round(item.def * 1.18) : 0,
    hp: item.hp ? Math.round(item.hp * 1.18) : 0,
    mp: item.mp ? Math.round(item.mp * 1.18) : 0
  };
}
function statsAtLevel(item, level) {
  const levels = item.levels;
  if (!levels || levels.length === 0) return null;
  const idx = Math.min(Math.max(level, 1), levels.length) - 1;
  return levels[idx];
}
function applyLevelData(item, level) {
  if (item.upgradeLocked) return item;
  if (level <= 0) return { ...item, upgradeLevel: 0 };
  const data = statsAtLevel(item, level);
  if (!data) return item;
  const durability = data.durability ?? item.durability;
  return {
    ...item,
    atk: data.atk ?? 0,
    def: data.def ?? 0,
    hp: data.hp ?? 0,
    mp: data.mp ?? 0,
    elementBonus: data.elementBonus ?? item.elementBonus ?? null,
    // `elements` — tek bir `element`/`elementBonus` yerine BİRDEN FAZLA
    // element hasarı birden taşıyan eşyalar için (bkz. data/casterWeapons.js
    // #Staff of <selfname>/Ron's Staff, "hem glacier hem lightning hem de
    // flame" isteği) — [{ key, bonus }, ...] şeklinde, ItemTooltip'te
    // `item.element` tekilinin yanında ayrıca render ediliyor.
    elements: data.elements ?? item.elements ?? null,
    statBonus: data.statBonus ?? item.statBonus ?? null,
    reqStats: data.reqStats ?? item.reqStats,
    resistances: data.resistances ?? item.resistances ?? null,
    // `defenseAbility`/`attackPowerPct` — String of Skulls gibi takılarda
    // seviyeye göre gerçekten değişiyor (bkz. data/accessories.js), önceden
    // burada hiç taşınmıyordu (Eagle's Eye/Prismatic Triad Staff'ın kendi
    // defenseAbility'si de aynı sebepten yükseltmede hiç güncellenmiyordu —
    // ama o zamana kadar hiçbir yerde tüketilmediği için hiç fark
    // edilmemişti). `resistances` da aynı sebepten artık item'ın önceki
    // değerine düşüyor (level verisi boşsa sıfırlamak yerine).
    defenseAbility: data.defenseAbility ?? item.defenseAbility ?? null,
    attackPowerPct: data.attackPowerPct ?? item.attackPowerPct ?? 0,
    itemGrade: data.itemGrade ?? null,
    durability,
    currentDurability: durability,
    upgradeLevel: level
  };
}

// src/data/startingWeapons.js
init_define_import_meta_env();
var STARTING_WEAPONS = {
  warrior: { name: "Short Blade", weaponType: "sword", weaponSlot: "mainHand", atk: 16, reqStats: [{ key: "str", value: 62 }] },
  rogue: { name: "Bow", weaponType: "bow", weaponSlot: "mainHand", atk: 16, reqStats: [{ key: "dex", value: 66 }] },
  mage: { name: "Wood Staff", weaponType: "staff", weaponSlot: "mainHand", atk: 18, reqStats: [{ key: "int", value: 46 }] }
};

// src/utils/dropConfig.js
init_define_import_meta_env();

// src/data/dropRules.js
init_define_import_meta_env();

// src/data/warzone.js
init_define_import_meta_env();
var WARZONE_UNLOCK_LEVEL = 50;
var WARZONE_TELEPORT_COST = 50;
var WARZONE_HUNT_POWER_MULT = 1.5;
var WARZONE_HUNT_GOLD_MULT = 1.5;
var WARZONE_HUNT_DROP_MULT = 1.3;
var WORLD_BOSS_ATK_MULT = 3;
var WORLD_BOSS_HP_MULT = 0.25;
var WORLD_BOSS_DEF_MULT = 3.8;
var BASE_BOSS_STATS = {
  hp: Math.round(7360 * WORLD_BOSS_HP_MULT),
  atk: Math.round(81 * WORLD_BOSS_ATK_MULT),
  def: Math.round(68 * WORLD_BOSS_DEF_MULT),
  lootTier: 6,
  bonusGoldMin: 300,
  bonusGoldMax: 550,
  equipDropChance: 0.45,
  chestDropChance: 0.15,
  scrollDropChance: 0.18
};
var WARZONE_BOSSES = [
  { id: "meydan_cellati", name: "Meydan Cell\xE2d\u0131", color: "#C9425A", visualSourceId: "kizil_muhafiz", ...BASE_BOSS_STATS },
  { id: "kan_imparatoru", name: "Kan \u0130mparatoru", color: "#8B6FC9", visualSourceId: "karanlik_cagirici", ...BASE_BOSS_STATS },
  { id: "golge_efendisi", name: "G\xF6lge Efendisi", color: "#4FC3D9", visualSourceId: "golge_vaizi", ...BASE_BOSS_STATS },
  { id: "alev_tanrisi", name: "Alev Tanr\u0131s\u0131", color: "#D4AF6A", visualSourceId: "alev_cellati", ...BASE_BOSS_STATS },
  { id: "buz_krali", name: "Buz Kral\u0131", color: "#5FA8A0", visualSourceId: "don_devi", ...BASE_BOSS_STATS },
  { id: "kaos_avatari", name: "Kaos Avatar\u0131", color: "#E8A5AF", visualSourceId: "kaos_iblisi", ...BASE_BOSS_STATS }
];

// src/data/soloDungeon.js
init_define_import_meta_env();
var SOLO_DUNGEON_DAILY_LIMIT = 3;
var EXTRA_DUNGEON_ENTRIES_PER_PURCHASE = 1;
var EXTRA_DUNGEON_ENTRY_COST_DIAMONDS = 150;
var REGULAR_STAGE_MULT = [1, 1.22, 1.48, 1.8, 2.2];
var BOSS_STAGE_MULT = 3.2;
var SOLO_DUNGEON_STAGE_COUNT = REGULAR_STAGE_MULT.length + 1;
function scaleStage(base, mult) {
  return {
    hp: Math.round(base.hp * mult),
    atk: Math.round(base.atk * (1 + (mult - 1) * 0.15)),
    def: Math.round(base.def * (1 + (mult - 1) * 0.1)),
    xp: Math.round(base.xp * mult),
    goldMin: Math.round(base.goldMin * mult),
    goldMax: Math.round(base.goldMax * mult)
  };
}
function buildSoloDungeonStages(map) {
  const base = map.monsters[map.monsters.length - 1];
  const regular = REGULAR_STAGE_MULT.map((mult, i) => ({
    id: `dungeon_${map.id}_${i + 1}`,
    name: `${base.name} (Zindan ${i + 1})`,
    ...scaleStage(base, mult),
    isBoss: false
  }));
  const boss = {
    id: `dungeon_${map.id}_boss`,
    name: `${map.name} Zindan Efendisi`,
    ...scaleStage(base, BOSS_STAGE_MULT),
    isBoss: true
  };
  return [...regular, boss];
}
function buildDungeonStageChoices(map, stageIndex) {
  const safe = buildSoloDungeonStages(map)[stageIndex];
  if (!safe || safe.isBoss) return [];
  const risk = {
    ...safe,
    id: `${safe.id}_risk`,
    name: `${safe.name} \xB7 Riskli Yol`,
    hp: Math.round(safe.hp * 1.35),
    atk: Math.round(safe.atk * 1.18),
    def: Math.round(safe.def * 1.12),
    xp: Math.round(safe.xp * 1.45),
    goldMin: Math.round(safe.goldMin * 1.45),
    goldMax: Math.round(safe.goldMax * 1.45),
    risk: true
  };
  return [{ ...safe, name: `${safe.name} \xB7 G\xFCvenli Yol` }, risk];
}

// src/data/dropRules.js
var DEFAULT_CHEST_WEAPON_PCT = 0.46;
var DEFAULT_CHEST_ARMOR_PCT = 0.46;
var DEFAULT_SPECIAL_CHEST_UNIQUE_CHANCE = 0.03;
function buildDefaultDropConfig() {
  const maps = {};
  for (const map of MAPS) {
    const monsters = {};
    for (const m of [...map.monsters, ...buildSoloDungeonStages(map).flatMap((stage, i) => stage.isBoss ? [stage] : buildDungeonStageChoices(map, i))]) {
      monsters[m.id] = { goldMin: m.goldMin, goldMax: m.goldMax, xp: m.xp, dropChance: map.dropChance, chestChance: map.chestChance };
    }
    const last = map.monsters.at(-1);
    monsters[`map_boss_${map.id}`] = { guaranteedChests: 1, guaranteedChestTier: map.tier, goldMin: last.goldMin * 3, goldMax: last.goldMax * 3, xp: last.xp * 3, dropChance: map.dropChance, chestChance: map.chestChance };
    maps[map.id] = { monsters };
  }
  const warzoneBosses = {};
  for (const boss of WARZONE_BOSSES) {
    warzoneBosses[boss.id] = {
      bonusGoldMin: boss.bonusGoldMin,
      bonusGoldMax: boss.bonusGoldMax,
      equipDropChance: boss.equipDropChance,
      chestDropChance: boss.chestDropChance,
      scrollDropChance: boss.scrollDropChance
    };
  }
  return {
    maps,
    warzoneBosses,
    warzoneHunt: { powerMult: WARZONE_HUNT_POWER_MULT, goldMult: WARZONE_HUNT_GOLD_MULT, dropMult: WARZONE_HUNT_DROP_MULT },
    chests: { weaponPct: DEFAULT_CHEST_WEAPON_PCT, armorPct: DEFAULT_CHEST_ARMOR_PCT, specialUniqueChance: DEFAULT_SPECIAL_CHEST_UNIQUE_CHANCE, specialAccessoryChance: 0.01 }
  };
}
var DEFAULT_DROP_CONFIG = buildDefaultDropConfig();

// src/utils/dropConfig.js
var liveConfig = null;
function applyLiveDropConfig(config) {
  liveConfig = config;
}
var STORAGE_KEY = "nyxia_drop_config_v1";
var UNSAFE_MERGE_KEYS = /* @__PURE__ */ new Set(["__proto__", "constructor", "prototype"]);
function deepMerge(base, override) {
  if (!override || typeof override !== "object" || Array.isArray(override)) return base;
  const out = { ...base };
  for (const key of Object.keys(override)) {
    if (UNSAFE_MERGE_KEYS.has(key)) continue;
    const bv = base?.[key];
    const ov = override[key];
    out[key] = ov && typeof ov === "object" && !Array.isArray(ov) && bv && typeof bv === "object" ? deepMerge(bv, ov) : ov;
  }
  return out;
}
function getDropConfig() {
  if (liveConfig) return deepMerge(DEFAULT_DROP_CONFIG, liveConfig);
  if (!define_import_meta_env_default?.DEV) return DEFAULT_DROP_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DROP_CONFIG;
    return deepMerge(DEFAULT_DROP_CONFIG, JSON.parse(raw));
  } catch {
    return DEFAULT_DROP_CONFIG;
  }
}
function getMonsterRewardConfig(monster, map) {
  const override = getDropConfig().maps?.[map.id]?.monsters?.[monster.id];
  return {
    loot: override?.loot,
    guaranteedChests: override?.guaranteedChests ?? 1,
    guaranteedChestTier: override?.guaranteedChestTier ?? map.tier,
    goldMin: override?.goldMin ?? monster.goldMin,
    goldMax: override?.goldMax ?? monster.goldMax,
    xp: override?.xp ?? monster.xp,
    dropChance: override?.dropChance ?? map.dropChance,
    chestChance: override?.chestChance ?? map.chestChance
  };
}
function getWarzoneBossConfig(bossId) {
  return getDropConfig().warzoneBosses?.[bossId] || null;
}
function getWarzoneHuntConfig() {
  return getDropConfig().warzoneHunt;
}
function getChestConfig() {
  return getDropConfig().chests;
}

// src/utils/loot.js
var { warrior: WARRIOR_WEAPONS2, rogue: ROGUE_WEAPONS2, mage: CASTER_WEAPONS2 } = BALANCED_WEAPONS;
function applyStartingPlusOne(item) {
  if (!item) return item;
  if (item.levels) return item;
  const bumped = bumpedStats(item);
  return { ...item, atk: bumped.atk, def: bumped.def, hp: bumped.hp, mp: bumped.mp, upgradeLevel: 1 };
}
var MAX_WEAPON_TIER = { warrior: 6, rogue: 6, mage: 6 };
function maxWeaponTier(cls) {
  return MAX_WEAPON_TIER[cls] || 5;
}
function buildArmorFromTemplate(a, tierId, dropClass, slot) {
  const weight = a.weight ?? tierId * 2;
  const durability = a.durability ?? weaponDurability(tierId);
  const base = {
    id: uid(),
    kind: "armor",
    slot,
    tier: tierId,
    class: dropClass,
    name: a.name,
    atk: 0,
    def: a.def || 0,
    hp: a.hp || 0,
    mp: a.mp || 0,
    weight,
    durability,
    currentDurability: durability,
    upgradeLevel: 0,
    stackable: false,
    reqStats: a.reqStats,
    levels: a.levels || null
  };
  return base.levels ? applyLevelData(base, 1) : base;
}
function rollArmor(tierId, forceClass) {
  const dropClass = forceClass || pick(Object.keys(CLASSES));
  const slot = pick(SLOTS).key;
  const options = ARMOR_SETS.filter((a) => a.cls === dropClass && a.slot === slot && a.tier === tierId);
  if (options.length === 0) return null;
  return applyStartingPlusOne(buildArmorFromTemplate(pick(options), tierId, dropClass, slot));
}
function buildWeaponFromTemplate(w, tierId, cls) {
  const weaponSlot = w.weaponSlot || "twoHand";
  const weight = w.weight ?? tierId * (weaponSlot === "twoHand" ? 3 : 2);
  const durability = w.durability ?? weaponDurability(tierId);
  const base = {
    id: uid(),
    kind: "weapon",
    weaponSlot,
    isShield: false,
    cls,
    tier: tierId,
    name: w.name,
    artName: w.artName,
    balanceVersion: w.balanceVersion,
    icon: WEAPON_TYPE_ICON[w.weaponType],
    weaponType: w.weaponType,
    attackSpeed: w.attackSpeed ?? WEAPON_TYPE_SPEED[w.weaponType],
    range: w.range ?? WEAPON_TYPE_RANGE[w.weaponType],
    atk: w.atk || 0,
    def: 0,
    hp: w.hp || 0,
    mp: w.mp || 0,
    statBonus: w.statBonus || null,
    element: w.element || null,
    elementBonus: w.elementBonus || null,
    elements: w.elements || null,
    lore: w.lore || null,
    noTrade: !!w.noTrade,
    durability,
    currentDurability: durability,
    weight,
    upgradeLevel: 0,
    stackable: false,
    reqStats: w.reqStats,
    levels: w.levels || null
  };
  return base.levels ? applyLevelData(base, 1) : base;
}
function rollFromWeaponTable(table, tierId, cls) {
  const options = table.filter((w) => w.tier === tierId);
  if (options.length === 0) return null;
  return buildWeaponFromTemplate(pick(options), tierId, cls);
}
function buildShieldFromTemplate(w, tierId) {
  const weight = tierId * 2;
  const durability = weaponDurability(tierId);
  return {
    id: uid(),
    kind: "weapon",
    weaponSlot: "offHand",
    isShield: true,
    cls: "warrior",
    tier: tierId,
    name: w.name,
    icon: WEAPON_TYPE_ICON.shield,
    weaponType: "shield",
    attackSpeed: WEAPON_TYPE_SPEED.shield,
    range: WEAPON_TYPE_RANGE.shield,
    atk: 0,
    def: w.def,
    hp: 0,
    mp: 0,
    durability,
    currentDurability: durability,
    weight,
    upgradeLevel: 0,
    stackable: false,
    reqStats: w.reqStats
  };
}
function rollWarriorShield(tierId) {
  const options = WARRIOR_SHIELDS.filter((w) => w.tier === tierId);
  if (options.length === 0) return null;
  return buildShieldFromTemplate(pick(options), tierId);
}
function rollProceduralWeapon(tierId, cls) {
  const catalog = WEAPON_CATALOG[cls];
  const categories = Object.keys(catalog).filter((k) => catalog[k].length > 0);
  const cat = pick(categories);
  const baseName = pick(catalog[cat]);
  const power2 = tierId * 10 + rand(-2, 4);
  let atk = 0, def = 0, hp = 0, weaponSlot = "mainHand", isShield = false;
  if (cat === "twoHand") {
    weaponSlot = "twoHand";
    atk = Math.round(power2 * 1.1) + rand(0, 4);
    hp = Math.round(power2 * 0.2) + rand(0, 2);
  } else if (cat === "mainHand") {
    weaponSlot = "mainHand";
    atk = Math.round(power2 * 0.8) + rand(0, 3);
    hp = Math.round(power2 * 0.15) + rand(0, 1);
  } else if (cat === "offHandWeapon") {
    weaponSlot = "offHand";
    atk = Math.round(power2 * 0.5) + rand(0, 2);
  } else if (cat === "offHandShield") {
    weaponSlot = "offHand";
    isShield = true;
    def = Math.round(power2 * 0.9) + rand(0, 3);
    hp = Math.round(power2 * 0.4) + rand(0, 2);
  }
  const weight = weaponSlot === "twoHand" ? tierId * 3 : tierId * 2;
  const durability = weaponDurability(tierId);
  const iconKey = weaponIconKey(baseName);
  const name = `${pick(TIER_PREFIX[tierId])} ${baseName}`;
  return {
    id: uid(),
    kind: "weapon",
    weaponSlot,
    isShield,
    cls,
    tier: tierId,
    name,
    icon: iconKey,
    atk,
    def,
    hp,
    weight,
    attackSpeed: WEAPON_TYPE_SPEED[iconKey] || "Normal",
    range: WEAPON_TYPE_RANGE[iconKey] || 2.5,
    durability,
    currentDurability: durability,
    upgradeLevel: 0,
    stackable: false,
    reqStats: [{ key: CLASSES[cls].mainStat, value: tierId * 10 }]
  };
}
function rollWeapon(tierId, cls) {
  return applyStartingPlusOne(rollWeaponBase(tierId, cls));
}
function rollWeaponBase(tierId, cls) {
  if (cls === "warrior") {
    if (Math.random() < 0.2) {
      const shield = rollWarriorShield(tierId);
      if (shield) return shield;
    }
    return rollFromWeaponTable(WARRIOR_WEAPONS2, tierId, "warrior");
  }
  if (cls === "rogue") return rollFromWeaponTable(ROGUE_WEAPONS2, tierId, "rogue");
  if (cls === "mage") return rollFromWeaponTable(CASTER_WEAPONS2, tierId, "mage");
  return rollProceduralWeapon(tierId, cls);
}
function buildAccessoryFromTemplate(a, tierId, slotType, level = 0) {
  const weight = a.weight ?? tierId;
  const durability = a.durability ?? weaponDurability(tierId);
  const base = {
    id: uid(),
    kind: "accessory",
    slot: slotType,
    tier: tierId,
    name: a.name,
    atk: 0,
    def: a.def || 0,
    hp: a.hp || 0,
    mp: a.mp || 0,
    statBonus: a.statBonus,
    family: a.family || null,
    upgradeLocked: !!a.upgradeLocked,
    weight,
    reqStats: a.reqStats || null,
    defenseAbility: a.defenseAbility || null,
    resistances: a.resistances || null,
    attackPowerPct: a.attackPowerPct || 0,
    durability,
    currentDurability: durability,
    upgradeLevel: 0,
    stackable: false,
    levels: a.levels || null
  };
  return level > 0 && base.levels ? applyLevelData(base, level) : base;
}
function rollAccessory(tierId) {
  const options = Object.entries(ACCESSORY_SETS).flatMap(
    ([slot, items]) => items.filter((it) => it.tier === tierId).map((it) => ({ slot, item: it }))
  );
  if (!options.length) return null;
  const chosen = pick(options);
  return buildAccessoryFromTemplate(chosen.item, tierId, chosen.slot);
}
function rollMapAccessory(mapTier) {
  const options = MAP_ACCESSORIES.filter((it) => it.mapTier === mapTier);
  if (!options.length) return null;
  const chosen = pick(options);
  return buildAccessoryFromTemplate(chosen, chosen.tier, chosen.slot);
}
function buildStartingWeapon(cls) {
  const w = STARTING_WEAPONS[cls];
  if (!w) return null;
  const durability = weaponDurability(1);
  return applyStartingPlusOne({
    id: uid(),
    kind: "weapon",
    weaponSlot: w.weaponSlot,
    isShield: false,
    cls,
    tier: 1,
    name: w.name,
    icon: WEAPON_TYPE_ICON[w.weaponType],
    weaponType: w.weaponType,
    attackSpeed: WEAPON_TYPE_SPEED[w.weaponType],
    range: WEAPON_TYPE_RANGE[w.weaponType],
    atk: w.atk,
    def: 0,
    hp: 0,
    mp: 0,
    statBonus: null,
    durability,
    currentDurability: durability,
    weight: 2,
    upgradeLevel: 0,
    stackable: false,
    reqStats: w.reqStats
  });
}
function rollLoot(tierId) {
  const { weaponPct, armorPct } = getChestConfig();
  const r = Math.random();
  const item = r < weaponPct ? rollWeapon(tierId, pick(Object.keys(CLASSES))) : r < weaponPct + armorPct ? rollArmor(tierId) : rollAccessory(tierId);
  if (item) return item;
  return rollWeapon(tierId, pick(Object.keys(CLASSES))) || rollArmor(tierId) || rollAccessory(tierId) || (tierId > 1 ? rollLoot(tierId - 1) : null);
}
function rollMapLoot(tierId, mapTier = tierId) {
  if (mapTier <= 2 && Math.random() < 0.06) return rollMapAccessory(mapTier);
  return rollLoot(tierId);
}
function rollSpecialChestLoot(playerClass) {
  const table = getDropConfig().chestTables?.special;
  if (table?.length) return rollConfiguredLoot(table);
  if (Math.random() < (getChestConfig().specialAccessoryChance ?? 0.01)) return rollAccessory(6);
  const { specialUniqueChance } = getChestConfig();
  if (maxWeaponTier(playerClass) >= 6 && Math.random() < specialUniqueChance) {
    const unique = rollWeapon(6, playerClass);
    if (unique) return unique;
  }
  return rollLoot(5);
}
function applyUpgradeLevel(item, level) {
  if (item.levels) return applyLevelData(item, level);
  let next = item;
  for (let i = 0; i < level; i++) {
    const bumped = bumpedStats(next);
    next = { ...next, atk: bumped.atk, def: bumped.def, hp: bumped.hp, mp: bumped.mp };
  }
  return { ...next, upgradeLevel: level };
}
function weaponTableFor(cls) {
  if (cls === "warrior") return WARRIOR_WEAPONS2;
  if (cls === "rogue") return ROGUE_WEAPONS2;
  return CASTER_WEAPONS2;
}
function gmBuildWeaponById(cls, id, level) {
  if (id.startsWith("s")) {
    const w2 = WARRIOR_SHIELDS[parseInt(id.slice(1), 10)];
    if (!w2) return null;
    return applyUpgradeLevel(buildShieldFromTemplate(w2, w2.tier), level);
  }
  const table = weaponTableFor(cls);
  const w = table[parseInt(id.slice(1), 10)];
  if (!w) return null;
  return applyUpgradeLevel(buildWeaponFromTemplate(w, w.tier, cls), level);
}
function gmBuildArmor(cls, slot, tier, level) {
  const a = ARMOR_SETS.find((x) => x.cls === cls && x.slot === slot && x.tier === tier);
  if (!a) return null;
  return applyUpgradeLevel(buildArmorFromTemplate(a, tier, cls, slot), level);
}
function gmAccessoryTemplates(slot) {
  return [...ACCESSORY_SETS[slot] || [], ...MAP_ACCESSORIES.filter((item) => item.slot === slot)];
}
function gmBuildAccessory(slot, tier, level, name = null) {
  const a = gmAccessoryTemplates(slot).find((x) => x.tier === tier && (!name || x.name === name));
  if (!a) return null;
  return a.upgradeLocked ? buildAccessoryFromTemplate(a, tier, slot) : applyUpgradeLevel(buildAccessoryFromTemplate(a, tier, slot), level);
}
function rollConfiguredLoot(table) {
  if (!table?.length) return null;
  const total = table.reduce((sum, x) => sum + x.weight, 0);
  let choice = Math.random() * total, entry = table[table.length - 1];
  for (const row of table) {
    choice -= row.weight;
    if (choice < 0) {
      entry = row;
      break;
    }
  }
  const item = LOOT_ADMIN_CATALOG.find((x) => x.key === entry.key);
  if (!item) return null;
  if (item.kind === "armor") return gmBuildArmor(item.class, item.slot, item.tier, entry.level);
  if (item.kind === "accessory") return gmBuildAccessory(item.slot, item.tier, entry.level, item.name);
  const index = (item.kind === "shield" ? WARRIOR_SHIELDS : weaponTableFor(item.class)).findIndex((w) => w.name === item.name);
  return gmBuildWeaponById(item.class, (item.kind === "shield" ? "s" : "w") + index, entry.level);
}
function rollChestLoot(tier) {
  const table = getDropConfig().chestTables?.[String(tier)];
  return table?.length ? rollConfiguredLoot(table) : rollLoot(tier);
}

// src/data/wings.js
init_define_import_meta_env();
var WINGS = [
  { id: "dawn", name: "\u015Eafak Muhaf\u0131z\u0131", nameEn: "Dawn Guardian", color: "#f5d69a", light: "#fff8e4", dark: "#725132", shape: "feather", price: 2e3 },
  { id: "frost", name: "Buz Ankas\u0131", nameEn: "Frost Phoenix", color: "#58c9ee", light: "#e0fcff", dark: "#183e76", shape: "crystal", price: 2e3 },
  { id: "ember", name: "K\u0131z\u0131l K\xFCller", nameEn: "Crimson Ashes", color: "#ed7148", light: "#ffd793", dark: "#641b35", shape: "flame", price: 2e3 },
  { id: "twilight", name: "Alacakaranl\u0131k", nameEn: "Twilight", color: "#b38aef", light: "#f0d8ff", dark: "#352652", shape: "shadow", price: 2e3 },
  { id: "grove", name: "Z\xFCmr\xFCt Yemin", nameEn: "Emerald Oath", color: "#64d2a3", light: "#d5ffe3", dark: "#1a504d", shape: "leaf", price: 2e3 }
];
var wingDefinition = (id) => WINGS.find((w) => w.id === id);
var equippedWing = (player) => player?.equipped?.wings?.kind === "wings" ? wingDefinition(player.equipped.wings.wingId) : null;
var wingMultiplier = (player, bonus) => equippedWing(player) ? { exp: 1.05, drop: 1.05, atk: 1.03 }[bonus] || 1 : 1;
var wingDexBonus = (player) => equippedWing(player) ? 3 : 0;

// src/utils/boosts.js
init_define_import_meta_env();

// src/data/boostScrolls.js
init_define_import_meta_env();
var BOOST_SCROLL_PACK_SIZE = 20;
var BOOST_DURATION_MIN = 30;
var BOOST_SCROLLS = [
  { id: "exp", type: "percent", magnitude: 0.3, packCost: 600, color: "#5FA8A0" },
  { id: "gold", type: "percent", magnitude: 0.25, packCost: 500, color: "#D4AF6A" },
  { id: "atk", type: "percent", magnitude: 0.2, packCost: 500, color: "#C9425A" },
  { id: "np", type: "percent", magnitude: 0.15, packCost: 350, color: "#4FC3D9" },
  { id: "def", type: "percent", magnitude: 0.1, packCost: 300, color: "#8B6FC9" },
  { id: "hp", type: "flat", magnitude: 100, packCost: 300, color: "#E8A5AF" }
];
function boostScrollDef(id) {
  return BOOST_SCROLLS.find((s) => s.id === id) || null;
}
var BOOST_NAMES = {
  tr: { exp: "Deneyim Par\u015F\xF6meni", gold: "Alt\u0131n Par\u015F\xF6meni", np: "NP Par\u015F\xF6meni", hp: "G\xFC\xE7 Par\u015F\xF6meni", def: "Savunma Par\u015F\xF6meni", atk: "Sald\u0131r\u0131 Par\u015F\xF6meni" },
  en: { exp: "Exp Scroll", gold: "Gold Scroll", np: "NP Scroll", hp: "Buff Scroll", def: "Def Scroll", atk: "Attack Scroll" }
};
function boostScrollName(id, lang = "tr") {
  return (BOOST_NAMES[lang] || BOOST_NAMES.tr)[id] || id;
}

// src/utils/boosts.js
var DURATION_MS = BOOST_DURATION_MIN * 60 * 1e3;
function activeExpiry(player, scrollId) {
  const expiresAt = player.activeBoosts?.[scrollId];
  return expiresAt && expiresAt > Date.now() ? expiresAt : null;
}
function boostMultiplier(player, scrollId) {
  if (!activeExpiry(player, scrollId)) return 1;
  const def = boostScrollDef(scrollId);
  return def?.type === "percent" ? 1 + def.magnitude : 1;
}
function boostFlatBonus(player, scrollId) {
  if (!activeExpiry(player, scrollId)) return 0;
  const def = boostScrollDef(scrollId);
  return def?.type === "flat" ? def.magnitude : 0;
}
function stackKeyFor(scrollId) {
  return `boostScroll:${scrollId}`;
}
function makeBoostScrollStack(scrollId, count = 1) {
  return {
    id: stackKeyFor(scrollId),
    kind: "boostScroll",
    boostId: scrollId,
    name: boostScrollName(scrollId, "tr"),
    count,
    weight: 0.5,
    stackable: true,
    stackKey: stackKeyFor(scrollId)
  };
}
function useBoostScroll(player, scrollId) {
  const stack = player.inventory.find((i) => i.kind === "boostScroll" && i.boostId === scrollId);
  if (!stack || stack.count <= 0) return { player, used: false, reason: "noScrollsLeft" };
  const inventory = stack.count - 1 <= 0 ? player.inventory.filter((i) => i.id !== stack.id) : player.inventory.map((i) => i.id === stack.id ? { ...i, count: i.count - 1 } : i);
  const base = activeExpiry(player, scrollId) || Date.now();
  const expiresAt = base + DURATION_MS;
  return {
    player: { ...player, inventory, activeBoosts: { ...player.activeBoosts || {}, [scrollId]: expiresAt } },
    used: true,
    expiresAt
  };
}
function buyBoostScrollPack(player, scrollId) {
  const def = boostScrollDef(scrollId);
  if (!def) return { player, bought: false, reason: "invalidScroll" };
  if (player.diamonds < def.packCost) return { player, bought: false, reason: "notEnoughDiamonds" };
  const result = addItemToInventory(
    { ...player, diamonds: player.diamonds - def.packCost },
    makeBoostScrollStack(scrollId, BOOST_SCROLL_PACK_SIZE)
  );
  if (!result.added) return { player, bought: false, reason: result.reason };
  return { player: result.player, bought: true };
}

// src/utils/player.js
function xpToNext(level) {
  return Math.round(90 * Math.pow(level, 1.62));
}
var MAX_GOLD = 2e9;
function clampGold(amount) {
  return Math.max(0, Math.min(MAX_GOLD, Math.round(amount)));
}
function formatGold(amount) {
  return Math.round(amount).toLocaleString("tr-TR");
}
function xpLevelPenaltyMultiplier(playerLevel, mapLevelMax) {
  const diff = playerLevel - mapLevelMax;
  if (diff <= 1) return 1;
  if (diff <= 7) return 0.8;
  if (diff <= 13) return 0.5;
  return 0.2;
}
var MAX_LEVEL = 65;
function gainXp(player, amount) {
  if (player.level >= MAX_LEVEL || amount <= 0) return { player, levelsGained: 0 };
  let np = { ...player, xp: player.xp + amount };
  let levelsGained = 0;
  while (np.level < MAX_LEVEL && np.xp >= xpToNext(np.level)) {
    np.xp -= xpToNext(np.level);
    np.level += 1;
    np.statPoints += 3;
    levelsGained += 1;
  }
  if (np.level >= MAX_LEVEL) np.xp = 0;
  return { player: np, levelsGained };
}
var STARTING_STAT_POINTS = 10;
var BANK_PAGES = 3;
function initialPlayer(cls, race, nickname) {
  const base = CLASSES[cls];
  const player = {
    class: cls,
    race,
    nickname,
    level: 1,
    xp: 0,
    gold: 60,
    // Special Market's own currency — separate from gold on purpose so
    // gold stays a pure gameplay sink (see repairCost) instead of also
    // being how you buy race-change scrolls. No in-game earn source is
    // wired up yet; for now it's GM-grantable only (see gmCommands.js
    // /elmas), same caveat as isGM below.
    diamonds: 0,
    // Elmas-bought VIP subscription — see data/premium.js and
    // utils/premium.js#activePremiumTier for how expiresAt is checked.
    premium: { tier: null, expiresAt: null },
    hp: base.maxHp,
    mp: base.maxMp,
    equipped: {
      head: null,
      chest: null,
      legs: null,
      gauntlets: null,
      boots: null,
      mainHand: null,
      wings: null,
      necklace: null,
      belt: null,
      ring1: null,
      ring2: null,
      earring1: null,
      earring2: null
    },
    inventory: [makePotionStack("hp", 1, 3), makePotionStack("mp", 1, 2)],
    chests: [],
    stats: { ...base.baseStats },
    statPoints: STARTING_STAT_POINTS,
    // Beceri (skill) system — known: every skill ever unlocked; loadout: up
    // to 5 of those slotted for actual battle use (see utils/skills.js,
    // data/skills.js#MAX_LOADOUT_SLOTS).
    skills: { known: [], loadout: [null, null, null, null, null] },
    // Cumulative per-monster kill counter, keyed by monster id — feeds both
    // Kaptan's quest progress (utils/quests.js) and nothing else, so it's
    // safe to just keep growing forever.
    monsterKills: {},
    claimedQuests: [],
    // Oyuncunun Kapı üzerinden en son ışınlandığı harita (bkz. data/maps.js,
    // components/BattleTab.jsx) — her yeni karakter en baştaki haritada başlar.
    currentMapId: MAPS[0].id,
    // National Point (kalıcı, hiç sıfırlanmaz) ve Weekly Point (her hafta
    // sıfırlanır) — Savaş Alanı'ndaki karşı ırk PK'lerinden kazanılır (bkz.
    // utils/nationalPoint.js, components/WarzoneTab.jsx). weekId, weeklyPoint
    // hangi haftaya ait diye takip eder; hafta değişince App.jsx#handlePlay
    // içindeki applyWeeklyRollover çağrısı sıfırlar.
    nationalPoint: STARTING_NATIONAL_POINT,
    weeklyPoint: 0,
    weekId: currentWeekId(),
    // Klan üyeliği (bkz. utils/clan.js, components/ClanTab.jsx) — hesap
    // değil karakter bazlı, null ise klansız demek.
    clan: null,
    // 2. Uyanış (Master rank) — see utils/quests.js#claimAwakening. Gates
    // Tier 5 armor (see equipItem below) and prefixes the class name with
    // "Master" everywhere it's displayed (see displayClassName below).
    awakened: false,
    // Kullanıcı isteği: "Chat üzerinden bir şeyleri elde edebilecek tek
    // kişi GM ekibi olacak, geri kalan kimse elde edememeli." — artık
    // varsayılan false; GM yetkisi sadece Sohbet'teki gizli /gmgiris
    // parola komutuyla açılıyor (bkz. utils/gmCommands.js#GM_UNLOCK_*,
    // ChatTab.jsx#send). NOT: bu build'in hâlâ gerçek bir backend'i yok,
    // yani bu istemci tarafında tutulan bir bayrak — parolayı bilen biri
    // yine de açabilir, ya da devtools'tan localStorage'ı elden düzenleyip
    // kendi karakterine isGM:true yazabilir. Bu, "hiçbirini bilmeyen
    // sıradan oyuncu" için gerçek bir engel ama kriptografik bir garanti
    // değil — gerçek güvence ancak bir sunucu isGM'i kendi tarafında
    // doğruladığında gelir.
    isGM: false,
    // Otomatik Saldırı ayarları — bkz. components/BattleTab.jsx (savaş
    // ekranındaki ikon aynı `enabled` alanını değiştirir) ve
    // components/CharacterTab.jsx'in "Otomatik Saldırı" alt sekmesi. Eşikler
    // yüzde (0-100), can/mana o yüzdenin ALTINA düşünce ilgili pot içiliyor.
    // autoSkill: açıkken döngü her turda düz saldırı yerine kullanılabilir
    // en iyi becerisini seçer (bkz. BattleTab.jsx#pickAutoSkill).
    autoBattle: { enabled: false, hpThreshold: 35, mpThreshold: 35, autoSkill: false },
    // Yeni karakterler Hub'a ilk girişte tutorial'ı görür (bkz.
    // components/Hub.jsx, components/TutorialModal.jsx) — "Atla" ile her an
    // geçilebilir, Karakter sekmesinden istenirse tekrar açılabilir.
    tutorialSeen: false,
    // Alt menüdeki "Envanter" sekmesine bir bildirim noktası koymak için —
    // bir canavar/sandıktan yeni eşya düşünce true olur (bkz. BattleTab.jsx
    // #applyLoot, InventoryTab.jsx#openChest), Envanter sekmesi açılınca
    // Hub.jsx tarafından false'a çekilir.
    hasNewItemNotice: false,
    // Günlük giriş ödülü — bkz. utils/dailyLogin.js. streak: kaç gündür
    // ard arda giriş yapıldığı (bir gün atlanırsa 1'e döner), lastClaimDay:
    // en son ödül alınan gün (aynı gün ikinci kez alınamaz).
    dailyLogin: { streak: 0, lastClaimDay: null },
    // Günlük görevler — bkz. utils/dailyQuests.js. Kaptan'ın kalıcı
    // görevlerinden AYRI, her gün sıfırlanan bir "bugün X canavar öldür"
    // merdiveni (day değişince otomatik sıfırlanır).
    dailyQuests: { day: null, killsToday: 0, claimed: [false, false, false] },
    // Başarım sistemi (bkz. data/achievements.js, utils/achievements.js) —
    // kills/level/awakened gibi ZATEN var olan alanlardan türeyen başarımlar
    // burada tekrar tutulmuyor; milestones sadece BAŞKA hiçbir yerde
    // izlenmeyen sayaç/bayrakları taşıyor (bkz. UpgradeTab#press,
    // utils/clan.js#foundClan, WarzoneTab#duel kazanma, InventoryTab#openChest).
    milestones: { maxUpgradeReached: false, hasFoundedClan: false, duelsWon: 0, chestsOpened: 0 },
    // Karakter sekmesinden seçilen, TopBar'da isminin yanında görünen aktif
    // unvan — bir başarımın id'si ya da hiçbiri seçilmemişse null.
    activeTitle: null,
    // Günlük Solo Zindan giriş hakkı — bkz. utils/soloDungeon.js. day
    // bugünden farklıysa entriesUsed sıfırmış gibi davranılır (gün değişince
    // otomatik yenilenir, dailyQuests'teki aynı desen).
    soloDungeon: { day: null, entriesUsed: 0 },
    // Bölge boss'ları günlük birer kez yenilir; Canavar Kitabı ise mevcut
    // monsterKills sayacından türediği için yalnız alınan sayfaları saklar.
    mapBoss: { day: null, defeatedMapIds: [] },
    claimedCollections: [],
    weeklyQuests: { weekId: currentWeekId(), kills: 0, bosses: 0, claimed: [] },
    // Belirli saatlerde açılan dünya etkinlikleri (bkz. data/scheduledEvents.js,
    // utils/scheduledEvents.js) — event id'sine göre { day, joined,
    // ticksCredited }. day bugünden farklıysa taze sayılır (gün değişince
    // otomatik yenilenir).
    scheduledEvents: {},
    // Kozmetik zırh boyası — bkz. data/armorDyes.js, utils/cosmetics.js.
    // armorDye: şu an giyilen boya (null = orijinal renkler); ownedDyes:
    // elmasla satın alınıp bir daha ücretsiz seçilebilecek boyalar.
    armorDye: null,
    ownedDyes: [],
    // Geçici elmas takviyeleri (30dk) — bkz. data/boostScrolls.js,
    // utils/boosts.js. { [scrollId]: expiresAt } — yoksa/süresi geçmişse
    // no-op sayılır, bu yüzden {} güvenli varsayılan.
    activeBoosts: {}
  };
  const startingWeapon = buildStartingWeapon(cls);
  if (startingWeapon) {
    const result = equipItem(player, startingWeapon);
    if (!result.blocked) {
      return { ...result.player, hp: playerMaxHp(result.player), mp: playerMaxMp(result.player) };
    }
  }
  return player;
}
var ALL_EQUIP_KEYS = [
  "wings",
  "head",
  "chest",
  "legs",
  "gauntlets",
  "boots",
  "mainHand",
  "necklace",
  "belt",
  "ring1",
  "ring2",
  "earring1",
  "earring2"
];
function canChangeJob(player) {
  if (Object.values(player.equipped).some((it) => it != null)) {
    return { ok: false, reason: "mustUnequipFirst" };
  }
  if (player.clan) {
    return { ok: false, reason: "cannotChangeJobInClan" };
  }
  return { ok: true };
}
function changeJob(player, newClass) {
  const next = {
    ...player,
    class: newClass,
    skills: { known: [], loadout: [null, null, null, null, null] }
  };
  next.hp = Math.min(next.hp, playerMaxHp(next));
  next.mp = Math.min(next.mp, playerMaxMp(next));
  return next;
}
function isBroken(item) {
  return item && item.durability > 0 && item.currentDurability <= 0;
}
var ARMOR_LEVEL_BONUS = { 0: 0, 1: 2, 2: 2, 3: 4, 4: 6, 5: 8, 6: 10, 7: 12, 8: 15 };
function armorLevelBonus(upgradeLevel) {
  return ARMOR_LEVEL_BONUS[upgradeLevel] ?? 0;
}
var ARMOR_CLASS_BONUS_STAT = { warrior: "str", rogue: "dex", mage: "mp" };
function equippedStatBonus(player) {
  const bonus = { str: 0, sta: 0, dex: 0, int: 0, mag: 0 };
  ALL_EQUIP_KEYS.forEach((k) => {
    const it = player.equipped[k];
    if (!it || isBroken(it)) return;
    if (it.statBonus) STAT_KEYS.forEach((key) => {
      bonus[key] += it.statBonus[key] || 0;
    });
    if (it.kind === "armor") {
      const stat = ARMOR_CLASS_BONUS_STAT[it.class];
      if (stat === "str" || stat === "dex") bonus[stat] += armorLevelBonus(it.upgradeLevel);
    }
  });
  return bonus;
}
var ATK_SCALE_C1 = 6e-3;
var ATK_SCALE_OFFSET = 40;
var ATK_SCALE_C2 = 16e-5;
var CLASS_DAMAGE_STAT = { warrior: "str", rogue: "dex", mage: "mag" };
function totalStats(player) {
  let hp = 0, def = 0, weaponAtk = 0, mp = 0;
  ALL_EQUIP_KEYS.forEach((k) => {
    const it = player.equipped[k];
    if (it && !isBroken(it)) {
      hp += it.hp || 0;
      def += it.def || 0;
      weaponAtk += it.atk || 0;
      mp += it.mp || 0;
      if (it.kind === "armor") {
        const stat = ARMOR_CLASS_BONUS_STAT[it.class];
        const val = armorLevelBonus(it.upgradeLevel);
        if (stat === "mp") mp += val;
        if (stat === "hp") hp += val;
      }
    }
  });
  const s = player.stats;
  const bonus = equippedStatBonus(player);
  const damageStat = CLASS_DAMAGE_STAT[player.class];
  const statVal = s[damageStat] + bonus[damageStat] + (player.class === "mage" ? Math.max(0, s.int - 70) : 0);
  const scaling = ATK_SCALE_C1 * (statVal + ATK_SCALE_OFFSET) + ATK_SCALE_C2 * player.level * statVal;
  const atk = Math.round(weaponAtk * scaling * boostMultiplier(player, "atk") * wingMultiplier(player, "atk"));
  return { hp, def, atk, mp };
}
function allocateStat(player, statKey) {
  if (player.statPoints <= 0) return player;
  if (player.stats[statKey] >= STAT_CAP) return player;
  return {
    ...player,
    statPoints: player.statPoints - 1,
    stats: { ...player.stats, [statKey]: player.stats[statKey] + 1 }
  };
}
var RESPEC_GOLD_PER_LEVEL = 200;
function respecCost(player) {
  return player.level * RESPEC_GOLD_PER_LEVEL;
}
function canRespecStats(player) {
  const cost = respecCost(player);
  if (player.gold < cost) return { ok: false, reason: "notEnoughGoldCost", reasonVars: { cost }, cost };
  return { ok: true, cost };
}
function respecStats(player) {
  const check = canRespecStats(player);
  if (!check.ok) return { player, reset: false, reason: check.reason, reasonVars: check.reasonVars };
  const totalPoints = STARTING_STAT_POINTS + POINTS_PER_LEVEL * (player.level - 1);
  return {
    player: { ...player, gold: player.gold - check.cost, stats: { ...CLASSES[player.class].baseStats }, statPoints: totalPoints },
    reset: true,
    cost: check.cost
  };
}
var HP_COEFF = { warrior: 1.05, rogue: 1, mage: 1.05 };
var HP_SCALE = 22e-4;
function playerMaxHp(player) {
  const base = CLASSES[player.class];
  const { hp: gearHp } = totalStats(player);
  const setBonus = activeArmorSetBonus(player);
  const sta = player.stats.sta + equippedStatBonus(player).sta;
  const level = player.level;
  const quadratic = HP_COEFF[player.class] * level * level * sta * HP_SCALE;
  return Math.round(base.maxHp + quadratic + level * 0.4 + sta * 0.15 + gearHp + (setBonus?.hp || 0) + boostFlatBonus(player, "hp"));
}
var ARMOR_SET_BONUS = {
  1: { hp: 50, dmgReduction: 0, scope: null },
  2: { hp: 60, dmgReduction: 0.01, scope: "monster" },
  3: { hp: 75, dmgReduction: 0.02, scope: "monster" },
  4: { hp: 100, dmgReduction: 0.01, scope: "all" },
  5: { hp: 250, dmgReduction: 0.03, scope: "all" }
};
function activeArmorSetBonus(player) {
  const pieces = ARMOR_SLOTS.map((slot) => player.equipped[slot]);
  if (pieces.some((it) => !it || it.kind !== "armor" || isBroken(it))) return null;
  const tier = pieces[0].tier;
  const complete = pieces.every((it) => it.class === player.class && it.tier === tier);
  return complete ? ARMOR_SET_BONUS[tier] || null : null;
}
function armorSetDamageReduction(player, source) {
  const bonus = activeArmorSetBonus(player);
  if (!bonus || bonus.dmgReduction <= 0) return 0;
  if (bonus.scope === "all") return bonus.dmgReduction;
  if (bonus.scope === "monster" && source === "monster") return bonus.dmgReduction;
  return 0;
}
var MP_COEFF = { warrior: 0.35, rogue: 0.45, mage: 1.15 };
var MP_SCALE = 22e-4;
function playerMaxMp(player) {
  const base = CLASSES[player.class];
  const { mp: gearMp } = totalStats(player);
  const bonus = equippedStatBonus(player);
  const int_ = player.stats.int + bonus.int;
  const level = player.level;
  const quadratic = MP_COEFF[player.class] * level * level * (int_ + 30) * MP_SCALE;
  return Math.round(base.maxMp + quadratic + level * 0.3 + int_ * 0.1 + gearMp);
}
var DEF_COEFF = { warrior: 0.75, rogue: 0.95, mage: 1.1 };
function playerDef(player) {
  const { def: gearDef } = totalStats(player);
  const base = DEF_COEFF[player.class] * (player.level + gearDef) + 2;
  return Math.round(base * boostMultiplier(player, "def"));
}
function clampPlayerHp(player) {
  return { ...player, hp: Math.min(player.hp, playerMaxHp(player)), mp: Math.min(player.mp, playerMaxMp(player)) };
}
var DEATH_XP_LOSS_PCT = 0.05;
function applyDeathPenalty(player) {
  const xpLost = Math.min(player.xp, Math.round(xpToNext(player.level) * DEATH_XP_LOSS_PCT));
  const next = { ...player, xp: player.xp - xpLost, hp: playerMaxHp(player), mp: playerMaxMp(player) };
  return { player: next, xpLost };
}
var WEAPON_SLOTS = ["mainHand"];
var ARMOR_SLOTS = ["head", "chest", "legs", "gauntlets", "boots"];
function damageEquippedDurability(player, slotKeys, amount = 1) {
  const equipped = { ...player.equipped };
  slotKeys.forEach((k) => {
    const it = equipped[k];
    if (it && it.durability > 0) {
      equipped[k] = { ...it, currentDurability: Math.max(0, it.currentDurability - amount) };
    }
  });
  return { ...player, equipped };
}
function repairCost(item) {
  if (!item || !item.durability) return 0;
  const missing = item.durability - item.currentDurability;
  if (missing <= 0) return 0;
  return Math.max(1, Math.round(missing * 0.12 * item.tier));
}
function discountedRepairCost(item, discount = 0) {
  const full = repairCost(item);
  if (full <= 0) return 0;
  return Math.max(1, Math.round(full * (1 - discount)));
}
function repairItem(player, item, discount = 0, bank = null) {
  const cost = discountedRepairCost(item, discount);
  if (cost <= 0) return { player, bank, repaired: false, cost: 0 };
  if (player.gold < cost) return { player, bank, repaired: false, cost, reason: "notEnoughGold" };
  const patch = (it) => it && it.id === item.id ? { ...it, currentDurability: it.durability } : it;
  const equipped = {};
  ALL_EQUIP_KEYS.forEach((k) => {
    equipped[k] = patch(player.equipped[k]);
  });
  const inventory = player.inventory.map(patch);
  const nextBank = bank ? bank.map((page) => page.map(patch)) : bank;
  return { player: { ...player, gold: player.gold - cost, equipped, inventory }, bank: nextBank, repaired: true, cost };
}
function totalEquippedRepairCost(player, discount = 0) {
  return ALL_EQUIP_KEYS.reduce((sum, k) => sum + discountedRepairCost(player.equipped[k], discount), 0);
}
function repairAllEquipped(player, discount = 0) {
  const cost = totalEquippedRepairCost(player, discount);
  if (cost <= 0) return { player, repaired: false, cost: 0 };
  if (player.gold < cost) return { player, repaired: false, cost, reason: "notEnoughGold" };
  const equipped = { ...player.equipped };
  ALL_EQUIP_KEYS.forEach((k) => {
    const it = equipped[k];
    if (it && it.durability) equipped[k] = { ...it, currentDurability: it.durability };
  });
  return { player: { ...player, gold: player.gold - cost, equipped }, repaired: true, cost };
}
function sellPrice(item) {
  const statBonusSum = item.statBonus ? Object.values(item.statBonus).reduce((s, v) => s + (v || 0), 0) : 0;
  return Math.round((item.hp || 0) * 0.9 + (item.atk || 0) * 1.4 + (item.def || 0) * 1.3 + statBonusSum * 3);
}
function equipItem(player, item) {
  if (!item || !["weapon", "armor", "accessory", "wings"].includes(item.kind)) return { player, blocked: { type: "notEquippable" } };
  if (player.class === "rogue" && item.kind === "weapon" && !["bow", "crossbow"].includes(item.weaponType)) {
    return { player, blocked: { type: "rogueBowOnly" } };
  }
  if (item.kind === "armor" && item.class !== player.class) {
    return { player, blocked: { type: "wrongClass", itemKind: "armor", cls: CLASSES[item.class].name } };
  }
  if (item.kind === "weapon" && item.cls && item.cls !== player.class) {
    return { player, blocked: { type: "wrongClass", itemKind: "weapon", cls: CLASSES[item.cls].name } };
  }
  if (item.kind === "armor" && item.tier === 5 && !player.awakened) {
    return { player, blocked: { type: "needsAwakening" } };
  }
  const currentReqValue = (key) => key === "hp" ? playerMaxHp(player) : key === "level" ? player.level : player.stats[key];
  const unmet = (item.reqStats || []).filter((r) => currentReqValue(r.key) < r.value);
  if (unmet.length > 0) {
    const need = unmet.map((r) => ({ stat: STAT_LABELS[r.key], value: r.value, current: currentReqValue(r.key) }));
    return { player, blocked: { type: "unmetStats", need } };
  }
  let inv = player.inventory.filter((i) => i.id !== item.id);
  let equipped = { ...player.equipped };
  if (item.kind === "weapon") {
    if (equipped.mainHand) inv.push(equipped.mainHand);
    equipped.mainHand = item;
  } else if (item.kind === "accessory" && item.slot === "ring") {
    const target = !equipped.ring1 ? "ring1" : !equipped.ring2 ? "ring2" : "ring1";
    if (equipped[target]) inv.push(equipped[target]);
    equipped[target] = item;
  } else if (item.kind === "accessory" && item.slot === "earring") {
    const target = !equipped.earring1 ? "earring1" : !equipped.earring2 ? "earring2" : "earring1";
    if (equipped[target]) inv.push(equipped[target]);
    equipped[target] = item;
  } else {
    const slotKey = item.slot;
    if (equipped[slotKey]) inv.push(equipped[slotKey]);
    equipped[slotKey] = item;
  }
  const nextPlayer = clampPlayerHp({ ...player, inventory: inv, equipped });
  return { player: nextPlayer, blocked: null };
}
function unequipItem(player, slot) {
  const item = player.equipped[slot];
  if (!item) return { player, removed: false };
  const next = { ...player, equipped: { ...player.equipped, [slot]: null } };
  const result = addItemToInventory(next, item);
  if (!result.added) return { player, removed: false, reason: result.reason };
  return { player: clampPlayerHp(result.player), removed: true };
}

// src/game/fields.js
init_define_import_meta_env();
var SERVER_OWNED_FIELDS = [
  // ekonomi
  "gold",
  "inventory",
  "equipped",
  "chests",
  // gelişim ve ilerleme
  "xp",
  "level",
  "statPoints",
  "stats",
  "skills",
  "class",
  "monsterKills",
  "claimedQuests",
  "claimedCollections",
  "awakened",
  "activeTitle",
  "dailyQuests",
  "weeklyQuests",
  "dailyLogin",
  "scheduledEvents",
  "tutorialGift",
  "wheelAppliedAt",
  // savaş, harita, forge
  "currentMapId",
  "mapBoss",
  "soloDungeon",
  "dungeonRun",
  "fight",
  "warzone",
  "huntSearch",
  "forge",
  "accForge",
  "activeBoosts",
  "eventExpBonus",
  // Savaş Alanı
  "nationalPoint",
  "weeklyPoint",
  "weekId",
  "pendingWeeklyClaim"
];

// src/game/fight.js
init_define_import_meta_env();

// src/utils/combat.js
init_define_import_meta_env();
function mitigate(rawPower, def, K) {
  return Math.max(0, rawPower) * K / (Math.max(0, def) + K);
}
var MONSTER_DEF_K = 120;
var PLAYER_DEF_K = 170;
function hitChance(attackerDex, defenderDex, attackerLevel) {
  const diff = attackerDex - defenderDex;
  const chance = 0.9 + Math.max(-0.04, Math.min(0.04, diff * 4e-4));
  return Math.min(0.95, Math.max(0.85, chance));
}
function varyDamage(base, random = Math.random) {
  return Math.max(1, Math.round(base * (1 + (Math.max(0, Math.min(1, random())) * 2 - 1) / 13)));
}

// src/utils/skills.js
init_define_import_meta_env();

// src/data/skills.js
init_define_import_meta_env();

// src/data/warriorSkills.js
init_define_import_meta_env();
var WARRIOR_SKILLS = [
  { id: "w1", unlockLevel: 1, name: "K\u0131l\u0131\xE7 Darbesi", tier: "basic", mpCost: 8, cooldown: 0, effect: { type: "damage", mult: 1.3 } },
  { id: "w2", unlockLevel: 5, name: "Sava\u015F\xE7\u0131 Azmi", tier: "basic", mpCost: 12, cooldown: 3, effect: { type: "heal", pct: 0.15 } },
  { id: "w3", unlockLevel: 10, name: "Y\u0131k\u0131c\u0131 Vuru\u015F", tier: "advanced", mpCost: 18, cooldown: 2, effect: { type: "damage", mult: 1.75 }, goldCost: 400, questTier: 1 },
  { id: "w4", unlockLevel: 15, name: "Sava\u015F Naras\u0131", tier: "advanced", mpCost: 18, cooldown: 4, effect: { type: "buffAtk", mult: 1.35, turns: 3 }, goldCost: 600, questTier: 2 },
  { id: "w5", unlockLevel: 20, name: "\xC7ift Kesim", tier: "advanced", mpCost: 22, cooldown: 2, effect: { type: "damage", mult: 2 }, goldCost: 800, questTier: 2 },
  { id: "w6", unlockLevel: 25, name: "Kanayan Yara", tier: "advanced", mpCost: 20, cooldown: 3, effect: { type: "dot", mult: 0.75, turns: 3 }, goldCost: 1e3, questTier: 2 },
  { id: "w7", unlockLevel: 30, name: "Toprak Sars\u0131nt\u0131s\u0131", tier: "advanced", mpCost: 26, cooldown: 3, effect: { type: "damage", mult: 2.2 }, goldCost: 1200, questTier: 3 },
  { id: "w8", unlockLevel: 35, name: "Can Al\u0131c\u0131 Darbe", tier: "advanced", mpCost: 24, cooldown: 3, effect: { type: "execute", mult: 2.8, hpPctThreshold: 0.3 }, goldCost: 1400, questTier: 3 },
  { id: "w9", unlockLevel: 40, name: "Kalkan Par\xE7alayan", tier: "advanced", mpCost: 28, cooldown: 3, effect: { type: "damage", mult: 2.35 }, goldCost: 1600, questTier: 3 },
  { id: "w10", unlockLevel: 45, name: "Zafer \xC7\u0131\u011Fl\u0131\u011F\u0131", tier: "advanced", mpCost: 26, cooldown: 4, effect: { type: "buffAtk", mult: 1.45, turns: 3 }, goldCost: 1800, questTier: 4 },
  { id: "w11", unlockLevel: 50, name: "Ejder Kesici", tier: "advanced", mpCost: 32, cooldown: 3, effect: { type: "damage", mult: 2.5 }, goldCost: 2e3, questTier: 4 },
  { id: "w12", unlockLevel: 55, name: "Demir \u0130rade", tier: "advanced", mpCost: 30, cooldown: 5, effect: { type: "heal", pct: 0.25 }, goldCost: 2200, questTier: 4 },
  { id: "w13", unlockLevel: 60, name: "Kaos Y\u0131k\u0131m\u0131", tier: "advanced", mpCost: 40, cooldown: 4, effect: { type: "damage", mult: 2.8 }, goldCost: 2400, questTier: 5 }
];

// src/data/rogueSkills.js
init_define_import_meta_env();
var ROGUE_SKILLS = [
  { id: "r1", unlockLevel: 1, name: "H\u0131zl\u0131 At\u0131\u015F", tier: "basic", mpCost: 8, cooldown: 0, effect: { type: "damage", mult: 1.3 } },
  { id: "r2", unlockLevel: 5, name: "Yara Sarma", tier: "basic", mpCost: 12, cooldown: 3, effect: { type: "heal", pct: 0.15 } },
  { id: "r3", unlockLevel: 10, name: "Ni\u015Fan At\u0131\u015F\u0131", tier: "advanced", mpCost: 18, cooldown: 2, effect: { type: "damage", mult: 1.75 }, goldCost: 400, questTier: 1 },
  { id: "r4", unlockLevel: 15, name: "Keskin Ni\u015Fanc\u0131 Duru\u015Fu", tier: "advanced", mpCost: 18, cooldown: 4, effect: { type: "buffAtk", mult: 1.35, turns: 3 }, goldCost: 600, questTier: 2 },
  { id: "r5", unlockLevel: 20, name: "\xC7ifte At\u0131\u015F", tier: "advanced", mpCost: 22, cooldown: 2, effect: { type: "damage", mult: 2 }, goldCost: 800, questTier: 2 },
  { id: "r6", unlockLevel: 25, name: "Zehirli Ok", tier: "advanced", mpCost: 20, cooldown: 3, effect: { type: "dot", mult: 0.75, turns: 3 }, goldCost: 1e3, questTier: 2 },
  { id: "r7", unlockLevel: 30, name: "Delici At\u0131\u015F", tier: "advanced", mpCost: 26, cooldown: 3, effect: { type: "damage", mult: 2.2 }, goldCost: 1200, questTier: 3 },
  { id: "r8", unlockLevel: 35, name: "\u0130nfaz Oku", tier: "advanced", mpCost: 24, cooldown: 3, effect: { type: "execute", mult: 2.8, hpPctThreshold: 0.3 }, goldCost: 1400, questTier: 3 },
  { id: "r9", unlockLevel: 40, name: "Sessiz Ok", tier: "advanced", mpCost: 28, cooldown: 3, effect: { type: "damage", mult: 2.35 }, goldCost: 1600, questTier: 3 },
  { id: "r10", unlockLevel: 45, name: "Avc\u0131 \u0130\xE7g\xFCd\xFCs\xFC", tier: "advanced", mpCost: 26, cooldown: 4, effect: { type: "buffAtk", mult: 1.45, turns: 3 }, goldCost: 1800, questTier: 4 },
  { id: "r11", unlockLevel: 50, name: "Kesin At\u0131\u015F", tier: "advanced", mpCost: 32, cooldown: 3, effect: { type: "damage", mult: 2.5 }, goldCost: 2e3, questTier: 4 },
  { id: "r12", unlockLevel: 55, name: "Do\u011Fa \u015Eifas\u0131", tier: "advanced", mpCost: 30, cooldown: 5, effect: { type: "heal", pct: 0.25 }, goldCost: 2200, questTier: 4 },
  { id: "r13", unlockLevel: 60, name: "\xD6l\xFCm Oku", tier: "advanced", mpCost: 40, cooldown: 4, effect: { type: "damage", mult: 2.8 }, goldCost: 2400, questTier: 5 }
];

// src/data/mageSkills.js
init_define_import_meta_env();
var MAGE_SKILLS = [
  { id: "m1", unlockLevel: 1, name: "B\xFCy\xFC Oku", tier: "basic", mpCost: 8, cooldown: 0, effect: { type: "damage", mult: 1.3 } },
  { id: "m2", unlockLevel: 5, name: "Mana Ak\u0131\u015F\u0131", tier: "basic", mpCost: 12, cooldown: 3, effect: { type: "heal", pct: 0.15 } },
  { id: "m3", unlockLevel: 10, name: "Alev Topu", tier: "advanced", mpCost: 18, cooldown: 2, effect: { type: "damage", mult: 1.75 }, goldCost: 400, questTier: 1 },
  { id: "m4", unlockLevel: 15, name: "Arkane Yo\u011Funla\u015Fma", tier: "advanced", mpCost: 18, cooldown: 4, effect: { type: "buffAtk", mult: 1.35, turns: 3 }, goldCost: 600, questTier: 2 },
  { id: "m5", unlockLevel: 20, name: "Y\u0131ld\u0131r\u0131m Zinciri", tier: "advanced", mpCost: 22, cooldown: 2, effect: { type: "damage", mult: 2 }, goldCost: 800, questTier: 2 },
  { id: "m6", unlockLevel: 25, name: "K\xFCk\xFCrt Ya\u011Fmuru", tier: "advanced", mpCost: 20, cooldown: 3, effect: { type: "dot", mult: 0.75, turns: 3 }, goldCost: 1e3, questTier: 2 },
  { id: "m7", unlockLevel: 30, name: "Donma Patlamas\u0131", tier: "advanced", mpCost: 26, cooldown: 3, effect: { type: "damage", mult: 2.2 }, goldCost: 1200, questTier: 3 },
  { id: "m8", unlockLevel: 35, name: "Ruh T\xFCketimi", tier: "advanced", mpCost: 24, cooldown: 3, effect: { type: "execute", mult: 2.8, hpPctThreshold: 0.3 }, goldCost: 1400, questTier: 3 },
  { id: "m9", unlockLevel: 40, name: "Meteor Ya\u011Fmuru", tier: "advanced", mpCost: 28, cooldown: 3, effect: { type: "damage", mult: 2.35 }, goldCost: 1600, questTier: 3 },
  { id: "m10", unlockLevel: 45, name: "Zaman B\xFCk\xFCm\xFC", tier: "advanced", mpCost: 26, cooldown: 4, effect: { type: "buffAtk", mult: 1.45, turns: 3 }, goldCost: 1800, questTier: 4 },
  { id: "m11", unlockLevel: 50, name: "Kaos B\xFCy\xFCs\xFC", tier: "advanced", mpCost: 32, cooldown: 3, effect: { type: "damage", mult: 2.5 }, goldCost: 2e3, questTier: 4 },
  { id: "m12", unlockLevel: 55, name: "Ya\u015Fam \xC7alma", tier: "advanced", mpCost: 30, cooldown: 5, effect: { type: "heal", pct: 0.25 }, goldCost: 2200, questTier: 4 },
  { id: "m13", unlockLevel: 60, name: "Arkane K\u0131yamet", tier: "advanced", mpCost: 40, cooldown: 4, effect: { type: "damage", mult: 2.8 }, goldCost: 2400, questTier: 5 }
];

// src/data/skills.js
var SKILLS_BY_CLASS = {
  warrior: WARRIOR_SKILLS,
  rogue: ROGUE_SKILLS,
  mage: MAGE_SKILLS
};
var MAX_LOADOUT_SLOTS = 5;

// src/utils/quests.js
init_define_import_meta_env();

// src/data/quests.js
init_define_import_meta_env();
var TIER_QUEST_TABLE = {
  1: { target: 50, goldReward: 150, xpReward: 1450 },
  2: { target: 70, goldReward: 400, xpReward: 3750 },
  3: { target: 90, goldReward: 800, xpReward: 7500 },
  4: { target: 110, goldReward: 1300, xpReward: 12700 },
  5: { target: 60, goldReward: 2e3, xpReward: 23e3 }
};
var QUEST_NAMES = {
  sis_kurdu: "Sisli Vadi'nin Belas\u0131",
  kabuklu_golem: "Kabuk Avc\u0131s\u0131",
  otlak_yabanisi: "Otlak Temizli\u011Fi",
  bataklik_surungeni: "Batakl\u0131k K\u0131r\u0131m\u0131",
  nadas_devi: "Nadas Devi Av\u0131",
  kul_yaratigi: "K\xFCl Kanyonu N\xF6bet\xE7isi",
  volkan_suru: "S\xFCr\xFCngen K\u0131r\u0131m\u0131",
  kanyon_akrebi: "Akrep Kovu\u015Fturmas\u0131",
  lav_ruhu: "Lav Ruhu Bast\u0131rmas\u0131",
  buzul_kurdu: "Buzul S\xFCr\xFCs\xFC",
  alev_orumcegi: "Alev \xD6r\xFCmce\u011Fi Av\u0131",
  don_devi: "Don Devi Seferi",
  kor_salamanderi: "Kor Salamanderi K\u0131r\u0131m\u0131",
  zirve_muhafizi: "Zirve Muhaf\u0131zlar\u0131",
  harabe_iskeleti: "Harabe Temizli\u011Fi",
  lanetli_rahip: "Lanetli Rahip Av\u0131",
  tapinak_bekcisi: "Tap\u0131nak Bek\xE7ileri",
  golge_vaizi: "G\xF6lge Vaizi Sefas\u0131",
  ucurum_solucani: "U\xE7urum Solucan\u0131 Av\u0131",
  karanlik_cagirici: "Karanl\u0131k \xC7a\u011F\u0131r\u0131c\u0131 K\u0131r\u0131m\u0131",
  dip_iblisi: "Dip \u0130blisi Seferi",
  kabus_golgesi: "Kabus G\xF6lgesi Av\u0131",
  ucurum_efendisi: "U\xE7urum Efendisi Kovu\u015Fturmas\u0131",
  kizil_muhafiz: "K\u0131z\u0131l Muhaf\u0131z Seferi",
  alev_cellati: "Alev Cellad\u0131 Av\u0131",
  kaos_iblisi: "Kaos Tap\u0131na\u011F\u0131 Seferi",
  kiyamet_ejderha: "K\u0131yamet Av\u0131"
};
var MONSTER_QUESTS = MAPS.flatMap((map) => {
  const table = TIER_QUEST_TABLE[map.tier];
  const avgXp = map.monsters.reduce((sum, m) => sum + m.xp, 0) / map.monsters.length;
  return map.monsters.map((m) => ({
    id: m.id,
    monsterId: m.id,
    tier: map.tier,
    requiredLevel: map.levelMin,
    name: QUEST_NAMES[m.id] || m.name,
    target: table.target,
    goldReward: table.goldReward,
    xpReward: Math.round(table.xpReward * (m.xp / avgXp) / 10) * 10
  }));
});
var AWAKENING_QUEST = {
  id: "awakening",
  name: "2. Uyan\u0131\u015F S\u0131nav\u0131",
  requiredLevel: 60,
  targets: { kaos_iblisi: 40, kiyamet_ejderha: 40 }
};

// src/utils/quests.js
function questProgress(player, quest) {
  const current = player.monsterKills?.[quest.monsterId] || 0;
  return { current: Math.min(current, quest.target), target: quest.target, done: current >= quest.target };
}
function isQuestClaimed(player, questId) {
  return (player.claimedQuests || []).includes(questId);
}
function claimQuest(player, questId) {
  const quest = MONSTER_QUESTS.find((q) => q.id === questId);
  if (!quest) return { player, claimed: false, reason: "invalidQuest" };
  if (isQuestClaimed(player, questId)) return { player, claimed: false, reason: "rewardAlreadyClaimed" };
  const { done: done13 } = questProgress(player, quest);
  if (!done13) return { player, claimed: false, reason: "questNotDone" };
  const chest = { id: uid(), tier: quest.tier };
  return {
    player: {
      ...player,
      gold: player.gold + quest.goldReward,
      xp: player.xp + quest.xpReward,
      chests: [...player.chests || [], chest],
      claimedQuests: [...player.claimedQuests || [], questId]
    },
    claimed: true,
    quest
  };
}
function isTierQuestClaimed(player, tier) {
  return MONSTER_QUESTS.some((q) => q.tier === tier && isQuestClaimed(player, q.id));
}
function awakeningProgress(player) {
  const entries = Object.entries(AWAKENING_QUEST.targets).map(([monsterId, target]) => ({
    monsterId,
    current: Math.min(player.monsterKills?.[monsterId] || 0, target),
    target
  }));
  const done13 = entries.every((e) => e.current >= e.target);
  return { entries, done: done13 };
}
function claimAwakening(player) {
  if (player.awakened) return { player, claimed: false, reason: "alreadyAwakened" };
  if (player.level < AWAKENING_QUEST.requiredLevel) return { player, claimed: false, reason: "levelRequired", reasonVars: { level: AWAKENING_QUEST.requiredLevel } };
  if (!awakeningProgress(player).done) return { player, claimed: false, reason: "trialNotDone" };
  return { player: { ...player, awakened: true }, claimed: true };
}

// src/utils/skills.js
function classSkills(cls) {
  return SKILLS_BY_CLASS[cls] || [];
}
function getSkill(cls, skillId) {
  return classSkills(cls).find((s) => s.id === skillId) || null;
}
function isKnown(player, skillId) {
  return (player.skills?.known || []).includes(skillId);
}
function learnFreeSkills(player) {
  const toLearn = classSkills(player.class).filter(
    (s) => s.tier === "basic" && s.unlockLevel <= player.level && !isKnown(player, s.id)
  );
  if (toLearn.length === 0) return player;
  return { ...player, skills: { ...player.skills, known: [...player.skills.known, ...toLearn.map((s) => s.id)] } };
}
function defaultT(key, vars) {
  const REASONS = {
    "character.skills.reason.invalidSkill": "Ge\xE7ersiz beceri.",
    "character.skills.reason.known": "Zaten \xF6\u011Frenildi.",
    "character.skills.reason.levelRequired": `Seviye ${vars?.level} gerekiyor.`,
    "character.skills.reason.questRequired": `Kaptan'\u0131n ${tierName("tr", vars?.tier)} g\xF6revini tamamlamal\u0131s\u0131n.`,
    "character.skills.reason.notEnoughGold": "Yeterli alt\u0131n\u0131n yok."
  };
  return REASONS[key] ?? key;
}
function canUnlockSkill(player, skill, t = defaultT, lang = "tr") {
  if (isKnown(player, skill.id)) return { ok: false, reason: t("character.skills.reason.known") };
  if (player.level < skill.unlockLevel) return { ok: false, reason: t("character.skills.reason.levelRequired", { level: skill.unlockLevel }) };
  if (skill.tier === "basic") return { ok: true };
  if (!isTierQuestClaimed(player, skill.questTier)) return { ok: false, reason: t("character.skills.reason.questRequired", { tier: tierName(lang, skill.questTier) }) };
  if (player.gold < skill.goldCost) return { ok: false, reason: t("character.skills.reason.notEnoughGold") };
  return { ok: true };
}
function unlockSkill(player, skillId, t = defaultT, lang = "tr") {
  const skill = getSkill(player.class, skillId);
  if (!skill) return { player, unlocked: false, reason: t("character.skills.reason.invalidSkill") };
  const check = canUnlockSkill(player, skill, t, lang);
  if (!check.ok) return { player, unlocked: false, reason: check.reason };
  const goldCost = skill.tier === "advanced" ? skill.goldCost : 0;
  return {
    player: {
      ...player,
      gold: player.gold - goldCost,
      skills: { ...player.skills, known: [...player.skills.known, skillId] }
    },
    unlocked: true
  };
}
function setLoadoutSlot(player, slotIndex, skillId) {
  if (skillId && !isKnown(player, skillId)) return player;
  const loadout = (player.skills.loadout || Array(MAX_LOADOUT_SLOTS).fill(null)).map((id, i) => {
    if (i === slotIndex) return skillId;
    return id === skillId ? null : id;
  });
  return { ...player, skills: { ...player.skills, loadout } };
}
function computeSkillDamage(skill, { clsAtk, atk, monsterDef, monsterHpPct, rand: rand2 }) {
  const e = skill.effect;
  let mult = e.mult ?? 1;
  if (e.type === "execute" && !(monsterHpPct <= e.hpPctThreshold)) mult = 1;
  return varyDamage(mitigate((clsAtk + atk * 0.9) * mult, monsterDef, MONSTER_DEF_K), () => (rand2(-1e4, 1e4) + 1e4) / 2e4);
}
function computeSkillHeal(skill, maxHp) {
  return Math.round((skill.effect.pct || 0) * maxHp);
}
function refreshSkillBuff(buffs, effect) {
  const stat = effect.type === "buffAtk" ? "atk" : "def";
  return [...buffs.filter((b) => b.stat !== stat), { stat, mult: effect.mult, turnsLeft: effect.turns + 1 }];
}

// src/game/fight.js
var POTION_COOLDOWN_TURNS = 2;
var MIN_TURN_MS = 300;
var MAX_FIGHT_ACTIONS = 4e3;
var nextSeed = (seed) => Math.imul(seed, 1664525) + 1013904223 >>> 0;
function stockOf(player) {
  const stock = { hp: {}, mp: {} };
  for (const item of player.inventory || []) {
    if (item.kind === "potion" && (item.potionType === "hp" || item.potionType === "mp") && item.count > 0) {
      stock[item.potionType][item.tier] = (stock[item.potionType][item.tier] || 0) + item.count;
    }
  }
  return stock;
}
function createFight(player, monster, seed) {
  return {
    seed: seed >>> 0 || 1,
    turn: 0,
    monsterHp: monster.hp,
    monsterMaxHp: monster.hp,
    hp: playerMaxHp(player),
    mp: playerMaxMp(player),
    buffs: [],
    dot: null,
    skillCooldowns: {},
    potionCooldowns: { hp: 0, mp: 0 },
    wear: { weapon: 0, armor: 0 },
    stock: stockOf(player),
    used: { hp: {}, mp: {} },
    ended: null
    // "win" | "lose"
  };
}
var buffMult = (buffs, stat) => buffs.filter((b) => b.stat === stat).reduce((m, b) => m * b.mult, 1);
function bestPotionTier(fight, kind) {
  for (let tier = 1; tier <= potionTiersFor(kind).length; tier++) if ((fight.stock[kind]?.[tier] || 0) > 0) return tier;
  return null;
}
function checkAction(fight, player, action) {
  if (fight.ended) return "ended";
  if (!action || typeof action !== "object") return "invalidAction";
  if (action.type === "attack") return null;
  if (action.type === "skill") {
    const skill = classSkills(player.class).find((s) => s.id === action.id);
    if (!skill || !(player.skills?.known || []).includes(skill.id)) return "unknownSkill";
    if ((fight.skillCooldowns[skill.id] || 0) > 0) return "skillCooldown";
    if (fight.mp < skill.mpCost) return "noMana";
    return null;
  }
  if (action.type === "potion") {
    if (action.kind !== "hp" && action.kind !== "mp") return "invalidAction";
    if ((fight.potionCooldowns[action.kind] || 0) > 0) return "potionCooldown";
    if (!bestPotionTier(fight, action.kind)) return "noPotion";
    return null;
  }
  return "invalidAction";
}
function stepFight(fight, player, monster, levelCap, action) {
  const error = checkAction(fight, player, action);
  if (error) return { fight, events: [], error };
  const s = {
    ...fight,
    turn: fight.turn + 1,
    buffs: fight.buffs.map((b) => ({ ...b })),
    dot: fight.dot ? { ...fight.dot } : null,
    skillCooldowns: { ...fight.skillCooldowns },
    potionCooldowns: { ...fight.potionCooldowns },
    wear: { ...fight.wear },
    stock: { hp: { ...fight.stock.hp }, mp: { ...fight.stock.mp } },
    used: { hp: { ...fight.used.hp }, mp: { ...fight.used.mp } }
  };
  const rng = () => {
    s.seed = nextSeed(s.seed);
    return s.seed / 4294967296;
  };
  const randInt = (min, max) => Math.floor(rng() * (max - min + 1)) + min;
  const events = [];
  const cls = CLASSES[player.class];
  const atk = totalStats(player).atk;
  const def = playerDef(player);
  const dex = player.stats.dex + wingDexBonus(player);
  const maxHp = playerMaxHp(player);
  if (s.dot && s.dot.turnsLeft > 0) {
    s.monsterHp = Math.max(0, s.monsterHp - s.dot.dmgPerTurn);
    events.push({ kind: "dot", dmg: s.dot.dmgPerTurn });
  }
  s.dot = s.dot && s.dot.turnsLeft > 1 ? { ...s.dot, turnsLeft: s.dot.turnsLeft - 1 } : null;
  s.buffs = s.buffs.map((b) => ({ ...b, turnsLeft: b.turnsLeft - 1 })).filter((b) => b.turnsLeft > 0);
  for (const id of Object.keys(s.skillCooldowns)) s.skillCooldowns[id] = Math.max(0, s.skillCooldowns[id] - 1);
  for (const kind of Object.keys(s.potionCooldowns)) s.potionCooldowns[kind] = Math.max(0, s.potionCooldowns[kind] - 1);
  const atkMult = buffMult(s.buffs, "atk");
  const usePotionNow = () => {
    const kind = action.kind;
    const tier = bestPotionTier(s, kind);
    s.stock[kind][tier] -= 1;
    s.used[kind][tier] = (s.used[kind][tier] || 0) + 1;
    s.potionCooldowns[kind] = POTION_COOLDOWN_TURNS;
    const cur = kind === "hp" ? s.hp : s.mp;
    const cap = kind === "hp" ? maxHp : playerMaxMp(player);
    const next = Math.min(cap, cur + potionAmount(kind, tier));
    if (kind === "hp") s.hp = next;
    else s.mp = next;
    events.push({ kind: "potion", potion: kind, tier, healed: next - cur });
  };
  if (s.monsterHp <= 0) {
    if (action.type === "skill") {
      const skill = classSkills(player.class).find((x) => x.id === action.id);
      s.mp -= skill.mpCost;
      s.skillCooldowns[skill.id] = skill.cooldown;
    } else if (action.type === "potion") usePotionNow();
    s.ended = "win";
    return { fight: s, events };
  }
  if (action.type === "attack") {
    const crit = rng() < cls.crit;
    const hit = rng() < hitChance(dex, monster.atk, player.level);
    const dmg = hit ? varyDamage(mitigate((cls.atk + atk * 0.9) * atkMult * (crit ? 1.8 : 1), monster.def, MONSTER_DEF_K), rng) : 0;
    s.monsterHp = Math.max(0, s.monsterHp - dmg);
    if (hit) s.wear.weapon += 1;
    events.push({ kind: "attack", hit, crit, dmg });
  } else if (action.type === "skill") {
    const skill = classSkills(player.class).find((x) => x.id === action.id);
    const e = skill.effect;
    s.skillCooldowns[skill.id] = skill.cooldown;
    s.mp -= skill.mpCost;
    if (e.type === "damage" || e.type === "execute") {
      const dmg = Math.max(1, Math.round(computeSkillDamage(skill, { clsAtk: cls.atk, atk, monsterDef: monster.def, monsterHpPct: s.monsterHp / s.monsterMaxHp, rand: randInt }) * atkMult));
      s.monsterHp = Math.max(0, s.monsterHp - dmg);
      events.push({ kind: "skill", skillId: skill.id, effect: e.type, dmg });
    } else if (e.type === "heal") {
      const amount = computeSkillHeal(skill, maxHp);
      const healed = Math.min(amount, maxHp - s.hp);
      s.hp = Math.min(maxHp, s.hp + amount);
      events.push({ kind: "skill", skillId: skill.id, effect: "heal", amount, healed });
    } else if (e.type === "buffAtk" || e.type === "buffDef") {
      s.buffs = refreshSkillBuff(s.buffs, e);
      events.push({ kind: "skill", skillId: skill.id, effect: "buff" });
    } else if (e.type === "dot") {
      const perTick = computeSkillDamage(skill, { clsAtk: cls.atk, atk, monsterDef: monster.def, monsterHpPct: 1, rand: () => 0 });
      s.dot = { dmgPerTurn: Math.max(1, Math.round(perTick * atkMult)), turnsLeft: e.turns };
      events.push({ kind: "skill", skillId: skill.id, effect: "dot" });
    }
  } else {
    usePotionNow();
  }
  if (s.monsterHp <= 0) {
    s.ended = "win";
    return { fight: s, events };
  }
  const hits = rng() < hitChance(monster.atk, dex, levelCap);
  const defMult = buffMult(s.buffs, "def");
  const reduction = armorSetDamageReduction(player, "monster");
  const mdmg = hits ? Math.max(1, Math.round(mitigate(monster.atk, def * defMult, PLAYER_DEF_K) * (1 - reduction) + randInt(-2, 3))) : 0;
  s.hp = Math.max(0, s.hp - mdmg);
  if (hits) s.wear.armor += 1;
  events.push({ kind: "monster", hit: hits, dmg: mdmg });
  if (s.hp <= 0) s.ended = "lose";
  return { fight: s, events };
}
function replayFight(player, monster, levelCap, seed, actions) {
  if (!Array.isArray(actions) || actions.length > MAX_FIGHT_ACTIONS) return { error: "invalidLog" };
  let fight = createFight(player, monster, seed);
  for (const action of actions) {
    if (fight.ended) return { error: "actionsAfterEnd" };
    const out = stepFight(fight, player, monster, levelCap, action);
    if (out.error) return { error: out.error };
    fight = out.fight;
  }
  return { fight };
}
function maxActionDamage(player, monsterDef) {
  const cls = CLASSES[player.class];
  if (!cls) return 0;
  const base = cls.atk + totalStats(player).atk * 0.9;
  const known = classSkills(player.class).filter((s) => (player.skills?.known || []).includes(s.id));
  const buff = known.filter((s) => s.effect.type === "buffAtk").reduce((m, s) => Math.max(m, s.effect.mult || 1), 1);
  let best = mitigate(base * 1.8 * buff, monsterDef, MONSTER_DEF_K);
  let dot = 0;
  for (const skill of known) {
    const e = skill.effect;
    if (e.type === "damage" || e.type === "execute") best = Math.max(best, mitigate(base * (e.mult || 1) * buff, monsterDef, MONSTER_DEF_K));
    else if (e.type === "dot") dot = Math.max(dot, mitigate(base * (e.mult || 1) * buff, monsterDef, MONSTER_DEF_K));
  }
  return Math.ceil((best + dot) * (1 + 1 / 13) * 1.1) + 5;
}

// src/game/battle.js
init_define_import_meta_env();

// src/data/mapBosses.js
init_define_import_meta_env();
function buildMapBoss(map) {
  const base = map.monsters[map.monsters.length - 1];
  const rewardCfg = getMonsterRewardConfig(base, map);
  return {
    id: `map_boss_${map.id}`,
    name: `${map.name} Muhaf\u0131z\u0131`,
    hp: Math.round(base.hp * 2.5),
    atk: Math.round(base.atk * 1.15),
    def: Math.round(base.def * 1.3),
    xp: Math.round(rewardCfg.xp * 3),
    goldMin: Math.round(rewardCfg.goldMin * 3),
    goldMax: Math.round(rewardCfg.goldMax * 3),
    mapBoss: true,
    isBoss: true,
    visualSourceId: base.id
  };
}

// src/utils/monsterRewards.js
init_define_import_meta_env();

// src/utils/premium.js
init_define_import_meta_env();

// src/data/premium.js
init_define_import_meta_env();
var PREMIUM_TIERS = {
  mythic: {
    id: "mythic",
    name: "Mythic Premium",
    price: 3e3,
    durationDays: 15,
    color: "#FF8C42",
    expMult: 2,
    dropMult: 1.1,
    goldMult: 1.1,
    sellMult: 1.1,
    repairDiscount: 0.5,
    bankBonusPages: 2,
    giftScrolls: 1,
    nationalPointBonus: 25,
    nationalPointLossReduction: 0.1,
    perks: ["goldBonus10", "expBonus100", "dropBonus10", "sellBonus10", "repairDiscount50", "giftScroll", "bankPages2", "npLossReduction10", "autoBattle"]
  },
  apex: {
    id: "apex",
    name: "Apex Premium",
    price: 1500,
    durationDays: 15,
    color: "#8B6FC9",
    expMult: 1.5,
    dropMult: 1.03,
    goldMult: 1.05,
    sellMult: 1.05,
    repairDiscount: 0.25,
    bankBonusPages: 0,
    giftScrolls: 1,
    nationalPointBonus: 10,
    nationalPointLossReduction: 0.05,
    perks: ["goldBonus5", "expBonus50", "dropBonus3", "sellBonus5", "repairDiscount25", "giftScroll", "npLossReduction5", "autoBattle"]
  }
};

// src/utils/premium.js
var DAY_MS = 24 * 60 * 60 * 1e3;
function activeEntry(entry) {
  if (!entry?.tier || !entry.expiresAt || entry.expiresAt <= Date.now()) return null;
  return PREMIUM_TIERS[entry.tier] ? entry : null;
}
function effectivePremium(player) {
  const bought = activeEntry(player.premium);
  const boost = activeEntry(player.premiumBoost);
  if (!bought) return boost;
  if (!boost) return bought;
  return PREMIUM_TIERS[boost.tier].price > PREMIUM_TIERS[bought.tier].price ? boost : bought;
}
function activePremiumTier(player) {
  const entry = effectivePremium(player);
  return entry ? PREMIUM_TIERS[entry.tier] : null;
}
function premiumGoldMultiplier(player) {
  return activePremiumTier(player)?.goldMult ?? 1;
}
function premiumExpMultiplier(player) {
  return activePremiumTier(player)?.expMult ?? 1;
}
function premiumDropMultiplier(player) {
  return activePremiumTier(player)?.dropMult ?? 1;
}
function premiumSellMultiplier(player) {
  return activePremiumTier(player)?.sellMult ?? 1;
}
function premiumRepairDiscount(player) {
  return activePremiumTier(player)?.repairDiscount ?? 0;
}
function premiumNpBonus(player) {
  return activePremiumTier(player)?.nationalPointBonus ?? 0;
}
function premiumNpLossReduction(player) {
  return activePremiumTier(player)?.nationalPointLossReduction ?? 0;
}
function buyPremium(player, tierId, bank) {
  const tier = PREMIUM_TIERS[tierId];
  if (!tier) return { player, bank, bought: false, reason: "invalidPackage" };
  if (player.diamonds < tier.price) return { player, bank, bought: false, reason: "notEnoughDiamonds" };
  const now = Date.now();
  const sameTierActive = player.premium?.tier === tierId && activePremiumTier(player);
  const base = sameTierActive ? player.premium.expiresAt : now;
  const expiresAt = base + tier.durationDays * DAY_MS;
  let nextBank = bank;
  const targetPages = BANK_PAGES + tier.bankBonusPages;
  if (nextBank.length < targetPages) {
    nextBank = [...nextBank, ...Array.from({ length: targetPages - nextBank.length }, () => [])];
  }
  let next = { ...player, diamonds: player.diamonds - tier.price, premium: { tier: tierId, expiresAt } };
  for (let i = 0; i < tier.giftScrolls; i++) {
    const result = addItemToInventory(next, makeBonusScrollStack());
    next = result.player;
  }
  return { player: next, bank: nextBank, bought: true };
}

// src/utils/clan.js
init_define_import_meta_env();

// src/utils/day.js
init_define_import_meta_env();
var ISTANBUL_OFFSET_MS = 3 * 60 * 60 * 1e3;
function dayKeyAt(ms) {
  const [weekday, day, month, year] = new Date(ms + ISTANBUL_OFFSET_MS).toUTCString().split(" ");
  return `${weekday.replace(",", "")} ${month} ${day} ${year}`;
}
function todayKey() {
  return dayKeyAt(Date.now());
}
function yesterdayKey() {
  return dayKeyAt(Date.now() - 24 * 60 * 60 * 1e3);
}

// src/data/clan.js
init_define_import_meta_env();
var CLAN_EXP_TIERS = [
  { min: 31, bonus: 0.05 },
  { min: 21, bonus: 0.02 },
  { min: 11, bonus: 0.01 }
];

// src/utils/clan.js
function onlineCountFor(clan) {
  if (!clan) return 0;
  return clan.members.length;
}
function clanExpBonus(onlineCount) {
  for (const tier of CLAN_EXP_TIERS) {
    if (onlineCount >= tier.min) return tier.bonus;
  }
  return 0;
}
function clanExpMultiplier(player) {
  if (!player.clan) return 1;
  return 1 + clanExpBonus(onlineCountFor(player.clan));
}

// src/utils/events.js
init_define_import_meta_env();
function activeExpEvent(player) {
  if (!player.eventExpBonus?.expiresAt) return null;
  if (player.eventExpBonus.expiresAt <= Date.now()) return null;
  return player.eventExpBonus;
}
function eventExpMultiplier(player) {
  return activeExpEvent(player)?.mult ?? 1;
}

// src/utils/dailyQuests.js
init_define_import_meta_env();

// src/data/dailySystems.js
init_define_import_meta_env();
var DAILY_LOGIN_REWARDS = [
  { day: 1, gold: 100, diamonds: 0, scrollCount: 0, chestTier: null, bonusScroll: false },
  { day: 2, gold: 200, diamonds: 0, scrollCount: 0, chestTier: null, bonusScroll: false },
  { day: 3, gold: 150, diamonds: 0, scrollCount: 3, chestTier: null, bonusScroll: false },
  { day: 4, gold: 400, diamonds: 0, scrollCount: 0, chestTier: null, bonusScroll: false },
  { day: 5, gold: 250, diamonds: 0, scrollCount: 0, chestTier: "map", bonusScroll: false },
  { day: 6, gold: 300, diamonds: 5, scrollCount: 0, chestTier: null, bonusScroll: false },
  { day: 7, gold: 800, diamonds: 15, scrollCount: 0, chestTier: null, bonusScroll: true }
];
var DAILY_QUEST_SLOTS = [
  { target: 10, goldReward: 150, xpReward: 400, chest: false },
  { target: 25, goldReward: 400, xpReward: 1e3, chest: false },
  { target: 50, goldReward: 900, xpReward: 2200, chest: true }
];

// src/utils/dailyQuests.js
function freshDailyQuests() {
  return { day: todayKey(), killsToday: 0, claimed: DAILY_QUEST_SLOTS.map(() => false) };
}
function ensureDailyQuestsFresh(player) {
  const dq = player.dailyQuests;
  if (dq && dq.day === todayKey()) return player;
  return { ...player, dailyQuests: freshDailyQuests() };
}
function registerDailyKill(player) {
  const p = ensureDailyQuestsFresh(player);
  return { ...p, dailyQuests: { ...p.dailyQuests, killsToday: p.dailyQuests.killsToday + 1 } };
}
function claimDailyQuest(player, slotIndex) {
  const p = ensureDailyQuestsFresh(player);
  const dq = p.dailyQuests;
  const slot = DAILY_QUEST_SLOTS[slotIndex];
  if (!slot) return { player: p, claimed: false, reason: "invalidQuest" };
  if (dq.claimed[slotIndex]) return { player: p, claimed: false, reason: "rewardAlreadyClaimed" };
  if (dq.killsToday < slot.target) return { player: p, claimed: false, reason: "questNotDone" };
  let next = {
    ...p,
    gold: p.gold + slot.goldReward,
    xp: p.xp + slot.xpReward,
    dailyQuests: { ...dq, claimed: dq.claimed.map((c, i) => i === slotIndex ? true : c) }
  };
  if (slot.chest) {
    const tier = highestUnlockedMap(next.level).tier;
    next = { ...next, chests: [...next.chests, { id: uid(), tier }] };
  }
  return { player: next, claimed: true, quest: slot };
}

// src/utils/weeklyQuests.js
init_define_import_meta_env();

// src/data/weeklyQuests.js
init_define_import_meta_env();
var WEEKLY_QUESTS = [
  { id: "weekly_hunt", name: "Haftal\u0131k Av", desc: "75 canavar yen.", type: "kills", target: 75, goldReward: 1200, xpReward: 4500, chest: false },
  { id: "weekly_boss", name: "Muhaf\u0131z Av\u0131", desc: "3 harita sonu boss'u yen.", type: "bosses", target: 3, goldReward: 2200, xpReward: 8500, chest: true }
];

// src/utils/weeklyQuests.js
function freshWeeklyQuests() {
  return { weekId: currentWeekId(), kills: 0, bosses: 0, claimed: [] };
}
function ensureWeeklyQuestsFresh(player) {
  return player.weeklyQuests?.weekId === currentWeekId() ? player : { ...player, weeklyQuests: freshWeeklyQuests() };
}
function registerWeeklyKill(player, monster) {
  const p = ensureWeeklyQuestsFresh(player);
  return { ...p, weeklyQuests: { ...p.weeklyQuests, kills: p.weeklyQuests.kills + 1, bosses: p.weeklyQuests.bosses + (monster.mapBoss ? 1 : 0) } };
}
function weeklyQuestProgress(player, quest) {
  const state = player.weeklyQuests?.weekId === currentWeekId() ? player.weeklyQuests : freshWeeklyQuests();
  const current = quest.type === "bosses" ? state.bosses : state.kills;
  return { current: Math.min(current, quest.target), target: quest.target, done: current >= quest.target, claimed: state.claimed.includes(quest.id) };
}
function claimWeeklyQuest(player, id) {
  const quest = WEEKLY_QUESTS.find((q) => q.id === id);
  const p = ensureWeeklyQuestsFresh(player);
  if (!quest) return { player: p, claimed: false, reason: "invalidQuest" };
  const progress = weeklyQuestProgress(p, quest);
  if (progress.claimed) return { player: p, claimed: false, reason: "rewardAlreadyClaimed" };
  if (!progress.done) return { player: p, claimed: false, reason: "questNotDone" };
  let next = { ...p, gold: p.gold + quest.goldReward, xp: p.xp + quest.xpReward, weeklyQuests: { ...p.weeklyQuests, claimed: [...p.weeklyQuests.claimed, id] } };
  if (quest.chest) next = { ...next, chests: [...next.chests, { id: uid(), tier: highestUnlockedMap(next.level).tier }] };
  return { player: next, claimed: true, quest };
}

// src/utils/mapBoss.js
init_define_import_meta_env();

// src/utils/mapProgress.js
init_define_import_meta_env();
var KILLS_TO_UNLOCK_NEXT = 20;
function monsterKillCount(player, monsterId) {
  return player.monsterKills?.[monsterId] || 0;
}
function isMonsterUnlocked(player, map, index) {
  if (index <= 0) return true;
  const prev = map.monsters[index - 1];
  return monsterKillCount(player, prev.id) >= KILLS_TO_UNLOCK_NEXT;
}
function isMapProgressUnlocked(player, mapIndex, allMaps) {
  if (mapIndex <= 0) return true;
  const prevMap = allMaps[mapIndex - 1];
  return prevMap.monsters.every((m) => monsterKillCount(player, m.id) >= KILLS_TO_UNLOCK_NEXT);
}

// src/utils/mapBoss.js
function freshBossState() {
  return { day: todayKey(), defeatedMapIds: [] };
}
function mapBossState(player) {
  return player.mapBoss?.day === todayKey() ? player.mapBoss : freshBossState();
}
function mapCompletion(player, mapId, map = findMap(mapId)) {
  const total = map.monsters.length;
  const done13 = map.monsters.filter((m) => monsterKillCount(player, m.id) >= KILLS_TO_UNLOCK_NEXT).length;
  return { done: done13, total, complete: done13 >= total };
}
function canFightMapBoss(player, mapId, map) {
  if (mapBossState(player).defeatedMapIds.includes(mapId)) return { ok: false, reason: "defeatedToday" };
  const completion = mapCompletion(player, mapId, map);
  if (!completion.complete) return { ok: false, reason: "mapIncomplete", done: completion.done, total: completion.total };
  return { ok: true };
}
function registerMapBossDefeat(player, mapId) {
  const state = mapBossState(player);
  if (state.defeatedMapIds.includes(mapId)) return player;
  return { ...player, mapBoss: { ...state, defeatedMapIds: [...state.defeatedMapIds, mapId] } };
}

// src/utils/monsterRewards.js
function pickDropTier(tier) {
  return Math.random() < 0.5 ? tier : Math.max(1, tier - 1);
}
function grantMonsterReward(p, m, map, opts = {}) {
  if (m.mapBoss && !canFightMapBoss(p, map.id).ok) return { player: p, drops: null, blockedReasonKey: "battle.bossDefeatedToday", tone: "warn" };
  const rewardCfg = getMonsterRewardConfig(m, map);
  const expMult = premiumExpMultiplier(p) * clanExpMultiplier(p) * eventExpMultiplier(p) * boostMultiplier(p, "exp") * wingMultiplier(p, "exp");
  const dropMult = premiumDropMultiplier(p) * (opts.dropMult ?? 1) * wingMultiplier(p, "drop");
  const goldMult = premiumGoldMultiplier(p) * boostMultiplier(p, "gold") * (opts.goldMult ?? 1);
  let np = { ...p, inventory: [...p.inventory], chests: [...p.chests], monsterKills: { ...p.monsterKills } };
  const killsBefore = np.monsterKills[m.id] || 0;
  np.monsterKills[m.id] = killsBefore + 1;
  const goldGain = Math.round(rand(rewardCfg.goldMin, rewardCfg.goldMax) * goldMult);
  const levelPenalty = xpLevelPenaltyMultiplier(p.level, map.levelMax);
  const xpGain = p.level >= MAX_LEVEL ? 0 : Math.round(rewardCfg.xp * expMult * levelPenalty);
  const goldBefore = np.gold;
  np.gold = clampGold(np.gold + goldGain);
  const actualGoldGain = np.gold - goldBefore;
  np.xp += xpGain;
  let drops = [];
  if (actualGoldGain > 0) drops.push({ type: "gold", amount: actualGoldGain });
  if (xpGain > 0) drops.push({ type: "xp", amount: xpGain });
  const relatedQuest = MONSTER_QUESTS.find((q) => q.monsterId === m.id);
  if (relatedQuest && !(p.claimedQuests || []).includes(relatedQuest.id)) {
    const current = np.monsterKills[m.id];
    if (current >= relatedQuest.target) {
      if (killsBefore < relatedQuest.target) {
        drops.push({ type: "questComplete" });
      }
    } else {
      drops.push({ type: "questProgress", current, target: relatedQuest.target });
    }
  }
  const freshNp = ensureDailyQuestsFresh(np);
  const dailyKillsBefore = freshNp.dailyQuests.killsToday;
  np = registerDailyKill(freshNp);
  np = registerWeeklyKill(np, m);
  DAILY_QUEST_SLOTS.forEach((slot) => {
    const wasDone = dailyKillsBefore >= slot.target;
    const isDone = np.dailyQuests.killsToday >= slot.target;
    if (isDone && !wasDone) {
      drops.push({ type: "dailyQuestComplete", target: slot.target });
    }
  });
  if (Math.random() < rewardCfg.dropChance * dropMult) {
    const dropTier = pickDropTier(map.tier);
    const item = Array.isArray(rewardCfg.loot) ? rollConfiguredLoot(rewardCfg.loot) : rollMapLoot(dropTier, map.tier);
    if (item) {
      const addResult = addItemToInventory(np, item);
      np = addResult.player;
      if (addResult.added) np.hasNewItemNotice = true;
      drops.push(addResult.added ? { type: "itemDropped", kind: item.kind, itemName: item.name } : { type: "itemDropFailed", itemName: item.name, reason: addResult.reason });
    }
  }
  if (Math.random() < rewardCfg.chestChance * dropMult) {
    const chestTier = pickDropTier(map.tier);
    const chest = { id: uid(), tier: chestTier };
    np.chests.push(chest);
    drops.push({ type: "chestDropped", tier: chestTier });
  }
  if (m.mapBoss) {
    np = registerMapBossDefeat(np, map.id);
    for (let i = 0; i < rewardCfg.guaranteedChests; i++) {
      np.chests.push({ id: uid(), tier: rewardCfg.guaranteedChestTier });
      drops.push({ type: "guardChest", tier: rewardCfg.guaranteedChestTier });
    }
  }
  const levelBefore = p.level;
  let leveled = false;
  let levelsGained = 0;
  while (np.level < MAX_LEVEL && np.xp >= xpToNext(np.level)) {
    np.xp -= xpToNext(np.level);
    np.level += 1;
    np.statPoints += 3;
    levelsGained += 1;
    leveled = true;
  }
  if (np.level >= MAX_LEVEL) np.xp = 0;
  np.hp = playerMaxHp(np);
  np.mp = playerMaxMp(np);
  if (leveled) {
    drops.push({ type: "levelUpToast", level: np.level, statPoints: levelsGained * 3 });
  }
  np = learnFreeSkills(np);
  const unlockedMap = leveled ? MAPS.find((m2) => m2.levelMin > levelBefore && m2.levelMin <= np.level) : null;
  const levelUp = leveled ? { fromLevel: levelBefore, toLevel: np.level, levelsGained, statPointsGained: levelsGained * 3, unlockedMap } : null;
  return { player: np, drops, blockedReasonKey: null, tone: leveled ? "level" : "loot", levelUp };
}

// src/utils/soloDungeon.js
init_define_import_meta_env();
function freshEntries() {
  return { day: todayKey(), entriesUsed: 0, extraPurchased: 0 };
}
function todaysEntries(player) {
  const sd = player.soloDungeon;
  return sd && sd.day === todayKey() ? sd : freshEntries();
}
function dungeonEntriesLeft(player) {
  const sd = todaysEntries(player);
  return Math.max(0, SOLO_DUNGEON_DAILY_LIMIT + (sd.extraPurchased || 0) - sd.entriesUsed);
}
function canEnterSoloDungeon(player) {
  if (dungeonEntriesLeft(player) <= 0) return { ok: false, reason: "Bug\xFCnk\xFC zindan giri\u015F haklar\u0131n bitti \u2014 yar\u0131n tekrar gel." };
  return { ok: true };
}
function consumeDungeonEntry(player) {
  const sd = todaysEntries(player);
  return { ...player, soloDungeon: { ...sd, entriesUsed: sd.entriesUsed + 1 } };
}
function hasBoughtExtraDungeonEntryToday(player) {
  return (todaysEntries(player).extraPurchased || 0) > 0;
}
function buyExtraDungeonEntries(player) {
  if (hasBoughtExtraDungeonEntryToday(player)) return { player, bought: false, reason: "alreadyBoughtToday" };
  if (player.diamonds < EXTRA_DUNGEON_ENTRY_COST_DIAMONDS) return { player, bought: false, reason: "notEnoughDiamonds" };
  const sd = todaysEntries(player);
  return {
    player: {
      ...player,
      diamonds: player.diamonds - EXTRA_DUNGEON_ENTRY_COST_DIAMONDS,
      soloDungeon: { ...sd, extraPurchased: (sd.extraPurchased || 0) + EXTRA_DUNGEON_ENTRIES_PER_PURCHASE }
    },
    bought: true
  };
}

// src/utils/potions.js
init_define_import_meta_env();
function bestAvailablePotionTier(player, potionType) {
  const tiers = potionTiersFor(potionType);
  for (let tier = 1; tier <= tiers.length; tier++) {
    const stack = player.inventory.find((i) => i.kind === "potion" && i.potionType === potionType && i.tier === tier);
    if (stack && stack.count > 0) return tier;
  }
  return null;
}
function usePotion(player, potionType, tier) {
  const stack = player.inventory.find((i) => i.kind === "potion" && i.potionType === potionType && i.tier === tier);
  if (!stack || stack.count <= 0) {
    return { player, healed: 0, reason: "noPotionsLeft" };
  }
  const maxStat = potionType === "hp" ? playerMaxHp(player) : playerMaxMp(player);
  const healAmt = potionAmount(potionType, tier);
  const cur = potionType === "hp" ? player.hp : player.mp;
  const next = Math.min(maxStat, cur + healAmt);
  const healed = next - cur;
  const inventory = stack.count - 1 <= 0 ? player.inventory.filter((i) => i.id !== stack.id) : player.inventory.map((i) => i.id === stack.id ? { ...i, count: i.count - 1 } : i);
  return { player: { ...player, [potionType]: next, inventory }, healed };
}

// src/game/battle.js
var MAX_WEAR_PER_REPORT = 1500;
var fail = (state, reason, extra = {}) => ({ state, result: { ok: false, reason, ...extra } });
var done = (state, extra = {}) => ({ state, result: { ok: true, ...extra } });
var staticIndex = null;
function buildIndex() {
  const index = /* @__PURE__ */ new Map();
  MAPS.forEach((map) => {
    map.monsters.forEach((monster, i) => index.set(monster.id, { monster, map, kind: "normal", index: i }));
    const stages = buildSoloDungeonStages(map);
    stages.forEach((stage, i) => {
      if (stage.isBoss) {
        index.set(stage.id, { monster: stage, map, kind: "dungeon", stage: i, risk: false });
        return;
      }
      buildDungeonStageChoices(map, i).forEach((choice) => index.set(choice.risk ? choice.id : stage.id, { monster: choice, map, kind: "dungeon", stage: i, risk: !!choice.risk }));
    });
  });
  return index;
}
function resolveMonster(monsterId) {
  if (typeof monsterId !== "string") return null;
  staticIndex ||= buildIndex();
  const hit = staticIndex.get(monsterId);
  if (hit) return hit;
  const map = MAPS.find((m) => monsterId === `map_boss_${m.id}`);
  return map ? { monster: buildMapBoss(map), map, kind: "boss" } : null;
}
var currentMap = (player) => {
  const map = findMap(player.currentMapId);
  return player.level >= map.levelMin ? map : null;
};
function checkAccess(player, target) {
  const map = currentMap(player);
  if (!map) return "locked";
  if (target.map.id !== map.id) return "wrongMap";
  if (target.kind === "normal" && !isMonsterUnlocked(player, map, target.index)) return "monsterLocked";
  if (target.kind === "boss") {
    const gate = canFightMapBoss(player, map.id);
    if (!gate.ok) return gate.reason === "mapIncomplete" ? "mapIncomplete" : "defeatedToday";
  }
  if (target.kind === "dungeon") {
    const run = player.dungeonRun;
    if (!run || run.mapId !== map.id || run.stage !== target.stage) return "noDungeonRun";
  }
  return null;
}
var asCount = (value) => Number.isFinite(value) && value > 0 ? Math.min(MAX_WEAR_PER_REPORT, Math.floor(value)) : 0;
function applyWear(player, wear) {
  let next = player;
  const weapon = asCount(wear?.weapon);
  const armor = asCount(wear?.armor);
  if (weapon) next = damageEquippedDurability(next, WEAPON_SLOTS, weapon);
  if (armor) next = damageEquippedDurability(next, ARMOR_SLOTS, armor);
  return next;
}
function applyFightAftermath(player, fight) {
  let next = applyWear(player, fight.wear);
  for (const kind of ["hp", "mp"]) {
    for (const [tier, count] of Object.entries(fight.used[kind])) {
      for (let n = 0; n < count; n++) next = usePotion(next, kind, Number(tier)).player;
    }
  }
  return next;
}
var clearFight = (player) => player.fight || player.dungeonRun ? { ...player, fight: null, dungeonRun: null } : player;
var battleReducers = {
  "battle/start"(state, { monsterId }) {
    const target = resolveMonster(monsterId);
    if (!target) return fail(state, "unknownMonster");
    const denied = checkAccess(state.player, target);
    if (denied) return fail(state, denied);
    const seed = Math.floor(Math.random() * 4294967296) >>> 0 || 1;
    const player = { ...state.player, fight: { monsterId, startedAt: Date.now(), seed }, hp: playerMaxHp(state.player), mp: playerMaxMp(state.player) };
    return done({ ...state, player }, { seed });
  },
  // Savaşı sunucuda baştan oynatır ve sonucu uygular. Sonuç: "win" (ödül), "lose" (ölüm cezası) ya da
  // "retreat" (bitmemiş savaş: yalnızca aşınma ve harcanan potlar). Savaş bir kez ödeme yapar.
  "battle/settle"(state, { monsterId, actions }) {
    const target = resolveMonster(monsterId);
    if (!target) return fail(state, "unknownMonster");
    const fight = state.player.fight;
    if (!fight || fight.monsterId !== monsterId || !Number.isInteger(fight.seed)) return fail(state, "noFight");
    const replay = replayFight(state.player, target.monster, target.map.levelMax, fight.seed, actions);
    if (replay.error) return fail(state, "invalidLog", { detail: replay.error });
    const elapsed = Date.now() - fight.startedAt;
    if (elapsed < replay.fight.turn * MIN_TURN_MS - 1500) return fail(state, "tooFast");
    const denied = checkAccess(state.player, target);
    if (denied) return fail(state, denied);
    let player = applyFightAftermath({ ...state.player, fight: null }, replay.fight);
    const outcome = replay.fight.ended || "retreat";
    if (outcome === "lose") {
      const penalty = applyDeathPenalty(clearFight(player));
      return done({ ...state, player: penalty.player }, { outcome, xpLost: penalty.xpLost });
    }
    if (outcome === "retreat") return done({ ...state, player: clearFight(player) }, { outcome });
    const reward = grantMonsterReward(player, target.monster, target.map);
    if (reward.blockedReasonKey) return done({ ...state, player }, { outcome, blockedReasonKey: reward.blockedReasonKey, tone: reward.tone, drops: [], levelUp: null });
    player = reward.player;
    let completion = null;
    if (target.kind === "dungeon") {
      if (target.monster.isBoss) {
        const bonusGold = rand(target.monster.goldMin, target.monster.goldMax) * 2;
        const gold = clampGold(player.gold + bonusGold);
        completion = { bonusGold: gold - player.gold, chestTier: target.map.tier };
        player = { ...player, gold, chests: [...player.chests, { id: uid(), tier: target.map.tier }], dungeonRun: null };
      } else {
        player = { ...player, dungeonRun: { ...player.dungeonRun, stage: target.stage + 1 } };
      }
    }
    return done({ ...state, player }, { outcome, drops: reward.drops, tone: reward.tone, levelUp: reward.levelUp, completion });
  },
  // Savaş Alanı/klan zindanı gibi henüz kendi savaş kaydı olmayan yerler için ölüm cezası.
  "battle/death"(state, { wear }) {
    const penalty = applyDeathPenalty(clearFight(applyWear(state.player, wear)));
    return done({ ...state, player: penalty.player }, { xpLost: penalty.xpLost });
  },
  // Savaş kaydını ve zindan koşusunu temizler (sekmeden çıkış vb.); aşınma/pot için `battle/settle` kullanılır.
  "battle/retreat"(state) {
    return done({ ...state, player: clearFight(state.player) });
  },
  // hp/mp istemcide canlı tutulur; pot hesabı istemcinin söylediği güncel değerlerle yapılır
  // (yalnızca kendi savaş ekranındaki iyileşmeyi etkiler), tüketilen pot sunucuda düşer.
  "battle/potion"(state, { kind, hp, mp }) {
    if (kind !== "hp" && kind !== "mp") return fail(state, "invalidKind");
    const tier = bestAvailablePotionTier(state.player, kind);
    if (!tier) return fail(state, "noPotionsLeft");
    const reported = {
      ...state.player,
      hp: Number.isFinite(hp) ? Math.max(0, Math.min(playerMaxHp(state.player), hp)) : state.player.hp,
      mp: Number.isFinite(mp) ? Math.max(0, Math.min(playerMaxMp(state.player), mp)) : state.player.mp
    };
    const used = usePotion(reported, kind, tier);
    if (used.reason) return fail(state, used.reason);
    return done({ ...state, player: used.player }, { healed: used.healed, tier });
  },
  "map/teleport"(state, { mapId }) {
    const idx = MAPS.findIndex((m) => m.id === mapId);
    if (idx < 0) return fail(state, "unknownMap");
    const target = MAPS[idx];
    const { player } = state;
    if (player.level < target.levelMin) return fail(state, "locked");
    if (!isMapProgressUnlocked(player, idx, MAPS)) return fail(state, "mapProgressLocked");
    if (target.id === player.currentMapId) return fail(state, "sameMap");
    if (player.gold < GATE_TELEPORT_COST) return fail(state, "notEnoughGold", { cost: GATE_TELEPORT_COST });
    return done({ ...state, player: { ...clearFight(player), gold: player.gold - GATE_TELEPORT_COST, currentMapId: target.id } }, { cost: GATE_TELEPORT_COST });
  },
  "battle/dungeonEntry"(state) {
    const map = currentMap(state.player);
    if (!map) return fail(state, "locked");
    const check = canEnterSoloDungeon(state.player);
    if (!check.ok) return fail(state, "entriesExhausted");
    const player = { ...consumeDungeonEntry(state.player), fight: null, dungeonRun: { mapId: map.id, stage: 0 } };
    return done({ ...state, player });
  }
};

// src/utils/warzoneCombat.js
init_define_import_meta_env();
function buildHuntMonster(template, powerMult) {
  const hp = Math.max(1, Math.round(template.hp * powerMult * 0.7));
  return { ...template, hp, maxHp: hp, atk: Math.max(1, Math.round(template.atk * powerMult * 0.55)), def: Math.max(0, Math.round(template.def * powerMult * 0.7)) };
}

// src/game/actions.js
init_define_import_meta_env();

// src/game/warzone.js
init_define_import_meta_env();
var CRIMSON_MAP = MAPS.find((m) => m.id === "crimson_battlefront");
var MIN_HUNT_SEARCH_MS = 4500;
var HUNT_PREFIX = "hunt:";
var fail2 = (state, reason, extra = {}) => ({ state, result: { ok: false, reason, ...extra } });
var done2 = (state, extra = {}) => ({ state, result: { ok: true, ...extra } });
var effectiveBoss = (boss) => {
  const override = getWarzoneBossConfig(boss.id);
  return override ? { ...boss, ...override } : boss;
};
function bossLoot(player, boss) {
  let np = { ...player, inventory: [...player.inventory], chests: [...player.chests] };
  const drops = [];
  const dropMult = wingMultiplier(player, "drop") * premiumDropMultiplier(player);
  const goldGain = Math.round(rand(boss.bonusGoldMin, boss.bonusGoldMax) * premiumGoldMultiplier(np));
  const goldBefore = np.gold;
  np.gold = clampGold(np.gold + goldGain);
  drops.push({ type: "gold", amount: np.gold - goldBefore });
  if (Math.random() < boss.equipDropChance * dropMult) {
    const item = Array.isArray(boss.loot) ? rollConfiguredLoot(boss.loot) : rollLoot(boss.lootTier);
    if (item) {
      const res = addItemToInventory(np, item);
      np = res.player;
      drops.push(res.added ? { type: "itemDropped", itemName: item.name } : { type: "itemDropFailed", itemName: item.name, reason: res.reason });
    }
  }
  if (Math.random() < boss.chestDropChance * dropMult) {
    np.chests.push({ id: uid(), tier: boss.lootTier });
    drops.push({ type: "chestDropped", tier: boss.lootTier });
  }
  if (Math.random() < boss.scrollDropChance * dropMult) {
    const res = addItemToInventory(np, makeScrollStack(boss.lootTier, 1));
    np = res.player;
    drops.push(res.added ? { type: "scrollDropped", tier: boss.lootTier } : { type: "scrollDropFailed", reason: res.reason });
  }
  np.hp = playerMaxHp(np);
  np.mp = playerMaxMp(np);
  return { player: np, drops };
}
var huntTemplate = (monsterId) => CRIMSON_MAP.monsters.find((m) => m.id === monsterId) || null;
var warzoneReducers = {
  "warzone/enter"(state) {
    const { player } = state;
    if (player.level < WARZONE_UNLOCK_LEVEL) return fail2(state, "locked");
    if (!(player.nationalPoint > 0)) return fail2(state, "npLocked");
    if (player.gold < WARZONE_TELEPORT_COST) return fail2(state, "notEnoughGold", { cost: WARZONE_TELEPORT_COST });
    return done2({ ...state, player: { ...player, gold: player.gold - WARZONE_TELEPORT_COST, warzone: { enteredAt: Date.now() } } }, { cost: WARZONE_TELEPORT_COST });
  },
  "warzone/leave"(state) {
    if (!state.player.warzone && !state.player.huntSearch) return done2(state);
    return done2({ ...state, player: { ...state.player, warzone: null, huntSearch: null, fight: null } });
  },
  // Hak, sunucuda `boss_loot_claims` satırıdır (bkz. server/game.mjs: boss kimliği oradan alınır,
  // satır aynı işlemde silinir). İstemci yalnızca eski (bayrak kapalı) yolda boss kimliğini söyler.
  "warzone/bossLoot"(state, { bossId }) {
    const boss = WARZONE_BOSSES.find((b) => b.id === bossId);
    if (!boss) return fail2(state, "unknownBoss");
    const result = bossLoot(state.player, effectiveBoss(boss));
    return done2({ ...state, player: result.player }, { drops: result.drops, tier: boss.lootTier });
  },
  "warzone/huntSearch"(state) {
    if (!state.player.warzone) return fail2(state, "notEntered");
    return done2({ ...state, player: { ...state.player, huntSearch: { startedAt: Date.now() }, fight: null } });
  },
  "warzone/huntStart"(state, { monsterId }) {
    const { player } = state;
    if (!player.warzone) return fail2(state, "notEntered");
    if (!huntTemplate(monsterId)) return fail2(state, "unknownMonster");
    if (!player.huntSearch || Date.now() - player.huntSearch.startedAt < MIN_HUNT_SEARCH_MS) return fail2(state, "searchTooShort");
    const seed = Math.floor(Math.random() * 4294967296) >>> 0 || 1;
    return done2({ ...state, player: { ...player, huntSearch: null, fight: { monsterId: HUNT_PREFIX + monsterId, startedAt: Date.now(), seed }, hp: playerMaxHp(player), mp: playerMaxMp(player) } }, { seed });
  },
  // Avı sunucuda baştan oynatır (bkz. game/fight.js, `battle/settle` ile aynı düzen): kazanma/ölme/geri çekilme,
  // ödül, aşınma ve harcanan potlar sunucunun hesabıdır.
  "warzone/huntSettle"(state, { monsterId, actions }) {
    const { player } = state;
    const template = huntTemplate(monsterId);
    if (!template) return fail2(state, "unknownMonster");
    const fight = player.fight;
    if (!player.warzone) return fail2(state, "notEntered");
    if (!fight || fight.monsterId !== HUNT_PREFIX + monsterId || !Number.isInteger(fight.seed)) return fail2(state, "noFight");
    const cfg = getWarzoneHuntConfig();
    const monster = buildHuntMonster(template, cfg.powerMult);
    const replay = replayFight(player, monster, CRIMSON_MAP.levelMax, fight.seed, actions);
    if (replay.error) return fail2(state, "invalidLog", { detail: replay.error });
    if (Date.now() - fight.startedAt < replay.fight.turn * MIN_TURN_MS - 1500) return fail2(state, "tooFast");
    const after = applyFightAftermath({ ...player, fight: null }, replay.fight);
    const outcome = replay.fight.ended || "retreat";
    if (outcome === "lose") {
      const penalty = applyDeathPenalty(clearFight(after));
      return done2({ ...state, player: penalty.player }, { outcome, xpLost: penalty.xpLost });
    }
    if (outcome === "retreat") return done2({ ...state, player: after }, { outcome });
    const reward = grantMonsterReward(after, template, CRIMSON_MAP, { goldMult: cfg.goldMult, dropMult: cfg.dropMult });
    return done2({ ...state, player: reward.player }, { outcome, drops: reward.drops, tone: reward.tone, levelUp: reward.levelUp });
  }
};

// src/game/progress.js
init_define_import_meta_env();

// src/utils/collection.js
init_define_import_meta_env();
var MAP_COLLECTIONS = MAPS.map((map) => ({
  id: `collection_${map.id}`,
  mapId: map.id,
  name: `${map.name} Canavar Kitab\u0131`,
  monsterIds: map.monsters.map((m) => m.id),
  goldReward: map.tier * 350,
  chestTier: map.tier
}));
function collectionProgress(player, collection) {
  const current = collection.monsterIds.filter((id) => (player.monsterKills?.[id] || 0) > 0).length;
  const claimed = (player.claimedCollections || []).includes(collection.id);
  return { current, target: collection.monsterIds.length, done: current === collection.monsterIds.length, claimed };
}
function claimCollection(player, id) {
  const collection = MAP_COLLECTIONS.find((c) => c.id === id);
  if (!collection) return { player, claimed: false, reason: "invalidCollection" };
  const progress = collectionProgress(player, collection);
  if (progress.claimed) return { player, claimed: false, reason: "rewardAlreadyClaimed" };
  if (!progress.done) return { player, claimed: false, reason: "mapNotFullyExplored" };
  return { player: { ...player, gold: player.gold + collection.goldReward, chests: [...player.chests, { id: uid(), tier: collection.chestTier }], claimedCollections: [...player.claimedCollections || [], id] }, claimed: true, collection };
}

// src/utils/nationalPoint.js
init_define_import_meta_env();

// src/utils/leaderboard.js
init_define_import_meta_env();
var WEEKLY_REWARDS = [7e3, 4e3, 2e3];
function leaderboardFor(race, cls, weekId, player, sortBy = "weeklyPoint") {
  if (player && player.race === race && player.class === cls) {
    return [{
      name: player.nickname || CLASSES[cls]?.name || "Sen",
      nationalPoint: player.nationalPoint || 0,
      weeklyPoint: player.weeklyPoint || 0,
      isPlayer: true,
      rank: 1
    }];
  }
  return [];
}

// src/utils/nationalPoint.js
var BASE_NATIONAL_POINT = 50;
function nationalPointGain(player) {
  return Math.round((BASE_NATIONAL_POINT + premiumNpBonus(player)) * boostMultiplier(player, "np"));
}
function awardNationalPoint(player) {
  const gain = nationalPointGain(player);
  return {
    player: { ...player, nationalPoint: player.nationalPoint + gain, weeklyPoint: player.weeklyPoint + gain },
    gain
  };
}
function penalizeNationalPoint(player) {
  const loss = Math.round(NP_LOSS_PENALTY * (1 - premiumNpLossReduction(player)));
  return {
    ...player,
    nationalPoint: Math.max(0, player.nationalPoint - loss),
    weeklyPoint: Math.max(0, player.weeklyPoint - loss)
  };
}
function buyNationalPoint(player) {
  if (player.nationalPoint > 0) return { player, bought: false, reason: "npStillAvailable" };
  if (player.gold < NP_RECOVERY_GOLD_COST) return { player, bought: false, reason: "notEnoughGold" };
  return {
    player: {
      ...player,
      gold: player.gold - NP_RECOVERY_GOLD_COST,
      nationalPoint: player.nationalPoint + NP_RECOVERY_NP_AMOUNT,
      weeklyPoint: player.weeklyPoint + NP_RECOVERY_NP_AMOUNT
    },
    bought: true
  };
}
function applyWeeklyRollover(player) {
  const nowWeek = currentWeekId();
  if (player.weekId === nowWeek) return { player, diamondsAwarded: 0, rank: null };
  const standings = leaderboardFor(player.race, player.class, player.weekId, player, "weeklyPoint");
  const own = standings.find((e) => e.isPlayer);
  const rank = own ? own.rank : null;
  const diamondsAwarded = rank && rank <= WEEKLY_REWARDS.length ? WEEKLY_REWARDS[rank - 1] : 0;
  return {
    player: {
      ...player,
      weeklyPoint: 0,
      weekId: nowWeek,
      ...diamondsAwarded > 0 ? { pendingWeeklyClaim: { weekId: player.weekId, rank } } : {}
    },
    diamondsAwarded,
    rank
  };
}

// src/utils/dailyLogin.js
init_define_import_meta_env();
function freshLogin() {
  return { streak: 0, lastClaimDay: null };
}
function nextStreakFor(login) {
  if (login.lastClaimDay === todayKey()) return login.streak;
  return login.lastClaimDay === yesterdayKey() ? login.streak + 1 : 1;
}
function cycleReward(streak) {
  return DAILY_LOGIN_REWARDS[(streak - 1) % DAILY_LOGIN_REWARDS.length];
}
function canClaimDailyLogin(player) {
  const login = player.dailyLogin || freshLogin();
  return login.lastClaimDay !== todayKey();
}
function claimDailyLogin(player, server = null) {
  if (!server && !canClaimDailyLogin(player)) return { player, claimed: false, reason: "dailyRewardAlreadyClaimed" };
  const login = player.dailyLogin || freshLogin();
  const streak = server ? server.streak : nextStreakFor(login);
  const reward = cycleReward(streak);
  let p = { ...player, gold: player.gold + reward.gold, diamonds: server ? server.diamonds : player.diamonds + reward.diamonds };
  if (reward.scrollCount > 0) {
    p = addItemToInventory(p, makeScrollStack(1, reward.scrollCount)).player;
  }
  if (reward.bonusScroll) {
    p = addItemToInventory(p, makeBonusScrollStack()).player;
  }
  if (reward.chestTier === "map") {
    const tier = highestUnlockedMap(p.level).tier;
    p = { ...p, chests: [...p.chests, { id: uid(), tier }] };
  }
  p = { ...p, dailyLogin: { streak, lastClaimDay: todayKey() } };
  return { player: p, claimed: true, reward, streak };
}

// src/utils/wheel.js
init_define_import_meta_env();

// src/utils/wings.js
init_define_import_meta_env();
function makeWings(wingId) {
  const wing = wingDefinition(wingId);
  if (!wing) return null;
  return {
    id: uid(),
    kind: "wings",
    slot: "wings",
    wingId,
    name: wing.name,
    tier: 5,
    weight: 0,
    upgradeLevel: 0,
    upgradeLocked: true,
    noTrade: true,
    attackPowerPct: 0.03,
    expBonus: 0.05,
    dropBonus: 0.05,
    statBonus: { str: 3, sta: 3, dex: 3, int: 3, mag: 3 }
  };
}
function buyWings(player, wingId) {
  const wing = wingDefinition(wingId);
  if (!wing) return { player, bought: false, reason: "invalidPackage" };
  if (player.diamonds < wing.price) return { player, bought: false, reason: "notEnoughDiamonds" };
  const result = addItemToInventory(player, makeWings(wingId));
  if (!result.added) return { player, bought: false, reason: result.reason };
  return { player: { ...result.player, diamonds: player.diamonds - wing.price }, bought: true };
}

// src/utils/wheel.js
var BOOST_OF = { boost_exp: "exp", boost_gold: "gold", boost_atk: "atk", boost_np: "np", boost_def: "def", boost_hp: "hp" };
function buildItem(player, prizeId) {
  if (prizeId === "scroll_upgrade") return makeScrollStack(highestUnlockedMap(player.level).tier, 1);
  if (prizeId === "scroll_bonus") return makeBonusScrollStack();
  if (prizeId === "scroll_accessory") return makeAccessoryScrollStack(1);
  if (BOOST_OF[prizeId]) return makeBoostScrollStack(BOOST_OF[prizeId], 1);
  if (prizeId === "wing") return makeWings(WINGS[Math.floor(Math.random() * WINGS.length)].id);
  return null;
}
function applyWheelPrize(player, bank, prizeId, spunAt) {
  const mark = (p) => ({ ...p, wheelAppliedAt: spunAt });
  if (prizeId === "mythic_1d" || prizeId === "apex_3d") return { player, bank, delivered: false };
  const item = buildItem(player, prizeId);
  if (!item) return { player, bank, delivered: false };
  const toBag = addItemToInventory(player, item);
  if (toBag.added) return { player: mark(toBag.player), bank, delivered: true, toBank: false };
  const toBank = addItemToAnyBankPage(item, bank);
  if (toBank.added) return { player: mark(player), bank: toBank.bank, delivered: true, toBank: true };
  return { player, bank, delivered: false };
}

// src/utils/scheduledEvents.js
init_define_import_meta_env();
var ISTANBUL_UTC_OFFSET_MS = 3 * 60 * 60 * 1e3;
function istanbulNow(now = Date.now()) {
  return new Date(now + ISTANBUL_UTC_OFFSET_MS);
}
function istanbulDateKey(now = Date.now()) {
  return istanbulNow(now).toISOString().slice(0, 10);
}
function scheduledStart(event, now = Date.now()) {
  const ist = istanbulNow(now);
  const istanbulLocalAsUtc = Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate(), event.hour, event.minute, 0, 0);
  return istanbulLocalAsUtc - ISTANBUL_UTC_OFFSET_MS;
}
function eventTotalTicks(event) {
  return Math.round(event.durationMinutes / event.tickIntervalMinutes);
}
function eventPhase(event, now = Date.now()) {
  const start = scheduledStart(event, now);
  const preOpenAt = start - event.preOpenMinutes * 6e4;
  const end = start + event.durationMinutes * 6e4;
  let phase;
  if (now < preOpenAt) phase = "upcoming";
  else if (now < start) phase = "preopen";
  else if (now < end) phase = "active";
  else phase = "ended";
  return { phase, start, end, preOpenAt };
}
function ticksElapsed(event, now = Date.now()) {
  const { phase, start } = eventPhase(event, now);
  const total = eventTotalTicks(event);
  if (phase === "upcoming" || phase === "preopen") return 0;
  if (phase === "ended") return total;
  return Math.min(total, Math.floor((now - start) / (event.tickIntervalMinutes * 6e4)));
}
function freshState(now) {
  return { day: istanbulDateKey(now), joined: false, ticksCredited: 0 };
}
function stateFor(player, event, now = Date.now()) {
  const s = player.scheduledEvents?.[event.id];
  return s && s.day === istanbulDateKey(now) ? s : freshState(now);
}
function canJoinScheduledEvent(player, event, now = Date.now()) {
  const { phase } = eventPhase(event, now);
  if (phase !== "preopen" && phase !== "active") return { ok: false, reason: "notOpen" };
  if (stateFor(player, event, now).joined) return { ok: false, reason: "alreadyJoined" };
  return { ok: true };
}
function joinScheduledEvent(player, event, now = Date.now()) {
  const check = canJoinScheduledEvent(player, event, now);
  if (!check.ok) return { player, joined: false, reason: check.reason };
  const next = { day: istanbulDateKey(now), joined: true, ticksCredited: ticksElapsed(event, now) };
  return { player: { ...player, scheduledEvents: { ...player.scheduledEvents, [event.id]: next } }, joined: true };
}
function creditScheduledEventTicks(player, event, now = Date.now()) {
  const s = stateFor(player, event, now);
  if (!s.joined) return null;
  const { phase } = eventPhase(event, now);
  if (phase !== "active" && phase !== "ended") return null;
  const elapsed = ticksElapsed(event, now);
  if (elapsed <= s.ticksCredited) return null;
  const newTicks = elapsed - s.ticksCredited;
  const pct = event.tickPercent * newTicks / 100;
  const xpAmount = player.level < MAX_LEVEL ? Math.round(xpToNext(player.level) * pct) : 0;
  const { player: gained, levelsGained } = gainXp(player, xpAmount);
  const next = { ...gained, scheduledEvents: { ...gained.scheduledEvents, [event.id]: { day: istanbulDateKey(now), joined: true, ticksCredited: elapsed } } };
  return { player: next, xpGain: xpAmount, newTicks, levelsGained };
}

// src/data/scheduledEvents.js
init_define_import_meta_env();
var SCHEDULED_EVENTS = [
  {
    id: "noon_exp_rush",
    name: "\xD6\u011Flen EXP Rush",
    color: "#D4AF6A",
    hour: 12,
    minute: 30,
    // günlük başlama saati (İSTANBUL saati)
    preOpenMinutes: 5,
    // etkinlik alanı bu kadar erken açılır (geri sayımla)
    durationMinutes: 10,
    tickIntervalMinutes: 2,
    // her tick'te tickPercent kadar XP
    tickPercent: 3
    // xpToNext(level)'in yüzdesi — 5 tick x %3 = toplam %15
  }
];

// src/utils/tutorial.js
init_define_import_meta_env();
var TUTORIAL_GIFT_GOLD = 200;
function grantTutorialGift(player) {
  if (player.tutorialGift) return { player, granted: false };
  const withGold = { ...player, gold: player.gold + TUTORIAL_GIFT_GOLD, tutorialGift: true };
  const result = addItemToInventory(withGold, makeScrollStack(1, 1));
  return { player: result.added ? result.player : withGold, granted: true, scrollAdded: result.added };
}
var TUTORIAL_SCROLL_PRICE = 100;

// src/game/progress.js
var fail3 = (state, reason, extra = {}) => ({ state, result: { ok: false, reason, ...extra } });
var done3 = (state, extra = {}) => ({ state, result: { ok: true, ...extra } });
function fromClaim(state, result, flag, extra = {}) {
  if (!result[flag]) return fail3(state, result.reason || "failed", result.reasonVars ? { reasonVars: result.reasonVars } : {});
  return done3({ ...state, player: result.player }, extra);
}
var findEvent = (eventId) => SCHEDULED_EVENTS.find((e) => e.id === eventId) || null;
var progressReducers = {
  "captain/quest"(state, { questId }) {
    const r = claimQuest(state.player, questId);
    return fromClaim(state, r, "claimed", { quest: r.quest });
  },
  "captain/awaken"(state) {
    return fromClaim(state, claimAwakening(state.player), "claimed");
  },
  "captain/daily"(state, { slotIndex }) {
    if (!Number.isInteger(slotIndex)) return fail3(state, "invalidQuest");
    const r = claimDailyQuest(state.player, slotIndex);
    return fromClaim(state, r, "claimed", { quest: r.quest });
  },
  "captain/weekly"(state, { id }) {
    const r = claimWeeklyQuest(state.player, id);
    return fromClaim(state, r, "claimed", { quest: r.quest });
  },
  "captain/book"(state, { id }) {
    const r = claimCollection(state.player, id);
    return fromClaim(state, r, "claimed", { collection: r.collection });
  },
  "captain/buyNp"(state) {
    return fromClaim(state, buyNationalPoint(state.player), "bought");
  },
  // Sunucu yolunda `server` alanı (seri, elmas bakiyesi) sunucunun kendi günlük kaydından gelir
  // (bkz. server/app.mjs kancası); istemcinin yazdığı yok sayılır.
  "dailyLogin/claim"(state, { server }) {
    if (!server || !Number.isInteger(server.streak) || server.streak < 1) return fail3(state, "noServerData");
    const r = claimDailyLogin(state.player, server);
    return fromClaim(state, r, "claimed", { reward: r.reward, streak: r.streak });
  },
  // Çark: ödül (prize/spunAt) sunucuda seçilmiş bekleyen kayıttır; sunucu yolunda kancadan gelir.
  "wheel/claimItem"(state, { prize, spunAt }) {
    const out = applyWheelPrize(state.player, state.bank, prize, spunAt);
    if (!out.delivered) return fail3(state, "bagFull");
    return done3({ ...state, player: out.player, bank: out.bank }, { prize, toBank: !!out.toBank });
  },
  "event/join"(state, { eventId }) {
    const event = findEvent(eventId);
    if (!event) return fail3(state, "unknownEvent");
    const r = joinScheduledEvent(state.player, event);
    return fromClaim(state, r, "joined");
  },
  "event/credit"(state, { eventId }) {
    const event = findEvent(eventId);
    if (!event) return fail3(state, "unknownEvent");
    const r = creditScheduledEventTicks(state.player, event);
    if (!r) return done3(state, { credited: false });
    return done3({ ...state, player: r.player }, { credited: true, xpGain: r.xpGain, newTicks: r.newTicks, levelsGained: r.levelsGained });
  },
  "tutorial/gift"(state) {
    return done3({ ...state, player: grantTutorialGift(state.player).player });
  },
  // Rehber, "parşömen al" adımında altın yetmezse takılmasın diye yalnızca rehber sürerken tamamlar.
  "tutorial/topUp"(state) {
    const { player } = state;
    if (player.tutorialSeen || player.gold >= TUTORIAL_SCROLL_PRICE) return done3(state);
    return done3({ ...state, player: { ...player, gold: TUTORIAL_SCROLL_PRICE } });
  }
};

// src/game/upgrade.js
init_define_import_meta_env();

// src/data/tiers.js
init_define_import_meta_env();
var GEAR_TIERS = [1, 2, 3, 4, 5, 6];

// src/utils/accessoryUpgrade.js
init_define_import_meta_env();
var ACCESSORY_UPGRADE_MAX_LEVEL = 3;
function accessoryUpgradeBlocked(sample) {
  if (sample.upgradeLocked) return { ok: false, reason: "accessoryUpgradeLocked" };
  if ((sample.upgradeLevel || 0) >= ACCESSORY_UPGRADE_MAX_LEVEL) {
    return { ok: false, reason: "accessoryMaxLevelLocked", reasonVars: { max: ACCESSORY_UPGRADE_MAX_LEVEL } };
  }
  return { ok: true };
}
function buildUpgradedAccessory(sample) {
  const level = sample.upgradeLevel || 0;
  return { ...applyLevelData(sample, level + 1), id: uid() };
}

// src/utils/achievements.js
init_define_import_meta_env();

// src/data/achievements.js
init_define_import_meta_env();
var ACHIEVEMENTS = [
  { id: "first_blood", name: "\u0130lk Kan", title: "\xC7\u0131rak", desc: "\u0130lk canavar\u0131n\u0131 \xF6ld\xFCr.", icon: Skull, color: "#9CA1B0", type: "kills", target: 1 },
  { id: "monster_nightmare", name: "Canavar K\xE2busu", title: "Canavar Avc\u0131s\u0131", desc: "Toplam 200 canavar \xF6ld\xFCr.", icon: Skull, color: "#C9425A", type: "kills", target: 200 },
  { id: "dungeon_wanderer", name: "Zindan Gezgini", title: "Zindan Gezgini", desc: "Frostburn Summit'e ula\u015F (Lv.25).", icon: Compass, color: "#6FD1E0", type: "level", target: 25 },
  { id: "abyss_lord", name: "U\xE7urumun Efendisi", title: "U\xE7urum Fatihi", desc: "Abyssal Pit'e ula\u015F (Lv.50).", icon: Mountain, color: "#A34FD9", type: "level", target: 50 },
  { id: "max_level", name: "Zirve", title: "Efsane", desc: "Maksimum seviyeye ula\u015F (Lv.65).", icon: Crown, color: "#D4AF6A", type: "level", target: 65 },
  { id: "awakened", name: "Uyan\u0131\u015F", title: "Uyanm\u0131\u015F", desc: "2. Uyan\u0131\u015F\u0131 tamamla.", icon: Sparkles, color: "#FF8C42", type: "awakened" },
  { id: "master_smith", name: "Usta Zanaatkar", title: "Usta Zanaatkar", desc: "Bir e\u015Fyay\u0131 +8'e y\xFCkselt.", icon: Hammer, color: "#8B6FC9", type: "flag", flag: "maxUpgradeReached" },
  { id: "clan_founder", name: "Klan Kurucusu", title: "Klan Kurucusu", desc: "Kendi klan\u0131n\u0131 kur.", icon: Shield, color: "#5FA8A0", type: "flag", flag: "hasFoundedClan" },
  { id: "warzone_hero", name: "Sava\u015F Alan\u0131 Kahraman\u0131", title: "Sava\u015F Alan\u0131 Kahraman\u0131", desc: "Sava\u015F Alan\u0131'nda 10 d\xFCello kazan.", icon: Swords, color: "#C9425A", type: "counter", counter: "duelsWon", target: 10 },
  { id: "treasure_hunter", name: "Hazine Avc\u0131s\u0131", title: "Hazine Avc\u0131s\u0131", desc: "25 sand\u0131k a\xE7.", icon: Gift, color: "#D4AF6A", type: "counter", counter: "chestsOpened", target: 25 },
  { id: "veteran_hunter", name: "Bin \u0130z", title: "Usta Avc\u0131", desc: "Toplam 1.000 canavar \xF6ld\xFCr.", icon: Skull, color: "#D4AF6A", type: "kills", target: 1e3 },
  { id: "endless_hunt", name: "Bitmeyen Av", title: "Yaban Efsanesi", desc: "Toplam 5.000 canavar \xF6ld\xFCr.", icon: Skull, color: "#D4AF6A", type: "kills", target: 5e3 },
  { id: "vault_keeper", name: "Mahzen Bek\xE7isi", title: "Hazine Muhaf\u0131z\u0131", desc: "100 sand\u0131k a\xE7.", icon: Gift, color: "#D4AF6A", type: "counter", target: 100, counter: "chestsOpened" },
  { id: "arena_veteran", name: "Meydan\u0131n Efendisi", title: "D\xFCello Ustas\u0131", desc: "Sava\u015F Alan\u0131nda 50 d\xFCello kazan.", icon: Swords, color: "#D4AF6A", type: "counter", target: 50, counter: "duelsWon" }
];

// src/utils/achievements.js
function totalKills(player) {
  return Object.values(player.monsterKills || {}).reduce((s, n) => s + n, 0);
}
function isAchievementUnlocked(player, ach) {
  switch (ach.type) {
    case "kills":
      return totalKills(player) >= ach.target;
    case "level":
      return player.level >= ach.target;
    case "awakened":
      return !!player.awakened;
    case "flag":
      return !!player.milestones?.[ach.flag];
    case "counter":
      return (player.milestones?.[ach.counter] || 0) >= ach.target;
    default:
      return false;
  }
}
function newlyUnlocked(prevPlayer, nextPlayer) {
  return ACHIEVEMENTS.filter((a) => !isAchievementUnlocked(prevPlayer, a) && isAchievementUnlocked(nextPlayer, a));
}
function setActiveTitle(player, achievementId) {
  if (achievementId === null) return { ...player, activeTitle: null };
  const ach = ACHIEVEMENTS.find((a) => a.id === achievementId);
  if (!ach || !isAchievementUnlocked(player, ach)) return player;
  return { ...player, activeTitle: achievementId };
}

// src/game/upgrade.js
var SCROLL_BOX_COUNT = 9;
var ACCESSORY_SLOT_COUNT = 3;
var ACCESSORY_SCROLL_PRICE = 5e4;
var fail4 = (state, reason, extra = {}) => ({ state, result: { ok: false, reason, ...extra } });
var done4 = (state, extra = {}) => ({ state, result: { ok: true, ...extra } });
var emptyForge = () => ({ item: null, boxes: Array(SCROLL_BOX_COUNT).fill(null), bonus: false });
var emptyAccForge = () => ({ slots: Array(ACCESSORY_SLOT_COUNT).fill(null), scroll: false });
var forgeOf = (player) => {
  const f = player.forge;
  return { item: f?.item || null, boxes: Array.from({ length: SCROLL_BOX_COUNT }, (_, i) => f?.boxes?.[i] || null), bonus: !!f?.bonus };
};
var accForgeOf = (player) => {
  const f = player.accForge;
  return { slots: Array.from({ length: ACCESSORY_SLOT_COUNT }, (_, i) => f?.slots?.[i] || null), scroll: !!f?.scroll };
};
function giveBackScroll(inventory, tier) {
  const existing = inventory.find((it) => it.kind === "scroll" && it.tier === tier);
  return existing ? inventory.map((it) => it.id === existing.id ? { ...it, count: it.count + 1 } : it) : [...inventory, makeScrollStack(tier, 1)];
}
function takeScroll(inventory, matches) {
  const stack = inventory.find(matches);
  if (!stack || stack.count <= 0) return null;
  return stack.count - 1 <= 0 ? inventory.filter((it) => it.id !== stack.id) : inventory.map((it) => it.id === stack.id ? { ...it, count: it.count - 1 } : it);
}
function returnAllForge(player) {
  const f = forgeOf(player);
  let inventory = [...player.inventory];
  if (f.item) inventory.push(f.item);
  f.boxes.forEach((box) => {
    if (box) inventory = giveBackScroll(inventory, box.tier);
  });
  if (f.bonus) inventory.push(makeBonusScrollStack());
  return { ...player, inventory, forge: emptyForge() };
}
function returnAllAccForge(player) {
  const f = accForgeOf(player);
  let inventory = [...player.inventory];
  f.slots.forEach((it) => {
    if (it) inventory.push(it);
  });
  if (f.scroll) {
    const existing = inventory.find((it) => it.kind === "accessoryScroll");
    inventory = existing ? inventory.map((it) => it.id === existing.id ? { ...it, count: it.count + 1 } : it) : [...inventory, makeAccessoryScrollStack(1)];
  }
  return { ...player, inventory, accForge: emptyAccForge() };
}
var upgradeReducers = {
  "shop/buyScroll"(state, { tier }) {
    if (!GEAR_TIERS.includes(tier)) return fail4(state, "invalidTier");
    const price = scrollPrice(tier);
    if (state.player.gold < price) return fail4(state, "notEnoughGold");
    const result = addItemToInventory({ ...state.player, gold: state.player.gold - price }, makeScrollStack(tier, 1));
    if (!result.added) return fail4(state, "purchaseFailed", { detail: result.reason });
    return done4({ ...state, player: result.player });
  },
  "shop/buyAccessoryScroll"(state) {
    if (state.player.gold < ACCESSORY_SCROLL_PRICE) return fail4(state, "notEnoughGold");
    const result = addItemToInventory({ ...state.player, gold: state.player.gold - ACCESSORY_SCROLL_PRICE }, makeAccessoryScrollStack(1));
    if (!result.added) return fail4(state, "purchaseFailed", { detail: result.reason });
    return done4({ ...state, player: result.player });
  },
  // ---- Silah/zırh forge'u
  "forge/stageItem"(state, { itemId }) {
    const { player } = state;
    const item = player.inventory.find((i) => i.id === itemId);
    if (!item || item.kind !== "weapon" && item.kind !== "armor") return fail4(state, "itemNotFound");
    if (item.noTrade) return fail4(state, "itemNoTrade");
    const f = forgeOf(player);
    let inventory = player.inventory.filter((i) => i.id !== itemId);
    if (f.item) inventory = [...inventory, f.item];
    return done4({ ...state, player: { ...player, inventory, forge: { ...f, item } } });
  },
  "forge/returnItem"(state) {
    const { player } = state;
    const f = forgeOf(player);
    if (!f.item) return done4(state);
    return done4({ ...state, player: { ...player, inventory: [...player.inventory, f.item], forge: { ...f, item: null } } });
  },
  "forge/stageScroll"(state, { tier }) {
    const { player } = state;
    const f = forgeOf(player);
    const emptyIndex = f.boxes.findIndex((b) => b === null);
    if (emptyIndex === -1) return fail4(state, "boxesFull");
    const inventory = takeScroll(player.inventory, (it) => it.kind === "scroll" && it.tier === tier);
    if (!inventory) return fail4(state, "scrollNotFound");
    const boxes = f.boxes.map((b, i) => i === emptyIndex ? { tier } : b);
    return done4({ ...state, player: { ...player, inventory, forge: { ...f, boxes } } });
  },
  "forge/returnScroll"(state, { box }) {
    const { player } = state;
    const f = forgeOf(player);
    if (!Number.isInteger(box) || !f.boxes[box]) return done4(state);
    return done4({ ...state, player: { ...player, inventory: giveBackScroll(player.inventory, f.boxes[box].tier), forge: { ...f, boxes: f.boxes.map((b, i) => i === box ? null : b) } } });
  },
  "forge/stageBonus"(state, { itemId }) {
    const { player } = state;
    const f = forgeOf(player);
    if (f.bonus) return fail4(state, "bonusFull");
    const item = player.inventory.find((i) => i.id === itemId && i.kind === "bonusScroll");
    if (!item) return fail4(state, "itemNotFound");
    return done4({ ...state, player: { ...player, inventory: player.inventory.filter((i) => i.id !== itemId), forge: { ...f, bonus: true } } });
  },
  "forge/returnBonus"(state) {
    const { player } = state;
    const f = forgeOf(player);
    if (!f.bonus) return done4(state);
    return done4({ ...state, player: { ...player, inventory: [...player.inventory, makeBonusScrollStack()], forge: { ...f, bonus: false } } });
  },
  "forge/clear"(state) {
    const f = forgeOf(state.player);
    if (!f.item && !f.bonus && f.boxes.every((b) => !b)) return done4(state);
    return done4({ ...state, player: returnAllForge(state.player) });
  },
  // Yükseltme: forge'daki eşya + tam bir eşleşen parşömen. Zar sunucuda atılır; başarısızlıkta
  // eşya yok olur (oyunun mevcut kuralı), başarıda aynı kimlikle +1 seviye olarak çantaya döner.
  "forge/press"(state) {
    const { player } = state;
    const f = forgeOf(player);
    const entry = f.item;
    if (!entry) return fail4(state, "noItem");
    const currentLevel = entry.upgradeLevel || 0;
    if (currentLevel >= MAX_UPGRADE_LEVEL) return fail4(state, "alreadyMaxLevel");
    const matching = f.boxes.map((b, i) => b && b.tier === entry.tier ? i : -1).filter((i) => i >= 0);
    if (matching.length === 0) return fail4(state, "noScrollForTier");
    if (matching.length >= 2) return fail4(state, "onlyOneScrollAllowed");
    const success = Math.random() < upgradeSuccessChance(currentLevel, f.bonus);
    const cleared = { item: null, boxes: f.boxes.map((b, i) => i === matching[0] ? null : b), bonus: false };
    if (!success) return done4({ ...state, player: { ...player, forge: cleared } }, { success: false, item: entry });
    const bumped = entry.levels ? applyLevelData(entry, currentLevel + 1) : { ...entry, upgradeLevel: currentLevel + 1, ...bumpedStats(entry) };
    const next = {
      ...player,
      forge: cleared,
      inventory: [...player.inventory, bumped],
      milestones: bumped.upgradeLevel >= MAX_UPGRADE_LEVEL ? { ...player.milestones, maxUpgradeReached: true } : player.milestones
    };
    return done4({ ...state, player: next }, { success: true, item: entry, bumpedItem: bumped, unlocked: newlyUnlocked(player, next).map((a) => a.id) });
  },
  // ---- Takı forge'u (3 aynı takı + 1 Aksesuar Kağıdı → bir üst seviye, başarısızlık yok)
  "accessory/stageItem"(state, { itemId }) {
    const { player } = state;
    const item = player.inventory.find((i) => i.id === itemId && i.kind === "accessory");
    if (!item) return fail4(state, "itemNotFound");
    const blocked = accessoryUpgradeBlocked(item);
    if (!blocked.ok) return fail4(state, blocked.reason, blocked.reasonVars ? { reasonVars: blocked.reasonVars } : {});
    const f = accForgeOf(player);
    const first = f.slots.find(Boolean);
    if (first && (first.name !== item.name || (first.upgradeLevel || 0) !== (item.upgradeLevel || 0))) return fail4(state, "mustMatch");
    const emptyIndex = f.slots.findIndex((s) => s === null);
    if (emptyIndex === -1) return fail4(state, "slotsFull");
    return done4({ ...state, player: { ...player, inventory: player.inventory.filter((i) => i.id !== itemId), accForge: { ...f, slots: f.slots.map((s, i) => i === emptyIndex ? item : s) } } });
  },
  "accessory/returnItem"(state, { slot }) {
    const { player } = state;
    const f = accForgeOf(player);
    if (!Number.isInteger(slot) || !f.slots[slot]) return done4(state);
    return done4({ ...state, player: { ...player, inventory: [...player.inventory, f.slots[slot]], accForge: { ...f, slots: f.slots.map((s, i) => i === slot ? null : s) } } });
  },
  "accessory/stageScroll"(state) {
    const { player } = state;
    const f = accForgeOf(player);
    if (f.scroll) return fail4(state, "scrollSlotFull");
    const inventory = takeScroll(player.inventory, (it) => it.kind === "accessoryScroll");
    if (!inventory) return fail4(state, "scrollNotFound");
    return done4({ ...state, player: { ...player, inventory, accForge: { ...f, scroll: true } } });
  },
  "accessory/returnScroll"(state) {
    const { player } = state;
    const f = accForgeOf(player);
    if (!f.scroll) return done4(state);
    const existing = player.inventory.find((it) => it.kind === "accessoryScroll");
    const inventory = existing ? player.inventory.map((it) => it.id === existing.id ? { ...it, count: it.count + 1 } : it) : [...player.inventory, makeAccessoryScrollStack(1)];
    return done4({ ...state, player: { ...player, inventory, accForge: { ...f, scroll: false } } });
  },
  "accessory/clear"(state) {
    const f = accForgeOf(state.player);
    if (!f.scroll && f.slots.every((s) => !s)) return done4(state);
    return done4({ ...state, player: returnAllAccForge(state.player) });
  },
  "accessory/press"(state) {
    const { player } = state;
    const f = accForgeOf(player);
    if (!f.slots.every(Boolean) || !f.scroll) return fail4(state, "notReady");
    const sample = f.slots[0];
    const upgraded = buildUpgradedAccessory(sample);
    return done4({ ...state, player: { ...player, inventory: [...player.inventory, upgraded], accForge: emptyAccForge() } }, { item: sample, bumpedItem: upgraded });
  }
};

// src/game/market.js
init_define_import_meta_env();

// src/data/market.js
init_define_import_meta_env();
var MARKET_DURATIONS_HOURS = [1, 3, 6, 12, 24];
var MARKET_DURATION_FEE = { 1: 25, 3: 60, 6: 100, 12: 170, 24: 250 };
var MARKET_MAX_PRICE = 999999999;

// src/game/market.js
var fail5 = (state, reason, extra = {}) => ({ state, result: { ok: false, reason, ...extra } });
var done5 = (state, extra = {}) => ({ state, result: { ok: true, ...extra } });
var LISTABLE_KINDS = ["armor", "weapon", "accessory", "clanMaterial"];
var marketReducers = {
  "shop/buyPotion"(state, { potionType, tier, qty }) {
    if (potionType !== "hp" && potionType !== "mp") return fail5(state, "invalidPotion");
    const tiers = potionType === "hp" ? HP_POTION_TIERS : MP_POTION_TIERS;
    if (!Number.isInteger(tier) || tier < 1 || tier > tiers.length) return fail5(state, "invalidPotion");
    if (!Number.isInteger(qty) || qty < 1 || qty > 999) return fail5(state, "invalidAmount");
    const price = potionPrice(potionType, tier) * qty;
    if (state.player.gold < price) return fail5(state, "notEnoughGold");
    const result = addItemToInventory({ ...state.player, gold: state.player.gold - price }, makePotionStack(potionType, tier, qty));
    if (!result.added) return fail5(state, "purchaseFailed", { detail: result.reason, reasonVars: result.reasonVars });
    return done5({ ...state, player: result.player }, { price });
  },
  // Tezgah kaydını (süre, satıcı adı) sunucu kancası yazar; ücret burada altından düşer.
  "market/openStall"(state, { durationHours }) {
    if (!MARKET_DURATIONS_HOURS.includes(durationHours)) return fail5(state, "stallOpenFailed");
    const fee = MARKET_DURATION_FEE[durationHours];
    if (state.player.gold < fee) return fail5(state, "notEnoughForStallFee", { reasonVars: { fee } });
    return done5({ ...state, player: { ...state.player, gold: state.player.gold - fee } }, { fee });
  },
  "market/addItem"(state, { itemId, price, asChest }) {
    if (!Number.isSafeInteger(price) || price <= 0 || price > MARKET_MAX_PRICE) return fail5(state, "addFailed");
    const { player } = state;
    if (asChest) {
      const chest = player.chests.find((c) => c.id === itemId);
      if (!chest) return fail5(state, "itemNotFound");
      return done5({ ...state, player: { ...player, chests: player.chests.filter((c) => c.id !== itemId) } }, { item: { id: chest.id, kind: "chest", tier: chest.tier, special: chest.special } });
    }
    const item = player.inventory.find((i) => i.id === itemId);
    if (!item || !LISTABLE_KINDS.includes(item.kind)) return fail5(state, "itemNotFound");
    if (item.noTrade || isFirstPurchaseWeapon(item)) return fail5(state, "noTrade");
    return done5({ ...state, player: { ...player, inventory: player.inventory.filter((i) => i.id !== itemId) } }, { item });
  },
  // `listing` ({ id, item, price }) sunucu kancasından gelir: sunucudaki gerçek tezgah satırı.
  "market/buy"(state, { listing }) {
    if (!listing || !listing.item || !Number.isSafeInteger(listing.price)) return fail5(state, "marketItemGone");
    const { player } = state;
    if (player.gold < listing.price) return fail5(state, "notEnoughGold");
    const paid = { ...player, gold: player.gold - listing.price };
    if (listing.item.kind === "chest") {
      return done5({ ...state, player: { ...paid, chests: [...paid.chests, { id: listing.item.id, tier: listing.item.tier, special: listing.item.special }] } }, { item: listing.item, price: listing.price });
    }
    const added = addItemToInventory(paid, listing.item);
    if (!added.added) return fail5(state, "bagFull", { detail: added.reason });
    return done5({ ...state, player: added.player }, { item: listing.item, price: listing.price });
  },
  // Tezgahtan geri alma (erken kapat / süresi dolmuş): sığanlar sandıklara/depoya gider, sığmayanlar
  // tezgahta kalır. `entries` sunucu kancasından gelir (yalnızca bu hesabın kendi tezgah satırları).
  "market/takeBack"(state, { entries }) {
    if (!Array.isArray(entries)) return fail5(state, "invalidPayload");
    let player = state.player;
    let bank = state.bank;
    const placedIds = [];
    let placedChests = 0;
    let placedItems = 0;
    for (const entry of entries) {
      if (entry.item.kind === "chest") {
        player = { ...player, chests: [...player.chests, { id: entry.item.id, tier: entry.item.tier, special: entry.item.special }] };
        placedChests++;
        placedIds.push(entry.id);
        continue;
      }
      const placed = addItemToAnyBankPage(entry.item, bank);
      if (placed.added) {
        bank = placed.bank;
        placedItems++;
        placedIds.push(entry.id);
      }
    }
    return done5({ ...state, player, bank }, { placedIds, placedChests, placedItems, left: entries.length - placedIds.length });
  }
};

// src/game/clan.js
init_define_import_meta_env();
var fail6 = (state, reason, extra = {}) => ({ state, result: { ok: false, reason, ...extra } });
var done6 = (state, extra = {}) => ({ state, result: { ok: true, ...extra } });
var NP_REFUND_RATE = 0.35;
var clanReducers = {
  "clan/donate"(state, { currency, amount }) {
    if (!Number.isSafeInteger(amount) || amount <= 0) return fail6(state, "enterValidAmount");
    const { player } = state;
    if (currency === "np") {
      if (player.nationalPoint < amount) return fail6(state, "notEnoughNP");
      return done6({ ...state, player: { ...player, nationalPoint: player.nationalPoint - amount } });
    }
    if (currency === "gold") {
      if (player.gold < amount) return fail6(state, "notEnoughGold");
      return done6({ ...state, player: { ...player, gold: player.gold - amount } });
    }
    if (Object.hasOwn(CLAN_DUNGEON_MATERIALS, currency)) {
      const stack = player.inventory.find((it) => it.kind === "clanMaterial" && it.materialKey === currency);
      if (!stack || (stack.count || 0) < amount) return fail6(state, "toastDonateFailed");
      const inventory = player.inventory.map((it) => it.id === stack.id ? { ...it, count: it.count - amount } : it).filter((it) => it.id !== stack.id || it.count > 0);
      return done6({ ...state, player: { ...player, inventory } });
    }
    return fail6(state, "invalidDonation");
  },
  // Üyelik kaydını silen sunucu kancası `donatedNp` değerini (gerçek bağış toplamı) verir.
  "clan/leave"(state, { donatedNp }) {
    const refund = Math.round((Number.isSafeInteger(donatedNp) && donatedNp > 0 ? donatedNp : 0) * NP_REFUND_RATE);
    return done6({ ...state, player: { ...state.player, clan: null, nationalPoint: state.player.nationalPoint + refund } }, { refund });
  },
  // Klan zindanında sunucunun düşürdüğü malzemeler (`pending_grants`). Sığmayanlar sırada bekler.
  "clan/claimMaterials"(state, { materials }) {
    if (!Array.isArray(materials)) return fail6(state, "invalidPayload");
    let player = state.player;
    let placed = 0;
    for (const key of materials) {
      if (!Object.hasOwn(CLAN_DUNGEON_MATERIALS, key)) break;
      const added = addItemToInventory(player, makeClanMaterialStack(key, 1));
      if (!added.added) break;
      player = added.player;
      placed++;
    }
    return done6({ ...state, player }, { placed, keys: materials.slice(0, placed), waiting: materials.length - placed });
  }
};

// src/game/diamonds.js
init_define_import_meta_env();
var fail7 = (state, reason, extra = {}) => ({ state, result: { ok: false, reason, ...extra } });
var done7 = (state, extra = {}) => ({ state, result: { ok: true, ...extra } });
var DELIVERED_KINDS = ["premium", "wings", "bonusScroll", "raceScroll", "jobScroll", "dungeonEntry", "bankPage", "boostPack"];
var isDeliveredDiamondKind = (kind) => DELIVERED_KINDS.includes(kind);
var diamondReducers = {
  "diamond/buy"(state, { kind, key, diamonds, price }) {
    if (!Number.isSafeInteger(diamonds) || !Number.isSafeInteger(price)) return fail7(state, "noServerData");
    if (!isDeliveredDiamondKind(kind)) return fail7(state, "invalidPurchase");
    const player = { ...state.player, diamonds: diamonds + price };
    const grantScroll = (stack) => {
      const added = addItemToInventory({ ...player, diamonds }, stack);
      return added.added ? done7({ ...state, player: added.player }) : fail7(state, "purchaseFailed", { detail: added.reason });
    };
    switch (kind) {
      case "premium": {
        const r = buyPremium(player, key, state.bank);
        return r.bought ? done7({ ...state, player: r.player, bank: r.bank }) : fail7(state, r.reason || "purchaseFailed");
      }
      case "wings": {
        const r = buyWings(player, key);
        return r.bought ? done7({ ...state, player: r.player }) : fail7(state, r.reason || "purchaseFailed");
      }
      case "bonusScroll":
        return grantScroll(makeBonusScrollStack());
      case "raceScroll":
        return grantScroll(makeRaceScroll(1));
      case "jobScroll":
        return grantScroll(makeJobScroll(1));
      case "dungeonEntry": {
        const r = buyExtraDungeonEntries(player);
        return r.bought ? done7({ ...state, player: r.player }) : fail7(state, r.reason || "purchaseFailed");
      }
      case "bankPage": {
        const r = buyExtraBankPage(player, state.bank);
        return r.bought ? done7({ ...state, player: r.player, bank: r.bank }) : fail7(state, r.reason || "purchaseFailed");
      }
      case "boostPack": {
        const r = buyBoostScrollPack(player, key);
        return r.bought ? done7({ ...state, player: r.player }) : fail7(state, r.reason || "purchaseFailed");
      }
      default:
        return fail7(state, "invalidPurchase");
    }
  }
};

// src/game/character.js
init_define_import_meta_env();

// src/data/races.js
init_define_import_meta_env();
var RACES = {
  karus: {
    name: "Ork",
    icon: Flame,
    color: "#C9425A",
    desc: "Sava\u015F\xE7\u0131 ruhlu, disiplinli bir ordu milleti. K\u0131z\u0131l bayrak alt\u0131nda birle\u015Fir."
  },
  elmorad: {
    name: "\u0130nsan",
    icon: Moon,
    color: "#4FC3D9",
    desc: "Zarif, stratejik d\xFC\u015F\xFCnen bir bilgelik milleti. G\xFCm\xFC\u015F ay alt\u0131nda y\xFCr\xFCr."
  }
};

// src/game/character.js
var fail8 = (state, reason, extra = {}) => ({ state, result: { ok: false, reason, ...extra } });
var done8 = (state, extra = {}) => ({ state, result: { ok: true, ...extra } });
var MAX_ALLOCATE_PER_CALL = 200;
var keyT = (key, vars) => JSON.stringify({ key, vars: vars || {} });
var characterReducers = {
  // Basılı tutunca hızlı dağıtım tek istekte yığınlanır: count kadar tekrar, sınırlarda kendiliğinden durur.
  "stat/allocate"(state, { stat, count = 1 }) {
    if (typeof stat !== "string" || !Object.hasOwn(state.player.stats, stat)) return fail8(state, "invalidStat");
    if (!Number.isInteger(count) || count < 1 || count > MAX_ALLOCATE_PER_CALL) return fail8(state, "invalidAmount");
    let player = state.player;
    let applied = 0;
    for (let i = 0; i < count; i++) {
      const next = allocateStat(player, stat);
      if (next === player) break;
      player = next;
      applied++;
    }
    if (applied === 0) return fail8(state, player.statPoints <= 0 ? "noStatPoints" : "statCap", { cap: STAT_CAP });
    return done8({ ...state, player }, { applied });
  },
  "stat/respec"(state) {
    const r = respecStats(state.player);
    if (!r.reset) return fail8(state, r.reason, r.reasonVars ? { reasonVars: r.reasonVars } : {});
    return done8({ ...state, player: r.player }, { statPoints: r.player.statPoints, cost: r.cost });
  },
  "skill/learn"(state, { skillId }) {
    const r = unlockSkill(state.player, skillId, keyT, "tr");
    if (!r.unlocked) return fail8(state, "skillLocked", { detail: r.reason });
    return done8({ ...state, player: r.player });
  },
  "skill/loadout"(state, { slot, skillId }) {
    const { player } = state;
    const known = player.skills?.known || [];
    if (!Number.isInteger(slot) || slot < 0 || slot >= (player.skills?.loadout?.length ?? 5)) return fail8(state, "invalidSlot");
    if (skillId !== null && !known.includes(skillId)) return fail8(state, "skillNotKnown");
    return done8({ ...state, player: setLoadoutSlot(player, slot, skillId) });
  },
  // Meslek parşömeni: üstte eşya olmamalı, klanda olunmamalı; beceriler yeni sınıfa göre sıfırlanır.
  "scroll/job"(state, { itemId, newClass }) {
    const { player } = state;
    const item = player.inventory.find((i) => i.id === itemId && i.kind === "jobScroll");
    if (!item) return fail8(state, "itemNotFound");
    if (typeof newClass !== "string" || !Object.hasOwn(CLASSES, newClass)) return fail8(state, "invalidClass");
    const check = canChangeJob(player);
    if (!check.ok) return fail8(state, check.reason);
    const inventory = (item.count || 1) <= 1 ? player.inventory.filter((i) => i.id !== itemId) : player.inventory.map((i) => i.id === itemId ? { ...i, count: i.count - 1 } : i);
    return done8({ ...state, player: learnFreeSkills(changeJob({ ...player, inventory }, newClass)) });
  },
  // Irk hesap genelindedir: sunucu, hesaptaki bütün karakterlerin ırkını aynı işlemde günceller (`setRace`).
  "scroll/race"(state, { itemId, race }) {
    const { player } = state;
    const item = player.inventory.find((i) => i.id === itemId && i.kind === "raceScroll");
    if (!item) return fail8(state, "itemNotFound");
    if (typeof race !== "string" || !Object.hasOwn(RACES, race)) return fail8(state, "invalidRace");
    if (player.clan) return fail8(state, "clanBlocksRaceChange");
    const inventory = (item.count || 1) <= 1 ? player.inventory.filter((i) => i.id !== itemId) : player.inventory.map((i) => i.id === itemId ? { ...i, count: i.count - 1 } : i);
    return done8({ ...state, player: { ...player, inventory, race } }, { setRace: race });
  },
  "title/set"(state, { achievementId }) {
    return done8({ ...state, player: setActiveTitle(state.player, achievementId ?? null) });
  }
};

// src/game/gm.js
init_define_import_meta_env();

// src/utils/gmCommands.js
init_define_import_meta_env();
function clampTier(value, max = 5) {
  const t = parseInt(value, 10);
  if (!Number.isFinite(t)) return 1;
  return Math.min(max, Math.max(1, t));
}
function grant(player, item, bank) {
  if (!item) return { player, bank, resultText: "Bu kombinasyon i\xE7in hen\xFCz e\u015Fya yok." };
  const result = addItemToInventory(player, item);
  return {
    player: result.player,
    bank,
    resultText: result.added ? `${item.name} verildi.` : `${item.name} verilemedi \u2014 ${result.reason}`
  };
}
var HELP_TEXT = "Komutlar: /alt\u0131n [miktar], /elmas [miktar], /z\u0131rh [tier] [s\u0131n\u0131f], /silah [tier], /aksesuar [tier], /par\u015F\xF6men [tier], /bonus [adet], /premium [mythic|apex], /iksir [hp|mp] [adet] [tier], /sand\u0131k [tier(1-6)|\xF6zel], /sand\u0131klar [tier ba\u015F\u0131na adet] (her tier'dan + \xF6zel, toplu test i\xE7in), /skill [id], /uyan, /seviye [1-65], /np [miktar], /expevent [saat] [y\xFCzde], /yard\u0131m";
function executeGmCommand(player, cmd, args, bank) {
  switch (cmd) {
    case "altin":
    case "alt\u0131n": {
      const amount = Math.max(1, parseInt(args[0], 10) || 100);
      if (player.gold >= MAX_GOLD) return { player, bank, resultText: `Zaten tavanda (${formatGold(MAX_GOLD)} alt\u0131n) \u2014 daha fazlas\u0131 eklenemez.` };
      const nextGold = clampGold(player.gold + amount);
      const actual = nextGold - player.gold;
      return {
        player: { ...player, gold: nextGold },
        bank,
        resultText: actual < amount ? `+${formatGold(actual)} alt\u0131n verildi (tavana ula\u015F\u0131ld\u0131, ${formatGold(MAX_GOLD)} alt\u0131n s\u0131n\u0131r\u0131 a\u015F\u0131lamaz).` : `+${formatGold(actual)} alt\u0131n verildi.`
      };
    }
    case "elmas": {
      const amount = Math.max(1, parseInt(args[0], 10) || 100);
      return { player, bank, resultText: `+${amount} elmas verildi.` };
    }
    case "zirh":
    case "z\u0131rh": {
      const tier = clampTier(args[0]);
      const forceClass = args[1] && CLASSES[args[1].toLowerCase()] ? args[1].toLowerCase() : void 0;
      return grant(player, rollArmor(tier, forceClass), bank);
    }
    case "silah": {
      const tier = clampTier(args[0], maxWeaponTier(player.class));
      return grant(player, rollWeapon(tier, player.class), bank);
    }
    case "aksesuar": {
      const tier = clampTier(args[0]);
      return grant(player, rollAccessory(tier), bank);
    }
    case "parsomen":
    case "par\u015F\xF6men": {
      const tier = clampTier(args[0]);
      return grant(player, makeScrollStack(tier, 1), bank);
    }
    case "bonus": {
      const count = Math.max(1, parseInt(args[0], 10) || 1);
      let cur = player;
      let lastText = "";
      for (let i = 0; i < count; i++) {
        const result = grant(cur, makeBonusScrollStack(), bank);
        cur = result.player;
        lastText = result.resultText;
      }
      return { player: cur, bank, resultText: count > 1 ? `Bonus Par\u015F\xF6men x${count} verildi.` : lastText };
    }
    case "premium": {
      const tierId = (args[0] || "").toLowerCase();
      if (!PREMIUM_TIERS[tierId]) return { player, bank, resultText: `Ge\xE7ersiz paket. /premium mythic ya da /premium apex.` };
      const result = buyPremium({ ...player, diamonds: 999999 }, tierId, bank);
      if (!result.bought) return { player, bank, resultText: result.reason };
      return { player: { ...result.player, diamonds: player.diamonds }, bank: result.bank, resultText: `${PREMIUM_TIERS[tierId].name} GM taraf\u0131ndan verildi.` };
    }
    case "iksir": {
      const type = (args[0] || "hp").toLowerCase() === "mp" ? "mp" : "hp";
      const count = Math.max(1, parseInt(args[1], 10) || 1);
      const tier = clampTier(args[2], potionTiersFor(type).length);
      return grant(player, makePotionStack(type, tier, count), bank);
    }
    case "sandik":
    case "sand\u0131k": {
      const arg = (args[0] || "").toLowerCase();
      if (arg === "ozel" || arg === "\xF6zel") {
        return {
          player: { ...player, chests: [...player.chests, { id: uid(), tier: 5, special: true }] },
          bank,
          resultText: "\xD6zel Etkinlik Sand\u0131\u011F\u0131 verildi."
        };
      }
      const tier = clampTier(args[0], 6);
      return { player: { ...player, chests: [...player.chests, { id: uid(), tier }] }, bank, resultText: `T${tier} Sand\u0131k verildi.` };
    }
    case "sandiklar":
    case "sand\u0131klar": {
      const perTier = Math.max(1, Math.min(50, parseInt(args[0], 10) || 5));
      const newChests = [];
      for (let tier = 1; tier <= 6; tier++) {
        for (let i = 0; i < perTier; i++) newChests.push({ id: uid(), tier });
      }
      newChests.push({ id: uid(), tier: 5, special: true });
      return {
        player: { ...player, chests: [...player.chests, ...newChests] },
        bank,
        resultText: `Her tier'dan (T1-T6) ${perTier} sand\u0131k + 1 \xF6zel sand\u0131k verildi (toplam ${newChests.length}).`
      };
    }
    case "skill": {
      const skillId = (args[0] || "").toLowerCase();
      const skill = classSkills(player.class).find((s) => s.id === skillId);
      if (!skill) return { player, bank, resultText: `Ge\xE7ersiz beceri id. Bu s\u0131n\u0131f\u0131n id'leri: ${classSkills(player.class).map((s) => s.id).join(", ")}` };
      if (isKnown(player, skillId)) return { player, bank, resultText: "Zaten \xF6\u011Frenilmi\u015F." };
      return {
        player: { ...player, skills: { ...player.skills, known: [...player.skills.known, skillId] } },
        bank,
        resultText: `${skill.name} GM taraf\u0131ndan \xF6\u011Fretildi.`
      };
    }
    case "uyan": {
      const maxedKills = Object.fromEntries(Object.keys(AWAKENING_QUEST.targets).map((id) => [id, 999]));
      const result = claimAwakening({ ...player, level: Math.max(player.level, AWAKENING_QUEST.requiredLevel), monsterKills: { ...player.monsterKills, ...maxedKills } });
      if (!result.claimed) return { player, bank, resultText: result.reason };
      return { player: { ...player, awakened: result.player.awakened }, bank, resultText: "2. Uyan\u0131\u015F GM taraf\u0131ndan verildi." };
    }
    case "seviye": {
      const target = Math.min(MAX_LEVEL, Math.max(1, parseInt(args[0], 10) || 1));
      const levelsGained = Math.max(0, target - player.level);
      let next = learnFreeSkills({ ...player, level: target, xp: 0, statPoints: player.statPoints + levelsGained * 3 });
      next.hp = playerMaxHp(next);
      next.mp = playerMaxMp(next);
      return { player: next, bank, resultText: `Seviye ${target} olarak ayarland\u0131. (+${levelsGained * 3} stat\xFC puan\u0131, sonraki seviyeye ${xpToNext(target)} XP gerekiyor.)` };
    }
    case "expevent": {
      const hours = Math.max(0.1, parseFloat(args[0]) || 1);
      const pct = Math.max(1, parseFloat(args[1]) || 100);
      const mult = 1 + pct / 100;
      const expiresAt = Date.now() + hours * 60 * 60 * 1e3;
      return {
        player: { ...player, eventExpBonus: { mult, expiresAt } },
        bank,
        resultText: `%${pct} EXP bonusu ${hours} saatli\u011Fine a\xE7\u0131ld\u0131.`
      };
    }
    case "np": {
      const amount = Math.max(1, parseInt(args[0], 10) || 50);
      return {
        player: { ...player, nationalPoint: player.nationalPoint + amount, weeklyPoint: player.weeklyPoint + amount },
        bank,
        resultText: `+${amount} National Point (ve Weekly Point) verildi.`
      };
    }
    case "yardim":
    case "yard\u0131m":
      return { player, bank, resultText: HELP_TEXT };
    default:
      return { player, bank, resultText: `Bilinmeyen komut: /${cmd}. /yard\u0131m yaz.` };
  }
}

// src/game/gm.js
var fail9 = (state, reason, extra = {}) => ({ state, result: { ok: false, reason, ...extra } });
var done9 = (state, extra = {}) => ({ state, result: { ok: true, ...extra } });
var gmReducers = {
  "gm/exec"(state, { cmd, args }) {
    if (typeof cmd !== "string" || !Array.isArray(args) || args.some((a) => typeof a !== "string")) return fail9(state, "invalidPayload");
    if (cmd === "elmas" || cmd === "premium") return fail9(state, "dedicatedRoute");
    const out = executeGmCommand(state.player, cmd, args.slice(0, 6), state.bank);
    return done9({ ...state, player: out.player, bank: out.bank ?? state.bank }, { resultText: out.resultText });
  },
  "gm/give"(state, { spec }) {
    if (!spec || typeof spec !== "object") return fail9(state, "invalidPayload");
    const level = Number.isInteger(spec.level) ? spec.level : 0;
    let item = null;
    if (spec.kind === "weapon") item = gmBuildWeaponById(spec.cls, spec.weaponId, level);
    else if (spec.kind === "armor") item = gmBuildArmor(spec.cls, spec.slot, spec.tier, level);
    else if (spec.kind === "accessory") item = gmBuildAccessory(spec.accSlot, spec.tier, level, spec.name ?? null);
    if (!item) return fail9(state, "noCombo");
    const added = addItemToInventory(state.player, item);
    return done9({ ...state, player: added.player }, { added: added.added, item, level, detail: added.reason });
  },
  "gm/clearInventory"(state) {
    return done9({ ...state, player: { ...state.player, inventory: [] } });
  },
  "gm/giveAllChests"(state, { perTier = 5 }) {
    const per = Math.max(1, Math.min(50, Number.isInteger(perTier) ? perTier : 5));
    const chests = [];
    for (let tier = 1; tier <= 6; tier++) for (let i = 0; i < per; i++) chests.push({ id: uid(), tier });
    chests.push({ id: uid(), tier: 5, special: true });
    return done9({ ...state, player: { ...state.player, chests: [...state.player.chests, ...chests] } }, { perTier: per });
  }
};

// src/game/duel.js
init_define_import_meta_env();

// src/utils/duelEngine.js
init_define_import_meta_env();

// src/utils/pvpBalance.js
init_define_import_meta_env();
var PVP_POWER_CURVE = { "warrior": [[1, 1], [15, 1], [25, 1], [40, 1], [50, 1], [60, 1], [65, 1]], "rogue": [[1, 1.024], [15, 1.024], [25, 1.022], [40, 1.121], [50, 1.027], [60, 1.137], [65, 1.307]], "mage": [[1, 0.698], [15, 0.698], [25, 0.677], [40, 0.842], [50, 0.79], [60, 0.894], [65, 0.993]] };
var PVP_UPGRADE_CURVE = { "warrior": {}, "rogue": { "15": [0.9794749999999999, 1, 1], "25": [1, 0.985, 1.019475], "40": [0.9439499999999998, 0.996216, 1.096108], "50": [1.131962, 1.04, 1.0555999999999999], "60": [1.033068, 1, 1.0244], "65": [0.8794079999999999, 0.92, 0.92] }, "mage": { "15": [0.9, 0.985, 1.2125], "25": [0.8865, 1, 1.2], "40": [0.9079200000000001, 1.0176399999999999, 1.32975], "50": [1.10968, 1.08, 1.1880000000000002], "60": [1.0120000000000002, 0.97, 1.1340000000000001], "65": [0.8627499999999999, 0.9888, 1.06575] } };
function pvpSkillPower(cls, level, plus = 5) {
  const points = PVP_POWER_CURVE[cls];
  const i = points.findIndex((p) => p[0] >= level);
  if (i <= 0) return points[i < 0 ? points.length - 1 : 0][1];
  const a = points[i - 1], b = points[i];
  const base = a[1] + (b[1] - a[1]) * (level - a[0]) / (b[0] - a[0]);
  const factor = (row) => {
    if (!row) return 1;
    return plus <= 5 ? row[0] + (row[1] - row[0]) * (plus - 1) / 4 : row[1] + (row[2] - row[1]) * (plus - 5) / 3;
  };
  return base * (factor(PVP_UPGRADE_CURVE[cls][a[0]]) + (factor(PVP_UPGRADE_CURVE[cls][b[0]]) - factor(PVP_UPGRADE_CURVE[cls][a[0]])) * (level - a[0]) / (b[0] - a[0]));
}
function pvpSnapshot(p) {
  const base = CLASSES[p.class];
  const items = Object.values(p.equipped).filter((i) => i && !isBroken(i));
  const weapon = items.filter((i) => i.kind === "weapon").reduce((n, i) => n + (i.atk || 0), 0) / { warrior: 1, rogue: 1.1, mage: 1.04 }[p.class];
  const armor = items.filter((i) => i.kind === "armor");
  const accessories = items.filter((i) => i.kind === "accessory");
  const bonusStats = items.reduce((all, i) => Object.entries(i.statBonus || {}).reduce((next, [key, value]) => ({ ...next, [key]: (next[key] || 0) + value }), all), {});
  const investment = p.stats[base.mainStat] - base.baseStats[base.mainStat] + (bonusStats[base.mainStat] || 0) + (p.class === "mage" ? Math.max(0, p.stats.int + (bonusStats.int || 0) - 70) : 0);
  const gearBonus = p.class === "mage" ? 0 : armor.reduce((n, i) => n + armorLevelBonus(i.upgradeLevel), 0);
  const power2 = (18 + weapon * (0.8 + 6e-3 * (investment + gearBonus) + 5e-3 * p.level)) / (1 + 0.8 * base.crit);
  const defense = (armor.reduce((n, i) => n + (i.def || 0), 0) + accessories.reduce((n, i) => n + (i.def || 0), 0)) * { warrior: 1, rogue: 1.44, mage: 1.67 }[p.class];
  const duelHp = 200 + boostFlatBonus(p, "hp") + p.level * 12 + (bonusStats.sta || 0) * 4 + Math.max(0, p.stats.sta - base.baseStats.sta) * 4 + items.reduce((n, i) => n + (i.hp || 0), 0);
  const antiDef = {};
  for (const item of items) {
    const d = item.defenseAbility;
    if (d?.vs) antiDef[d.vs] = (antiDef[d.vs] || 0) + Math.max(0, d.value || 0);
  }
  const accessoryPower = 1 + Math.min(0.15, accessories.reduce((n, i) => n + (i.attackPowerPct || 0), 0));
  return {
    weaponType: p.equipped.mainHand?.weaponType || "sword",
    antiDef,
    cls: p.class,
    level: p.level,
    dex: p.stats.dex + (bonusStats.dex || 0),
    hp: playerMaxHp(p),
    maxHp: playerMaxHp(p),
    duelHp,
    atk: power2 * wingMultiplier(p, "atk") * boostMultiplier(p, "atk") * accessoryPower,
    def: (defense * 0.65 + p.level) * boostMultiplier(p, "def"),
    crit: base.crit,
    reduction: armorSetDamageReduction(p, "pvp")
  };
}
function pvpDamage(a, b, critical = false, random = Math.random) {
  const weapon = a.weaponType === "crossbow" ? "bow" : a.weaponType;
  const points = b.antiDef?.[weapon] || 0;
  const anti = Math.min(0.25, points / (100 + points));
  const raw = (1 - anti) * mitigate(a.atk * (critical ? 1.8 : 1), b.def, 170) * (1 - (b.reduction || 0)) * (b.maxHp / b.duelHp);
  return Math.max(1, Math.floor(raw) + (random() < raw % 1 ? 1 : 0));
}

// src/utils/duelEngine.js
var DUEL_RULE_VERSION = "2026-09-24.1";
function createDuel(a, b, { seed = 1, fullHealth = false } = {}) {
  const fighters = [a, b].map((p) => {
    const s = pvpSnapshot(p);
    s.atk *= pvpSkillPower(p.class, p.level, p.equipped.mainHand?.upgradeLevel || 1);
    return { ...s, name: p.nickname || p.class, mp: fullHealth ? playerMaxMp(p) : Math.min(p.mp, playerMaxMp(p)), maxMp: playerMaxMp(p), hp: fullHealth ? s.maxHp : Math.max(0, Math.min(p.hp, s.maxHp)), skills: [...new Set(p.skills?.loadout || [])].filter((id) => p.skills?.known?.includes(id)).slice(0, 5).map((id) => getSkill(p.class, id)).filter((s2) => s2 && s2.unlockLevel <= p.level), cooldowns: {}, buff: null, dot: null };
  });
  return { rulesVersion: DUEL_RULE_VERSION, fighters, seed: seed >>> 0 || 1, round: 0, first: seed % 2, finished: false, winner: null, events: [] };
}
function selectDuelSkill(a, b) {
  const ready = a.skills.filter((s) => !a.cooldowns[s.id] && a.mp >= s.mpCost);
  const heal = ready.filter((s) => s.effect.type === "heal").sort((x, y) => y.effect.pct - x.effect.pct)[0];
  if (heal && a.hp / a.maxHp < 0.5) return heal;
  const execute = ready.find((s) => s.effect.type === "execute" && b.hp / b.maxHp <= s.effect.hpPctThreshold);
  if (execute) return execute;
  if (!a.buff && b.hp / b.maxHp > 0.5) {
    const buff = ready.filter((s) => s.effect.type === "buffAtk").sort((x, y) => y.effect.mult - x.effect.mult)[0];
    if (buff) return buff;
  }
  if (!b.dot && b.hp / b.maxHp > 0.45) {
    const dot = ready.find((s) => s.effect.type === "dot");
    if (dot) return dot;
  }
  return ready.filter((s) => s.effect.type === "damage").sort((x, y) => y.effect.mult - x.effect.mult)[0] || null;
}
function stepDuel(state) {
  if (state.finished) return state;
  const next = { ...state, round: state.round + 1, events: [], fighters: state.fighters.map((f) => ({ ...f, cooldowns: { ...f.cooldowns }, buff: f.buff ? { ...f.buff } : null, dot: f.dot ? { ...f.dot } : null })) };
  const random = () => {
    next.seed = Math.imul(next.seed, 1664525) + 1013904223 >>> 0;
    return next.seed / 4294967296;
  };
  const damage = (a2, b2, crit) => Math.max(1, Math.round(pvpDamage(a2, b2, crit, random) * (0.88 + random() * 0.24)));
  const order = (state.first + state.round) % 2 ? [1, 0] : [0, 1];
  for (const side of order) {
    const a2 = next.fighters[side], b2 = next.fighters[1 - side];
    if (a2.hp <= 0 || b2.hp <= 0) break;
    if (a2.dot) {
      const damage2 = Math.min(a2.hp, a2.dot.damage);
      a2.hp -= damage2;
      next.events.push({ side: 1 - side, type: "dotTick", damage: damage2, hit: true });
      if (--a2.dot.left <= 0) a2.dot = null;
      if (a2.hp <= 0) break;
    }
    const skill = selectDuelSkill(a2, b2), e = skill?.effect;
    for (const id of Object.keys(a2.cooldowns)) a2.cooldowns[id] = Math.max(0, a2.cooldowns[id] - 1);
    const power2 = a2.buff?.mult || 1;
    if (a2.buff && --a2.buff.left <= 0) a2.buff = null;
    if (skill) {
      a2.mp -= skill.mpCost;
      a2.cooldowns[skill.id] = skill.cooldown;
    }
    const event = { side, skillId: skill?.id, label: skill?.name, type: e?.type || "attack", hit: true, damage: 0 };
    if (e?.type === "heal") {
      event.heal = Math.min(a2.maxHp - a2.hp, Math.round(a2.maxHp * Math.min(0.2, e.pct)));
      a2.hp += event.heal;
    } else if (e?.type === "buffAtk") {
      a2.buff = { mult: e.mult, left: e.turns };
    } else if (e?.type === "dot") {
      b2.dot = { damage: Math.max(1, Math.round(damage({ ...a2, atk: a2.atk * power2 }, b2, false) * e.mult)), left: e.turns };
    } else {
      event.hit = !!skill || random() < hitChance(a2.dex, b2.dex, a2.level);
      event.crit = event.hit && random() < a2.crit;
      const mult = e?.type === "execute" ? b2.hp / b2.maxHp <= e.hpPctThreshold ? e.mult : 1 : e?.mult || 1;
      if (event.hit) {
        event.damage = Math.min(b2.hp, damage({ ...a2, atk: a2.atk * power2 * mult }, b2, event.crit));
        b2.hp -= event.damage;
      }
    }
    next.events.push(event);
  }
  const [a, b] = next.fighters;
  if (a.hp <= 0 || b.hp <= 0 || next.round >= 100) {
    next.finished = true;
    next.winner = a.hp <= 0 && b.hp <= 0 ? null : a.hp <= 0 ? 1 : b.hp <= 0 ? 0 : null;
  }
  return next;
}

// src/game/duel.js
var fail10 = (state, reason, extra = {}) => ({ state, result: { ok: false, reason, ...extra } });
var done10 = (state, extra = {}) => ({ state, result: { ok: true, ...extra } });
var MAX_STEPS = 120;
function simulateDuel(player, opponent, seed) {
  let engine = createDuel(player, opponent, { seed, fullHealth: true });
  for (let i = 0; i < MAX_STEPS && !engine.finished; i++) engine = stepDuel(engine);
  return engine.finished ? engine.winner : null;
}
var duelReducers = {
  // Yeni düello: önceki bekleyen düello bırakıldıysa (`forfeit`) yenilgi sayılır.
  "duel/start"(state, { opponentAccountId, opponentName, opponent, seed, forfeit }) {
    if (!opponent || !Number.isSafeInteger(seed)) return fail10(state, "noOpponent");
    const player = forfeit ? penalizeNationalPoint(state.player) : state.player;
    return done10({ ...state, player }, { opponentAccountId, opponentName, opponent, seed, forfeited: !!forfeit });
  },
  "duel/resolve"(state, { opponent, seed }) {
    if (!opponent || !Number.isSafeInteger(seed)) return fail10(state, "noDuel");
    const winner = simulateDuel(state.player, opponent, seed);
    if (winner === 0) {
      const awarded = awardNationalPoint(state.player);
      const player = { ...awarded.player, milestones: { ...awarded.player.milestones, duelsWon: (awarded.player.milestones?.duelsWon || 0) + 1 } };
      return done10({ ...state, player }, { winner: "me", gain: awarded.gain });
    }
    if (winner === 1) return done10({ ...state, player: penalizeNationalPoint(state.player) }, { winner: "opponent" });
    return done10(state, { winner: "draw" });
  },
  "duel/concede"(state, { opponent }) {
    if (!opponent) return fail10(state, "noDuel");
    return done10({ ...state, player: penalizeNationalPoint(state.player) }, { winner: "opponent" });
  },
  // Hafta değişince haftalık puan sıfırlanır; ilk 3'e girdiyse bekleyen elmas talebi (sunucu doğrular) oluşur.
  "week/rollover"(state) {
    const r = applyWeeklyRollover(state.player);
    return done10({ ...state, player: r.player }, { rank: r.rank, rolled: r.player !== state.player });
  }
};

// src/game/shared.js
init_define_import_meta_env();
var fail11 = (state, reason, extra = {}) => ({ state, result: { ok: false, reason, ...extra } });
var done11 = (state, extra = {}) => ({ state, result: { ok: true, ...extra } });
var SHARED_REST_MS = 6e4;
var sharedReducers = {
  "shared/attack"(state, { fighter, monster, sharedHp, action, seed, now }) {
    if (!monster || !Number.isFinite(monster.hp) || !Number.isFinite(sharedHp) || !Number.isFinite(now)) return fail11(state, "noServerData");
    const { player } = state;
    let base = fighter && Number.isFinite(fighter.turn) ? fighter : createFight(player, monster, seed);
    if (fighter && now - (fighter.lastAt || 0) > SHARED_REST_MS) base = { ...base, hp: playerMaxHp(player), mp: playerMaxMp(player) };
    const fight = { ...base, monsterHp: Math.max(1, sharedHp), monsterMaxHp: monster.hp, stock: stockOf(player), used: { hp: {}, mp: {} }, wear: { weapon: 0, armor: 0 }, ended: null };
    const out = stepFight(fight, player, monster, 65, action);
    if (out.error) return fail11(state, out.error);
    const f = out.fight;
    const damage = Math.max(0, Math.min(sharedHp, fight.monsterHp - f.monsterHp));
    let next = applyFightAftermath(player, f);
    let xpLost = 0;
    if (f.ended === "lose") {
      const penalty = applyDeathPenalty(next);
      next = penalty.player;
      xpLost = penalty.xpLost;
    }
    const persisted = f.ended === "lose" ? null : { seed: f.seed, turn: f.turn, hp: f.hp, mp: f.mp, buffs: f.buffs, dot: f.dot, skillCooldowns: f.skillCooldowns, potionCooldowns: f.potionCooldowns, lastAt: now };
    return done11({ ...state, player: next }, { events: out.events, damage, died: f.ended === "lose", targetDown: f.ended === "win", xpLost, fighter: persisted, hp: f.hp, mp: f.mp, skillCooldowns: f.skillCooldowns, potionCooldowns: f.potionCooldowns, buffs: f.buffs, dot: f.dot });
  }
};

// src/utils/chests.js
init_define_import_meta_env();
function openChestSafely(player, chestId, roll) {
  const chest = player.chests.find((c) => c.id === chestId);
  if (!chest) return { player, opened: false, reason: "chestMissing" };
  if (player.inventory.length >= BAG_SLOTS) return { player, opened: false, reason: "bagFull" };
  const item = roll ? roll(chest, player) : chest.special ? rollSpecialChestLoot(player.class) : rollChestLoot(chest.tier);
  if (!item) return { player, opened: false, reason: "emptyChestPool" };
  const result = addItemToInventory(player, item);
  if (!result.added) return { ...result, opened: false, item: null };
  return { opened: true, item, player: { ...result.player, chests: player.chests.filter((c) => c.id !== chestId), hasNewItemNotice: true, milestones: { ...player.milestones, chestsOpened: (player.milestones?.chestsOpened || 0) + 1 } } };
}
function openChestsSafely(player, roll) {
  let next = player, reason = null;
  const items = [];
  for (const chest of player.chests) {
    const result = openChestSafely(next, chest.id, roll);
    if (!result.opened) {
      reason = result.reason;
      break;
    }
    next = result.player;
    items.push(result.item);
  }
  return { player: next, items, reason, remaining: next.chests.length };
}

// src/game/actions.js
var fail12 = (state, reason, extra = {}) => ({ state, result: { ok: false, reason, ...extra } });
var done12 = (state, extra = {}) => ({ state, result: { ok: true, ...extra } });
var strip = ({ player, bank, ...rest }) => rest;
var findOwned = (player, itemId) => player.inventory.find((i) => i.id === itemId) || Object.values(player.equipped || {}).find((i) => i && i.id === itemId) || null;
var inventoryReducers = {
  "inventory/equip"(state, { itemId }) {
    const item = state.player.inventory.find((i) => i.id === itemId);
    if (!item) return fail12(state, "itemNotFound");
    const result = equipItem(state.player, item);
    if (result.blocked) return fail12(state, "blocked", { blocked: result.blocked });
    return done12({ ...state, player: result.player });
  },
  "inventory/unequip"(state, { slot }) {
    const result = unequipItem(state.player, slot);
    if (!result.removed) return fail12(state, result.reason || "nothingToRemove", strip(result));
    return done12({ ...state, player: result.player });
  },
  "inventory/sell"(state, { itemId }) {
    const item = state.player.inventory.find((i) => i.id === itemId);
    if (!item) return fail12(state, "itemNotFound");
    if (item.noTrade) return fail12(state, "noTrade");
    const price = Math.round(sellPrice(item) * premiumSellMultiplier(state.player));
    const gold = Math.min(MAX_GOLD, state.player.gold + price);
    return done12({ ...state, player: { ...state.player, gold, inventory: state.player.inventory.filter((i) => i.id !== itemId) } }, { gold: price });
  },
  "inventory/sellBulk"(state, { itemIds }) {
    const wanted = new Set(Array.isArray(itemIds) ? itemIds : []);
    const sellable = state.player.inventory.filter((i) => wanted.has(i.id) && !isConsumable(i) && !i.noTrade);
    if (sellable.length === 0) return fail12(state, "noneSellable");
    const total = sellable.reduce((sum, i) => sum + Math.round(sellPrice(i) * premiumSellMultiplier(state.player)), 0);
    const sold = new Set(sellable.map((i) => i.id));
    const gold = Math.min(MAX_GOLD, state.player.gold + total);
    return done12({ ...state, player: { ...state.player, gold, inventory: state.player.inventory.filter((i) => !sold.has(i.id)) } }, { count: sellable.length, gold: total });
  },
  "inventory/repair"(state, { itemId }) {
    const item = findOwned(state.player, itemId);
    if (!item) return fail12(state, "itemNotFound");
    const result = repairItem(state.player, item, premiumRepairDiscount(state.player), state.bank);
    if (!result.repaired) return fail12(state, result.reason || "repairFailed", strip(result));
    return done12({ ...state, player: result.player, bank: result.bank || state.bank }, { cost: result.cost });
  },
  "inventory/repairAll"(state) {
    const result = repairAllEquipped(state.player, premiumRepairDiscount(state.player));
    if (!result.repaired) return fail12(state, result.reason || "nothingToRepair", strip(result));
    return done12({ ...state, player: result.player }, { cost: result.cost });
  },
  "inventory/depositItem"(state, { itemId, page }) {
    const item = state.player.inventory.find((i) => i.id === itemId);
    if (!item) return fail12(state, "itemNotFound");
    if (!Number.isInteger(page) || !state.bank[page]) return fail12(state, "invalidPage");
    const result = depositToBank(state.player, item, state.bank, page);
    if (!result.moved) return fail12(state, result.reason || "depositFailed", strip(result));
    return done12({ ...state, player: result.player, bank: result.bank });
  },
  "inventory/withdrawItem"(state, { itemId, page }) {
    if (!Number.isInteger(page) || !state.bank[page]) return fail12(state, "invalidPage");
    const item = state.bank[page].find((i) => i.id === itemId);
    if (!item) return fail12(state, "itemNotFound");
    const result = withdrawFromBank(state.player, item, state.bank, page);
    if (!result.moved) return fail12(state, result.reason || "withdrawFailed", strip(result));
    return done12({ ...state, player: result.player, bank: result.bank });
  },
  "inventory/depositBulk"(state, { itemIds, page }) {
    if (!Number.isInteger(page) || !state.bank[page]) return fail12(state, "invalidPage");
    let player = state.player, bank = state.bank, moved = 0;
    for (const id of Array.isArray(itemIds) ? itemIds : []) {
      const item = player.inventory.find((i) => i.id === id);
      if (!item) continue;
      const result = depositToBank(player, item, bank, page);
      if (result.moved) {
        player = result.player;
        bank = result.bank;
        moved++;
      }
    }
    return done12({ ...state, player, bank }, { moved });
  },
  "inventory/depositGold"(state, { amount }) {
    if (!Number.isSafeInteger(amount) || amount <= 0) return fail12(state, "invalidAmount");
    if (state.player.gold < amount) return fail12(state, "notEnoughGold");
    if (state.bankGold + amount > MAX_GOLD) return fail12(state, "bankGoldCap");
    return done12({ ...state, player: { ...state.player, gold: state.player.gold - amount }, bankGold: state.bankGold + amount }, { amount });
  },
  "inventory/withdrawGold"(state, { amount }) {
    if (!Number.isSafeInteger(amount) || amount <= 0) return fail12(state, "invalidAmount");
    if (state.bankGold < amount) return fail12(state, "notEnoughBankGold");
    if (state.player.gold + amount > MAX_GOLD) return fail12(state, "carryGoldCap");
    return done12({ ...state, player: { ...state.player, gold: state.player.gold + amount }, bankGold: state.bankGold - amount }, { amount });
  },
  "inventory/openChest"(state, { chestId }) {
    const result = openChestSafely(state.player, chestId);
    if (!result.opened) return fail12(state, result.reason || "chestFailed");
    return done12({ ...state, player: result.player }, { item: result.item });
  },
  "inventory/openAllChests"(state) {
    const result = openChestsSafely(state.player);
    if (!result.items.length) return fail12(state, result.reason || "noChests");
    return done12({ ...state, player: result.player }, { items: result.items, reason: result.reason || null });
  },
  "inventory/useBoostScroll"(state, { itemId }) {
    const item = state.player.inventory.find((i) => i.id === itemId && i.kind === "boostScroll");
    if (!item) return fail12(state, "itemNotFound");
    const result = useBoostScroll(state.player, item.boostId);
    if (!result.used) return fail12(state, "noScrollsLeft");
    return done12({ ...state, player: result.player });
  }
};
var reducers = { ...inventoryReducers, ...battleReducers, ...warzoneReducers, ...progressReducers, ...upgradeReducers, ...marketReducers, ...clanReducers, ...diamondReducers, ...characterReducers, ...gmReducers, ...duelReducers, ...sharedReducers };
var ACTION_TYPES = Object.keys(reducers);
function applyAction(state, type, payload = {}) {
  const reducer = Object.hasOwn(reducers, type) ? reducers[type] : null;
  if (!reducer) return fail12(state, "unknownAction");
  if (payload === null || typeof payload !== "object") return fail12(state, "invalidPayload");
  return reducer(state, payload);
}

// src/game/index.js
var CLASS_IDS = ["warrior", "rogue", "mage"];
var RACE_IDS = ["human", "karus", "elmorad"];
function createCharacter(cls, race, nickname) {
  return initialPlayer(CLASS_IDS.includes(cls) ? cls : "warrior", RACE_IDS.includes(race) ? race : "human", typeof nickname === "string" ? nickname : "Hero");
}
function newCharacterEconomy(cls, race, nickname) {
  const player = createCharacter(cls, race, nickname);
  return { gold: player.gold, inventory: player.inventory, equipped: player.equipped, chests: player.chests };
}
export {
  ACTION_TYPES,
  MAPS,
  MIN_TURN_MS,
  POTION_COOLDOWN_TURNS,
  SERVER_OWNED_FIELDS,
  applyAction,
  applyLiveDropConfig,
  bestPotionTier,
  buildHuntMonster,
  checkAction,
  createCharacter,
  createFight,
  getWarzoneHuntConfig,
  maxActionDamage,
  newCharacterEconomy,
  reducers,
  replayFight,
  resolveMonster,
  stepFight
};
