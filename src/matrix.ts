

class Matrix {

  context?: CanvasRenderingContext2D;
  element?: HTMLElement;
  #_el: HTMLElement;
  useCSS3D: boolean = false;
  _px: string;
  _st: CSSStyleDeclaration;
  _t = this.transform;

  a = 1;
  b = 0;
  c = 0;
  d = 1;
  e = 0;
  f = 0;

  constructor(context?: CanvasRenderingContext2D, element?: HTMLElement) {
    if (context) {
      (this.context = context).setTransform(1, 0, 0, 1, 0, 0);
    }
    this.element = element;
  }

  get _el() {
    return this.#_el;
  }
  set _el(el) {
    if (!this._el) {
      this._px = this._getPX();
      this.useCSS3D = false
    }
    this.#_el = el;
    (this._st = this.#_el.style)[this._px as any] = this.toCSS();
  }


  _getPX() {
    var lst = ["t", "oT", "msT", "mozT", "webkitT", "khtmlT"];
    var p: string;
    var style = document.createElement("div").style;
    for (let i = 0; i < lst.length; i++) {
      p = lst[i];
      if (typeof style[p + "ransform" as any] !== "undefined") {
        return p + "ransform";
      };
    }
  }

  _q(f1: number, f2: number) {
    return Math.abs(f1 - f2) < 1e-14
  }

  _x() {
    var me = this;
    if (me.context) {
      me.context.setTransform(me.a, me.b, me.c, me.d, me.e, me.f);
    }
    if (me._st) {
      me._st[me._px as any] = me.useCSS3D ? me.toCSS3D() : me.toCSS();	// can be optimized pre-storing func ref.
    }
    return me
  }


  //#region Static creators

  static from(a: number, b: number, c: number, d: number, e: number, f: number, context?: CanvasRenderingContext2D, dom?: HTMLElement) {
    var m = new Matrix(context, dom);
    m.setTransform(a, b, c, d, e, f);
    return m;
  }

  static fromSVGTransformList(tList: SVGTransformList, context?: CanvasRenderingContext2D, dom?: HTMLElement) {
    var m = new Matrix(context, dom);
    var i = 0; 
    while(i < tList.length) {
      m.multiply(tList[i++].matrix);
    } 
    return m;
  };

  ///#endregion


  applyToArray(points: number[]) {
    var i = 0;
    var p;
    var mxPoints = [];
    while(i < points.length) {
      p = this.applyToPoint(points[i++], points[i++]);
      mxPoints.push(p.x, p.y);
    }
    return mxPoints;
  }

  applyToContext(context: CanvasRenderingContext2D) {
    var me = this;
    context.setTransform(me.a, me.b, me.c, me.d, me.e, me.f);
    return me
  }

  applyToElement(element: HTMLElement, use3D?: boolean) {
    var me = this;
    if (!me._px) {
      me._px = me._getPX();
    }
    element.style[me._px as any] = use3D ? me.toCSS3D() : me.toCSS();
    return me;
  }

  applyToObject(obj: {a: number, b: number, c: number, d: number, e: number, f: number}) {
    var me = this;
    obj.a = me.a;
    obj.b = me.b;
    obj.c = me.c;
    obj.d = me.d;
    obj.e = me.e;
    obj.f = me.f;
    return me
  }

  applyToPoint(x: number, y: number) {
    var me = this;
    return {
      x: x * me.a + y * me.c + me.e,
      y: x * me.b + y * me.d + me.f
    }
  }

  applyToTypedArray(points: number[], use64?: boolean) {
    var i = 0;
    var p;
    var l = points.length;
    var mxPoints = use64 ? new Float64Array(l) : new Float32Array(l);
    while(i < l) {
      p = this.applyToPoint(points[i], points[i + 1]);
      mxPoints[i++] = p.x;
      mxPoints[i++] = p.y;
    }
    return mxPoints;
  }

  clone(noContext?: boolean) {
    return new Matrix(noContext ? null : this.context).multiply(this);
  }

  concat(cm: Matrix | SVGMatrix) {
    return this.clone().multiply(cm);
  }

  decompose(useLU?: boolean) {
    var me = this;
    var a = me.a;
    var b = me.b;
    var c = me.c;
    var d = me.d;
    var acos = Math.acos;
    var atan = Math.atan;
    var sqrt = Math.sqrt;
    var pi = Math.PI;
    var translate = {x: me.e, y: me.f};
    var rotation = 0;
    var scale = {x: 1, y: 1};
    var skew = {x: 0, y: 0};
    var determ = a * d - b * c;
    var r;
    var s;
    if (useLU) {
      if (a) {
        skew = {x: atan(c / a), y: atan(b / a)};
        scale = {x: a, y: determ / a};
      }
      else if (b) {
        rotation = pi * 0.5;
        scale = {x: b, y: determ / b};
        skew.x = atan(d / b);
      }
      else { // a = b = 0
        scale = {x: c, y: d};
        skew.x = pi * 0.25;
      }
    }
    else {
      // Apply the QR-like decomposition.
      if (a || b) {
        r = sqrt(a * a + b * b);
        rotation = b > 0 ? acos(a / r) : -acos(a / r);
        scale = {x: r, y: determ / r};
        skew.x = atan((a * c + b * d) / (r * r));
      }
      else if (c || d) {
        s = sqrt(c * c + d * d);
        rotation = pi * 0.5 - (d > 0 ? acos(-c / s) : -acos(c / s));
        scale = {x: determ / s, y: s};
        skew.y = atan((a * c + b * d) / (s * s));
      }
      else { // a = b = c = d = 0
        scale = {x: 0, y: 0};
      }
    }
    return {
      translate: translate,
      rotation : rotation,
      scale : scale,
      skew : skew
    }
  }

  determinant() {
    return this.a * this.d - this.b * this.c
  }

  divide(m: Matrix) {
    return this.multiply(m.inverse());
  }

  divideScalar(d: number) {
    var me = this;
    if (!d) {
      throw new Error("Division on zero");
    }
    me.a /= d;
    me.b /= d;
    me.c /= d;
    me.d /= d;
    me.e /= d;
    me.f /= d;
    return me._x();
  }

  interpolate(m2: Matrix | SVGMatrix, t: number, context?: CanvasRenderingContext2D, dom?: HTMLElement) {
    var me = this;
    var m  = new Matrix(context, dom);
    m.a = me.a + (m2.a - me.a) * t;
    m.b = me.b + (m2.b - me.b) * t;
    m.c = me.c + (m2.c - me.c) * t;
    m.d = me.d + (m2.d - me.d) * t;
    m.e = me.e + (m2.e - me.e) * t;
    m.f = me.f + (m2.f - me.f) * t;
    return m._x();
  }

  interpolateAnim(m2: Matrix, t: number, context?: CanvasRenderingContext2D, dom?: HTMLElement) {
    var m  = new Matrix(context, dom);
    var d1 = this.decompose();
    var d2 = m2.decompose();
    var t1 = d1.translate;
    var t2 = d2.translate;
    var s1 = d1.scale;
    // QR order (t-r-s-sk)
    m.translate(t1.x + (t2.x - t1.x) * t, t1.y + (t2.y - t1.y) * t);
    m.rotate(d1.rotation + (d2.rotation - d1.rotation) * t);
    m.scale(s1.x + (d2.scale.x - s1.x) * t, s1.y + (d2.scale.y - s1.y) * t);
    //todo test skew scenarios
    return m._x();
  }

  inverse(cloneContext?: boolean, cloneDOM?: boolean) {
    var me = this;
    var m  = new Matrix(cloneContext ? me.context : null, cloneDOM ? me.element : null);
    var dt = me.determinant();
    if (!dt) {
      throw new Error("Matrix not invertible.");
    }
    m.a = me.d / dt;
    m.b = -me.b / dt;
    m.c = -me.c / dt;
    m.d = me.a / dt;
    m.e = (me.c * me.f - me.d * me.e) / dt;
    m.f = -(me.a * me.f - me.b * me.e) / dt;
    return m;
  }

  isEqual(m: Matrix | SVGMatrix) {
    var me = this;
    var q = me._q;
    return q(me.a, m.a) &&
           q(me.b, m.b) &&
           q(me.c, m.c) &&
           q(me.d, m.d) &&
           q(me.e, m.e) &&
           q(me.f, m.f)
  }

  isIdentity() {
    var me = this;
    return me.a === 1 && !me.b && !me.c && me.d === 1 && !me.e && !me.f
  }

  isInvertible() {
    return !this._q(this.determinant(), 0)
  }

  isValid() {
    return !(this.a * this.d)
  }

  flipX() {
    return this._t(-1, 0, 0, 1, 0, 0);
  }

  flipY() {
    return this._t(1, 0, 0, -1, 0, 0)
  }

  multiply(m: Matrix | DOMMatrix | SVGMatrix) {
    return this._t(m.a, m.b, m.c, m.d, m.e, m.f);
  }

  reflectVector(x: number, y: number) {
    var v = this.applyToPoint(0, 1);
    var d = (v.x * x + v.y * y) * 2;
    x -= d * v.x;
    y -= d * v.y;
    return {x: x, y: y}
  }

  reset() {
    return this.setTransform(1, 0, 0, 1, 0, 0)
  }

  rotate(angle: number) {
    var cos = Math.cos(angle);
    var sin = Math.sin(angle);
    return this._t(cos, sin, -sin, cos, 0, 0);
  }

  rotateFromVector(x: number, y: number) {
    return this.rotate(Math.atan2(y, x))
  }

  rotateDeg(angle: number) {
    return this.rotate(angle * Math.PI / 180)
  }

  scaleU(f: number) {
    return this._t(f, 0, 0, f, 0, 0)
  }

  scale(sx: number, sy: number) {
    return this._t(sx, 0, 0, sy, 0, 0)
  }

  scaleX(sx: number) {
    return this._t(sx, 0, 0, 1, 0, 0)
  }

  scaleY(sy: number) {
    return this._t(1, 0, 0, sy, 0, 0)
  }

  scaleFromVector(x: number, y: number) {
    return this.scaleU(Math.sqrt(x*x + y*y))
  }

  shear(sx: number, sy: number) {
    return this._t(1, sy, sx, 1, 0, 0)
  }

  shearX(sx: number) {
    return this._t(1, 0, sx, 1, 0, 0)
  }

  shearY(sy: number) {
    return this._t(1, sy, 0, 1, 0, 0)
  }

  skew(ax: number, ay: number) {
    return this.shear(Math.tan(ax), Math.tan(ay))
  }

  skewDeg(ax: number, ay: number) {
    return this.shear(Math.tan(ax / 180 * Math.PI), Math.tan(ay / 180 * Math.PI))
  }

  skewX(ax: number) {
    return this.shearX(Math.tan(ax))
  }

  skewY(ay: number) {
    return this.shearY(Math.tan(ay))
  }

  setTransform(a: number, b: number, c: number, d: number, e: number, f: number) {
    var me = this;
    me.a = a;
    me.b = b;
    me.c = c;
    me.d = d;
    me.e = e;
    me.f = f;
    return me._x();
  }

  toArray() {
    var me = this;
    return [me.a, me.b, me.c, me.d, me.e, me.f];
  }

  toCSS() {
    return "matrix(" + this.toArray() + ")";
  }

  toCSS3D() {
    var me = this;
    var n2 = ",0,0,";
    return "matrix3d(" + me.a + "," + me.b + n2 + me.c + "," + me.d + n2 + n2 + ",1,0," + me.e + "," + me.f + ",0,1)";
  }

  toCSV() {
    return this.toArray().join() + "\r\n";
  }

  toDOMMatrix() {
    var m = null;
    if ("DOMMatrix" in window) {
      m = new DOMMatrix();
      m.a = this.a;
      m.b = this.b;
      m.c = this.c;
      m.d = this.d;
      m.e = this.e;
      m.f = this.f;
    }
    return m;
  }

  toJSON() {
    var me = this;
    return '{"a":' + me.a + ',"b":' + me.b + ',"c":' + me.c + ',"d":' + me.d + ',"e":' + me.e + ',"f":' + me.f + '}';
  }

  toString(fixLen?: number) {
    var me = this;
    fixLen = fixLen || 4;
    return "a=" + me.a.toFixed(fixLen) +
           " b=" + me.b.toFixed(fixLen) +
           " c=" + me.c.toFixed(fixLen) +
           " d=" + me.d.toFixed(fixLen) +
           " e=" + me.e.toFixed(fixLen) +
           " f=" + me.f.toFixed(fixLen)
  }

  toSVGMatrix() {
    var me = this;
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    var svgMatrix = null;
    if (svg) {
      svgMatrix = svg.createSVGMatrix();
      svgMatrix.a = me.a;
      svgMatrix.b = me.b;
      svgMatrix.c = me.c;
      svgMatrix.d = me.d;
      svgMatrix.e = me.e;
      svgMatrix.f = me.f;
    }
    return svgMatrix
  }

  toTypedArray() {
    var me = this;
    return new Float32Array([me.a, me.b, me.c, me.d, me.e, me.f]);
  }

  translate(tx: number, ty: number) {
    return this._t(1, 0, 0, 1, tx, ty);
  }

  translateX(tx: number) {
    return this._t(1, 0, 0, 1, tx, 0)
  }

  translateY(ty: number) {
    return this._t(1, 0, 0, 1, 0, ty)
  }

  transform(a2: number, b2: number, c2: number, d2: number, e2: number, f2: number) {
    var me = this;
    var a1 = me.a;
    var b1 = me.b;
    var c1 = me.c;
    var d1 = me.d;
    var e1 = me.e;
    var f1 = me.f;
    me.a = a1 * a2 + c1 * b2;
    me.b = b1 * a2 + d1 * b2;
    me.c = a1 * c2 + c1 * d2;
    me.d = b1 * c2 + d1 * d2;
    me.e = a1 * e2 + c1 * f2 + e1;
    me.f = b1 * e2 + d1 * f2 + f1;
    return me._x();
  }
  
}

export default Matrix;