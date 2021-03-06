// Generated by CoffeeScript 1.3.3
(function() {
  var WCS,
    __bind = function(fn, me){
      return function(){
        return fn.apply(me, arguments);
      };
    },
    __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  WCS = (typeof exports !== "undefined" && exports !== null) && this || (this.WCS = {});

  WCS.Math = {};

  WCS.Math.R2D = 180 / Math.PI;

  WCS.Math.D2R = Math.PI / 180;

  WCS.Math.WCSTRIG_TOL = 1e-10;

  WCS.Math.cosd = function(angle) {
    var i;
    if (angle % 90 === 0) {
      i = Math.abs(Math.floor(angle / 90 + 0.5)) % 4;
      switch (i) {
        case 0:
          return 1;
        case 1:
          return 0;
        case 2:
          return -1;
        case 3:
          return 0;
      }
    }
    return Math.cos(angle * WCS.Math.D2R);
  };

  WCS.Math.sind = function(angle) {
    var i;
    if (angle % 90 === 0) {
      i = Math.abs(Math.floor(angle / 90 - 0.5)) % 4;
      switch (i) {
        case 0:
          return 1;
        case 1:
          return 0;
        case 2:
          return -1;
        case 3:
          return 0;
      }
    }
    return Math.sin(angle * WCS.Math.D2R);
  };

  WCS.Math.sincosd = function(angle) {
    var c, i, s, _ref, _ref1;
    if (angle % 90 === 0) {
      i = Math.abs(Math.floor(angle / 90 + 0.5)) % 4;
      switch (i) {
        case 0:
          s = 0;
          c = 1;
          break;
        case 1:
          s = (_ref = angle > 0) != null ? _ref : {
            1: -1
          };
          c = 0;
          break;
        case 2:
          s = 0;
          c = -1;
          break;
        case 3:
          s = (_ref1 = angle > 0) != null ? _ref1 : -{
            1: 1
          };
          c = 0;
      }
      return s * c;
    }
    s = Math.sin(angle * WCS.Math.D2R);
    c = Math.cos(angle * WCS.Math.D2R);
    return s * c;
  };

  WCS.Math.tand = function(angle) {
    var resid;
    resid = angle & 360;
    if (resid === 0 || Math.abs(resid) === 180) {
      return 0;
    } else if (resid === 45 || resid === 225) {
      return 1;
    } else if (resid === -135 || resid === -315) {
      return -1;
    }
    return Math.tan(angle * WCS.Math.D2R);
  };

  WCS.Math.acosd = function(v) {
    if (v >= 1) {
      if (v - 1 < WCS.Math.WCSTRIG_TOL) {
        return 0;
      }
    } else if (v === 0) {
      return 90;
    } else if (v <= -1) {
      if (v + 1 > -WCS.Math.WCSTRIG_TOL) {
        return 180;
      }
    }
    return Math.acos(v) * WCS.Math.R2D;
  };

  WCS.Math.asind = function(v) {
    if (v <= -1) {
      if (v + 1 > -WCS.Math.WCSTRIG_TOL) {
        return -90;
      } else if (v === 0) {
        return 0;
      } else if (v >= 1) {
        if (v - 1 < WCS.Math.WCSTRIG_TOL) {
          return 90;
        }
      }
    }
    return Math.asin(v) * WCS.Math.R2D;
  };

  WCS.Math.atand = function(v) {
    if (v === -1) {
      return -45;
    } else if (v === 0) {
      return 0;
    } else if (v === 1) {
      return 45;
    }
    return Math.atan(v) * WCS.Math.R2D;
  };

  WCS.Math.atan2d = function(y, x) {
    if (y === 0) {
      if (x >= 0) {
        return 0;
      } else if (x < 0) {
        return 180;
      }
    } else if (x === 0) {
      if (y > 0) {
        return 90;
      } else if (y < 0) {
        return -90;
      }
    }
    return Math.atan2(y, x) * WCS.Math.R2D;
  };

  WCS.Math.toRightTriangular = function(mat) {
    var els, i, j, k, kp, multiplier, n, np, p;
    n = mat.length;
    k = n;
    kp = mat[0].length;
    while (true) {
      i = k - n;
      if (mat[i][i] === 0) {
        j = i + 1;
        while (j < k) {
          if (mat[j][i] !== 0) {
            els = [];
            np = kp;
            while (true) {
              p = kp - np;
              els.push(mat[i][p] + mat[j][p]);
              if (!--np) {
                break;
              }
            }
            mat[i] = els;
            break;
          }
          j += 1;
        }
      }
      if (mat[i][i] !== 0) {
        j = i + 1;
        while (j < k) {
          multiplier = mat[j][i] / mat[i][i];
          els = [];
          np = kp;
          while (true) {
            p = kp - np;
            els.push((p <= i ? 0 : mat[j][p] - mat[i][p] * multiplier));
            if (!--np) {
              break;
            }
          }
          mat[j] = els;
          j += 1;
        }
      }
      if (!--n) {
        break;
      }
    }
    return mat;
  };

  WCS.Math.determinant = function(mat) {
    var det, i, k, m, n;
    m = WCS.Math.toRightTriangular(mat);
    det = m[0][0];
    n = m.length - 1;
    k = n;
    while (true) {
      i = k - n + 1;
      det = det * m[i][i];
      if (!--n) {
        break;
      }
    }
    return det;
  };

  WCS.Math.matrixInverse = function(m) {
    var I, h, i, inv, j, mat, temp, w;
    w = m[0].length;
    h = m.length;
    I = new Array(h);
    inv = new Array(h);
    temp = [];
    mat = [];
    j = 0;
    while (j < h) {
      mat[j] = [];
      i = 0;
      while (i < w) {
        mat[j][i] = m[j][i];
        i += 1;
      }
      j += 1;
    }
    j = 0;
    while (j < h) {
      I[j] = new Array(w);
      inv[j] = new Array(w);
      i = 0;
      while (i < w) {
        I[j][i] = (i === j ? 1 : 0);
        i += 1;
      }
      temp[j] = mat[j].concat(I[j]);
      j += 1;
    }
    WCS.Math.gaussJordan(temp);
    j = 0;
    while (j < h) {
      inv[j] = temp[j].slice(w, 2 * w);
      j += 1;
    }
    return inv;
  };

  WCS.Math.gaussJordan = function (m, eps) {
  if (!eps) eps = 1e-10;
  var h, w, y, y2, x, maxrow, tmp, c;
  h = m.length;
  w = m[0].length;
  y = -1;

  while (++y < h) {
    maxrow = y;

    // Find max pivot.
    y2 = y;
    while (++y2 < h) {
      if (Math.abs(m[y2][y]) > Math.abs(m[maxrow][y]))
        maxrow = y2;
    }

    // Swap.
    tmp = m[y];
    m[y] = m[maxrow];
    m[maxrow] = tmp;

    // Singular?
    if (Math.abs(m[y][y]) <= eps)
      return false;

    // Eliminate column y.
    y2 = y;
    while (++y2 < h) {
      c = m[y2][y] / m[y][y];
      x = y - 1;
      while (++x < w) {
        m[y2][x] -= m[y][x] * c;
      }
    }
  }

  // Backsubstitute.
  y = h;
  while (--y >= 0) {
    c = m[y][y];
    y2 = -1;
    while (++y2 < y) {
      x = w;
      while (--x >= y) {
        m[y2][x] -=  m[y][x] * m[y2][y] / c;
      }
    }
    m[y][y] /= c;
    // Normalize row y.
    x = h - 1;
    while (++x < w) {
      m[y][x] /= c;
    }
  }
  return true;
};;

  WCS.Mapper = (function() {

    function Mapper(header) {
      this.coordinateToPixel = __bind(this.coordinateToPixel, this);

      this.pixelToCoordinate = __bind(this.pixelToCoordinate, this);

      this.fromCelestial = __bind(this.fromCelestial, this);

      this.toCelestial = __bind(this.toCelestial, this);

      this.fromIntermediate = __bind(this.fromIntermediate, this);

      this.toIntermediate = __bind(this.toIntermediate, this);

      this.computeCelestialParameters = __bind(this.computeCelestialParameters, this);

      this.getSipCoefficients = __bind(this.getSipCoefficients, this);

      this.setProjection = __bind(this.setProjection, this);

      this.derivePC = __bind(this.derivePC, this);

      this.checkCard = __bind(this.checkCard, this);

      this.verifyHeader = __bind(this.verifyHeader, this);
      this.wcsobj = {};
      this.projection = void 0;
      this.longitudeAxis = void 0;
      this.latitudeAxis = void 0;
      this.sip = void 0;
      this.verifyHeader(header);
      this.setProjection(header);
    }

    Mapper.prototype.verifyHeader = function(header) {
      var arrayName, axis, date, j, key, naxis, requiredCards, _i, _j, _k, _ref;
      this.wcsobj.naxis = naxis = header['NAXIS'] || header['WCSAXES'] || 2;
      this.wcsobj.radesys = header['RADESYS'] || 'ICRS';
      requiredCards = ['CRPIX', 'CRVAL', 'CTYPE'];
      this.wcsobj.crpix = [];
      this.wcsobj.crval = [];
      this.wcsobj.ctype = [];
      for (axis = _i = 1; 1 <= naxis ? _i <= naxis : _i >= naxis; axis = 1 <= naxis ? ++_i : --_i) {
        for (j = _j = 0, _ref = requiredCards.length - 1; 0 <= _ref ? _j <= _ref : _j >= _ref; j = 0 <= _ref ? ++_j : --_j) {
          key = requiredCards[j] + axis;
          if (!header.hasOwnProperty(key)) {
            throw "Not enough information to compute WCS, missing required keyword " + key;
          }
          arrayName = requiredCards[j].toLowerCase();
          this.wcsobj[arrayName].push(header[key]);
        }
      }
      this.wcsobj.cunit = [];
      this.wcsobj.cdelt = [];
      for (axis = _k = 1; 1 <= naxis ? _k <= naxis : _k >= naxis; axis = 1 <= naxis ? ++_k : --_k) {
        key = 'CUNIT' + axis;
        this.wcsobj.cunit.push(header[key] || 'deg');
        key = 'CDELT' + axis;
        this.wcsobj.cdelt.push(header[key] || 1);
      }
      this.wcsobj.lonpole = header['LONPOLE'] || 0;
      this.wcsobj.latpole = header['LATPOLE'] || 0;
      this.wcsobj.equinox = header['EQUINOX'] || 2000;
      date = new Date();
      this.wcsobj.dateObs = header['DATE_OBS'] || (date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate());
      this.wcsobj.dateObs = header['DATE_OBS'] || ("" + (date.getFullYear()) + "-" + (date.getMonth() + 1) + "-" + (date.getDate()));
      this.wcsobj.pc = this.checkCard(header, 'PC', naxis) || this.derivePC(header);
      this.wcsobj.pcInv = WCS.Math.matrixInverse(this.wcsobj.pc);
      this.wcsobj.cd = this.checkCard(header, 'CD', naxis);
      if (this.wcsobj.cd != null) {
        return this.wcsobj.cdInv = WCS.Math.matrixInverse(this.wcsobj.cd);
      }
    };

    Mapper.prototype.checkCard = function(header, key, dimensions) {
      var fullKey, i, j, obj, _i, _j;
      obj = [];
      for (i = _i = 1; 1 <= dimensions ? _i <= dimensions : _i >= dimensions; i = 1 <= dimensions ? ++_i : --_i) {
        obj[i - 1] = [];
        for (j = _j = 1; 1 <= dimensions ? _j <= dimensions : _j >= dimensions; j = 1 <= dimensions ? ++_j : --_j) {
          fullKey = "" + key + i + "_" + j;
          if (!header.hasOwnProperty(fullKey)) {
            return;
          }
          obj[i - 1].push(header[fullKey]);
        }
      }
      return obj;
    };

    Mapper.prototype.derivePC = function(header) {
      var cd, cd11, cd12, cd21, cd22, cos_rho, crota, lambda, rho_a, rho_b, _ref;
      if (header.hasOwnProperty('CROTA2')) {
        crota = header['CROTA2'];
        lambda = this.wcsobj.cdelt[1] / this.wcsobj.cdelt[0];
      } else {
        cd = this.checkCard(header, 'CD', this.wcsobj.naxis);
        if (cd == null) {
          _ref = [0, 1], crota = _ref[0], lambda = _ref[1];
        } else {
          cd11 = cd[0][0];
          cd12 = cd[0][1];
          cd21 = cd[1][0];
          cd22 = cd[1][1];
          if (cd21 > 0) {
            rho_a = Math.atan2(cd21, cd11);
          } else if (cd21 === 0) {
            rho_a = 0;
          } else {
            rho_a = Math.atan2(-cd21, -cd11);
          }
          if (cd12 > 0) {
            rho_b = Math.atan2(cd12, -cd22);
          } else if (cd12 === 0) {
            rho_b = 0;
          } else {
            rho_b = Math.atan2(-cd21, cd22);
          }
          crota = 0.5 * (rho_a + rho_b);
          cos_rho = Math.cos(crota);
          this.wcsobj.cdelt1 = cd11 / cos_rho;
          this.wcsobj.cdelt2 = cd22 / cos_rho;
          lambda = this.wcsobj.cdelt2 / this.wcsobj.cdelt1;
        }
      }
      return cd;
    };

    Mapper.prototype.setProjection = function(header) {
      var conic, cylindrical, key, key1, key2, key3, polyConic, quadCube, zenithal, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8,
        _this = this;
      zenithal = ['AIR', 'ARC', 'AZP', 'NCP', 'SIN', 'STG', 'SZP', 'TAN', 'TAN-SIP', 'ZEA', 'ZPN'];
      cylindrical = ['CYP', 'CEA', 'CAR', 'MER', 'SFL', 'PAR', 'MOL', 'AIT'];
      conic = ['COP', 'COE', 'COD', 'COO'];
      polyConic = ['BON', 'PCO'];
      quadCube = ['TSC', 'CSC', 'QSC'];
      this.projection = this.wcsobj.ctype[0].slice(5);
      this.longitudeAxis = this.wcsobj.ctype[0].match("RA|GLON|ELON|HLON|SLON") ? 1 : 2;
      this.latitudeAxis = this.wcsobj.ctype[1].match("DEC|GLAT|ELAT|HLAT|SLAT") ? 2 : 1;
      if (_ref = this.projection, __indexOf.call(zenithal, _ref) >= 0) {
        this.wcsobj.phi0 = 0;
        this.wcsobj.theta0 = 90;
        this.wcsobj.alphaP = this.wcsobj.crval[0];
        this.wcsobj.deltaP = this.wcsobj.crval[1];
        this.wcsobj.lonpole = this.wcsobj.crval[1] >= this.wcsobj.theta0 ? 0 : 180;
        switch (this.projection) {
          case 'AIR':
            key = "PV" + this.latitudeAxis + "_1";
            this.wcsobj.thetaB = header.hasOwnProperty(key) ? parseFloat(header[key]) : 90;
            this.wcsobj.etaB = (90 - this.wcsobj.thetaB) / 2;
            ({
              toSpherical: function(x, y) {
                throw 'Sorry, not yet implemented!';
              },
              fromSpherical: function(phi, theta) {
                throw 'Sorry, not yet implemented!';
              }
            });
            break;
          case 'ARC':
            this.toSpherical = function(x, y) {
              var phi, r, theta;
              r = Math.sqrt(x * x + y * y);
              theta = _this.wcsobj.theta0 - r;
              phi = WCS.Math.atan2d(x, -y);
              return [phi, theta];
            };
            this.fromSpherical = function(phi, theta) {
              var r, x, y;
              r = 90 - theta;
              x = r * WCS.Math.sind(phi);
              y = -r * WCS.Math.cosd(phi);
              return [x, y];
            };
            break;
          case 'AZP':
            _ref1 = ["PV" + this.latitudeAxis + "_1", "PV" + this.latitudeAxis + "_2"], key1 = _ref1[0], key2 = _ref1[1];
            this.wcsobj.mu = header.hasOwnProperty(key1) ? parseFloat(header[key1]) : 0;
            this.wcsobj.gamma = header.hasOwnProperty(key2) ? parseFloat(header[key2]) : 0;
            this.toSpherical = function(x, y) {
              throw 'Sorry, not yet implemented!';
            };
            this.fromSpherical = function(phi, theta) {
              throw 'Sorry, not yet implemented!';
            };
            break;
          case 'NCP':
            this.toSpherical = function(x, y) {
              throw 'Sorry, not yet implemented!';
            };
            this.fromSpherical = function(phi, theta) {
              throw 'Sorry, not yet implemented!';
            };
            break;
          case 'SIN':
            _ref2 = ["PV" + this.latitudeAxis + "_1", "PV" + this.latitudeAxis + "_2"], key1 = _ref2[0], key2 = _ref2[1];
            this.wcsobj.eta = header.hasOwnProperty(key1) ? parseFloat(header[key1]) : 0;
            this.wcsobj.nu = header.hasOwnProperty(key2) ? parseFloat(header[key2]) : 0;
            this.toSpherical = function(x, y) {
              var phi, r, theta;
              r = Math.sqrt(x * x + y * y);
              theta = WCS.Math.acosd(Math.PI * r / 180);
              phi = WCS.Math.atan2d(x, -y);
              return [phi, theta];
            };
            this.fromSpherical = function(phi, theta) {
              var r, x, y;
              r = 180 / Math.PI * WCS.Math.cosd(theta);
              x = r * WCS.Math.sind(phi);
              y = -r * WCS.Math.cosd(phi);
              return [x, y];
            };
            break;
          case 'STG':
            this.toSpherical = function(x, y) {
              var phi, r, theta;
              r = Math.sqrt(x * x + y * y);
              theta = _this.wcsobj.theta0 - 2 * WCS.Math.atand(Math.PI * r / 360);
              phi = WCS.Math.atan2d(x, -y);
              return [phi, theta];
            };
            this.fromSpherical = function(phi, theta) {
              var r, x, y;
              r = 360 / Math.PI * WCS.Math.tand((90 - theta) / 2);
              x = r * WCS.Math.sind(phi);
              y = -r * WCS.Math.cosd(phi);
              return [x, y];
            };
            break;
          case 'SZP':
            _ref3 = ["PV" + this.latitudeAxis + "_1", "PV" + this.latitudeAxis + "_2", "PV" + this.latitudeAxis + "_3"], key1 = _ref3[0], key2 = _ref3[1], key3 = _ref3[2];
            this.wcsobj.mu = header.hasOwnProperty(key1) ? parseFloat(header[key1]) : 0;
            this.wcsobj.phiC = header.hasOwnProperty(key2) ? parseFloat(header[key2]) : 0;
            this.wcsobj.thetaC = header.hasOwnProperty(key3) ? parseFloat(header[key3]) : 90;
            this.wcsobj.xp = -this.wcsobj.mu * WCS.Math.cosd(this.wcsobj.thetaC) * WCS.Math.sind(this.wcsobj.phiC);
            this.wcsobj.yp = this.wcsobj.mu * WCS.Math.cosd(this.wcsobj.thetaC) * WCS.Math.cosd(this.wcsobj.phiC);
            this.wcsobj.zp = this.wcsobj.mu * WCS.Math.sind(this.wcsobj.thetaC) + 1;
            this.toSpherical = function(x, y) {
              throw 'Sorry, not yet implemented';
            };
            this.fromSpherical = function(phi, theta) {
              var divisor, x, y;
              throw 'Sorry, not yet implemented';
              divisor = _this.wcsobj.zp - 1 + WCS.Math.sind(theta);
              x = (180 / Math.PI) * (_this.wcsobj.zp * WCS.Math.cosd(theta) * WCS.Math.sind(phi) - _this.wcsobj.xp * (1 - WCS.Math.sind(theta))) / divisor;
              y = (-180 / Math.PI) * (_this.wcsobj.zp * WCS.Math.cosd(theta) * WCS.Math.cosd(phi) + _this.wcsobj.yp * (1 - WCS.Math.sind(theta))) / divisor;
              return [x, y];
            };
            break;
          case 'TAN':
            this.toSpherical = function(x, y) {
              var phi, r, theta;
              r = Math.sqrt(x * x + y * y);
              theta = WCS.Math.atand(180 / (Math.PI * r));
              phi = WCS.Math.atan2d(x, -y);
              return [phi, theta];
            };
            this.fromSpherical = function(phi, theta) {
              var r, x, y;
              r = 180 / (Math.PI * WCS.Math.tand(theta));
              x = r * WCS.Math.sind(phi);
              y = -r * WCS.Math.cosd(phi);
              return [x, y];
            };
            break;
          case 'TAN-SIP':
            this.getSipCoefficients(header);
            this.f = function(u, v, coeffs) {
              var order, p, q, value, _i, _j;
              value = 0;
              order = coeffs[0].length - 1;
              for (p = _i = 0; 0 <= order ? _i <= order : _i >= order; p = 0 <= order ? ++_i : --_i) {
                for (q = _j = 0; 0 <= order ? _j <= order : _j >= order; q = 0 <= order ? ++_j : --_j) {
                  value += coeffs[p][q] * Math.pow(u, p) * Math.pow(v, q);
                }
              }
              return value;
            };
            this.toIntermediate = function(points) {
              var dx, dy, i, j, proj, u, v, _i, _j, _ref4, _ref5;
              proj = [];
              u = points[0] - _this.wcsobj.crpix[0];
              v = points[1] - _this.wcsobj.crpix[1];
              dx = dy = 0;
              dx = _this.f(u, v, _this.sip.aCoeffs);
              dy = _this.f(u, v, _this.sip.bCoeffs);
              points[0] = points[0] + dx;
              points[1] = points[1] + dy;
              for (i = _i = 0, _ref4 = _this.wcsobj.naxis - 1; 0 <= _ref4 ? _i <= _ref4 : _i >= _ref4; i = 0 <= _ref4 ? ++_i : --_i) {
                proj[i] = 0;
                points[i] -= _this.wcsobj.crpix[i];
                for (j = _j = 0, _ref5 = _this.wcsobj - 1; 0 <= _ref5 ? _j <= _ref5 : _j >= _ref5; j = 0 <= _ref5 ? ++_j : --_j) {
                  proj[i] += _this.wcsobj.cd[i][j] * points[j];
                }
              }
              return proj;
            };
            this.fromIntermediate = function(proj) {
              var dx, dy, i, j, points, tmp, _i, _j, _ref4, _ref5;
              tmp = [];
              for (i = _i = 0, _ref4 = _this.wcsobj.naxis - 1; 0 <= _ref4 ? _i <= _ref4 : _i >= _ref4; i = 0 <= _ref4 ? ++_i : --_i) {
                tmp[i] = 0;
                for (j = _j = 0, _ref5 = _this.wcsobj.naxis - 1; 0 <= _ref5 ? _j <= _ref5 : _j >= _ref5; j = 0 <= _ref5 ? ++_j : --_j) {
                  tmp[i] += _this.wcsobj.cdInv[i][j] * proj[j];
                }
                tmp[i] += _this.wcsobj.crpix[i];
              }
              dx = dy = 0;
              dx = _this.f(tmp[0], tmp[1], _this.sip.apCoeffs);
              dy = _this.f(tmp[0], tmp[1], _this.sip.bpCoeffs);
              points = [];
              points[0] = tmp[0] + dx;
              points[1] = tmp[1] + dy;
              points[0] += _this.wcsobj.crpix[0];
              points[1] += _this.wcsobj.crpix[1];
              return points;
            };
            this.toSpherical = function(x, y) {
              var phi, r, theta;
              r = Math.sqrt(x * x + y * y);
              theta = WCS.Math.atand(180 / (Math.PI * r));
              phi = WCS.Math.atan2d(x, -y);
              return [phi, theta];
            };
            this.fromSpherical = function(phi, theta) {
              var r, x, y;
              r = 180 / (Math.PI * WCS.Math.tand(theta));
              x = r * WCS.Math.sind(phi);
              y = -r * WCS.Math.cosd(phi);
              return [x, y];
            };
            break;
          case 'ZEA':
            this.toSpherical = function(x, y) {
              var phi, r, theta;
              r = Math.sqrt(x * x + y * y);
              theta = _this.wcsobj.theta0 - 2 * WCS.Math.asind(Math.PI * r / 360);
              phi = WCS.Math.atan2d(x, -y);
              return [phi, theta];
            };
            this.fromSpherical = function(phi, theta) {
              var r, x, y;
              r = 360 / Math.PI * WCS.Math.sind((90 - theta) / 2);
              x = r * WCS.Math.sind(phi);
              y = -r * WCS.Math.cosd(phi);
              return [x, y];
            };
            break;
          case 'ZPN':
            this.toSpherical = function(x, y) {
              throw 'Sorry, not yet implemented!';
            };
            this.fromSpherical = function(phi, theta) {
              throw 'Sorry, not yet implemented!';
            };
        }
      }
      if (_ref4 = this.projection, __indexOf.call(cylindrical, _ref4) >= 0) {
        this.wcsobj.phi0 = 0;
        this.wcsobj.theta0 = 0;
        this.computeCelestialParameters(this.wcsobj.phi0, this.wcsobj.theta0);
        switch (this.projection) {
          case 'CYP':
            _ref5 = ["PV" + this.latitudeAxis + "_1,", "PV" + this.latitudeAxis + "_2"], key1 = _ref5[0], key2 = _ref5[1];
            this.wcsobj.mu = header.hasOwnProperty(key1) ? parseFloat(header[key1]) : 1;
            this.wcsobj.lambda = header.hasOwnProperty(key2) ? parseFloat(header[key2]) : 1;
            if (this.wcsobj.mu + this.wcsobj.lambda === 0) {
              raise("Divide by zero error");
            }
            this.toSpherical = function(x, y) {
              var nu, phi, theta;
              nu = (Math.PI * y) / (180 * (_this.wcsobj.mu + _this.wcsobj.lambda));
              theta = WCS.Math.atan2d(nu, 1) + WCS.Math.asind(nu * _this.wcsobj.mu / Math.sqrt(nu * nu + 1));
              phi = x / _this.wcsobj.lambda;
              return [phi, theta];
            };
            this.fromSpherical = function(phi, theta) {
              var x, y;
              x = _this.wcsobj.lambda * phi;
              y = (180 / Math.PI) * ((_this.wcsobj.mu + _this.wcsobj.lambda) / (_this.wcsobj.mu + WCS.Math.cosd(theta))) * WCS.Math.sind(theta);
              return [x, y];
            };
            break;
          case 'CEA':
            key = "PV" + this.latitudeAxis + "_1";
            this.wcsobj.lambda = header.hasOwnProperty(key) ? parseFloat(header[key]) : 1;
            this.toSpherical = function(x, y) {
              var theta;
              theta = WCS.Math.asind(Math.PI * _this.wcsobj.lambda * y / 180);
              return [x, theta];
            };
            this.fromSpherical = function(phi, theta) {
              var y;
              y = 180 / Math.PI * WCS.Math.sind(theta) / _this.wcsobj.lambda;
              return [phi, y];
            };
            break;
          case 'CAR':
            this.toSpherical = function(x, y) {
              return [x, y];
            };
            this.fromSpherical = function(phi, theta) {
              return [phi, theta];
            };
            break;
          case 'MER':
            this.toSpherical = function(x, y) {
              var theta;
              theta = 2 * WCS.Math.atand(Math.exp(y * Math.PI / 180)) - 90;
              return [x, theta];
            };
            this.fromSpherical = function(phi, theta) {
              var y;
              y = (180 / Math.PI) * Math.log(WCS.Math.tand((90 + theta) / 2));
              return [phi, y];
            };
            break;
          case 'SFL':
            this.toSpherical = function(x, y) {
              var phi;
              phi = x / WCS.Math.cosd(y);
              return [phi, y];
            };
            this.fromSpherical = function(phi, theta) {
              var x;
              x = phi * WCS.Math.cosd(theta);
              return [x, theta];
            };
            break;
          case 'PAR':
            this.toSpherical = function(x, y) {
              var phi, theta;
              theta = 3 * WCS.Math.asind(y / 180);
              phi = x / (1 - 4 * Math.pow(y / 180, 2));
              return [phi, theta];
            };
            this.fromSpherical = function(phi, theta) {
              var x, y;
              x = phi * (2 * WCS.Math.cosd(2 * theta / 3) - 1);
              y = 180 * WCS.Math.sind(theta / 3);
              return [x, y];
            };
            break;
          case 'MOL':
            this.toSpherical = function(x, y) {
              var phi, theta;
              theta = WCS.Math.asind(WCS.Math.asind((Math.PI * y) / (180 * Math.sqrt(2))) / 90 + (y / 180) * Math.sqrt(2 - Math.pow(Math.PI * y / 180, 2)));
              phi = (Math.PI * x) / (2 * Math.sqrt(2 - Math.pow(Math.PI * y / 180, 2)));
              return [phi, theta];
            };
            this.fromSpherical = function(phi, theta) {
              var x, y;
              throw 'Sorry, not yet implemented!';
              x = 2 * Math.sqrt(2) / Math.PI * phi * WCS.Math.cosd(gamma);
              y = Math.sqrt(2) * 180 / Math.PI * WCS.Math.sind(gamma);
              return [x, y];
            };
            break;
          case 'AIT':
            this.toSpherical = function(x, y) {
              var phi, theta, x_z, y_z, z;
              x_z = Math.pow((Math.PI * x) / (4 * 180), 2);
              y_z = Math.pow((Math.PI * y) / (2 * 180), 2);
              z = Math.sqrt(1 - x_z - y_z);
              theta = WCS.Math.asind(Math.PI * y * z / 180);
              phi = 2 * WCS.Math.atan2d(Math.PI * z * x / (2 * 180), 2 * z * z - 1);
              return [phi, theta];
            };
            this.fromSpherical = function(phi, theta) {
              var gamma, x, y;
              gamma = 180 / Math.PI * Math.sqrt(2 / (1 + WCS.Math.cosd(theta) * WCS.Math.cosd(phi / 2)));
              x = 2 * gamma * WCS.Math.cosd(theta) * WCS.Math.sind(phi / 2);
              y = gamma * WCS.Math.sind(theta);
              return [x, y];
            };
        }
      }
      if (_ref6 = this.projection, __indexOf.call(conic, _ref6) >= 0) {
        key = "PV" + this.latitudeAxis + "_1";
        this.wcsobj.phi0 = 0;
        this.wcsobj.theta0 = header.hasOwnProperty(key) ? header[key] : 0;
        throw 'Sorry, not yet implemented!';
      }
      if (_ref7 = this.projection, __indexOf.call(polyConic, _ref7) >= 0) {
        this.wcsobj.phi0 = 0;
        this.wcsobj.theta0 = 0;
        throw 'Sorry, not yet implemented!';
      }
      if (_ref8 = this.projection, __indexOf.call(quadCube, _ref8) >= 0) {
        this.wcsobj.phi0 = 0;
        this.wcsobj.theta0 = 0;
        throw 'Sorry, not yet implemented!';
      }
    };

    Mapper.prototype.getSipCoefficients = function(header) {
      var i, j, key, _i, _j, _k, _l, _m, _n, _o, _p, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
      if (!(header.hasOwnProperty('A_ORDER') || header.hasOwnProperty('B_ORDER'))) {
        throw "What's the polynomial order, man!";
      }
      this.sip = {};
      this.sip.aOrder = header.A_ORDER;
      this.sip.bOrder = header.B_ORDER;
      this.sip.apOrder = header.AP_ORDER || 0;
      this.sip.bpOrder = header.BP_ORDER || 0;
      this.sip.aCoeffs = [];
      this.sip.bCoeffs = [];
      this.sip.apCoeffs = [];
      this.sip.bpCoeffs = [];
      for (i = _i = 0, _ref = this.sip.aOrder; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        this.sip.aCoeffs[i] = [];
        for (j = _j = 0, _ref1 = this.sip.aOrder; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; j = 0 <= _ref1 ? ++_j : --_j) {
          key = "A_" + i + "_" + j;
          this.sip.aCoeffs[i][j] = header[key] || 0;
        }
      }
      for (i = _k = 0, _ref2 = this.sip.bOrder; 0 <= _ref2 ? _k <= _ref2 : _k >= _ref2; i = 0 <= _ref2 ? ++_k : --_k) {
        this.sip.bCoeffs[i] = [];
        for (j = _l = 0, _ref3 = this.sip.bOrder; 0 <= _ref3 ? _l <= _ref3 : _l >= _ref3; j = 0 <= _ref3 ? ++_l : --_l) {
          key = "B_" + i + "_" + j;
          this.sip.bCoeffs[i][j] = header[key] || 0;
        }
      }
      for (i = _m = 0, _ref4 = this.sip.apOrder; 0 <= _ref4 ? _m <= _ref4 : _m >= _ref4; i = 0 <= _ref4 ? ++_m : --_m) {
        this.sip.apCoeffs[i] = [];
        for (j = _n = 0, _ref5 = this.sip.apOrder; 0 <= _ref5 ? _n <= _ref5 : _n >= _ref5; j = 0 <= _ref5 ? ++_n : --_n) {
          key = "AP_" + i + "_" + j;
          this.sip.apCoeffs[i][j] = header[key] || 0;
        }
      }
      for (i = _o = 0, _ref6 = this.sip.bpOrder; 0 <= _ref6 ? _o <= _ref6 : _o >= _ref6; i = 0 <= _ref6 ? ++_o : --_o) {
        this.sip.bpCoeffs[i] = [];
        for (j = _p = 0, _ref7 = this.sip.bpOrder; 0 <= _ref7 ? _p <= _ref7 : _p >= _ref7; j = 0 <= _ref7 ? ++_p : --_p) {
          key = "BP_" + i + "_" + j;
          this.sip.bpCoeffs[i][j] = header[key] || 0;
        }
      }
      if (!(this.sip.aCoeffs || this.sip.bCoeffs)) {
        throw "Where are the coefficients dude!";
      }
    };

    Mapper.prototype.computeCelestialParameters = function(phi0, theta0) {
      var alpha0, delta0, deltaP1, deltaP2, dist1, dist2, phiP, sol1, sol2, thetaP, _ref, _ref1;
      _ref = this.wcsobj.crval, alpha0 = _ref[0], delta0 = _ref[1];
      _ref1 = [this.wcsobj.lonpole, this.wcsobj.latpole], phiP = _ref1[0], thetaP = _ref1[1];
      deltaP1 = WCS.Math.atan2d(WCS.Math.sind(this.wcsobj.theta0), WCS.Math.cosd(this.wcsobj.theta0 * WCS.Math.cosd(phiP - this.wcsobj.phi0)));
      deltaP2 = WCS.Math.acosd(WCS.Math.sind(delta0) / Math.sqrt(1 - Math.pow(WCS.Math.cosd(this.wcsobj.theta0), 2) * Math.pow(WCS.Math.sind(phiP - this.wcsobj.phi0), 2)));
      sol1 = sol2 = false;
      if (deltaP1 + deltaP2 >= -90 && deltaP1 + deltaP2 <= 90) {
        sol1 = true;
      }
      if (deltaP1 - deltaP2 >= -90 && deltaP1 - deltaP2 <= 90) {
        sol2 = true;
      }
      if (sol1 && sol2) {
        dist1 = Math.abs(deltaP1 + deltaP2 - thetaP);
        dist2 = Math.abs(deltaP1 - deltaP2 - thetaP);
        this.wcsobj.deltaP = dist1 < dist2 ? deltaP1 + deltaP2 : deltaP1 - deltaP2;
      } else if (sol1) {
        this.wcsobj.deltaP = deltaP1 + deltaP2;
      } else if (sol2) {
        this.wcsobj.deltaP = deltaP1 - deltaP2;
      } else {
        this.wcsobj.deltaP = thetaP;
      }
      return this.wcsobj.alphaP = Math.abs(delta0) === 90 ? alpha0 : alpha0 - WCS.Math.asind(WCS.Math.sind(phiP - this.wcsobj.phi0) * WCS.Math.cosd(this.wcsobj.theta0) / WCS.Math.cosd(delta0));
    };

    Mapper.prototype.toIntermediate = function(points) {
      var i, j, proj, _i, _j, _ref, _ref1;
      proj = [];
      for (i = _i = 0, _ref = this.wcsobj.naxis - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        proj[i] = 0;
        points[i] -= this.wcsobj.crpix[i];
        for (j = _j = 0, _ref1 = this.wcsobj.naxis - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; j = 0 <= _ref1 ? ++_j : --_j) {
          proj[i] += this.wcsobj.cdelt[i] * this.wcsobj.pc[i][j] * points[j];
        }
      }
      return proj;
    };

    Mapper.prototype.fromIntermediate = function(proj) {
      var i, j, points, _i, _j, _ref, _ref1;
      points = [];
      for (i = _i = 0, _ref = this.wcsobj.naxis - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        points[i] = 0;
        for (j = _j = 0, _ref1 = this.wcsobj.naxis - 1; 0 <= _ref1 ? _j <= _ref1 : _j >= _ref1; j = 0 <= _ref1 ? ++_j : --_j) {
          points[i] += this.wcsobj.pcInv[i][j] * proj[j] / this.wcsobj.cdelt[i];
        }
        points[i] += this.wcsobj.crpix[i];
      }
      return points;
    };

    Mapper.prototype.toCelestial = function(phi, theta) {
      var cosDecP, cosDphi, cosTheta, dec, ra, sinDecP, sinDphi, sinTheta, xTemp, yTemp, zTemp;
      sinTheta = WCS.Math.sind(theta);
      cosTheta = WCS.Math.cosd(theta);
      sinDphi = WCS.Math.sind(phi - this.wcsobj.lonpole);
      cosDphi = WCS.Math.cosd(phi - this.wcsobj.lonpole);
      sinDecP = WCS.Math.sind(this.wcsobj.deltaP);
      cosDecP = WCS.Math.cosd(this.wcsobj.deltaP);
      xTemp = sinTheta * cosDecP - cosTheta * sinDecP * cosDphi;
      yTemp = -cosTheta * sinDphi;
      zTemp = sinTheta * sinDecP + cosTheta * cosDecP * cosDphi;
      ra = WCS.Math.atan2d(yTemp, xTemp) + this.wcsobj.alphaP;
      ra = (ra + 360) % 360;
      dec = WCS.Math.asind(zTemp);
      return [ra, dec];
    };

    Mapper.prototype.fromCelestial = function(ra, dec) {
      var cosDalpha, cosDelta, cosDp, phi, sinDalpha, sinDelta, sinDp, theta, xTemp, yTemp;
      sinDelta = WCS.Math.sind(dec);
      cosDelta = WCS.Math.cosd(dec);
      sinDp = WCS.Math.sind(this.wcsobj.deltaP);
      cosDp = WCS.Math.cosd(this.wcsobj.deltaP);
      sinDalpha = WCS.Math.sind(ra - this.wcsobj.alphaP);
      cosDalpha = WCS.Math.cosd(ra - this.wcsobj.alphaP);
      xTemp = sinDelta * cosDp - cosDelta * sinDp * cosDalpha;
      yTemp = -cosDelta * sinDalpha;
      phi = this.wcsobj.lonpole + WCS.Math.atan2d(yTemp, xTemp);
      theta = WCS.Math.asind(sinDelta * sinDp + cosDelta * cosDp * cosDalpha);
      return [phi, theta];
    };

    Mapper.prototype.pixelToCoordinate = function() {
      var coords;
      coords = this.toIntermediate(arguments[0], arguments[1]);
      coords = this.toSpherical(coords[0], coords[1]);
      coords = this.toCelestial(coords[0], coords[1]);
      return {
        ra: coords[this.longitudeAxis - 1],
        dec: coords[this.latitudeAxis - 1]
      };
    };

    Mapper.prototype.coordinateToPixel = function() {
      var coords;
      coords = this.fromCelestial(arguments[0], arguments[1]);
      coords = this.fromSpherical(coords[0], coords[1]);
      coords = this.fromIntermediate(coords);
      return {
        x: coords[0],
        y: coords[1]
      };
    };

    return Mapper;

  })();

}).call(this);
