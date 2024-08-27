! function(t, n) {
    class e {
        constructor(t, n) {
            this.X = t, this.Y = n
        }
    }
    class r {
        constructor(t, n, e, r) {
            this.X = t, this.Y = n, this.Width = e, this.Height = r
        }
    }
    class s {
        constructor(t, n) {
            this.Name = t, this.Points = function(t, n) {
                for (var r = function(t) {
                        for (var n = 0, e = 1; e < t.length; e++) n += Distance(t[e - 1], t[e]);
                        return n
                    }(t) / (n - 1), s = 0, i = new Array(t[0]), o = 1; o < t.length; o++) {
                    var a = Distance(t[o - 1], t[o]);
                    if (s + a >= r) {
                        var h = t[o - 1].X + (r - s) / a * (t[o].X - t[o - 1].X),
                            c = t[o - 1].Y + (r - s) / a * (t[o].Y - t[o - 1].Y),
                            l = new e(h, c);
                        i[i.length] = l, t.splice(o, 0, l), s = 0
                    } else s += a
                }
                i.length == n - 1 && (i[i.length] = new e(t[t.length - 1].X, t[t.length - 1].Y));
                return i
            }(n, o);
            ! function(t) {
                var n = Centroid(t);
                Math.atan2(n.Y - t[0].Y, n.X - t[0].X)
            }(this.Points);
            this.Points = function(t, n) {
                for (var s = function(t) {
                        for (var n = 1 / 0, e = -1 / 0, s = 1 / 0, i = -1 / 0, o = 0; o < t.length; o++) n = Math.min(n, t[o].X), s = Math.min(s, t[o].Y), e = Math.max(e, t[o].X), i = Math.max(i, t[o].Y);
                        return new r(n, s, e - n, i - s)
                    }(t), i = new Array, o = 0; o < t.length; o++) {
                    var a = t[o].X * (n / s.Width),
                        h = t[o].Y * (n / s.Height);
                    i[i.length] = new e(a, h)
                }
                return i
            }(this.Points, a), this.Points = function(t, n) {
                for (var r = Centroid(t), s = new Array, i = 0; i < t.length; i++) {
                    var o = t[i].X + n.X - r.X,
                        a = t[i].Y + n.Y - r.Y;
                    s[s.length] = new e(o, a)
                }
                return s
            }(this.Points, h), this.Vector = function(t) {
                for (var n = 0, e = new Array, r = 0; r < t.length; r++) e[e.length] = t[r].X, e[e.length] = t[r].Y, n += t[r].X * t[r].X + t[r].Y * t[r].Y;
                for (var s = Math.sqrt(n), r = 0; r < e.length; r++) e[r] /= s;
                return e
            }(this.Points)
        }
    }
    class i {
        constructor(t, n, e) {
            this.Name = t, this.Score = n, this.Time = e
        }
    }
    const o = 64,
        a = 250,
        h = new e(0, 0),
        c = .5 * Math.sqrt(a * a + a * a);
    Deg2Rad(45), Deg2Rad(2), Math.sqrt(5);

    function OptimalCosineDistance(t, n) {
        for (var e = 0, r = 0, s = 0; s < t.length; s += 2) e += t[s] * n[s] + t[s + 1] * n[s + 1], r += t[s] * n[s + 1] - t[s + 1] * n[s];
        var i = Math.atan(r / e);
        return Math.acos(e * Math.cos(i) + r * Math.sin(i))
    }

    function DistanceAtBestAngle(t, n, e, r, s) {
        var i = DistanceAtAngle(t, n, 0),
            o = DistanceAtAngle(t, n, 0);
        return Math.min(i, o)
    }

    function DistanceAtAngle(t, n, r) {
        return function(t, n) {
            for (var e = 0, r = 0; r < t.length; r++) e += Distance(t[r], n[r]);
            return e / t.length
        }(function(t, n) {
            for (var r = Centroid(t), s = Math.cos(n), i = Math.sin(n), o = new Array, a = 0; a < t.length; a++) {
                var h = (t[a].X - r.X) * s - (t[a].Y - r.Y) * i + r.X,
                    c = (t[a].X - r.X) * i + (t[a].Y - r.Y) * s + r.Y;
                o[o.length] = new e(h, c)
            }
            return o
        }(t, r), n.Points)
    }

    function Centroid(t) {
        for (var n = 0, r = 0, s = 0; s < t.length; s++) n += t[s].X, r += t[s].Y;
        return n /= t.length, r /= t.length, new e(n, r)
    }

    function Distance(t, n) {
        var e = n.X - t.X,
            r = n.Y - t.Y;
        return Math.sqrt(e * e + r * r)
    }

    function Deg2Rad(t) {
        return t * Math.PI / 180
    }
    t.Point = e, t.Rectangle = r, t.Unistroke = s, t.Result = i, t.DollarRecognizer = class {
        constructor() {
            this.Unistrokes = [], this.Recognize = function(t, n) {
                for (var e = Date.now(), r = new s("", t), o = -1, a = 1 / 0, h = 0; h < this.Unistrokes.length; h++) {
                    var l;
                    (l = n ? OptimalCosineDistance(this.Unistrokes[h].Vector, r.Vector) : DistanceAtBestAngle(r.Points, this.Unistrokes[h])) < a && (a = l, o = h)
                }
                var u = Date.now();
                return -1 == o ? new i("No match.", 0, u - e) : new i(this.Unistrokes[o].Name, n ? 1 - a : 1 - a / c, u - e)
            }, this.AddGesture = function(t, n) {
                this.Unistrokes[this.Unistrokes.length] = new s(t, n);
                for (var e = 0, r = 0; r < this.Unistrokes.length; r++) this.Unistrokes[r].Name == t && e++;
                return e
            }, this.DeleteUserGestures = function() {}
        }
    }
}(window.Dollar = window.Dollar || {}, Dollar);