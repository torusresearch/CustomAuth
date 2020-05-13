/* eslint-disable */
function getScope() {
  return self.registration.scope;
}

self.addEventListener("message", function (event) {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", function (event) {
  try {
    const url = new URL(event.request.url);
    if (url.pathname.includes("redirect") && url.href.includes(getScope())) {
      event.respondWith(
        new Response(
          new Blob(
            [
              `
<html>

<head>
  <style>
    * {
      box-sizing: border-box;
    }

    html,
    body {
      background: #fcfcfc;
      height: 100%;
      padding: 0;
      margin: 0;
    }

    .container {
      width: 100%;
      height: 100%;

      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
    }

    h1.title {
      font-size: 14px;
      color: #0f1222;
      font-family: 'Roboto', sans-serif !important;
      margin: 0;
      text-align: center;
    }

    .spinner .beat {
      background-color: #0364ff;
      height: 12px;
      width: 12px;
      margin: 24px 2px 10px;
      border-radius: 100%;
      -webkit-animation: beatStretchDelay 0.7s infinite linear;
      animation: beatStretchDelay 0.7s infinite linear;
      -webkit-animation-fill-mode: both;
      animation-fill-mode: both;
      display: inline-block;
    }

    .spinner .beat-odd {
      animation-delay: 0s;
    }

    .spinner .beat-even {
      animation-delay: 0.35s;
    }

    @-webkit-keyframes beatStretchDelay {
      50% {
        -webkit-transform: scale(0.75);
        transform: scale(0.75);
        -webkit-opacity: 0.2;
        opacity: 0.2;
      }

      100% {
        -webkit-transform: scale(1);
        transform: scale(1);
        -webkit-opacity: 1;
        opacity: 1;
      }
    }

    @keyframes beatStretchDelay {
      50% {
        -webkit-transform: scale(0.75);
        transform: scale(0.75);
        -webkit-opacity: 0.2;
        opacity: 0.2;
      }

      100% {
        -webkit-transform: scale(1);
        transform: scale(1);
        -webkit-opacity: 1;
        opacity: 1;
      }
    }

    @media (min-width: 768px) {
      h1.title {
        font-size: 14px;
      }

      p.info {
        font-size: 28px;
      }

      .spinner .beat {
        height: 12px;
        width: 12px;
      }
    }
  </style>
</head>

<body>
  <div id="message" class="container">
    <div class="spinner content">
      <div class="beat beat-odd"></div>
      <div class="beat beat-even"></div>
      <div class="beat beat-odd"></div>
    </div>
    <h1 class="title content">Loading</h1>
  </div>
  <script>
    // auth0-spa-js.production.js
    ! function (t, e) {
      "object" == typeof exports && "undefined" != typeof module ? module.exports = e() : "function" == typeof define &&
        define.amd ? define(e) : (t = t || self).createAuth0Client = e()
    }(this, function () {
      "use strict";
      var t = function (e, n) {
        return (t = Object.setPrototypeOf || {
            __proto__: []
          }
          instanceof Array && function (t, e) {
            t.__proto__ = e
          } || function (t, e) {
            for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n])
          })(e, n)
      };
      var e = function () {
        return (e = Object.assign || function (t) {
          for (var e, n = 1, r = arguments.length; n < r; n++)
            for (var o in e = arguments[n]) Object.prototype.hasOwnProperty.call(e, o) && (t[o] = e[o]);
          return t
        }).apply(this, arguments)
      };

      function n(t, e) {
        var n = {};
        for (var r in t) Object.prototype.hasOwnProperty.call(t, r) && e.indexOf(r) < 0 && (n[r] = t[r]);
        if (null != t && "function" == typeof Object.getOwnPropertySymbols) {
          var o = 0;
          for (r = Object.getOwnPropertySymbols(t); o < r.length; o++) e.indexOf(r[o]) < 0 && Object.prototype
            .propertyIsEnumerable.call(t, r[o]) && (n[r[o]] = t[r[o]])
        }
        return n
      }

      function r(t, e, n, r) {
        return new(n || (n = Promise))(function (o, i) {
          function c(t) {
            try {
              u(r.next(t))
            } catch (t) {
              i(t)
            }
          }

          function a(t) {
            try {
              u(r.throw(t))
            } catch (t) {
              i(t)
            }
          }

          function u(t) {
            t.done ? o(t.value) : new n(function (e) {
              e(t.value)
            }).then(c, a)
          }
          u((r = r.apply(t, e || [])).next())
        })
      }

      function o(t, e) {
        var n, r, o, i, c = {
          label: 0,
          sent: function () {
            if (1 & o[0]) throw o[1];
            return o[1]
          },
          trys: [],
          ops: []
        };
        return i = {
          next: a(0),
          throw: a(1),
          return: a(2)
        }, "function" == typeof Symbol && (i[Symbol.iterator] = function () {
          return this
        }), i;

        function a(i) {
          return function (a) {
            return function (i) {
              if (n) throw new TypeError("Generator is already executing.");
              for (; c;) try {
                if (n = 1, r && (o = 2 & i[0] ? r.return : i[0] ? r.throw || ((o = r.return) && o.call(r), 0) :
                    r.next) && !(o = o.call(r, i[1])).done) return o;
                switch (r = 0, o && (i = [2 & i[0], o.value]), i[0]) {
                  case 0:
                  case 1:
                    o = i;
                    break;
                  case 4:
                    return c.label++, {
                      value: i[1],
                      done: !1
                    };
                  case 5:
                    c.label++, r = i[1], i = [0];
                    continue;
                  case 7:
                    i = c.ops.pop(), c.trys.pop();
                    continue;
                  default:
                    if (!(o = (o = c.trys).length > 0 && o[o.length - 1]) && (6 === i[0] || 2 === i[0])) {
                      c = 0;
                      continue
                    }
                    if (3 === i[0] && (!o || i[1] > o[0] && i[1] < o[3])) {
                      c.label = i[1];
                      break
                    }
                    if (6 === i[0] && c.label < o[1]) {
                      c.label = o[1], o = i;
                      break
                    }
                    if (o && c.label < o[2]) {
                      c.label = o[2], c.ops.push(i);
                      break
                    }
                    o[2] && c.ops.pop(), c.trys.pop();
                    continue
                }
                i = e.call(t, c)
              } catch (t) {
                i = [6, t], r = 0
              } finally {
                n = o = 0
              }
              if (5 & i[0]) throw i[1];
              return {
                value: i[0] ? i[1] : void 0,
                done: !0
              }
            }([i, a])
          }
        }
      }
      var i = "undefined" != typeof globalThis ? globalThis : "undefined" != typeof window ? window : "undefined" !=
        typeof global ? global : "undefined" != typeof self ? self : {};

      function c(t, e) {
        return t(e = {
          exports: {}
        }, e.exports), e.exports
      }
      var a, u, s, f = "object",
        l = function (t) {
          return t && t.Math == Math && t
        },
        p = l(typeof globalThis == f && globalThis) || l(typeof window == f && window) || l(typeof self == f &&
        self) || l(typeof i == f && i) || Function("return this")(),
        d = function (t) {
          try {
            return !!t()
          } catch (t) {
            return !0
          }
        },
        h = !d(function () {
          return 7 != Object.defineProperty({}, "a", {
            get: function () {
              return 7
            }
          }).a
        }),
        y = {}.propertyIsEnumerable,
        v = Object.getOwnPropertyDescriptor,
        w = {
          f: v && !y.call({
            1: 2
          }, 1) ? function (t) {
            var e = v(this, t);
            return !!e && e.enumerable
          } : y
        },
        g = function (t, e) {
          return {
            enumerable: !(1 & t),
            configurable: !(2 & t),
            writable: !(4 & t),
            value: e
          }
        },
        m = {}.toString,
        _ = function (t) {
          return m.call(t).slice(8, -1)
        },
        b = "".split,
        O = d(function () {
          return !Object("z").propertyIsEnumerable(0)
        }) ? function (t) {
          return "String" == _(t) ? b.call(t, "") : Object(t)
        } : Object,
        E = function (t) {
          if (null == t) throw TypeError("Can't call method on " + t);
          return t
        },
        T = function (t) {
          return O(E(t))
        },
        S = function (t) {
          return "object" == typeof t ? null !== t : "function" == typeof t
        },
        j = function (t, e) {
          if (!S(t)) return t;
          var n, r;
          if (e && "function" == typeof (n = t.toString) && !S(r = n.call(t))) return r;
          if ("function" == typeof (n = t.valueOf) && !S(r = n.call(t))) return r;
          if (!e && "function" == typeof (n = t.toString) && !S(r = n.call(t))) return r;
          throw TypeError("Can't convert object to primitive value")
        },
        A = {}.hasOwnProperty,
        P = function (t, e) {
          return A.call(t, e)
        },
        x = p.document,
        U = S(x) && S(x.createElement),
        C = function (t) {
          return U ? x.createElement(t) : {}
        },
        k = !h && !d(function () {
          return 7 != Object.defineProperty(C("div"), "a", {
            get: function () {
              return 7
            }
          }).a
        }),
        I = Object.getOwnPropertyDescriptor,
        F = {
          f: h ? I : function (t, e) {
            if (t = T(t), e = j(e, !0), k) try {
              return I(t, e)
            } catch (t) {}
            if (P(t, e)) return g(!w.f.call(t, e), t[e])
          }
        },
        R = function (t) {
          if (!S(t)) throw TypeError(String(t) + " is not an object");
          return t
        },
        D = Object.defineProperty,
        L = {
          f: h ? D : function (t, e, n) {
            if (R(t), e = j(e, !0), R(n), k) try {
              return D(t, e, n)
            } catch (t) {}
            if ("get" in n || "set" in n) throw TypeError("Accessors not supported");
            return "value" in n && (t[e] = n.value), t
          }
        },
        M = h ? function (t, e, n) {
          return L.f(t, e, g(1, n))
        } : function (t, e, n) {
          return t[e] = n, t
        },
        z = function (t, e) {
          try {
            M(p, t, e)
          } catch (n) {
            p[t] = e
          }
          return e
        },
        N = c(function (t) {
          var e = p["__core-js_shared__"] || z("__core-js_shared__", {});
          (t.exports = function (t, n) {
            return e[t] || (e[t] = void 0 !== n ? n : {})
          })("versions", []).push({
            version: "3.2.1",
            mode: "global",
            copyright: "Â© 2019 Denis Pushkarev (zloirock.ru)"
          })
        }),
        B = N("native-function-to-string", Function.toString),
        W = p.WeakMap,
        q = "function" == typeof W && /native code/.test(B.call(W)),
        G = 0,
        J = Math.random(),
        H = function (t) {
          return "Symbol(" + String(void 0 === t ? "" : t) + ")_" + (++G + J).toString(36)
        },
        Y = N("keys"),
        V = function (t) {
          return Y[t] || (Y[t] = H(t))
        },
        K = {},
        Q = p.WeakMap;
      if (q) {
        var X = new Q,
          Z = X.get,
          $ = X.has,
          tt = X.set;
        a = function (t, e) {
          return tt.call(X, t, e), e
        }, u = function (t) {
          return Z.call(X, t) || {}
        }, s = function (t) {
          return $.call(X, t)
        }
      } else {
        var et = V("state");
        K[et] = !0, a = function (t, e) {
          return M(t, et, e), e
        }, u = function (t) {
          return P(t, et) ? t[et] : {}
        }, s = function (t) {
          return P(t, et)
        }
      }
      var nt = {
          set: a,
          get: u,
          has: s,
          enforce: function (t) {
            return s(t) ? u(t) : a(t, {})
          },
          getterFor: function (t) {
            return function (e) {
              var n;
              if (!S(e) || (n = u(e)).type !== t) throw TypeError("Incompatible receiver, " + t + " required");
              return n
            }
          }
        },
        rt = c(function (t) {
          var e = nt.get,
            n = nt.enforce,
            r = String(B).split("toString");
          N("inspectSource", function (t) {
            return B.call(t)
          }), (t.exports = function (t, e, o, i) {
            var c = !!i && !!i.unsafe,
              a = !!i && !!i.enumerable,
              u = !!i && !!i.noTargetGet;
            "function" == typeof o && ("string" != typeof e || P(o, "name") || M(o, "name", e), n(o).source = r
              .join("string" == typeof e ? e : "")), t !== p ? (c ? !u && t[e] && (a = !0) : delete t[e], a ?
              t[e] = o : M(t, e, o)) : a ? t[e] = o : z(e, o)
          })(Function.prototype, "toString", function () {
            return "function" == typeof this && e(this).source || B.call(this)
          })
        }),
        ot = p,
        it = function (t) {
          return "function" == typeof t ? t : void 0
        },
        ct = function (t, e) {
          return arguments.length < 2 ? it(ot[t]) || it(p[t]) : ot[t] && ot[t][e] || p[t] && p[t][e]
        },
        at = Math.ceil,
        ut = Math.floor,
        st = function (t) {
          return isNaN(t = +t) ? 0 : (t > 0 ? ut : at)(t)
        },
        ft = Math.min,
        lt = function (t) {
          return t > 0 ? ft(st(t), 9007199254740991) : 0
        },
        pt = Math.max,
        dt = Math.min,
        ht = function (t) {
          return function (e, n, r) {
            var o, i = T(e),
              c = lt(i.length),
              a = function (t, e) {
                var n = st(t);
                return n < 0 ? pt(n + e, 0) : dt(n, e)
              }(r, c);
            if (t && n != n) {
              for (; c > a;)
                if ((o = i[a++]) != o) return !0
            } else
              for (; c > a; a++)
                if ((t || a in i) && i[a] === n) return t || a || 0;
            return !t && -1
          }
        },
        yt = {
          includes: ht(!0),
          indexOf: ht(!1)
        },
        vt = yt.indexOf,
        wt = function (t, e) {
          var n, r = T(t),
            o = 0,
            i = [];
          for (n in r) !P(K, n) && P(r, n) && i.push(n);
          for (; e.length > o;) P(r, n = e[o++]) && (~vt(i, n) || i.push(n));
          return i
        },
        gt = ["constructor", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "toLocaleString", "toString",
          "valueOf"
        ],
        mt = gt.concat("length", "prototype"),
        _t = {
          f: Object.getOwnPropertyNames || function (t) {
            return wt(t, mt)
          }
        },
        bt = {
          f: Object.getOwnPropertySymbols
        },
        Ot = ct("Reflect", "ownKeys") || function (t) {
          var e = _t.f(R(t)),
            n = bt.f;
          return n ? e.concat(n(t)) : e
        },
        Et = function (t, e) {
          for (var n = Ot(e), r = L.f, o = F.f, i = 0; i < n.length; i++) {
            var c = n[i];
            P(t, c) || r(t, c, o(e, c))
          }
        },
        Tt = /#|\\.prototype\\./,
        St = function (t, e) {
          var n = At[jt(t)];
          return n == xt || n != Pt && ("function" == typeof e ? d(e) : !!e)
        },
        jt = St.normalize = function (t) {
          return String(t).replace(Tt, ".").toLowerCase()
        },
        At = St.data = {},
        Pt = St.NATIVE = "N",
        xt = St.POLYFILL = "P",
        Ut = St,
        Ct = F.f,
        kt = function (t, e) {
          var n, r, o, i, c, a = t.target,
            u = t.global,
            s = t.stat;
          if (n = u ? p : s ? p[a] || z(a, {}) : (p[a] || {}).prototype)
            for (r in e) {
              if (i = e[r], o = t.noTargetGet ? (c = Ct(n, r)) && c.value : n[r], !Ut(u ? r : a + (s ? "." : "#") + r,
                  t.forced) && void 0 !== o) {
                if (typeof i == typeof o) continue;
                Et(i, o)
              }(t.sham || o && o.sham) && M(i, "sham", !0), rt(n, r, i, t)
            }
        },
        It = !!Object.getOwnPropertySymbols && !d(function () {
          return !String(Symbol())
        }),
        Ft = p.Symbol,
        Rt = N("wks"),
        Dt = function (t) {
          return Rt[t] || (Rt[t] = It && Ft[t] || (It ? Ft : H)("Symbol." + t))
        },
        Lt = Dt("match"),
        Mt = function (t) {
          if (function (t) {
              var e;
              return S(t) && (void 0 !== (e = t[Lt]) ? !!e : "RegExp" == _(t))
            }(t)) throw TypeError("The method doesn't accept regular expressions");
          return t
        },
        zt = Dt("match"),
        Nt = "".startsWith,
        Bt = Math.min;
      kt({
        target: "String",
        proto: !0,
        forced: ! function (t) {
          var e = /./;
          try {
            "/./" [t](e)
          } catch (n) {
            try {
              return e[zt] = !1, "/./" [t](e)
            } catch (t) {}
          }
          return !1
        }("startsWith")
      }, {
        startsWith: function (t) {
          var e = String(E(this));
          Mt(t);
          var n = lt(Bt(arguments.length > 1 ? arguments[1] : void 0, e.length)),
            r = String(t);
          return Nt ? Nt.call(e, r, n) : e.slice(n, n + r.length) === r
        }
      });
      var Wt, qt, Gt, Jt = function (t) {
          if ("function" != typeof t) throw TypeError(String(t) + " is not a function");
          return t
        },
        Ht = function (t, e, n) {
          if (Jt(t), void 0 === e) return t;
          switch (n) {
            case 0:
              return function () {
                return t.call(e)
              };
            case 1:
              return function (n) {
                return t.call(e, n)
              };
            case 2:
              return function (n, r) {
                return t.call(e, n, r)
              };
            case 3:
              return function (n, r, o) {
                return t.call(e, n, r, o)
              }
          }
          return function () {
            return t.apply(e, arguments)
          }
        },
        Yt = Function.call,
        Vt = function (t, e, n) {
          return Ht(Yt, p[t].prototype[e], n)
        },
        Kt = (Vt("String", "startsWith"), function (t) {
          return function (e, n) {
            var r, o, i = String(E(e)),
              c = st(n),
              a = i.length;
            return c < 0 || c >= a ? t ? "" : void 0 : (r = i.charCodeAt(c)) < 55296 || r > 56319 || c + 1 ===
              a || (o = i.charCodeAt(c + 1)) < 56320 || o > 57343 ? t ? i.charAt(c) : r : t ? i.slice(c, c + 2) :
              o - 56320 + (r - 55296 << 10) + 65536
          }
        }),
        Qt = {
          codeAt: Kt(!1),
          charAt: Kt(!0)
        },
        Xt = function (t) {
          return Object(E(t))
        },
        Zt = !d(function () {
          function t() {}
          return t.prototype.constructor = null, Object.getPrototypeOf(new t) !== t.prototype
        }),
        $t = V("IE_PROTO"),
        te = Object.prototype,
        ee = Zt ? Object.getPrototypeOf : function (t) {
          return t = Xt(t), P(t, $t) ? t[$t] : "function" == typeof t.constructor && t instanceof t.constructor ? t
            .constructor.prototype : t instanceof Object ? te : null
        },
        ne = Dt("iterator"),
        re = !1;
      [].keys && ("next" in (Gt = [].keys()) ? (qt = ee(ee(Gt))) !== Object.prototype && (Wt = qt) : re = !0), null ==
        Wt && (Wt = {}), P(Wt, ne) || M(Wt, ne, function () {
          return this
        });
      var oe = {
          IteratorPrototype: Wt,
          BUGGY_SAFARI_ITERATORS: re
        },
        ie = Object.keys || function (t) {
          return wt(t, gt)
        },
        ce = h ? Object.defineProperties : function (t, e) {
          R(t);
          for (var n, r = ie(e), o = r.length, i = 0; o > i;) L.f(t, n = r[i++], e[n]);
          return t
        },
        ae = ct("document", "documentElement"),
        ue = V("IE_PROTO"),
        se = function () {},
        fe = function () {
          var t, e = C("iframe"),
            n = gt.length;
          for (e.style.display = "none", ae.appendChild(e), e.src = String("javascript:"), (t = e.contentWindow
              .document).open(), t.write("<scr" + "ipt>document.F=Object<\\/scr" + "ipt>"), t.close(), fe = t.F; n--;)
            delete fe.prototype[gt[n]];
          return fe()
        },
        le = Object.create || function (t, e) {
          var n;
          return null !== t ? (se.prototype = R(t), n = new se, se.prototype = null, n[ue] = t) : n = fe(), void 0 ===
            e ? n : ce(n, e)
        };
      K[ue] = !0;
      var pe = L.f,
        de = Dt("toStringTag"),
        he = function (t, e, n) {
          t && !P(t = n ? t : t.prototype, de) && pe(t, de, {
            configurable: !0,
            value: e
          })
        },
        ye = {},
        ve = oe.IteratorPrototype,
        we = function () {
          return this
        },
        ge = Object.setPrototypeOf || ("__proto__" in {} ? function () {
          var t, e = !1,
            n = {};
          try {
            (t = Object.getOwnPropertyDescriptor(Object.prototype, "__proto__").set).call(n, []), e =
              n instanceof Array
          } catch (t) {}
          return function (n, r) {
            return R(n),
              function (t) {
                if (!S(t) && null !== t) throw TypeError("Can't set " + String(t) + " as a prototype")
              }(r), e ? t.call(n, r) : n.__proto__ = r, n
          }
        }() : void 0),
        me = oe.IteratorPrototype,
        _e = oe.BUGGY_SAFARI_ITERATORS,
        be = Dt("iterator"),
        Oe = function () {
          return this
        },
        Ee = Qt.charAt,
        Te = nt.set,
        Se = nt.getterFor("String Iterator");
      ! function (t, e, n, r, o, i, c) {
        ! function (t, e, n) {
          var r = e + " Iterator";
          t.prototype = le(ve, {
            next: g(1, n)
          }), he(t, r, !1), ye[r] = we
        }(n, e, r);
        var a, u, s, f = function (t) {
            if (t === o && y) return y;
            if (!_e && t in d) return d[t];
            switch (t) {
              case "keys":
              case "values":
              case "entries":
                return function () {
                  return new n(this, t)
                }
            }
            return function () {
              return new n(this)
            }
          },
          l = e + " Iterator",
          p = !1,
          d = t.prototype,
          h = d[be] || d["@@iterator"] || o && d[o],
          y = !_e && h || f(o),
          v = "Array" == e && d.entries || h;
        if (v && (a = ee(v.call(new t)), me !== Object.prototype && a.next && (ee(a) !== me && (ge ? ge(a, me) :
            "function" != typeof a[be] && M(a, be, Oe)), he(a, l, !0))), "values" == o && h && "values" !== h.name &&
          (p = !0, y = function () {
            return h.call(this)
          }), d[be] !== y && M(d, be, y), ye[e] = y, o)
          if (u = {
              values: f("values"),
              keys: i ? y : f("keys"),
              entries: f("entries")
            }, c)
            for (s in u) !_e && !p && s in d || rt(d, s, u[s]);
          else kt({
            target: e,
            proto: !0,
            forced: _e || p
          }, u)
      }(String, "String", function (t) {
        Te(this, {
          type: "String Iterator",
          string: String(t),
          index: 0
        })
      }, function () {
        var t, e = Se(this),
          n = e.string,
          r = e.index;
        return r >= n.length ? {
          value: void 0,
          done: !0
        } : (t = Ee(n, r), e.index += t.length, {
          value: t,
          done: !1
        })
      });
      var je = function (t, e, n, r) {
          try {
            return r ? e(R(n)[0], n[1]) : e(n)
          } catch (e) {
            var o = t.return;
            throw void 0 !== o && R(o.call(t)), e
          }
        },
        Ae = Dt("iterator"),
        Pe = Array.prototype,
        xe = function (t) {
          return void 0 !== t && (ye.Array === t || Pe[Ae] === t)
        },
        Ue = function (t, e, n) {
          var r = j(e);
          r in t ? L.f(t, r, g(0, n)) : t[r] = n
        },
        Ce = Dt("toStringTag"),
        ke = "Arguments" == _(function () {
          return arguments
        }()),
        Ie = function (t) {
          var e, n, r;
          return void 0 === t ? "Undefined" : null === t ? "Null" : "string" == typeof (n = function (t, e) {
              try {
                return t[e]
              } catch (t) {}
            }(e = Object(t), Ce)) ? n : ke ? _(e) : "Object" == (r = _(e)) && "function" == typeof e.callee ?
            "Arguments" : r
        },
        Fe = Dt("iterator"),
        Re = function (t) {
          if (null != t) return t[Fe] || t["@@iterator"] || ye[Ie(t)]
        },
        De = Dt("iterator"),
        Le = !1;
      try {
        var Me = 0,
          ze = {
            next: function () {
              return {
                done: !!Me++
              }
            },
            return: function () {
              Le = !0
            }
          };
        ze[De] = function () {
          return this
        }, Array.from(ze, function () {
          throw 2
        })
      } catch (t) {}
      var Ne = ! function (t, e) {
        if (!e && !Le) return !1;
        var n = !1;
        try {
          var r = {};
          r[De] = function () {
            return {
              next: function () {
                return {
                  done: n = !0
                }
              }
            }
          }, t(r)
        } catch (t) {}
        return n
      }(function (t) {
        Array.from(t)
      });
      kt({
        target: "Array",
        stat: !0,
        forced: Ne
      }, {
        from: function (t) {
          var e, n, r, o, i = Xt(t),
            c = "function" == typeof this ? this : Array,
            a = arguments.length,
            u = a > 1 ? arguments[1] : void 0,
            s = void 0 !== u,
            f = 0,
            l = Re(i);
          if (s && (u = Ht(u, a > 2 ? arguments[2] : void 0, 2)), null == l || c == Array && xe(l))
            for (n = new c(e = lt(i.length)); e > f; f++) Ue(n, f, s ? u(i[f], f) : i[f]);
          else
            for (o = l.call(i), n = new c; !(r = o.next()).done; f++) Ue(n, f, s ? je(o, u, [r.value, f], !0) :
              r.value);
          return n.length = f, n
        }
      });
      ot.Array.from;
      var Be, We = L.f,
        qe = p.DataView,
        Ge = qe && qe.prototype,
        Je = p.Int8Array,
        He = Je && Je.prototype,
        Ye = p.Uint8ClampedArray,
        Ve = Ye && Ye.prototype,
        Ke = Je && ee(Je),
        Qe = He && ee(He),
        Xe = Object.prototype,
        Ze = Xe.isPrototypeOf,
        $e = Dt("toStringTag"),
        tn = H("TYPED_ARRAY_TAG"),
        en = !(!p.ArrayBuffer || !qe),
        nn = en && !!ge && "Opera" !== Ie(p.opera),
        rn = {
          Int8Array: 1,
          Uint8Array: 1,
          Uint8ClampedArray: 1,
          Int16Array: 2,
          Uint16Array: 2,
          Int32Array: 4,
          Uint32Array: 4,
          Float32Array: 4,
          Float64Array: 8
        },
        on = function (t) {
          return S(t) && P(rn, Ie(t))
        };
      for (Be in rn) p[Be] || (nn = !1);
      if ((!nn || "function" != typeof Ke || Ke === Function.prototype) && (Ke = function () {
          throw TypeError("Incorrect invocation")
        }, nn))
        for (Be in rn) p[Be] && ge(p[Be], Ke);
      if ((!nn || !Qe || Qe === Xe) && (Qe = Ke.prototype, nn))
        for (Be in rn) p[Be] && ge(p[Be].prototype, Qe);
      if (nn && ee(Ve) !== Qe && ge(Ve, Qe), h && !P(Qe, $e))
        for (Be in !0, We(Qe, $e, {
            get: function () {
              return S(this) ? this[tn] : void 0
            }
          }), rn) p[Be] && M(p[Be], tn, Be);
      en && ge && ee(Ge) !== Xe && ge(Ge, Xe);
      var cn = function (t) {
          if (on(t)) return t;
          throw TypeError("Target is not a typed array")
        },
        an = function (t) {
          if (ge) {
            if (Ze.call(Ke, t)) return t
          } else
            for (var e in rn)
              if (P(rn, Be)) {
                var n = p[e];
                if (n && (t === n || Ze.call(n, t))) return t
              } throw TypeError("Target is not a typed array constructor")
        },
        un = function (t, e, n) {
          if (h) {
            if (n)
              for (var r in rn) {
                var o = p[r];
                o && P(o.prototype, t) && delete o.prototype[t]
              }
            Qe[t] && !n || rt(Qe, t, n ? e : nn && He[t] || e)
          }
        },
        sn = Dt("species"),
        fn = cn,
        ln = an,
        pn = [].slice;
      un("slice", function (t, e) {
        for (var n = pn.call(fn(this), t, e), r = function (t, e) {
            var n, r = R(t).constructor;
            return void 0 === r || null == (n = R(r)[sn]) ? e : Jt(n)
          }(this, this.constructor), o = 0, i = n.length, c = new(ln(r))(i); i > o;) c[o] = n[o++];
        return c
      }, d(function () {
        new Int8Array(1).slice()
      }));
      var dn = Dt("unscopables"),
        hn = Array.prototype;
      null == hn[dn] && M(hn, dn, le(null));
      var yn, vn = yt.includes;
      kt({
        target: "Array",
        proto: !0
      }, {
        includes: function (t) {
          return vn(this, t, arguments.length > 1 ? arguments[1] : void 0)
        }
      }), yn = "includes", hn[dn][yn] = !0;
      Vt("Array", "includes");

      function wn(t) {
        var e = this.constructor;
        return this.then(function (n) {
          return e.resolve(t()).then(function () {
            return n
          })
        }, function (n) {
          return e.resolve(t()).then(function () {
            return e.reject(n)
          })
        })
      }
      var gn = setTimeout;

      function mn(t) {
        return Boolean(t && void 0 !== t.length)
      }

      function _n() {}

      function bn(t) {
        if (!(this instanceof bn)) throw new TypeError("Promises must be constructed via new");
        if ("function" != typeof t) throw new TypeError("not a function");
        this._state = 0, this._handled = !1, this._value = void 0, this._deferreds = [], An(t, this)
      }

      function On(t, e) {
        for (; 3 === t._state;) t = t._value;
        0 !== t._state ? (t._handled = !0, bn._immediateFn(function () {
          var n = 1 === t._state ? e.onFulfilled : e.onRejected;
          if (null !== n) {
            var r;
            try {
              r = n(t._value)
            } catch (t) {
              return void Tn(e.promise, t)
            }
            En(e.promise, r)
          } else(1 === t._state ? En : Tn)(e.promise, t._value)
        })) : t._deferreds.push(e)
      }

      function En(t, e) {
        try {
          if (e === t) throw new TypeError("A promise cannot be resolved with itself.");
          if (e && ("object" == typeof e || "function" == typeof e)) {
            var n = e.then;
            if (e instanceof bn) return t._state = 3, t._value = e, void Sn(t);
            if ("function" == typeof n) return void An((r = n, o = e, function () {
              r.apply(o, arguments)
            }), t)
          }
          t._state = 1, t._value = e, Sn(t)
        } catch (e) {
          Tn(t, e)
        }
        var r, o
      }

      function Tn(t, e) {
        t._state = 2, t._value = e, Sn(t)
      }

      function Sn(t) {
        2 === t._state && 0 === t._deferreds.length && bn._immediateFn(function () {
          t._handled || bn._unhandledRejectionFn(t._value)
        });
        for (var e = 0, n = t._deferreds.length; e < n; e++) On(t, t._deferreds[e]);
        t._deferreds = null
      }

      function jn(t, e, n) {
        this.onFulfilled = "function" == typeof t ? t : null, this.onRejected = "function" == typeof e ? e : null,
          this.promise = n
      }

      function An(t, e) {
        var n = !1;
        try {
          t(function (t) {
            n || (n = !0, En(e, t))
          }, function (t) {
            n || (n = !0, Tn(e, t))
          })
        } catch (t) {
          if (n) return;
          n = !0, Tn(e, t)
        }
      }
      bn.prototype.catch = function (t) {
        return this.then(null, t)
      }, bn.prototype.then = function (t, e) {
        var n = new this.constructor(_n);
        return On(this, new jn(t, e, n)), n
      }, bn.prototype.finally = wn, bn.all = function (t) {
        return new bn(function (e, n) {
          if (!mn(t)) return n(new TypeError("Promise.all accepts an array"));
          var r = Array.prototype.slice.call(t);
          if (0 === r.length) return e([]);
          var o = r.length;

          function i(t, c) {
            try {
              if (c && ("object" == typeof c || "function" == typeof c)) {
                var a = c.then;
                if ("function" == typeof a) return void a.call(c, function (e) {
                  i(t, e)
                }, n)
              }
              r[t] = c, 0 == --o && e(r)
            } catch (t) {
              n(t)
            }
          }
          for (var c = 0; c < r.length; c++) i(c, r[c])
        })
      }, bn.resolve = function (t) {
        return t && "object" == typeof t && t.constructor === bn ? t : new bn(function (e) {
          e(t)
        })
      }, bn.reject = function (t) {
        return new bn(function (e, n) {
          n(t)
        })
      }, bn.race = function (t) {
        return new bn(function (e, n) {
          if (!mn(t)) return n(new TypeError("Promise.race accepts an array"));
          for (var r = 0, o = t.length; r < o; r++) bn.resolve(t[r]).then(e, n)
        })
      }, bn._immediateFn = "function" == typeof setImmediate && function (t) {
        setImmediate(t)
      } || function (t) {
        gn(t, 0)
      }, bn._unhandledRejectionFn = function (t) {
        "undefined" != typeof console && console && console.warn("Possible Unhandled Promise Rejection:", t)
      };
      var Pn = function () {
        if ("undefined" != typeof self) return self;
        if ("undefined" != typeof window) return window;
        if ("undefined" != typeof global) return global;
        throw new Error("unable to locate global object")
      }();

      function xn(t, e) {
        return e = e || {}, new Promise(function (n, r) {
          var o = new XMLHttpRequest,
            i = [],
            c = [],
            a = {},
            u = function () {
              return {
                ok: 2 == (o.status / 100 | 0),
                statusText: o.statusText,
                status: o.status,
                url: o.responseURL,
                text: function () {
                  return Promise.resolve(o.responseText)
                },
                json: function () {
                  return Promise.resolve(JSON.parse(o.responseText))
                },
                blob: function () {
                  return Promise.resolve(new Blob([o.response]))
                },
                clone: u,
                headers: {
                  keys: function () {
                    return i
                  },
                  entries: function () {
                    return c
                  },
                  get: function (t) {
                    return a[t.toLowerCase()]
                  },
                  has: function (t) {
                    return t.toLowerCase() in a
                  }
                }
              }
            };
          for (var s in o.open(e.method || "get", t, !0), o.onload = function () {
              o.getAllResponseHeaders().replace(/^(.*?):[^\\S\\n]*([\\s\\S]*?)$/gm, function (t, e, n) {
                i.push(e = e.toLowerCase()), c.push([e, n]), a[e] = a[e] ? a[e] + "," + n : n
              }), n(u())
            }, o.onerror = r, o.withCredentials = "include" == e.credentials, e.headers) o.setRequestHeader(s, e
            .headers[s]);
          o.send(e.body || null)
        })
      }
      "Promise" in Pn ? Pn.Promise.prototype.finally || (Pn.Promise.prototype.finally = wn) : Pn.Promise = bn,
        function (t) {
          function e(t) {
            if ("utf-8" !== (t = void 0 === t ? "utf-8" : t)) throw new RangeError(
              "Failed to construct 'TextEncoder': The encoding label provided ('" + t + "') is invalid.")
          }

          function n(t, e) {
            if (e = void 0 === e ? {
                fatal: !1
              } : e, "utf-8" !== (t = void 0 === t ? "utf-8" : t)) throw new RangeError(
              "Failed to construct 'TextDecoder': The encoding label provided ('" + t + "') is invalid.");
            if (e.fatal) throw Error("Failed to construct 'TextDecoder': the 'fatal' option is unsupported.")
          }
          if (t.TextEncoder && t.TextDecoder) return !1;
          Object.defineProperty(e.prototype, "encoding", {
            value: "utf-8"
          }), e.prototype.encode = function (t, e) {
            if ((e = void 0 === e ? {
                stream: !1
              } : e).stream) throw Error("Failed to encode: the 'stream' option is unsupported.");
            e = 0;
            for (var n = t.length, r = 0, o = Math.max(32, n + (n >> 1) + 7), i = new Uint8Array(o >> 3 << 3); e <
              n;) {
              var c = t.charCodeAt(e++);
              if (55296 <= c && 56319 >= c) {
                if (e < n) {
                  var a = t.charCodeAt(e);
                  56320 == (64512 & a) && (++e, c = ((1023 & c) << 10) + (1023 & a) + 65536)
                }
                if (55296 <= c && 56319 >= c) continue
              }
              if (r + 4 > i.length && (o += 8, o = (o *= 1 + e / t.length * 2) >> 3 << 3, (a = new Uint8Array(o))
                  .set(i), i = a), 0 == (4294967168 & c)) i[r++] = c;
              else {
                if (0 == (4294965248 & c)) i[r++] = c >> 6 & 31 | 192;
                else if (0 == (4294901760 & c)) i[r++] = c >> 12 & 15 | 224, i[r++] = c >> 6 & 63 | 128;
                else {
                  if (0 != (4292870144 & c)) continue;
                  i[r++] = c >> 18 & 7 | 240, i[r++] = c >> 12 & 63 | 128, i[r++] = c >> 6 & 63 | 128
                }
                i[r++] = 63 & c | 128
              }
            }
            return i.slice(0, r)
          }, Object.defineProperty(n.prototype, "encoding", {
            value: "utf-8"
          }), Object.defineProperty(n.prototype, "fatal", {
            value: !1
          }), Object.defineProperty(n.prototype, "ignoreBOM", {
            value: !1
          }), n.prototype.decode = function (t, e) {
            if ((e = void 0 === e ? {
                stream: !1
              } : e).stream) throw Error("Failed to decode: the 'stream' option is unsupported.");
            e = 0;
            for (var n = (t = new Uint8Array(t)).length, r = []; e < n;) {
              var o = t[e++];
              if (0 === o) break;
              if (0 == (128 & o)) r.push(o);
              else if (192 == (224 & o)) {
                var i = 63 & t[e++];
                r.push((31 & o) << 6 | i)
              } else if (224 == (240 & o)) {
                i = 63 & t[e++];
                var c = 63 & t[e++];
                r.push((31 & o) << 12 | i << 6 | c)
              } else if (240 == (248 & o)) {
                65535 < (o = (7 & o) << 18 | (i = 63 & t[e++]) << 12 | (c = 63 & t[e++]) << 6 | 63 & t[e++]) && (
                  o -= 65536, r.push(o >>> 10 & 1023 | 55296), o = 56320 | 1023 & o), r.push(o)
              }
            }
            return String.fromCharCode.apply(null, r)
          }, t.TextEncoder = e, t.TextDecoder = n
        }("undefined" != typeof window ? window : i);
      var Un, Cn = {
          timeoutInSeconds: 60
        },
        kn = function (t) {
          return t.filter(function (e, n) {
            return t.indexOf(e) === n
          })
        },
        In = {
          error: "timeout",
          error_description: "Timeout"
        },
        Fn = function () {
          for (var t = [], e = 0; e < arguments.length; e++) t[e] = arguments[e];
          var n = t.filter(Boolean).join();
          return kn(n.replace(/\\s/g, ",").split(",")).join(" ").trim()
        },
        Rn = function () {
          var t = window.open("", "auth0:authorize:popup",
            "left=100,top=100,width=400,height=600,resizable,scrollbars=yes,status=1");
          if (!t) throw new Error("Could not open popup");
          return t
        },
        Dn = function (t, n, r) {
          return t.location.href = n, new Promise(function (n, o) {
            var i = setTimeout(function () {
              o(e({}, In, {
                popup: t
              }))
            }, 1e3 * (r.timeoutInSeconds || 60));
            window.addEventListener("message", function (e) {
              if (e.data && "authorization_response" === e.data.type) {
                if (clearTimeout(i), t.close(), e.data.response.error) return o(e.data.response);
                n(e.data.response)
              }
            })
          })
        },
        Ln = function () {
          var t = "0123456789ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvwxyz-_~.",
            e = "";
          return Array.from(crypto.getRandomValues(new Uint8Array(43))).forEach(function (n) {
            return e += t[n % t.length]
          }), e
        },
        Mn = function (t) {
          return btoa(t)
        },
        zn = function (t) {
          return Object.keys(t).filter(function (e) {
            return void 0 !== t[e]
          }).map(function (e) {
            return encodeURIComponent(e) + "=" + encodeURIComponent(t[e])
          }).join("&")
        },
        Nn = function (t) {
          return r(void 0, void 0, void 0, function () {
            var e;
            return o(this, function (n) {
              switch (n.label) {
                case 0:
                  return [4, Promise.resolve(window.crypto.subtle.digest({
                    name: "SHA-256"
                  }, (new TextEncoder).encode(t)))];
                case 1:
                  return (e = n.sent()).result ? [2, e.result] : [2, e]
              }
            })
          })
        },
        Bn = function (t) {
          return function (t) {
            return decodeURIComponent(atob(t).split("").map(function (t) {
              return "%" + ("00" + t.charCodeAt(0).toString(16)).slice(-2)
            }).join(""))
          }(t.replace(/_/g, "/").replace(/-/g, "+"))
        },
        Wn = function (t) {
          var e = new Uint8Array(t);
          return function (t) {
            var e = {
              "+": "-",
              "/": "_",
              "=": ""
            };
            return t.replace(/[\\+\\/=]/g, function (t) {
              return e[t]
            })
          }(window.btoa(String.fromCharCode.apply(String, Array.from(e))))
        },
        qn = function (t, e) {
          return r(void 0, void 0, void 0, function () {
            var r, i, c, a, u, s, f;
            return o(this, function (o) {
              switch (o.label) {
                case 0:
                  return [4, xn(t, e)];
                case 1:
                  return [4, (r = o.sent()).json()];
                case 2:
                  if (i = o.sent(), c = i.error, a = i.error_description, u = n(i, ["error",
                      "error_description"
                    ]), !r.ok) throw s = a || "HTTP error. Unable to fetch " + t, (f = new Error(s)).error =
                    c || "request_error", f.error_description = s, f;
                  return [2, u]
              }
            })
          })
        },
        Gn = function (t) {
          return r(void 0, void 0, void 0, function () {
            var r = t.baseUrl,
              i = n(t, ["baseUrl"]);
            return o(this, function (t) {
              switch (t.label) {
                case 0:
                  return [4, qn(r + "/oauth/token", {
                    method: "POST",
                    body: JSON.stringify(e({
                      grant_type: "authorization_code",
                      redirect_uri: window.location.origin
                    }, i)),
                    headers: {
                      "Content-type": "application/json"
                    }
                  })];
                case 1:
                  return [2, t.sent()]
              }
            })
          })
        },
        Jn = function (t) {
          return t.audience + "::" + t.scope
        },
        Hn = function () {
          function t() {
            this.cache = {}
          }
          return t.prototype.save = function (t) {
            var e = this,
              n = Jn(t);
            this.cache[n] = t;
            var r, o, i, c = (r = t.expires_in, o = t.decodedToken.claims.exp, i = (new Date(1e3 * o).getTime() - (
              new Date).getTime()) / 1e3, 1e3 * Math.min(r, i));
            setTimeout(function () {
              delete e.cache[n]
            }, c)
          }, t.prototype.get = function (t) {
            return this.cache[Jn(t)]
          }, t
        }(),
        Yn = c(function (t, e) {
          var n = i && i.__assign || Object.assign || function (t) {
            for (var e, n = 1, r = arguments.length; n < r; n++)
              for (var o in e = arguments[n]) Object.prototype.hasOwnProperty.call(e, o) && (t[o] = e[o]);
            return t
          };

          function r(t, e) {
            if (!e) return "";
            var n = "; " + t;
            return !0 === e ? n : n + "=" + e
          }

          function o(t, e, n) {
            return encodeURIComponent(t).replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent).replace(/\\(/g,
              "%28").replace(/\\)/g, "%29") + "=" + encodeURIComponent(e).replace(
              /%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent) + function (t) {
              if ("number" == typeof t.expires) {
                var e = new Date;
                e.setMilliseconds(e.getMilliseconds() + 864e5 * t.expires), t.expires = e
              }
              return r("Expires", t.expires ? t.expires.toUTCString() : "") + r("Domain", t.domain) + r("Path", t
                .path) + r("Secure", t.secure) + r("SameSite", t.sameSite)
            }(n)
          }

          function c(t) {
            for (var e = {}, n = t ? t.split("; ") : [], r = /(%[0-9A-Z]{2})+/g, o = 0; o < n.length; o++) {
              var i = n[o].split("="),
                c = i.slice(1).join("=");
              '"' === c.charAt(0) && (c = c.slice(1, -1));
              try {
                e[i[0].replace(r, decodeURIComponent)] = c.replace(r, decodeURIComponent)
              } catch (t) {}
            }
            return e
          }

          function a() {
            return c(document.cookie)
          }

          function u(t, e, r) {
            document.cookie = o(t, e, n({
              path: "/"
            }, r))
          }
          e.__esModule = !0, e.encode = o, e.parse = c, e.getAll = a, e.get = function (t) {
            return a()[t]
          }, e.set = u, e.remove = function (t, e) {
            u(t, "", n({}, e, {
              expires: -1
            }))
          }
        });
      (Un = Yn) && Un.__esModule && Object.prototype.hasOwnProperty.call(Un, "default") && Un.default;
      Yn.encode, Yn.parse;
      var Vn = Yn.getAll,
        Kn = Yn.get,
        Qn = Yn.set,
        Xn = Yn.remove,
        Zn = function () {
          return Object.keys(Vn() || {})
        },
        $n = function (t) {
          var e = Kn(t);
          if (void 0 !== e) return JSON.parse(e)
        },
        tr = function (t, e, n) {
          Qn(t, JSON.stringify(e), {
            expires: n.daysUntilExpire
          })
        },
        er = function (t) {
          Xn(t)
        },
        nr = "a0.spajs.txs.",
        rr = function (t) {
          return "" + nr + t
        },
        or = function () {
          function t() {
            var t = this;
            this.transactions = {}, Zn().filter(function (t) {
              return t.startsWith(nr)
            }).forEach(function (e) {
              var n = e.replace(nr, "");
              t.transactions[n] = $n(e)
            })
          }
          return t.prototype.create = function (t, e) {
            this.transactions[t] = e, tr(rr(t), e, {
              daysUntilExpire: 1
            })
          }, t.prototype.get = function (t) {
            return this.transactions[t]
          }, t.prototype.remove = function (t) {
            delete this.transactions[t], er(rr(t))
          }, t
        }(),
        ir = ["iss", "aud", "exp", "nbf", "iat", "jti", "azp", "nonce", "auth_time", "at_hash", "c_hash", "acr",
          "amr", "sub_jwk", "cnf", "sip_from_tag", "sip_date", "sip_callid", "sip_cseq_num", "sip_via_branch", "orig",
          "dest", "mky", "events", "toe", "txn", "rph", "sid", "vot", "vtm"
        ],
        cr = function (t) {
          var e, n, r, o, i, c, a, u, s = (e = t.id_token, n = e.split("."), r = n[0], o = n[1], i = n[2], c = JSON
            .parse(Bn(o)), a = {
              __raw: e
            }, u = {}, Object.keys(c).forEach(function (t) {
              a[t] = c[t], ir.includes(t) || (u[t] = c[t])
            }), {
              encoded: {
                header: r,
                payload: o,
                signature: i
              },
              header: JSON.parse(Bn(r)),
              claims: a,
              user: u
            });
          if (s.claims.iss !== t.iss) throw new Error("Invalid issuer");
          if (s.claims.aud !== t.aud) throw new Error("Invalid audience");
          if ("RS256" !== s.header.alg) throw new Error("Invalid algorithm");
          if (s.claims.nonce !== t.nonce) throw new Error("Invalid nonce");
          var f = new Date,
            l = new Date(0),
            p = new Date(0),
            d = new Date(0),
            h = t.leeway || 60;
          if (l.setUTCSeconds(s.claims.exp + h), p.setUTCSeconds(s.claims.iat - h), d.setUTCSeconds(s.claims.nbf - h),
            f > l) throw new Error("id_token expired");
          if (f < p) throw new Error("id_token was issued in the future (invalid iat)");
          if (void 0 !== s.claims.nbf && f < d) throw new Error("token is not yet valid (invalid notBefore)");
          return s
        },
        ar = function (e) {
          function n(t, r, o) {
            var i = e.call(this, r) || this;
            return i.error = t, i.error_description = r, i.state = o, Object.setPrototypeOf(i, n.prototype), i
          }
          return function (e, n) {
            function r() {
              this.constructor = e
            }
            t(e, n), e.prototype = null === n ? Object.create(n) : (r.prototype = n.prototype, new r)
          }(n, e), n
        }(Error),
        ur = function () {
          function t(t) {
            this.options = t, this.DEFAULT_SCOPE = "openid profile email", this.cache = new Hn, this
              .transactionManager = new or, this.domainUrl = "https://" + this.options.domain
          }
          return t.prototype._url = function (t) {
            var e = encodeURIComponent(btoa(JSON.stringify({
              name: "auth0-spa-js",
              version: "1.2.4"
            })));
            return "" + this.domainUrl + t + "&auth0Client=" + e
          }, t.prototype._getParams = function (t, r, o, i, c) {
            var a = this.options,
              u = (a.domain, a.leeway, n(a, ["domain", "leeway"]));
            return e({}, u, t, {
              scope: Fn(this.DEFAULT_SCOPE, this.options.scope, t.scope),
              response_type: "code",
              response_mode: "query",
              state: r,
              nonce: o,
              redirect_uri: c || this.options.redirect_uri,
              code_challenge: i,
              code_challenge_method: "S256"
            })
          }, t.prototype._authorizeUrl = function (t) {
            return this._url("/authorize?" + zn(t))
          }, t.prototype._verifyIdToken = function (t, e) {
            return cr({
              iss: this.domainUrl + "/",
              aud: this.options.client_id,
              id_token: t,
              nonce: e,
              leeway: this.options.leeway
            })
          }, t.prototype.loginWithPopup = function (t, i) {
            return void 0 === t && (t = {}), void 0 === i && (i = Cn), r(this, void 0, void 0, function () {
              var r, c, a, u, s, f, l, p, d, h, y, v, w;
              return o(this, function (o) {
                switch (o.label) {
                  case 0:
                    return [4, Rn()];
                  case 1:
                    return r = o.sent(), c = n(t, []), a = Mn(Ln()), u = Ln(), s = Ln(), [4, Nn(s)];
                  case 2:
                    return f = o.sent(), l = Wn(f), p = this._getParams(c, a, u, l, this.options
                      .redirect_uri || window.location.origin), d = this._authorizeUrl(e({}, p, {
                      response_mode: "web_message"
                    })), [4, Dn(r, d, i)];
                  case 3:
                    if (h = o.sent(), a !== h.state) throw new Error("Invalid state");
                    return [4, Gn({
                      baseUrl: this.domainUrl,
                      audience: t.audience || this.options.audience,
                      client_id: this.options.client_id,
                      code_verifier: s,
                      code: h.code
                    })];
                  case 4:
                    return y = o.sent(), v = this._verifyIdToken(y.id_token, u), w = e({}, y, {
                      decodedToken: v,
                      scope: p.scope,
                      audience: p.audience || "default"
                    }), this.cache.save(w), tr("auth0.is.authenticated", !0, {
                      daysUntilExpire: 1
                    }), [2]
                }
              })
            })
          }, t.prototype.getUser = function (t) {
            return void 0 === t && (t = {
              audience: this.options.audience || "default",
              scope: this.options.scope || this.DEFAULT_SCOPE
            }), r(this, void 0, void 0, function () {
              var e;
              return o(this, function (n) {
                return t.scope = Fn(this.DEFAULT_SCOPE, t.scope), [2, (e = this.cache.get(t)) && e
                  .decodedToken.user
                ]
              })
            })
          }, t.prototype.getIdTokenClaims = function (t) {
            return void 0 === t && (t = {
              audience: this.options.audience || "default",
              scope: this.options.scope || this.DEFAULT_SCOPE
            }), r(this, void 0, void 0, function () {
              var e;
              return o(this, function (n) {
                return t.scope = Fn(this.DEFAULT_SCOPE, t.scope), [2, (e = this.cache.get(t)) && e
                  .decodedToken.claims
                ]
              })
            })
          }, t.prototype.loginWithRedirect = function (t) {
            return void 0 === t && (t = {}), r(this, void 0, void 0, function () {
              var e, r, i, c, a, u, s, f, l, p;
              return o(this, function (o) {
                switch (o.label) {
                  case 0:
                    return e = t.redirect_uri, r = t.appState, i = n(t, ["redirect_uri", "appState"]), c =
                      Mn(Ln()), a = Ln(), u = Ln(), [4, Nn(u)];
                  case 1:
                    return s = o.sent(), f = Wn(s), l = this._getParams(i, c, a, f, e), p = this
                      ._authorizeUrl(l), this.transactionManager.create(c, {
                        nonce: a,
                        code_verifier: u,
                        appState: r,
                        scope: l.scope,
                        audience: l.audience || "default"
                      }), window.location.assign(p), [2]
                }
              })
            })
          }, t.prototype.handleRedirectCallback = function () {
            return r(this, void 0, void 0, function () {
              var t, n, r, i, c, a, u, s, f;
              return o(this, function (o) {
                switch (o.label) {
                  case 0:
                    if (!window.location.search) throw new Error(
                      "There are no query params available at 'window.location.search'.");
                    if (l = window.location.search.substr(1), p = l.split("&"), d = {}, p.forEach(function (
                        t) {
                        var e = t.split("="),
                          n = e[0],
                          r = e[1];
                        d[n] = decodeURIComponent(r)
                      }), t = e({}, d, {
                        expires_in: parseInt(d.expires_in)
                      }), n = t.state, r = t.code, i = t.error, c = t.error_description, i) throw new ar(i,
                      c, n);
                    if (!(a = this.transactionManager.get(n))) throw new Error("Invalid state");
                    return this.transactionManager.remove(n), [4, Gn({
                      baseUrl: this.domainUrl,
                      audience: this.options.audience,
                      client_id: this.options.client_id,
                      code_verifier: a.code_verifier,
                      code: r
                    })];
                  case 1:
                    return u = o.sent(), s = this._verifyIdToken(u.id_token, a.nonce), f = e({}, u, {
                      decodedToken: s,
                      audience: a.audience,
                      scope: a.scope
                    }), this.cache.save(f), tr("auth0.is.authenticated", !0, {
                      daysUntilExpire: 1
                    }), [2, {
                      appState: a.appState
                    }]
                }
                var l, p, d
              })
            })
          }, t.prototype.getTokenSilently = function (t) {
            return void 0 === t && (t = {
              audience: this.options.audience,
              scope: this.options.scope || this.DEFAULT_SCOPE,
              ignoreCache: !1
            }), r(this, void 0, void 0, function () {
              var n, r, i, c, a, u, s, f, l, p, d, h, y;
              return o(this, function (o) {
                switch (o.label) {
                  case 0:
                    return t.scope = Fn(this.DEFAULT_SCOPE, t.scope), !t.ignoreCache && (n = this.cache
                  .get({
                      scope: t.scope,
                      audience: t.audience || "default"
                    })) ? [2, n.access_token] : (r = Mn(Ln()), i = Ln(), c = Ln(), [4, Nn(c)]);
                  case 1:
                    return a = o.sent(), u = Wn(a), s = {
                      audience: t.audience,
                      scope: t.scope
                    }, f = this._getParams(s, r, i, u, this.options.redirect_uri || window.location
                      .origin), l = this._authorizeUrl(e({}, f, {
                      prompt: "none",
                      response_mode: "web_message"
                    })), [4, (v = l, w = this.domainUrl, new Promise(function (t, e) {
                      var n = window.document.createElement("iframe");
                      n.setAttribute("width", "0"), n.setAttribute("height", "0"), n.style.display =
                        "none";
                      var r = setTimeout(function () {
                          e(In), window.document.body.removeChild(n)
                        }, 6e4),
                        o = function (i) {
                          i.origin == w && i.data && "authorization_response" === i.data.type && (i
                            .source.close(), i.data.response.error ? e(i.data.response) : t(i.data
                              .response), clearTimeout(r), window.removeEventListener("message",
                              o, !1), window.document.body.removeChild(n))
                        };
                      window.addEventListener("message", o, !1), window.document.body.appendChild(
                        n), n.setAttribute("src", v)
                    }))];
                  case 2:
                    if (p = o.sent(), r !== p.state) throw new Error("Invalid state");
                    return [4, Gn({
                      baseUrl: this.domainUrl,
                      audience: t.audience || this.options.audience,
                      client_id: this.options.client_id,
                      code_verifier: c,
                      code: p.code
                    })];
                  case 3:
                    return d = o.sent(), h = this._verifyIdToken(d.id_token, i), y = e({}, d, {
                      decodedToken: h,
                      scope: f.scope,
                      audience: f.audience || "default"
                    }), this.cache.save(y), tr("auth0.is.authenticated", !0, {
                      daysUntilExpire: 1
                    }), [2, d.access_token]
                }
                var v, w
              })
            })
          }, t.prototype.getTokenWithPopup = function (t, e) {
            return void 0 === t && (t = {
              audience: this.options.audience,
              scope: this.options.scope || this.DEFAULT_SCOPE
            }), void 0 === e && (e = Cn), r(this, void 0, void 0, function () {
              return o(this, function (n) {
                switch (n.label) {
                  case 0:
                    return t.scope = Fn(this.DEFAULT_SCOPE, this.options.scope, t.scope), [4, this
                      .loginWithPopup(t, e)
                    ];
                  case 1:
                    return n.sent(), [2, this.cache.get({
                      scope: t.scope,
                      audience: t.audience || "default"
                    }).access_token]
                }
              })
            })
          }, t.prototype.isAuthenticated = function () {
            return r(this, void 0, void 0, function () {
              return o(this, function (t) {
                switch (t.label) {
                  case 0:
                    return [4, this.getUser()];
                  case 1:
                    return [2, !!t.sent()]
                }
              })
            })
          }, t.prototype.logout = function (t) {
            void 0 === t && (t = {}), null !== t.client_id ? t.client_id = t.client_id || this.options.client_id :
              delete t.client_id, er("auth0.is.authenticated");
            var e = t.federated,
              r = n(t, ["federated"]),
              o = e ? "&federated" : "",
              i = this._url("/v2/logout?" + zn(r));
            window.location.assign("" + i + o)
          }, t
        }();
      return function (t) {
        return r(this, void 0, void 0, function () {
          var e;
          return o(this, function (n) {
            switch (n.label) {
              case 0:
                if (!window.crypto && window.msCrypto && (window.crypto = window.msCrypto), !window.crypto)
                  throw new Error(
                    "For security reasons, 'window.crypto' is required to run 'auth0-spa-js'.");
                if (void 0 === window.crypto.subtle) throw new Error(
                  "\\n      auth0-spa-js must run on a secure origin.\\n      See https://github.com/auth0/auth0-spa-js/blob/master/FAQ.md#why-do-i-get-error-invalid-state-in-firefox-when-refreshing-the-page-immediately-after-a-login \\n      for more information.\\n    "
                  );
                if (e = new ur(t), !$n("auth0.is.authenticated")) return [2, e];
                n.label = 1;
              case 1:
                return n.trys.push([1, 3, , 4]), [4, e.getTokenSilently({
                  audience: t.audience,
                  scope: t.scope,
                  ignoreCache: !0
                })];
              case 2:
              case 3:
                return n.sent(), [3, 4];
              case 4:
                return [2, e]
            }
          })
        })
      }
    });
  </script>
  <script>
    function storageAvailable(type) {
      var storage
      try {
        storage = window[type]
        var x = '__storage_test__'
        storage.setItem(x, x)
        storage.removeItem(x)
        return true
      } catch (e) {
        return (
          e &&
          // everything except Firefox
          (e.code === 22 ||
            // Firefox
            e.code === 1014 ||
            // test name field too, because code might not be present
            // everything except Firefox
            e.name === 'QuotaExceededError' ||
            // Firefox
            e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
          // acknowledge QuotaExceededError only if there's something already stored
          storage &&
          storage.length !== 0
        )
      }
    }
    // set theme
    let theme = 'light'
    if (storageAvailable('localStorage')) {
      const torusTheme = localStorage.getItem('torus-theme')
      if (torusTheme) {
        theme = torusTheme.split('-')[0]
      }
    }

    if (theme === 'dark') {
      document.querySelector('h1.title').style.color = '#d3d3d4'
      document.querySelector('body').style.backgroundColor = '#24252A'
    }
    // broadcast-channel
    /* eslint no-param-reassign: 0 */
    var broadcastChannelLib = {};
    (function () {
      function r(e, n, t) {
        function o(i, f) {
          if (!n[i]) {
            if (!e[i]) {
              var c = 'function' == typeof require && require
              if (!f && c) return c(i, !0)
              if (u) return u(i, !0)
              var a = new Error("Cannot find module '" + i + "'")
              throw ((a.code = 'MODULE_NOT_FOUND'), a)
            }
            var p = (n[i] = {
              exports: {}
            })
            e[i][0].call(
              p.exports,
              function (r) {
                var n = e[i][1][r]
                return o(n || r)
              },
              p,
              p.exports,
              r,
              e,
              n,
              t
            )
          }
          return n[i].exports
        }
        for (var u = 'function' == typeof require && require, i = 0; i < t.length; i++) o(t[i])
        return o
      }
      return r
    })()({
        1: [function (require, module, exports) {}, {}],
        2: [
          function (require, module, exports) {
            // shim for using process in browser
            var process = (module.exports = {})

            // cached from whatever global is present so that test runners that stub it
            // don't break things.  But we need to wrap it in a try catch in case it is
            // wrapped in strict mode code which doesn't define any globals.  It's inside a
            // function because try/catches deoptimize in certain engines.

            var cachedSetTimeout
            var cachedClearTimeout

            function defaultSetTimout() {
              throw new Error('setTimeout has not been defined')
            }

            function defaultClearTimeout() {
              throw new Error('clearTimeout has not been defined')
            };
            (function () {
              try {
                if (typeof setTimeout === 'function') {
                  cachedSetTimeout = setTimeout
                } else {
                  cachedSetTimeout = defaultSetTimout
                }
              } catch (e) {
                cachedSetTimeout = defaultSetTimout
              }
              try {
                if (typeof clearTimeout === 'function') {
                  cachedClearTimeout = clearTimeout
                } else {
                  cachedClearTimeout = defaultClearTimeout
                }
              } catch (e) {
                cachedClearTimeout = defaultClearTimeout
              }
            })()

            function runTimeout(fun) {
              if (cachedSetTimeout === setTimeout) {
                //normal enviroments in sane situations
                return setTimeout(fun, 0)
              }
              // if setTimeout wasn't available but was latter defined
              if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
                cachedSetTimeout = setTimeout
                return setTimeout(fun, 0)
              }
              try {
                // when when somebody has screwed with setTimeout but no I.E. maddness
                return cachedSetTimeout(fun, 0)
              } catch (e) {
                try {
                  // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
                  return cachedSetTimeout.call(null, fun, 0)
                } catch (e) {
                  // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
                  return cachedSetTimeout.call(this, fun, 0)
                }
              }
            }

            function runClearTimeout(marker) {
              if (cachedClearTimeout === clearTimeout) {
                //normal enviroments in sane situations
                return clearTimeout(marker)
              }
              // if clearTimeout wasn't available but was latter defined
              if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
                cachedClearTimeout = clearTimeout
                return clearTimeout(marker)
              }
              try {
                // when when somebody has screwed with setTimeout but no I.E. maddness
                return cachedClearTimeout(marker)
              } catch (e) {
                try {
                  // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
                  return cachedClearTimeout.call(null, marker)
                } catch (e) {
                  // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
                  // Some versions of I.E. have different rules for clearTimeout vs setTimeout
                  return cachedClearTimeout.call(this, marker)
                }
              }
            }
            var queue = []
            var draining = false
            var currentQueue
            var queueIndex = -1

            function cleanUpNextTick() {
              if (!draining || !currentQueue) {
                return
              }
              draining = false
              if (currentQueue.length) {
                queue = currentQueue.concat(queue)
              } else {
                queueIndex = -1
              }
              if (queue.length) {
                drainQueue()
              }
            }

            function drainQueue() {
              if (draining) {
                return
              }
              var timeout = runTimeout(cleanUpNextTick)
              draining = true

              var len = queue.length
              while (len) {
                currentQueue = queue
                queue = []
                while (++queueIndex < len) {
                  if (currentQueue) {
                    currentQueue[queueIndex].run()
                  }
                }
                queueIndex = -1
                len = queue.length
              }
              currentQueue = null
              draining = false
              runClearTimeout(timeout)
            }

            process.nextTick = function (fun) {
              var args = new Array(arguments.length - 1)
              if (arguments.length > 1) {
                for (var i = 1; i < arguments.length; i++) {
                  args[i - 1] = arguments[i]
                }
              }
              queue.push(new Item(fun, args))
              if (queue.length === 1 && !draining) {
                runTimeout(drainQueue)
              }
            }

            // v8 likes predictible objects
            function Item(fun, array) {
              this.fun = fun
              this.array = array
            }
            Item.prototype.run = function () {
              this.fun.apply(null, this.array)
            }
            process.title = 'browser'
            process.browser = true
            process.env = {}
            process.argv = []
            process.version = '' // empty string to avoid regexp issues
            process.versions = {}

            function noop() {}

            process.on = noop
            process.addListener = noop
            process.once = noop
            process.off = noop
            process.removeListener = noop
            process.removeAllListeners = noop
            process.emit = noop
            process.prependListener = noop
            process.prependOnceListener = noop

            process.listeners = function (name) {
              return []
            }

            process.binding = function (name) {
              throw new Error('process.binding is not supported')
            }

            process.cwd = function () {
              return '/'
            }
            process.chdir = function (dir) {
              throw new Error('process.chdir is not supported')
            }
            process.umask = function () {
              return 0
            }
          },
          {}
        ],
        3: [
          function (require, module, exports) {
            function _interopRequireDefault(obj) {
              return obj && obj.__esModule ?
                obj :
                {
                  default: obj
                }
            }

            module.exports = _interopRequireDefault
          },
          {}
        ],
        4: [
          function (require, module, exports) {
            'use strict'

            Object.defineProperty(exports, '__esModule', {
              value: true
            })
            exports.clearNodeFolder = clearNodeFolder
            exports.enforceOptions = enforceOptions
            exports.BroadcastChannel = void 0

            var _util = require('./util.js')

            var _methodChooser = require('./method-chooser.js')

            var _options = require('./options.js')

            var BroadcastChannel = function BroadcastChannel(name, options) {
              this.name = name

              if (ENFORCED_OPTIONS) {
                options = ENFORCED_OPTIONS
              }

              this.options = (0, _options.fillOptionsWithDefaults)(options)
              this.method = (0, _methodChooser.chooseMethod)(this.options) // isListening

              this._iL = false
              /**
               * _onMessageListener
               * setting onmessage twice,
               * will overwrite the first listener
               */

              this._onML = null
              /**
               * _addEventListeners
               */

              this._addEL = {
                message: [],
                internal: []
              }
              /**
               * _beforeClose
               * array of promises that will be awaited
               * before the channel is closed
               */

              this._befC = []
              /**
               * _preparePromise
               */

              this._prepP = null

              _prepareChannel(this)
            } // STATICS

            /**
             * used to identify if someone overwrites
             * window.BroadcastChannel with this
             * See methods/native.js
             */

            exports.BroadcastChannel = BroadcastChannel
            BroadcastChannel._pubkey = true
            /**
             * clears the tmp-folder if is node
             * @return {Promise<boolean>} true if has run, false if not node
             */

            function clearNodeFolder(options) {
              options = (0, _options.fillOptionsWithDefaults)(options)
              var method = (0, _methodChooser.chooseMethod)(options)

              if (method.type === 'node') {
                return method.clearNodeFolder().then(function () {
                  return true
                })
              } else {
                return Promise.resolve(false)
              }
            }
            /**
             * if set, this method is enforced,
             * no mather what the options are
             */

            var ENFORCED_OPTIONS

            function enforceOptions(options) {
              ENFORCED_OPTIONS = options
            } // PROTOTYPE

            BroadcastChannel.prototype = {
              postMessage: function postMessage(msg) {
                if (this.closed) {
                  throw new Error('BroadcastChannel.postMessage(): ' +
                    'Cannot post message after channel has closed')
                }

                return _post(this, 'message', msg)
              },
              postInternal: function postInternal(msg) {
                return _post(this, 'internal', msg)
              },

              set onmessage(fn) {
                var time = this.method.microSeconds()
                var listenObj = {
                  time: time,
                  fn: fn
                }

                _removeListenerObject(this, 'message', this._onML)

                if (fn && typeof fn === 'function') {
                  this._onML = listenObj

                  _addListenerObject(this, 'message', listenObj)
                } else {
                  this._onML = null
                }
              },

              addEventListener: function addEventListener(type, fn) {
                var time = this.method.microSeconds()
                var listenObj = {
                  time: time,
                  fn: fn
                }

                _addListenerObject(this, type, listenObj)
              },
              removeEventListener: function removeEventListener(type, fn) {
                var obj = this._addEL[type].find(function (obj) {
                  return obj.fn === fn
                })

                _removeListenerObject(this, type, obj)
              },
              close: function close() {
                var _this = this

                if (this.closed) return
                this.closed = true
                var awaitPrepare = this._prepP ? this._prepP : Promise.resolve()
                this._onML = null
                this._addEL.message = []
                return awaitPrepare
                  .then(function () {
                    return Promise.all(
                      _this._befC.map(function (fn) {
                        return fn()
                      })
                    )
                  })
                  .then(function () {
                    return _this.method.close(_this._state)
                  })
              },

              get type() {
                return this.method.type
              }
            }

            function _post(broadcastChannel, type, msg) {
              var time = broadcastChannel.method.microSeconds()
              var msgObj = {
                time: time,
                type: type,
                data: msg
              }
              var awaitPrepare = broadcastChannel._prepP ? broadcastChannel._prepP : Promise.resolve()
              return awaitPrepare.then(function () {
                return broadcastChannel.method.postMessage(broadcastChannel._state, msgObj)
              })
            }

            function _prepareChannel(channel) {
              var maybePromise = channel.method.create(channel.name, channel.options)

              if ((0, _util.isPromise)(maybePromise)) {
                channel._prepP = maybePromise
                maybePromise.then(function (s) {
                  // used in tests to simulate slow runtime

                  /*if (channel.options.prepareDelay) {
           await new Promise(res => setTimeout(res, this.options.prepareDelay));
      }*/
                  channel._state = s
                })
              } else {
                channel._state = maybePromise
              }
            }

            function _hasMessageListeners(channel) {
              if (channel._addEL.message.length > 0) return true
              if (channel._addEL.internal.length > 0) return true
              return false
            }

            function _addListenerObject(channel, type, obj) {
              channel._addEL[type].push(obj)

              _startListening(channel)
            }

            function _removeListenerObject(channel, type, obj) {
              channel._addEL[type] = channel._addEL[type].filter(function (o) {
                return o !== obj
              })

              _stopListening(channel)
            }

            function _startListening(channel) {
              if (!channel._iL && _hasMessageListeners(channel)) {
                // someone is listening, start subscribing
                var listenerFn = function listenerFn(msgObj) {
                  channel._addEL[msgObj.type].forEach(function (obj) {
                    if (msgObj.time >= obj.time) {
                      obj.fn(msgObj.data)
                    }
                  })
                }

                var time = channel.method.microSeconds()

                if (channel._prepP) {
                  channel._prepP.then(function () {
                    channel._iL = true
                    channel.method.onMessage(channel._state, listenerFn, time)
                  })
                } else {
                  channel._iL = true
                  channel.method.onMessage(channel._state, listenerFn, time)
                }
              }
            }

            function _stopListening(channel) {
              if (channel._iL && !_hasMessageListeners(channel)) {
                // noone is listening, stop subscribing
                channel._iL = false
                var time = channel.method.microSeconds()
                channel.method.onMessage(channel._state, null, time)
              }
            }
          },
          {
            './method-chooser.js': 8,
            './options.js': 14,
            './util.js': 15
          }
        ],
        5: [
          function (require, module, exports) {
            'use strict'

            var _index = require('./index.js')

            /**
             * because babel can only export on default-attribute,
             * we use this for the non-module-build
             * this ensures that users do not have to use
             * var BroadcastChannel = require('broadcast-channel').default;
             * but
             * var BroadcastChannel = require('broadcast-channel');
             */
            module.exports = {
              BroadcastChannel: _index.BroadcastChannel,
              createLeaderElection: _index.createLeaderElection,
              clearNodeFolder: _index.clearNodeFolder,
              enforceOptions: _index.enforceOptions
            }
          },
          {
            './index.js': 6
          }
        ],
        6: [
          function (require, module, exports) {
            'use strict'

            Object.defineProperty(exports, '__esModule', {
              value: true
            })
            Object.defineProperty(exports, 'BroadcastChannel', {
              enumerable: true,
              get: function get() {
                return _broadcastChannel.BroadcastChannel
              }
            })
            Object.defineProperty(exports, 'clearNodeFolder', {
              enumerable: true,
              get: function get() {
                return _broadcastChannel.clearNodeFolder
              }
            })
            Object.defineProperty(exports, 'enforceOptions', {
              enumerable: true,
              get: function get() {
                return _broadcastChannel.enforceOptions
              }
            })
            Object.defineProperty(exports, 'createLeaderElection', {
              enumerable: true,
              get: function get() {
                return _leaderElection.createLeaderElection
              }
            })

            var _broadcastChannel = require('./broadcast-channel')

            var _leaderElection = require('./leader-election')
          },
          {
            './broadcast-channel': 4,
            './leader-election': 7
          }
        ],
        7: [
          function (require, module, exports) {
            'use strict'

            var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault')

            Object.defineProperty(exports, '__esModule', {
              value: true
            })
            exports.createLeaderElection = createLeaderElection

            var _util = require('./util.js')

            var _unload = _interopRequireDefault(require('unload'))

            var LeaderElection = function LeaderElection(channel, options) {
              this._channel = channel
              this._options = options
              this.isLeader = false
              this.isDead = false
              this.token = (0, _util.randomToken)()
              this._isApl = false // _isApplying

              this._reApply = false // things to clean up

              this._unl = [] // _unloads

              this._lstns = [] // _listeners

              this._invs = [] // _intervals
            }

            LeaderElection.prototype = {
              applyOnce: function applyOnce() {
                var _this = this

                if (this.isLeader) return Promise.resolve(false)
                if (this.isDead) return Promise.resolve(false) // do nothing if already running

                if (this._isApl) {
                  this._reApply = true
                  return Promise.resolve(false)
                }

                this._isApl = true
                var stopCriteria = false
                var recieved = []

                var handleMessage = function handleMessage(msg) {
                  if (msg.context === 'leader' && msg.token != _this.token) {
                    recieved.push(msg)

                    if (msg.action === 'apply') {
                      // other is applying
                      if (msg.token > _this.token) {
                        // other has higher token, stop applying
                        stopCriteria = true
                      }
                    }

                    if (msg.action === 'tell') {
                      // other is already leader
                      stopCriteria = true
                    }
                  }
                }

                this._channel.addEventListener('internal', handleMessage)

                var ret = _sendMessage(this, 'apply') // send out that this one is applying
                  .then(function () {
                    return (0, _util.sleep)(_this._options.responseTime)
                  }) // let others time to respond
                  .then(function () {
                    if (stopCriteria) return Promise.reject(new Error())
                    else return _sendMessage(_this, 'apply')
                  })
                  .then(function () {
                    return (0, _util.sleep)(_this._options.responseTime)
                  }) // let others time to respond
                  .then(function () {
                    if (stopCriteria) return Promise.reject(new Error())
                    else return _sendMessage(_this)
                  })
                  .then(function () {
                    return _beLeader(_this)
                  }) // no one disagreed -> this one is now leader
                  .then(function () {
                    return true
                  })['catch'](function () {
                    return false
                  }) // apply not successfull
                  .then(function (success) {
                    _this._channel.removeEventListener('internal', handleMessage)

                    _this._isApl = false

                    if (!success && _this._reApply) {
                      _this._reApply = false
                      return _this.applyOnce()
                    } else return success
                  })

                return ret
              },
              awaitLeadership: function awaitLeadership() {
                if (
                  /* _awaitLeadershipPromise */
                  !this._aLP
                ) {
                  this._aLP = _awaitLeadershipOnce(this)
                }

                return this._aLP
              },
              die: function die() {
                var _this2 = this

                if (this.isDead) return
                this.isDead = true

                this._lstns.forEach(function (listener) {
                  return _this2._channel.removeEventListener('internal', listener)
                })

                this._invs.forEach(function (interval) {
                  return clearInterval(interval)
                })

                this._unl.forEach(function (uFn) {
                  uFn.remove()
                })

                return _sendMessage(this, 'death')
              }
            }

            function _awaitLeadershipOnce(leaderElector) {
              if (leaderElector.isLeader) return Promise.resolve()
              return new Promise(function (res) {
                var resolved = false

                var finish = function finish() {
                  if (resolved) return
                  resolved = true
                  clearInterval(interval)

                  leaderElector._channel.removeEventListener('internal', whenDeathListener)

                  res(true)
                } // try once now

                leaderElector.applyOnce().then(function () {
                  if (leaderElector.isLeader) finish()
                }) // try on fallbackInterval

                var interval = setInterval(function () {
                  leaderElector.applyOnce().then(function () {
                    if (leaderElector.isLeader) finish()
                  })
                }, leaderElector._options.fallbackInterval)

                leaderElector._invs.push(interval) // try when other leader dies

                var whenDeathListener = function whenDeathListener(msg) {
                  if (msg.context === 'leader' && msg.action === 'death') {
                    leaderElector.applyOnce().then(function () {
                      if (leaderElector.isLeader) finish()
                    })
                  }
                }

                leaderElector._channel.addEventListener('internal', whenDeathListener)

                leaderElector._lstns.push(whenDeathListener)
              })
            }
            /**
             * sends and internal message over the broadcast-channel
             */

            function _sendMessage(leaderElector, action) {
              var msgJson = {
                context: 'leader',
                action: action,
                token: leaderElector.token
              }
              return leaderElector._channel.postInternal(msgJson)
            }

            function _beLeader(leaderElector) {
              leaderElector.isLeader = true

              var unloadFn = _unload['default'].add(function () {
                return leaderElector.die()
              })

              leaderElector._unl.push(unloadFn)

              var isLeaderListener = function isLeaderListener(msg) {
                if (msg.context === 'leader' && msg.action === 'apply') {
                  _sendMessage(leaderElector, 'tell')
                }
              }

              leaderElector._channel.addEventListener('internal', isLeaderListener)

              leaderElector._lstns.push(isLeaderListener)

              return _sendMessage(leaderElector, 'tell')
            }

            function fillOptionsWithDefaults(options, channel) {
              if (!options) options = {}
              options = JSON.parse(JSON.stringify(options))

              if (!options.fallbackInterval) {
                options.fallbackInterval = 3000
              }

              if (!options.responseTime) {
                options.responseTime = channel.method.averageResponseTime(channel.options)
              }

              return options
            }

            function createLeaderElection(channel, options) {
              if (channel._leaderElector) {
                throw new Error('BroadcastChannel already has a leader-elector')
              }

              options = fillOptionsWithDefaults(options, channel)
              var elector = new LeaderElection(channel, options)

              channel._befC.push(function () {
                return elector.die()
              })

              channel._leaderElector = elector
              return elector
            }
          },
          {
            './util.js': 15,
            '@babel/runtime/helpers/interopRequireDefault': 3,
            unload: 18
          }
        ],
        8: [
          function (require, module, exports) {
            'use strict'

            var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault')

            Object.defineProperty(exports, '__esModule', {
              value: true
            })
            exports.chooseMethod = chooseMethod

            var _native = _interopRequireDefault(require('./methods/native.js'))

            var _indexedDb = _interopRequireDefault(require('./methods/indexed-db.js'))

            var _localstorage = _interopRequireDefault(require('./methods/localstorage.js'))

            var _simulate = _interopRequireDefault(require('./methods/simulate.js'))

            var _util = require('./util')

            // order is important
            var METHODS = [
              _native['default'], // fastest
              _indexedDb['default'],
              _localstorage['default']
            ]
            /**
             * The NodeMethod is loaded lazy
             * so it will not get bundled in browser-builds
             */

            if (_util.isNode) {
              /**
               * we use the non-transpiled code for nodejs
               * because it runs faster
               */
              var NodeMethod = require('../../src/methods/' + // use this hack so that browserify and others
                // do not import the node-method by default
                // when bundling.
                'node.js')
              /**
               * this will be false for webpackbuilds
               * which will shim the node-method with an empty object {}
               */

              if (typeof NodeMethod.canBeUsed === 'function') {
                METHODS.push(NodeMethod)
              }
            }

            function chooseMethod(options) {
              var chooseMethods = [].concat(options.methods, METHODS).filter(Boolean) // directly chosen

              if (options.type) {
                if (options.type === 'simulate') {
                  // only use simulate-method if directly chosen
                  return _simulate['default']
                }

                var ret = chooseMethods.find(function (m) {
                  return m.type === options.type
                })
                if (!ret) throw new Error('method-type ' + options.type + ' not found')
                else return ret
              }
              /**
               * if no webworker support is needed,
               * remove idb from the list so that localstorage is been chosen
               */

              if (!options.webWorkerSupport && !_util.isNode) {
                chooseMethods = chooseMethods.filter(function (m) {
                  return m.type !== 'idb'
                })
              }

              var useMethod = chooseMethods.find(function (method) {
                return method.canBeUsed()
              })
              if (!useMethod)
                throw new Error(
                  'No useable methode found:' +
                  JSON.stringify(
                    METHODS.map(function (m) {
                      return m.type
                    })
                  )
                )
              else return useMethod
            }
          },
          {
            './methods/indexed-db.js': 9,
            './methods/localstorage.js': 10,
            './methods/native.js': 11,
            './methods/simulate.js': 12,
            './util': 15,
            '@babel/runtime/helpers/interopRequireDefault': 3
          }
        ],
        9: [
          function (require, module, exports) {
            'use strict'

            var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault')

            Object.defineProperty(exports, '__esModule', {
              value: true
            })
            exports.getIdb = getIdb
            exports.createDatabase = createDatabase
            exports.writeMessage = writeMessage
            exports.getAllMessages = getAllMessages
            exports.getMessagesHigherThen = getMessagesHigherThen
            exports.removeMessageById = removeMessageById
            exports.getOldMessages = getOldMessages
            exports.cleanOldMessages = cleanOldMessages
            exports.create = create
            exports.close = close
            exports.postMessage = postMessage
            exports.onMessage = onMessage
            exports.canBeUsed = canBeUsed
            exports.averageResponseTime = averageResponseTime
            exports['default'] = exports.type = exports.microSeconds = void 0

            var _util = require('../util.js')

            var _obliviousSet = _interopRequireDefault(require('../oblivious-set'))

            var _options = require('../options')

            /**
             * this method uses indexeddb to store the messages
             * There is currently no observerAPI for idb
             * @link https://github.com/w3c/IndexedDB/issues/51
             */
            var microSeconds = _util.microSeconds
            exports.microSeconds = microSeconds
            var DB_PREFIX = 'pubkey.broadcast-channel-0-'
            var OBJECT_STORE_ID = 'messages'
            var type = 'idb'
            exports.type = type

            function getIdb() {
              if (typeof indexedDB !== 'undefined') return indexedDB
              if (typeof window.mozIndexedDB !== 'undefined') return window.mozIndexedDB
              if (typeof window.webkitIndexedDB !== 'undefined') return window.webkitIndexedDB
              if (typeof window.msIndexedDB !== 'undefined') return window.msIndexedDB
              return false
            }

            function createDatabase(channelName) {
              var IndexedDB = getIdb() // create table

              var dbName = DB_PREFIX + channelName
              var openRequest = IndexedDB.open(dbName, 1)

              openRequest.onupgradeneeded = function (ev) {
                var db = ev.target.result
                db.createObjectStore(OBJECT_STORE_ID, {
                  keyPath: 'id',
                  autoIncrement: true
                })
              }

              var dbPromise = new Promise(function (res, rej) {
                openRequest.onerror = function (ev) {
                  return rej(ev)
                }

                openRequest.onsuccess = function () {
                  res(openRequest.result)
                }
              })
              return dbPromise
            }
            /**
             * writes the new message to the database
             * so other readers can find it
             */

            function writeMessage(db, readerUuid, messageJson) {
              var time = new Date().getTime()
              var writeObject = {
                uuid: readerUuid,
                time: time,
                data: messageJson
              }
              var transaction = db.transaction([OBJECT_STORE_ID], 'readwrite')
              return new Promise(function (res, rej) {
                transaction.oncomplete = function () {
                  return res()
                }

                transaction.onerror = function (ev) {
                  return rej(ev)
                }

                var objectStore = transaction.objectStore(OBJECT_STORE_ID)
                objectStore.add(writeObject)
              })
            }

            function getAllMessages(db) {
              var objectStore = db.transaction(OBJECT_STORE_ID).objectStore(OBJECT_STORE_ID)
              var ret = []
              return new Promise(function (res) {
                objectStore.openCursor().onsuccess = function (ev) {
                  var cursor = ev.target.result

                  if (cursor) {
                    ret.push(cursor.value) //alert("Name for SSN " + cursor.key + " is " + cursor.value.name);

                    cursor['continue']()
                  } else {
                    res(ret)
                  }
                }
              })
            }

            function getMessagesHigherThen(db, lastCursorId) {
              var objectStore = db.transaction(OBJECT_STORE_ID).objectStore(OBJECT_STORE_ID)
              var ret = []
              var keyRangeValue = IDBKeyRange.bound(lastCursorId + 1, Infinity)
              return new Promise(function (res) {
                objectStore.openCursor(keyRangeValue).onsuccess = function (ev) {
                  var cursor = ev.target.result

                  if (cursor) {
                    ret.push(cursor.value)
                    cursor['continue']()
                  } else {
                    res(ret)
                  }
                }
              })
            }

            function removeMessageById(db, id) {
              var request = db
                .transaction([OBJECT_STORE_ID], 'readwrite')
                .objectStore(OBJECT_STORE_ID)['delete'](id)
              return new Promise(function (res) {
                request.onsuccess = function () {
                  return res()
                }
              })
            }

            function getOldMessages(db, ttl) {
              var olderThen = new Date().getTime() - ttl
              var objectStore = db.transaction(OBJECT_STORE_ID).objectStore(OBJECT_STORE_ID)
              var ret = []
              return new Promise(function (res) {
                objectStore.openCursor().onsuccess = function (ev) {
                  var cursor = ev.target.result

                  if (cursor) {
                    var msgObk = cursor.value

                    if (msgObk.time < olderThen) {
                      ret.push(msgObk) //alert("Name for SSN " + cursor.key + " is " + cursor.value.name);

                      cursor['continue']()
                    } else {
                      // no more old messages,
                      res(ret)
                      return
                    }
                  } else {
                    res(ret)
                  }
                }
              })
            }

            function cleanOldMessages(db, ttl) {
              return getOldMessages(db, ttl).then(function (tooOld) {
                return Promise.all(
                  tooOld.map(function (msgObj) {
                    return removeMessageById(db, msgObj.id)
                  })
                )
              })
            }

            function create(channelName, options) {
              options = (0, _options.fillOptionsWithDefaults)(options)
              return createDatabase(channelName).then(function (db) {
                var state = {
                  closed: false,
                  lastCursorId: 0,
                  channelName: channelName,
                  options: options,
                  uuid: (0, _util.randomToken)(),

                  /**
                   * emittedMessagesIds
                   * contains all messages that have been emitted before
                   * @type {ObliviousSet}
                   */
                  eMIs: new _obliviousSet['default'](options.idb.ttl * 2),
                  // ensures we do not read messages in parrallel
                  writeBlockPromise: Promise.resolve(),
                  messagesCallback: null,
                  readQueuePromises: [],
                  db: db
                }
                /**
                 * if service-workers are used,
                 * we have no 'storage'-event if they post a message,
                 * therefore we also have to set an interval
                 */

                _readLoop(state)

                return state
              })
            }

            function _readLoop(state) {
              if (state.closed) return
              return readNewMessages(state)
                .then(function () {
                  return (0, _util.sleep)(state.options.idb.fallbackInterval)
                })
                .then(function () {
                  return _readLoop(state)
                })
            }

            function _filterMessage(msgObj, state) {
              if (msgObj.uuid === state.uuid) return false // send by own

              if (state.eMIs.has(msgObj.id)) return false // already emitted

              if (msgObj.data.time < state.messagesCallbackTime) return false // older then onMessageCallback

              return true
            }
            /**
             * reads all new messages from the database and emits them
             */

            function readNewMessages(state) {
              // channel already closed
              if (state.closed) return Promise
              .resolve() // if no one is listening, we do not need to scan for new messages

              if (!state.messagesCallback) return Promise.resolve()
              return getMessagesHigherThen(state.db, state.lastCursorId).then(function (newerMessages) {
                var useMessages = newerMessages
                  /**
                   * there is a bug in iOS where the msgObj can be undefined some times
                   * so we filter them out
                   * @link https://github.com/pubkey/broadcast-channel/issues/19
                   */
                  .filter(function (msgObj) {
                    return !!msgObj
                  })
                  .map(function (msgObj) {
                    if (msgObj.id > state.lastCursorId) {
                      state.lastCursorId = msgObj.id
                    }

                    return msgObj
                  })
                  .filter(function (msgObj) {
                    return _filterMessage(msgObj, state)
                  })
                  .sort(function (msgObjA, msgObjB) {
                    return msgObjA.time - msgObjB.time
                  }) // sort by time

                useMessages.forEach(function (msgObj) {
                  if (state.messagesCallback) {
                    state.eMIs.add(msgObj.id)
                    state.messagesCallback(msgObj.data)
                  }
                })
                return Promise.resolve()
              })
            }

            function close(channelState) {
              channelState.closed = true
              channelState.db.close()
            }

            function postMessage(channelState, messageJson) {
              channelState.writeBlockPromise = channelState.writeBlockPromise
                .then(function () {
                  return writeMessage(channelState.db, channelState.uuid, messageJson)
                })
                .then(function () {
                  if ((0, _util.randomInt)(0, 10) === 0) {
                    /* await (do not await) */
                    cleanOldMessages(channelState.db, channelState.options.idb.ttl)
                  }
                })
              return channelState.writeBlockPromise
            }

            function onMessage(channelState, fn, time) {
              channelState.messagesCallbackTime = time
              channelState.messagesCallback = fn
              readNewMessages(channelState)
            }

            function canBeUsed() {
              if (_util.isNode) return false
              var idb = getIdb()
              if (!idb) return false
              return true
            }

            function averageResponseTime(options) {
              return options.idb.fallbackInterval * 2
            }

            var _default = {
              create: create,
              close: close,
              onMessage: onMessage,
              postMessage: postMessage,
              canBeUsed: canBeUsed,
              type: type,
              averageResponseTime: averageResponseTime,
              microSeconds: microSeconds
            }
            exports['default'] = _default
          },
          {
            '../oblivious-set': 13,
            '../options': 14,
            '../util.js': 15,
            '@babel/runtime/helpers/interopRequireDefault': 3
          }
        ],
        10: [
          function (require, module, exports) {
            'use strict'

            var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault')

            Object.defineProperty(exports, '__esModule', {
              value: true
            })
            exports.getLocalStorage = getLocalStorage
            exports.storageKey = storageKey
            exports.postMessage = postMessage
            exports.addStorageEventListener = addStorageEventListener
            exports.removeStorageEventListener = removeStorageEventListener
            exports.create = create
            exports.close = close
            exports.onMessage = onMessage
            exports.canBeUsed = canBeUsed
            exports.averageResponseTime = averageResponseTime
            exports['default'] = exports.type = exports.microSeconds = void 0

            var _obliviousSet = _interopRequireDefault(require('../oblivious-set'))

            var _options = require('../options')

            var _util = require('../util')

            /**
             * A localStorage-only method which uses localstorage and its 'storage'-event
             * This does not work inside of webworkers because they have no access to locastorage
             * This is basically implemented to support IE9 or your grandmothers toaster.
             * @link https://caniuse.com/#feat=namevalue-storage
             * @link https://caniuse.com/#feat=indexeddb
             */
            var microSeconds = _util.microSeconds
            exports.microSeconds = microSeconds
            var KEY_PREFIX = 'pubkey.broadcastChannel-'
            var type = 'localstorage'
            /**
             * copied from crosstab
             * @link https://github.com/tejacques/crosstab/blob/master/src/crosstab.js#L32
             */

            exports.type = type

            function getLocalStorage() {
              var localStorage
              if (typeof window === 'undefined') return null

              try {
                localStorage = window.localStorage
                localStorage = window['ie8-eventlistener/storage'] || window.localStorage
              } catch (e) {
                // New versions of Firefox throw a Security exception
                // if cookies are disabled. See
                // https://bugzilla.mozilla.org/show_bug.cgi?id=1028153
              }

              return localStorage
            }

            function storageKey(channelName) {
              return KEY_PREFIX + channelName
            }
            /**
             * writes the new message to the storage
             * and fires the storage-event so other readers can find it
             */

            function postMessage(channelState, messageJson) {
              return new Promise(function (res) {
                ;
                (0, _util.sleep)().then(function () {
                  var key = storageKey(channelState.channelName)
                  var writeObj = {
                    token: (0, _util.randomToken)(),
                    time: new Date().getTime(),
                    data: messageJson,
                    uuid: channelState.uuid
                  }
                  var value = JSON.stringify(writeObj)
                  getLocalStorage().setItem(key, value)
                  /**
                   * StorageEvent does not fire the 'storage' event
                   * in the window that changes the state of the local storage.
                   * So we fire it manually
                   */

                  var ev = document.createEvent('Event')
                  ev.initEvent('storage', true, true)
                  ev.key = key
                  ev.newValue = value
                  window.dispatchEvent(ev)
                  res()
                })
              })
            }

            function addStorageEventListener(channelName, fn) {
              var key = storageKey(channelName)

              var listener = function listener(ev) {
                if (ev.key === key) {
                  fn(JSON.parse(ev.newValue))
                }
              }

              window.addEventListener('storage', listener)
              return listener
            }

            function removeStorageEventListener(listener) {
              window.removeEventListener('storage', listener)
            }

            function create(channelName, options) {
              options = (0, _options.fillOptionsWithDefaults)(options)

              if (!canBeUsed()) {
                throw new Error('BroadcastChannel: localstorage cannot be used')
              }

              var uuid = (0, _util.randomToken)()
              /**
               * eMIs
               * contains all messages that have been emitted before
               * @type {ObliviousSet}
               */

              var eMIs = new _obliviousSet['default'](options.localstorage.removeTimeout)
              var state = {
                channelName: channelName,
                uuid: uuid,
                eMIs: eMIs // emittedMessagesIds
              }
              state.listener = addStorageEventListener(channelName, function (msgObj) {
                if (!state.messagesCallback) return // no listener

                if (msgObj.uuid === uuid) return // own message

                if (!msgObj.token || eMIs.has(msgObj.token)) return // already emitted

                if (msgObj.data.time && msgObj.data.time < state.messagesCallbackTime) return // too old

                eMIs.add(msgObj.token)
                state.messagesCallback(msgObj.data)
              })
              return state
            }

            function close(channelState) {
              removeStorageEventListener(channelState.listener)
            }

            function onMessage(channelState, fn, time) {
              channelState.messagesCallbackTime = time
              channelState.messagesCallback = fn
            }

            function canBeUsed() {
              if (_util.isNode) return false
              var ls = getLocalStorage()
              if (!ls) return false

              try {
                var key = '__broadcastchannel_check'
                ls.setItem(key, 'works')
                ls.removeItem(key)
              } catch (e) {
                // Safari 10 in private mode will not allow write access to local
                // storage and fail with a QuotaExceededError. See
                // https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API#Private_Browsing_Incognito_modes
                return false
              }

              return true
            }

            function averageResponseTime() {
              var defaultTime = 120
              var userAgent = navigator.userAgent.toLowerCase()

              if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
                // safari is much slower so this time is higher
                return defaultTime * 2
              }

              return defaultTime
            }

            var _default = {
              create: create,
              close: close,
              onMessage: onMessage,
              postMessage: postMessage,
              canBeUsed: canBeUsed,
              type: type,
              averageResponseTime: averageResponseTime,
              microSeconds: microSeconds
            }
            exports['default'] = _default
          },
          {
            '../oblivious-set': 13,
            '../options': 14,
            '../util': 15,
            '@babel/runtime/helpers/interopRequireDefault': 3
          }
        ],
        11: [
          function (require, module, exports) {
            'use strict'

            Object.defineProperty(exports, '__esModule', {
              value: true
            })
            exports.create = create
            exports.close = close
            exports.postMessage = postMessage
            exports.onMessage = onMessage
            exports.canBeUsed = canBeUsed
            exports.averageResponseTime = averageResponseTime
            exports['default'] = exports.type = exports.microSeconds = void 0

            var _util = require('../util')

            var microSeconds = _util.microSeconds
            exports.microSeconds = microSeconds
            var type = 'native'
            exports.type = type

            function create(channelName) {
              var state = {
                messagesCallback: null,
                bc: new BroadcastChannel(channelName),
                subFns: [] // subscriberFunctions
              }

              state.bc.onmessage = function (msg) {
                if (state.messagesCallback) {
                  state.messagesCallback(msg.data)
                }
              }

              return state
            }

            function close(channelState) {
              channelState.bc.close()
              channelState.subFns = []
            }

            function postMessage(channelState, messageJson) {
              channelState.bc.postMessage(messageJson, false)
            }

            function onMessage(channelState, fn) {
              channelState.messagesCallback = fn
            }

            function canBeUsed() {
              /**
               * in the electron-renderer, isNode will be true even if we are in browser-context
               * so we also check if window is undefined
               */
              if (_util.isNode && typeof window === 'undefined') return false

              if (typeof BroadcastChannel === 'function') {
                if (BroadcastChannel._pubkey) {
                  throw new Error(
                    'BroadcastChannel: Do not overwrite window.BroadcastChannel with this module, this is not a polyfill'
                    )
                }

                return true
              } else return false
            }

            function averageResponseTime() {
              return 150
            }

            var _default = {
              create: create,
              close: close,
              onMessage: onMessage,
              postMessage: postMessage,
              canBeUsed: canBeUsed,
              type: type,
              averageResponseTime: averageResponseTime,
              microSeconds: microSeconds
            }
            exports['default'] = _default
          },
          {
            '../util': 15
          }
        ],
        12: [
          function (require, module, exports) {
            'use strict'

            Object.defineProperty(exports, '__esModule', {
              value: true
            })
            exports.create = create
            exports.close = close
            exports.postMessage = postMessage
            exports.onMessage = onMessage
            exports.canBeUsed = canBeUsed
            exports.averageResponseTime = averageResponseTime
            exports['default'] = exports.type = exports.microSeconds = void 0

            var _util = require('../util')

            var microSeconds = _util.microSeconds
            exports.microSeconds = microSeconds
            var type = 'simulate'
            exports.type = type
            var SIMULATE_CHANNELS = new Set()

            function create(channelName) {
              var state = {
                name: channelName,
                messagesCallback: null
              }
              SIMULATE_CHANNELS.add(state)
              return state
            }

            function close(channelState) {
              SIMULATE_CHANNELS['delete'](channelState)
            }

            function postMessage(channelState, messageJson) {
              return new Promise(function (res) {
                return setTimeout(function () {
                  var channelArray = Array.from(SIMULATE_CHANNELS)
                  channelArray
                    .filter(function (channel) {
                      return channel.name === channelState.name
                    })
                    .filter(function (channel) {
                      return channel !== channelState
                    })
                    .filter(function (channel) {
                      return !!channel.messagesCallback
                    })
                    .forEach(function (channel) {
                      return channel.messagesCallback(messageJson)
                    })
                  res()
                }, 5)
              })
            }

            function onMessage(channelState, fn) {
              channelState.messagesCallback = fn
            }

            function canBeUsed() {
              return true
            }

            function averageResponseTime() {
              return 5
            }

            var _default = {
              create: create,
              close: close,
              onMessage: onMessage,
              postMessage: postMessage,
              canBeUsed: canBeUsed,
              type: type,
              averageResponseTime: averageResponseTime,
              microSeconds: microSeconds
            }
            exports['default'] = _default
          },
          {
            '../util': 15
          }
        ],
        13: [
          function (require, module, exports) {
            'use strict'

            Object.defineProperty(exports, '__esModule', {
              value: true
            })
            exports['default'] = void 0

            /**
             * this is a set which automatically forgets
             * a given entry when a new entry is set and the ttl
             * of the old one is over
             * @constructor
             */
            var ObliviousSet = function ObliviousSet(ttl) {
              var set = new Set()
              var timeMap = new Map()
              this.has = set.has.bind(set)

              this.add = function (value) {
                timeMap.set(value, now())
                set.add(value)

                _removeTooOldValues()
              }

              this.clear = function () {
                set.clear()
                timeMap.clear()
              }

              function _removeTooOldValues() {
                var olderThen = now() - ttl
                var iterator = set[Symbol.iterator]()

                while (true) {
                  var value = iterator.next().value
                  if (!value) return // no more elements

                  var time = timeMap.get(value)

                  if (time < olderThen) {
                    timeMap['delete'](value)
                    set['delete'](value)
                  } else {
                    // we reached a value that is not old enough
                    return
                  }
                }
              }
            }

            function now() {
              return new Date().getTime()
            }

            var _default = ObliviousSet
            exports['default'] = _default
          },
          {}
        ],
        14: [
          function (require, module, exports) {
            'use strict'

            Object.defineProperty(exports, '__esModule', {
              value: true
            })
            exports.fillOptionsWithDefaults = fillOptionsWithDefaults

            function fillOptionsWithDefaults() {
              var originalOptions = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {}
              var options = JSON.parse(JSON.stringify(originalOptions)) // main

              if (typeof options.webWorkerSupport === 'undefined') options.webWorkerSupport = true // indexed-db

              if (!options.idb) options.idb = {} //  after this time the messages get deleted

              if (!options.idb.ttl) options.idb.ttl = 1000 * 45
              if (!options.idb.fallbackInterval) options.idb.fallbackInterval = 150 // localstorage

              if (!options.localstorage) options.localstorage = {}
              if (!options.localstorage.removeTimeout) options.localstorage.removeTimeout = 1000 *
                60 // custom methods

              if (originalOptions.methods) options.methods = originalOptions.methods // node

              if (!options.node) options.node = {}
              if (!options.node.ttl) options.node.ttl = 1000 * 60 * 2 // 2 minutes;

              if (typeof options.node.useFastPath === 'undefined') options.node.useFastPath = true
              return options
            }
          },
          {}
        ],
        15: [
          function (require, module, exports) {
            ;
            (function (process) {
              'use strict'

              Object.defineProperty(exports, '__esModule', {
                value: true
              })
              exports.isPromise = isPromise
              exports.sleep = sleep
              exports.randomInt = randomInt
              exports.randomToken = randomToken
              exports.microSeconds = microSeconds
              exports.isNode = void 0

              /**
               * returns true if the given object is a promise
               */
              function isPromise(obj) {
                if (obj && typeof obj.then === 'function') {
                  return true
                } else {
                  return false
                }
              }

              function sleep(time) {
                if (!time) time = 0
                return new Promise(function (res) {
                  return setTimeout(res, time)
                })
              }

              function randomInt(min, max) {
                return Math.floor(Math.random() * (max - min + 1) + min)
              }
              /**
               * https://stackoverflow.com/a/8084248
               */

              function randomToken() {
                return Math.random()
                  .toString(36)
                  .substring(2)
              }

              var lastMs = 0
              var additional = 0
              /**
               * returns the current time in micro-seconds,
               * WARNING: This is a pseudo-function
               * Performance.now is not reliable in webworkers, so we just make sure to never return the same time.
               * This is enough in browsers, and this function will not be used in nodejs.
               * The main reason for this hack is to ensure that BroadcastChannel behaves equal to production when it is used in fast-running unit tests.
               */

              function microSeconds() {
                var ms = new Date().getTime()

                if (ms === lastMs) {
                  additional++
                  return ms * 1000 + additional
                } else {
                  lastMs = ms
                  additional = 0
                  return ms * 1000
                }
              }
              /**
               * copied from the 'detect-node' npm module
               * We cannot use the module directly because it causes problems with rollup
               * @link https://github.com/iliakan/detect-node/blob/master/index.js
               */

              var isNode = Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) ===
                '[object process]'
              exports.isNode = isNode
            }.call(this, require('_process')))
          },
          {
            _process: 2
          }
        ],
        16: [
          function (require, module, exports) {
            module.exports = false
          },
          {}
        ],
        17: [
          function (require, module, exports) {
            'use strict'

            Object.defineProperty(exports, '__esModule', {
              value: true
            })
            exports['default'] = void 0

            /* global WorkerGlobalScope */
            function add(fn) {
              if (typeof WorkerGlobalScope === 'function' && self instanceof WorkerGlobalScope) {
                // this is run inside of a webworker
              } else {
                /**
                 * if we are on react-native, there is no window.addEventListener
                 * @link https://github.com/pubkey/unload/issues/6
                 */
                if (typeof window.addEventListener !== 'function') return
                /**
                 * for normal browser-windows, we use the beforeunload-event
                 */

                window.addEventListener(
                  'beforeunload',
                  function () {
                    fn()
                  },
                  true
                )
                /**
                 * for iframes, we have to use the unload-event
                 * @link https://stackoverflow.com/q/47533670/3443137
                 */

                window.addEventListener(
                  'unload',
                  function () {
                    fn()
                  },
                  true
                )
              }
              /**
               * TODO add fallback for safari-mobile
               * @link https://stackoverflow.com/a/26193516/3443137
               */
            }

            var _default = {
              add: add
            }
            exports['default'] = _default
          },
          {}
        ],
        18: [
          function (require, module, exports) {
            'use strict'

            var _interopRequireDefault = require('@babel/runtime/helpers/interopRequireDefault')

            Object.defineProperty(exports, '__esModule', {
              value: true
            })
            exports.add = add
            exports.runAll = runAll
            exports.removeAll = removeAll
            exports.getSize = getSize
            exports['default'] = void 0

            var _detectNode = _interopRequireDefault(require('detect-node'))

            var _browser = _interopRequireDefault(require('./browser.js'))

            var _node = _interopRequireDefault(require('./node.js'))

            var USE_METHOD = _detectNode['default'] ? _node['default'] : _browser['default']
            var LISTENERS = new Set()
            var startedListening = false

            function startListening() {
              if (startedListening) return
              startedListening = true
              USE_METHOD.add(runAll)
            }

            function add(fn) {
              startListening()
              if (typeof fn !== 'function') throw new Error('Listener is no function')
              LISTENERS.add(fn)
              var addReturn = {
                remove: function remove() {
                  return LISTENERS['delete'](fn)
                },
                run: function run() {
                  LISTENERS['delete'](fn)
                  return fn()
                }
              }
              return addReturn
            }

            function runAll() {
              var promises = []
              LISTENERS.forEach(function (fn) {
                promises.push(fn())
                LISTENERS['delete'](fn)
              })
              return Promise.all(promises)
            }

            function removeAll() {
              LISTENERS.clear()
            }

            function getSize() {
              return LISTENERS.size
            }

            var _default = {
              add: add,
              runAll: runAll,
              removeAll: removeAll,
              getSize: getSize
            }
            exports['default'] = _default
          },
          {
            './browser.js': 17,
            './node.js': 1,
            '@babel/runtime/helpers/interopRequireDefault': 3,
            'detect-node': 16
          }
        ],
        19: [
          function (require, module, exports) {
            const {
              BroadcastChannel
            } = require('broadcast-channel')
            broadcastChannelLib.BroadcastChannel = BroadcastChannel
          },
          {
            'broadcast-channel': 5
          }
        ]
      }, {},
      [19]
    )
    var bc
    var broadcastChannelOptions = {
      // type: 'localstorage', // (optional) enforce a type, oneOf['native', 'idb', 'localstorage', 'node'
      webWorkerSupport: false // (optional) set this to false if you know that your channel will never be used in a WebWorker (increase performance)
    }
    var instanceParams = {}
    var preopenInstanceId = new URL(window.location.href).searchParams.get('preopenInstanceId')
    var auth0Params = new URL(window.location.href).searchParams.get('auth0Params')
    var auth0Login = new URL(window.location.href).searchParams.get('auth0Login')
    // trying to get a new auth0 login
    if (auth0Params && auth0Login) {
      var auth0ParamsObj = JSON.parse(window.atob(auth0Params))
      var auth0LoginObj = JSON.parse(window.atob(auth0Login))

      new Promise(function (resolve, reject) {
        // wait for page load
        const readyInterval = setInterval(function () {
          if (window && window.document && window.document.readyState === 'complete') {
            clearInterval(readyInterval)
            resolve()
          }
        }, 100)
        setTimeout(function () {
          reject('timed out waiting for document to load')
        }, 5000)
      }).then(function () {
        // create auth0 client
        return window.createAuth0Client(auth0ParamsObj)
      }).then(function (auth0Client) {
        // check if already authenticated
        window.auth0 = auth0Client
        return auth0Client.isAuthenticated()
      }).then(function (isAuthenticated) {
        if (isAuthenticated) {
          // if already authenticated but trying to get a login, then logout and refresh page
          console.log('logging out')
          window.auth0.logout({
            returnTo: window.location.href
          })
        } else {
          // not authenticated yet and trying to get a login
          if (!auth0LoginObj.appState) {
            auth0LoginObj.appState = {}
          }
          auth0LoginObj.appState.auth0Params = auth0ParamsObj
          return window.auth0.loginWithRedirect(auth0LoginObj)
        }
      })
    } else if (!preopenInstanceId) {
      window.document.getElementById('message').style.visibility = 'visible'
      // in general oauth redirect
      try {
        var url = new URL(location.href)
        var hash = url.hash.substr(1)
        var hashParams = hash.split('&').reduce(function (result, item) {
          const parts = item.split('=')
          result[parts[0]] = parts[1]
          return result
        }, {})
        var queryParams = {}
        for (var key of url.searchParams.keys()) {
          queryParams[key] = url.searchParams.get(key)
        }
        var error = ''
        if (Object.keys(hashParams).length > 0 && hashParams.state) {
          instanceParams = JSON.parse(window.atob(decodeURIComponent(decodeURIComponent(hashParams.state)))) || {}
          if (hashParams.error) error = hashParams.error
        } else if (Object.keys(queryParams).length > 0 && queryParams.state) {
          instanceParams = JSON.parse(window.atob(decodeURIComponent(decodeURIComponent(queryParams.state)))) || {}
          if (queryParams.error) error = queryParams.error
        }
        if (instanceParams.auth0Params) {
          // auth0 redirect
          new Promise(function (resolve, reject) {
            // wait for page load
            const readyInterval = setInterval(function () {
              if (window && window.document && window.document.readyState === 'complete') {
                clearInterval(readyInterval)
                resolve()
              }
            }, 100)
            setTimeout(function () {
              reject('timed out waiting for document to load')
            }, 5000)
          }).then(function () {
            // create auth0 client
            return window.createAuth0Client(instanceParams.auth0Params)
          }).then(function(auth0Client) {
            window.auth0 = auth0Client
            return window.auth0.handleRedirectCallback()
          }).then(function() {
            return window.auth0.getIdTokenClaims()
          }).then(function(claim) {
            if (!claim || !claim.__raw ) {
              throw new Error('invalid idtoken claim')
            }
            bc = new broadcastChannelLib.BroadcastChannel('redirect_channel_' + instanceParams.instanceId, broadcastChannelOptions)
            for (var key in claim) {
              hashParams[key] = claim[key]
            }
            hashParams.idtoken = claim.__raw
            return bc.postMessage({
              data: {
                instanceParams,
                queryParams: {},
                hashParams: hashParams
              },
              error: ''
            })
          }).then(function() {
            bc && bc.close()
            console.log('posted', { queryParams, instanceParams, hashParams })
            setTimeout(function() {
              window.close()
            }, 30000)
          })
          .catch(function(e) {
            console.error('could not handle auth0 redirect', e)
          })
        } else if (instanceParams.redirectToOpener) {
          // communicate to window.opener
          window.opener.postMessage({
            channel: 'redirect_channel_' + instanceParams.instanceId,
            data: {
              instanceParams: instanceParams,
              hashParams: hashParams,
              queryParams: queryParams
            },
            error: error
          }, '*')
        } else {
          // communicate via broadcast channel
          bc = new broadcastChannelLib.BroadcastChannel('redirect_channel_' + instanceParams.instanceId,
            broadcastChannelOptions)
          bc.postMessage({
            data: {
              instanceParams: instanceParams,
              hashParams: hashParams,
              queryParams: queryParams
            },
            error: error
          }).then(function () {
            bc.close()
            console.log('posted', {
              queryParams,
              instanceParams,
              hashParams
            })
            setTimeout(function () {
              window.close()
            }, 30000)
          })
        }
      } catch (err) {
        console.error(err, 'service worker error in redirect')
        bc && bc.close()
        window.close()
      }
    } else {
      // in preopen, awaiting redirect
      try {
        bc = new broadcastChannelLib.BroadcastChannel('preopen_channel_' + preopenInstanceId, broadcastChannelOptions)
        bc.onmessage = function (ev) {
          const {
            preopenInstanceId: oldId,
            payload,
            message
          } = ev.data
          if (oldId === preopenInstanceId && payload && payload.url) {
            window.location.href = payload.url
          } else if (oldId === preopenInstanceId && message === 'setup_complete') {
            bc.postMessage({
              data: {
                preopenInstanceId: preopenInstanceId,
                message: 'popup_loaded'
              }
            })
          }
          if (ev.error && ev.error !== '') {
            console.error(ev.error)
            bc.close()
          }
        }
      } catch (err) {
        console.error(err, 'service worker error in preopen')
        bc && bc.close()
        window.close()
      }
    }
  </script>
</body>

</html>                        
${""}
  `,
            ],
            { type: "text/html" }
          )
        )
      );
    }
  } catch (error) {
    console.error(error);
  }
});
