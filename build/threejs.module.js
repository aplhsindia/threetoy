import { Vector2, WebGLRenderer, PerspectiveCamera, Scene, PointLight, DirectionalLight, AmbientLight, SplineCurve, Vector3, Color, OrthographicCamera, PlaneGeometry, ShaderMaterial, Mesh, BufferGeometry, BufferAttribute, AdditiveBlending, Points, MathUtils, CanvasTexture, HalfFloatType, InstancedBufferAttribute, DoubleSide, TextureLoader, MeshBasicMaterial, MeshPhongMaterial, MeshStandardMaterial, InstancedMesh, SphereGeometry, OctahedronGeometry, ConeGeometry, CapsuleGeometry, BoxGeometry, Float32BufferAttribute, FogExp2 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

function pointer(params) {
  const {
    domElement,
    onClick = () => {
    },
    onEnter = () => {
    },
    onMove = () => {
    },
    onLeave = () => {
    },
    onDragStart = () => {
    },
    onDragMove = () => {
    },
    onDragStop = () => {
    }
  } = params;
  const position = new Vector2();
  const nPosition = new Vector2();
  const startPosition = new Vector2();
  const lastPosition = new Vector2();
  const delta = new Vector2();
  const obj = { position, nPosition, hover: false, down: false, removeListeners };
  addListeners();
  return obj;
  function pointerClick(e) {
    if (startPosition.distanceTo(position) < 20) {
      updatePosition(e);
      onClick({ position, nPosition });
    }
  }
  function pointerEnter(e) {
    obj.hover = e.pointerType === "mouse";
    updatePosition(e);
    onEnter({ position, nPosition });
  }
  function pointerDown(e) {
    obj.down = true;
    updatePosition(e);
    startPosition.copy(position);
    lastPosition.copy(position);
    onDragStart({ position, nPosition });
  }
  function pointerMove(e) {
    updatePosition(e);
    delta.copy(position).sub(lastPosition);
    if (obj.down) {
      onDragMove({ position, nPosition, startPosition, lastPosition, delta });
    } else {
      if (!obj.hover) obj.hover = true;
    }
    onMove({ position, nPosition, startPosition, lastPosition, delta });
    lastPosition.copy(position);
  }
  function pointerUp(e) {
    obj.down = false;
    onDragStop();
  }
  function pointerLeave(e) {
    if (obj.down) {
      obj.down = false;
      onDragStop();
    }
    obj.hover = false;
    onLeave();
  }
  function updatePosition(e) {
    const rect = domElement.getBoundingClientRect();
    position.x = e.clientX - rect.left;
    position.y = e.clientY - rect.top;
    nPosition.x = position.x / rect.width * 2 - 1;
    nPosition.y = -(position.y / rect.height) * 2 + 1;
  }
  function addListeners() {
    domElement.addEventListener("click", pointerClick);
    domElement.addEventListener("pointerenter", pointerEnter);
    domElement.addEventListener("pointerdown", pointerDown);
    domElement.addEventListener("pointermove", pointerMove);
    domElement.addEventListener("pointerup", pointerUp);
    domElement.addEventListener("pointerleave", pointerLeave);
  }
  function removeListeners() {
    domElement.removeEventListener("click", pointerClick);
    domElement.removeEventListener("pointerenter", pointerEnter);
    domElement.removeEventListener("pointerdown", pointerDown);
    domElement.removeEventListener("pointermove", pointerMove);
    domElement.removeEventListener("pointerup", pointerUp);
    domElement.removeEventListener("pointerleave", pointerLeave);
  }
}

function three(params) {
  const options = {
    el: null,
    canvas: null,
    eventsEl: null,
    width: null,
    height: null,
    resize: true,
    alpha: false,
    antialias: false,
    orbitControls: false,
    init() {
    },
    initCamera() {
    },
    initScene() {
    },
    afterResize() {
    },
    beforeRender() {
    },
    ...params
  };
  const three = {
    renderer: null,
    camera: null,
    scene: null,
    pointer: null,
    width: 0,
    height: 0,
    wWidth: 0,
    wHeight: 0,
    clock: {
      startTime: 0,
      time: 0,
      elapsed: 0
    },
    options
  };
  let render;
  let cameraCtrl;
  init();
  return three;
  function init() {
    var _a, _b, _c, _d, _e;
    let canvas;
    if (options.el) {
      canvas = document.createElement("canvas");
      options.el.appendChild(canvas);
    } else if (options.canvas) {
      canvas = options.canvas;
    } else {
      throw new Error("Missing parameter : el or canvas is required");
    }
    (_a = options.init) == null ? void 0 : _a.call(options, three);
    three.renderer = new WebGLRenderer({ canvas, alpha: options.alpha, antialias: options.antialias });
    (_b = options.initRenderer) == null ? void 0 : _b.call(options, three);
    three.camera = new PerspectiveCamera();
    three.camera.position.z = 50;
    (_c = options.initCamera) == null ? void 0 : _c.call(options, three);
    if (options.orbitControls) {
      cameraCtrl = new OrbitControls(three.camera, (_d = options.eventsEl) != null ? _d : three.renderer.domElement);
      cameraCtrl.enableDamping = true;
      cameraCtrl.dampingFactor = 0.1;
      if (typeof options.orbitControls === "object") {
        Object.keys(options.orbitControls).forEach((key) => {
          cameraCtrl[key] = options.orbitControls[key];
        });
      }
    }
    resize();
    if (options.resize && !options.width && !options.height) {
      window.addEventListener("resize", resize);
    }
    three.scene = new Scene();
    (_e = options.initScene) == null ? void 0 : _e.call(options, three);
    initPointer();
    render = options.render ? options.render : () => {
      three.renderer.render(three.scene, three.camera);
    };
    requestAnimationFrame((timestamp) => {
      three.clock.startTime = three.clock.time = timestamp;
      requestAnimationFrame(animate);
    });
  }
  function initPointer() {
    var _a, _b;
    const pointerOptions = {};
    if (options.onPointerEnter) {
      pointerOptions.onEnter = options.onPointerEnter;
    }
    if (options.onPointerMove) {
      pointerOptions.onMove = options.onPointerMove;
    }
    if (options.onPointerMove) {
      pointerOptions.onLeave = options.onPointerLeave;
    }
    if (Object.keys(pointerOptions).length > 0) {
      three.pointer = pointer({ domElement: (_b = options.eventsEl) != null ? _b : (_a = options.el) != null ? _a : options.canvas, ...pointerOptions });
    }
  }
  function animate(timestamp) {
    const { clock } = three;
    clock.elapsed = timestamp - clock.time;
    clock.time = timestamp;
    options.beforeRender(three);
    if (cameraCtrl) cameraCtrl.update();
    render(three);
    requestAnimationFrame(animate);
  }
  function resize() {
    var _a;
    if (options.width && options.height) {
      three.width = options.width;
      three.height = options.height;
    } else if (options.resize === "window") {
      three.width = window.innerWidth;
      three.height = window.innerHeight;
    } else {
      const parent = three.renderer.domElement.parentElement;
      three.width = parent.clientWidth;
      three.height = parent.clientHeight;
    }
    three.renderer.setSize(three.width, three.height);
    three.camera.aspect = three.width / three.height;
    three.camera.updateProjectionMatrix();
    if (three.camera instanceof PerspectiveCamera) {
      const wsize = getCameraViewSize();
      three.wWidth = wsize[0];
      three.wHeight = wsize[1];
    } else {
      three.wWidth = three.camera.top - three.camera.bottom;
      three.wHeight = three.camera.right - three.camera.left;
    }
    (_a = options.afterResize) == null ? void 0 : _a.call(options, three);
  }
  function getCameraViewSize() {
    const vFOV = three.camera.fov * Math.PI / 180;
    const h = 2 * Math.tan(vFOV / 2) * Math.abs(three.camera.position.z);
    const w = h * three.camera.aspect;
    return [w, h];
  }
}
function commonConfig$1(params) {
  const config = {};
  const keys = ["el", "canvas", "eventsEl", "width", "height", "resize", "orbitControls"];
  keys.forEach((key) => {
    if (params[key] !== void 0) config[key] = params[key];
  });
  return config;
}
function initLights(scene, lightsConfig) {
  const lights = [];
  if (Array.isArray(lightsConfig) && lightsConfig.length > 0) {
    let light;
    lightsConfig.forEach((lightConfig) => {
      switch (lightConfig.type) {
        case "ambient":
          light = new AmbientLight(...lightConfig.params);
          break;
        case "directional":
          light = new DirectionalLight(...lightConfig.params);
          break;
        case "point":
          light = new PointLight(...lightConfig.params);
          break;
        default:
          console.error(`Unknown light type ${lightConfig.type}`);
      }
      if (light) {
        if (typeof lightConfig.props === "object") {
          Object.keys(lightConfig.props).forEach((key) => {
            if (key === "position") {
              light.position.set(...lightConfig.props[key]);
            } else light[key] = lightConfig.props[key];
          });
        }
        scene.add(light);
        lights.push(light);
      }
    });
  }
  return lights;
}

const defaultConfig$6 = {
  shaderPoints: 8,
  curvePoints: 80,
  curveLerp: 0.75,
  radius1: 3,
  radius2: 5,
  velocityTreshold: 10,
  sleepRadiusX: 150,
  sleepRadiusY: 150,
  sleepTimeCoefX: 25e-4,
  sleepTimeCoefY: 25e-4
};
function index$5(params) {
  const config = { ...defaultConfig$6, ...params };
  const points = new Array(config.curvePoints).fill(0).map(() => new Vector2());
  const spline = new SplineCurve(points);
  const velocity = new Vector3();
  const velocityTarget = new Vector3();
  const uRatio = { value: new Vector2() };
  const uSize = { value: new Vector2() };
  const uPoints = { value: new Array(config.shaderPoints).fill(0).map(() => new Vector2()) };
  const uColor = { value: new Color(16711935) };
  let material;
  let plane;
  let hover = false;
  const threeConfig = {};
  const keys = ["el", "canvas", "width", "height", "resize"];
  keys.forEach((key) => {
    if (params[key] !== void 0) threeConfig[key] = params[key];
  });
  three({
    ...threeConfig,
    antialias: false,
    initCamera(three2) {
      three2.camera = new OrthographicCamera();
    },
    initScene({ scene }) {
      const geometry = new PlaneGeometry(2, 2);
      material = new ShaderMaterial({
        uniforms: { uRatio, uSize, uPoints, uColor },
        defines: {
          SHADER_POINTS: config.shaderPoints
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          // https://www.shadertoy.com/view/wdy3DD
          // https://www.shadertoy.com/view/MlKcDD
          // Signed distance to a quadratic bezier
          float sdBezier(vec2 pos, vec2 A, vec2 B, vec2 C) {
            vec2 a = B - A;
            vec2 b = A - 2.0*B + C;
            vec2 c = a * 2.0;
            vec2 d = A - pos;
            float kk = 1.0 / dot(b,b);
            float kx = kk * dot(a,b);
            float ky = kk * (2.0*dot(a,a)+dot(d,b)) / 3.0;
            float kz = kk * dot(d,a);
            float res = 0.0;
            float p = ky - kx*kx;
            float p3 = p*p*p;
            float q = kx*(2.0*kx*kx - 3.0*ky) + kz;
            float h = q*q + 4.0*p3;
            if(h >= 0.0){
              h = sqrt(h);
              vec2 x = (vec2(h, -h) - q) / 2.0;
              vec2 uv = sign(x)*pow(abs(x), vec2(1.0/3.0));
              float t = uv.x + uv.y - kx;
              t = clamp( t, 0.0, 1.0 );
              // 1 root
              vec2 qos = d + (c + b*t)*t;
              res = length(qos);
            } else {
              float z = sqrt(-p);
              float v = acos( q/(p*z*2.0) ) / 3.0;
              float m = cos(v);
              float n = sin(v)*1.732050808;
              vec3 t = vec3(m + m, -n - m, n - m) * z - kx;
              t = clamp( t, 0.0, 1.0 );
              // 3 roots
              vec2 qos = d + (c + b*t.x)*t.x;
              float dis = dot(qos,qos);
              res = dis;
              qos = d + (c + b*t.y)*t.y;
              dis = dot(qos,qos);
              res = min(res,dis);
              qos = d + (c + b*t.z)*t.z;
              dis = dot(qos,qos);
              res = min(res,dis);
              res = sqrt( res );
            }
            return res;
          }

          uniform vec2 uRatio;
          uniform vec2 uSize;
          uniform vec2 uPoints[SHADER_POINTS];
          uniform vec3 uColor;
          varying vec2 vUv;
          void main() {
            float intensity = 1.0;
            float radius = 0.015;

            vec2 pos = (vUv - 0.5) * uRatio;

            vec2 c = (uPoints[0] + uPoints[1]) / 2.0;
            vec2 c_prev;
            float dist = 10000.0;
            for(int i = 0; i < SHADER_POINTS - 1; i++){
              c_prev = c;
              c = (uPoints[i] + uPoints[i + 1]) / 2.0;
              dist = min(dist, sdBezier(pos, c_prev, uPoints[i], c));
            }
            dist = max(0.0, dist);

            float glow = pow(uSize.y / dist, intensity);
            vec3 col = vec3(0.0);
            col += 10.0 * vec3(smoothstep(uSize.x, 0.0, dist));
            col += glow * uColor;

            // Tone mapping
            col = 1.0 - exp(-col);
            col = pow(col, vec3(0.4545));
  
            gl_FragColor = vec4(col, 1.0);
          }
        `
      });
      plane = new Mesh(geometry, material);
      scene.add(plane);
    },
    afterResize({ width, height }) {
      uSize.value.set(config.radius1, config.radius2);
      if (width >= height) {
        uRatio.value.set(1, height / width);
        uSize.value.multiplyScalar(1 / width);
      } else {
        uRatio.value.set(width / height, 1);
        uSize.value.multiplyScalar(1 / height);
      }
    },
    beforeRender({ clock, width, height, wWidth }) {
      for (let i = 1; i < config.curvePoints; i++) {
        points[i].lerp(points[i - 1], config.curveLerp);
      }
      for (let i = 0; i < config.shaderPoints; i++) {
        spline.getPoint(i / (config.shaderPoints - 1), uPoints.value[i]);
      }
      if (!hover) {
        const t1 = clock.time * config.sleepTimeCoefX;
        const t2 = clock.time * config.sleepTimeCoefY;
        const cos = Math.cos(t1);
        const sin = Math.sin(t2);
        const r1 = config.sleepRadiusX * wWidth / width;
        const r2 = config.sleepRadiusY * wWidth / width;
        const x = r1 * cos;
        const y = r2 * sin;
        spline.points[0].set(x, y);
        uColor.value.r = 0.5 + 0.5 * Math.cos(clock.time * 15e-4);
        uColor.value.g = 0;
        uColor.value.b = 1 - uColor.value.r;
      } else {
        uColor.value.r = velocity.z;
        uColor.value.g = 0;
        uColor.value.b = 1 - velocity.z;
        velocity.multiplyScalar(0.95);
      }
    },
    onPointerMove({ nPosition, delta }) {
      hover = true;
      const x = 0.5 * nPosition.x * uRatio.value.x;
      const y = 0.5 * nPosition.y * uRatio.value.y;
      spline.points[0].set(x, y);
      velocityTarget.x = Math.min(velocity.x + Math.abs(delta.x) / config.velocityTreshold, 1);
      velocityTarget.y = Math.min(velocity.y + Math.abs(delta.y) / config.velocityTreshold, 1);
      velocityTarget.z = Math.sqrt(velocityTarget.x * velocityTarget.x + velocityTarget.y * velocityTarget.y);
      velocity.lerp(velocityTarget, 0.05);
    },
    onPointerLeave() {
      hover = false;
    }
  });
  return { config };
}

function colorScale(colors) {
  let range = [];
  setColors(colors);
  const dummy = new Color();
  return { setColors, getColorAt };
  function setColors(colors2) {
    range = [];
    colors2.forEach((color) => {
      range.push(new Color(color));
    });
  }
  function getColorAt(progress) {
    const p = Math.max(0, Math.min(1, progress)) * (colors.length - 1);
    const i1 = Math.floor(p);
    const c1 = range[i1];
    if (i1 >= colors.length - 1) {
      return c1.clone();
    }
    const p1 = p - i1;
    const c2 = range[i1 + 1];
    dummy.r = c1.r + p1 * (c2.r - c1.r);
    dummy.g = c1.g + p1 * (c2.g - c1.g);
    dummy.b = c1.b + p1 * (c2.b - c1.b);
    return dummy.clone();
  }
}

var psrdnoise$1 = "vec4 permute(vec4 x){vec4 xm=mod(x,289.0);return mod(((xm*34.0)+10.0)*xm,289.0);}float psrdnoise(vec3 x,vec3 period,float alpha,out vec3 gradient){\n#ifndef PERLINGRID\nconst mat3 M=mat3(0.0,1.0,1.0,1.0,0.0,1.0,1.0,1.0,0.0);const mat3 Mi=mat3(-0.5,0.5,0.5,0.5,-0.5,0.5,0.5,0.5,-0.5);\n#endif\nvec3 uvw;\n#ifndef PERLINGRID\nuvw=M*x;\n#else\nuvw=x+dot(x,vec3(1.0/3.0));\n#endif\nvec3 i0=floor(uvw);vec3 f0=fract(uvw);vec3 g_=step(f0.xyx,f0.yzz);vec3 l_=1.0-g_;vec3 g=vec3(l_.z,g_.xy);vec3 l=vec3(l_.xy,g_.z);vec3 o1=min(g,l);vec3 o2=max(g,l);vec3 i1=i0+o1;vec3 i2=i0+o2;vec3 i3=i0+vec3(1.0);vec3 v0,v1,v2,v3;\n#ifndef PERLINGRID\nv0=Mi*i0;v1=Mi*i1;v2=Mi*i2;v3=Mi*i3;\n#else\nv0=i0-dot(i0,vec3(1.0/6.0));v1=i1-dot(i1,vec3(1.0/6.0));v2=i2-dot(i2,vec3(1.0/6.0));v3=i3-dot(i3,vec3(1.0/6.0));\n#endif\nvec3 x0=x-v0;vec3 x1=x-v1;vec3 x2=x-v2;vec3 x3=x-v3;if(any(greaterThan(period,vec3(0.0)))){vec4 vx=vec4(v0.x,v1.x,v2.x,v3.x);vec4 vy=vec4(v0.y,v1.y,v2.y,v3.y);vec4 vz=vec4(v0.z,v1.z,v2.z,v3.z);if(period.x>0.0)vx=mod(vx,period.x);if(period.y>0.0)vy=mod(vy,period.y);if(period.z>0.0)vz=mod(vz,period.z);\n#ifndef PERLINGRID\ni0=M*vec3(vx.x,vy.x,vz.x);i1=M*vec3(vx.y,vy.y,vz.y);i2=M*vec3(vx.z,vy.z,vz.z);i3=M*vec3(vx.w,vy.w,vz.w);\n#else\nv0=vec3(vx.x,vy.x,vz.x);v1=vec3(vx.y,vy.y,vz.y);v2=vec3(vx.z,vy.z,vz.z);v3=vec3(vx.w,vy.w,vz.w);i0=v0+dot(v0,vec3(1.0/3.0));i1=v1+dot(v1,vec3(1.0/3.0));i2=v2+dot(v2,vec3(1.0/3.0));i3=v3+dot(v3,vec3(1.0/3.0));\n#endif\ni0=floor(i0+0.5);i1=floor(i1+0.5);i2=floor(i2+0.5);i3=floor(i3+0.5);}vec4 hash=permute(permute(permute(vec4(i0.z,i1.z,i2.z,i3.z))+vec4(i0.y,i1.y,i2.y,i3.y))+vec4(i0.x,i1.x,i2.x,i3.x));vec4 theta=hash*3.883222077;vec4 sz=hash*-0.006920415+0.996539792;vec4 psi=hash*0.108705628;vec4 Ct=cos(theta);vec4 St=sin(theta);vec4 sz_prime=sqrt(1.0-sz*sz);vec4 gx,gy,gz;\n#ifdef FASTROTATION\nvec4 qx=St;vec4 qy=-Ct;vec4 qz=vec4(0.0);vec4 px=sz*qy;vec4 py=-sz*qx;vec4 pz=sz_prime;psi+=alpha;vec4 Sa=sin(psi);vec4 Ca=cos(psi);gx=Ca*px+Sa*qx;gy=Ca*py+Sa*qy;gz=Ca*pz+Sa*qz;\n#else\nif(alpha!=0.0){vec4 Sp=sin(psi);vec4 Cp=cos(psi);vec4 px=Ct*sz_prime;vec4 py=St*sz_prime;vec4 pz=sz;vec4 Ctp=St*Sp-Ct*Cp;vec4 qx=mix(Ctp*St,Sp,sz);vec4 qy=mix(-Ctp*Ct,Cp,sz);vec4 qz=-(py*Cp+px*Sp);vec4 Sa=vec4(sin(alpha));vec4 Ca=vec4(cos(alpha));gx=Ca*px+Sa*qx;gy=Ca*py+Sa*qy;gz=Ca*pz+Sa*qz;}else{gx=Ct*sz_prime;gy=St*sz_prime;gz=sz;}\n#endif\nvec3 g0=vec3(gx.x,gy.x,gz.x);vec3 g1=vec3(gx.y,gy.y,gz.y);vec3 g2=vec3(gx.z,gy.z,gz.z);vec3 g3=vec3(gx.w,gy.w,gz.w);vec4 w=0.5-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3));w=max(w,0.0);vec4 w2=w*w;vec4 w3=w2*w;vec4 gdotx=vec4(dot(g0,x0),dot(g1,x1),dot(g2,x2),dot(g3,x3));float n=dot(w3,gdotx);vec4 dw=-6.0*w2*gdotx;vec3 dn0=w3.x*g0+dw.x*x0;vec3 dn1=w3.y*g1+dw.y*x1;vec3 dn2=w3.z*g2+dw.z*x2;vec3 dn3=w3.w*g3+dw.w*x3;gradient=39.5*(dn0+dn1+dn2+dn3);return 39.5*n;}";

const { randFloat: rnd$3, randFloatSpread: rndFS$3 } = MathUtils;
const defaultConfig$5 = {
  gpgpuSize: 256,
  centerColor: 355441,
  edgeColor: 12852,
  colors: [16284204, 16284204, 16284204],
  color: 16284204,
  coordScale: 1.5,
  noiseIntensity: 1e-3,
  noiseTimeCoef: 1e-4,
  pointSize: 5,
  pointDecay: 5e-3,
  sleepRadiusX: 250,
  sleepRadiusY: 250,
  sleepTimeCoefX: 1e-3,
  sleepTimeCoefY: 2e-3,
  hover: 0,
  position: [{ x: 0, y: 0 }]
};
function index$4(params) {
  const config = { ...defaultConfig$5, ...params };
  const WIDTH = config.gpgpuSize;
  const COUNT = WIDTH * WIDTH;
  let gpu;
  let dtPosition, dtVelocity;
  let velocityVariable, positionVariable;
  const uTime = { value: 0 };
  const uCoordScale = { value: config.coordScale };
  const uNoiseIntensity = { value: config.noiseIntensity };
  const uPointSize = { value: config.pointSize };
  const uPointDecay = { value: config.pointDecay };
  const uColor = { value: new Color(config.color) };
  const uMouse = { value: new Vector2() };
  const uMouseDirection = { value: new Vector2() };
  const uniforms = { uTime, uCoordScale, uNoiseIntensity, uPointSize, uPointDecay, uColor, uMouse, uMouseDirection };
  let geometry, material, mesh;
  let hover = config.hover;
  const mouseTarget = new Vector2();
  var mindex = 0;
  const changes = config.position;
  let mchange = { x: 0, y: -100 };
  three({
    ...commonConfig(params),
    alpha: true,
    // Enable transparency for the renderer
    antialias: false,
    initRenderer({ renderer }) {
      renderer.setClearColor(0, 0);
      initGPU(renderer);
    },
    initScene({ scene }) {
      initParticles();
      scene.background = null;
      scene.add(mesh);
    },
    beforeRender({ width, wWidth, wHeight, clock, pointer }) {
      var _a, _b;
      if (!hover) {
        mouseTarget.x = (_a = mchange.x) != null ? _a : 0;
        mouseTarget.y = (_b = mchange.y) != null ? _b : 0;
      } else {
        mouseTarget.x = pointer.nPosition.x * 0.5 * wWidth;
        mouseTarget.y = pointer.nPosition.y * 0.5 * wHeight;
      }
      uMouse.value.lerp(mouseTarget, 0.05);
      uTime.value = clock.time * config.noiseTimeCoef;
      gpu.compute();
      material.uniforms.texturePosition.value = gpu.getCurrentRenderTarget(positionVariable).texture;
      material.uniforms.textureVelocity.value = gpu.getCurrentRenderTarget(velocityVariable).texture;
    },
    onPointerMove({ delta }) {
      uMouseDirection.value.copy(delta);
      console.log(delta);
    },
    onPointerLeave() {
    },
    onWheel(event) {
    }
  });
  window.addEventListener("load", () => {
    window.addEventListener("wheel", handleWheel, { passive: false });
    function handleWheel(event) {
      event.preventDefault();
      const scrollAmount = event.deltaY;
      console.log("Scroll amount (deltaY):", scrollAmount);
      if (scrollAmount > 0) {
        if (mindex < changes.length - 1) {
          mindex++;
        }
      } else if (scrollAmount < 0) {
        if (mindex > 0) {
          mindex--;
        }
      }
      console.log("Current mindex:", mindex);
      if (mindex >= 0 && mindex < changes.length) {
        const change = changes[mindex];
        mchange.x = change.x;
        mchange.y = change.y;
        console.log(mindex);
        const moveEvent = new MouseEvent("mousemove", {
          clientX: change.x,
          // X position in pixels
          clientY: change.y
          // Y position in pixels
        });
        document.dispatchEvent(moveEvent);
      }
    }
  });
  return { config, uniforms };
  function initGPU(renderer) {
    gpu = new GPUComputationRenderer(WIDTH, WIDTH, renderer);
    dtPosition = gpu.createTexture();
    dtVelocity = gpu.createTexture();
    initTextures(dtPosition, dtVelocity);
    velocityVariable = gpu.addVariable("textureVelocity", `
      ${psrdnoise$1}
      uniform float uTime;
      uniform float uCoordScale;
      uniform float uNoiseIntensity;
      void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        vec4 pos = texture2D(texturePosition, uv);
        vec4 vel = texture2D(textureVelocity, uv);

        if (pos.w < 0.0) {
          vel.x = 0.0;
          vel.y = 0.0;
          vel.z = 0.0;
        } else {
          vec3 grad;
          vec3 p = vec3(0.0);
          float n = psrdnoise(pos.xyz * uCoordScale, p, uTime, grad);
          vel.xyz += grad * uNoiseIntensity * pos.w;
        }
        gl_FragColor = vel;
      }
    `, dtVelocity);
    positionVariable = gpu.addVariable("texturePosition", `
      uniform float uPointDecay;
      uniform vec2 uMouse;
      uniform vec2 uMouseDirection;
      void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        vec4 pos = texture2D(texturePosition, uv);
        vec4 vel = texture2D(textureVelocity, uv);
        if (pos.w < 0.0) { pos.w = vel.w; }
        pos.w -= uPointDecay;
        if (pos.w <= 0.0) {
          pos.xy = uMouse.xy;
          pos.z = 0.0;
        } else {
          pos.xyz += vel.xyz;
        }
        gl_FragColor = pos;
      }
    `, dtPosition);
    gpu.setVariableDependencies(velocityVariable, [positionVariable, velocityVariable]);
    gpu.setVariableDependencies(positionVariable, [positionVariable, velocityVariable]);
    Object.keys(uniforms).forEach((key) => {
      velocityVariable.material.uniforms[key] = uniforms[key];
      positionVariable.material.uniforms[key] = uniforms[key];
    });
    const error = gpu.init();
    if (error !== null) {
      console.error(error);
    }
  }
  function initParticles() {
    geometry = new BufferGeometry();
    const positions = new Float32Array(COUNT * 3);
    const uvs = new Float32Array(COUNT * 2);
    const colors = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT * 3; i += 3) {
      positions[i] = 0;
      positions[i + 1] = 0;
      positions[i + 2] = 0;
    }
    let index = 0;
    for (let j = 0; j < WIDTH; j++) {
      for (let i = 0; i < WIDTH; i++) {
        uvs[index++] = i / (WIDTH - 1);
        uvs[index++] = j / (WIDTH - 1);
      }
    }
    const cscale = colorScale(config.colors);
    for (let i = 0; i < COUNT * 3; i += 3) {
      const color = cscale.getColorAt(Math.random());
      colors[i] = color.r;
      colors[i + 1] = color.g;
      colors[i + 2] = color.b;
    }
    geometry.setAttribute("position", new BufferAttribute(positions, 3));
    geometry.setAttribute("uv", new BufferAttribute(uvs, 2));
    geometry.setAttribute("color", new BufferAttribute(colors, 3));
    material = new ShaderMaterial({
      blending: AdditiveBlending,
      depthTest: false,
      transparent: true,
      vertexColors: true,
      uniforms: {
        texturePosition: { value: null },
        textureVelocity: { value: null },
        uPointSize,
        uColor
      },
      vertexShader: `
        uniform sampler2D texturePosition;
        uniform sampler2D textureVelocity;
        uniform float uPointSize;
        varying vec4 vPos;
        varying vec4 vVel;
        varying vec3 vCol;
        void main() {
          vCol = color;
          vPos = texture2D(texturePosition, uv);
          vVel = texture2D(textureVelocity, uv);
          vec4 mvPosition = modelViewMatrix * vec4(vPos.xyz, 1.0);
          // gl_PointSize = smoothstep(0.0, 2.0, vPos.w) * uPointSize;
          gl_PointSize = vPos.w * (vVel.w + 0.5) * uPointSize;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 uColor;
        varying vec4 vPos;
        varying vec4 vVel;
        varying vec3 vCol;
        void main() {
          float dist = length(gl_PointCoord - 0.5);
          if (dist > 0.5) discard;
          // float a = smoothstep(0.0, 1.0, vPos.w);
          gl_FragColor = vec4(mix(vCol, uColor, vPos.w), vPos.w);
        }
      `
    });
    mesh = new Points(geometry, material);
    mesh.matrixAutoUpdate = false;
    mesh.updateMatrix();
  }
  function initTextures(texturePosition, textureVelocity) {
    const posArray = texturePosition.image.data;
    const velArray = textureVelocity.image.data;
    for (let k = 0, kl = posArray.length; k < kl; k += 4) {
      posArray[k + 0] = rndFS$3(1);
      posArray[k + 1] = rndFS$3(1);
      posArray[k + 2] = -1e5;
      posArray[k + 3] = rnd$3(0.1, 1);
      velArray[k + 0] = 0;
      velArray[k + 1] = 0;
      velArray[k + 2] = 0;
      velArray[k + 3] = rnd$3(0.1, 1);
    }
  }
}
function commonConfig(params) {
  const config = {};
  const keys = ["el", "canvas", "width", "height", "resize"];
  keys.forEach((key) => {
    if (params[key] !== void 0) config[key] = params[key];
  });
  return config;
}

const defaultConfig$4 = {
  width: 256,
  height: 256
};
function useCanvasTexture(params) {
  const config = { ...defaultConfig$4, ...params };
  const canvas = document.createElement("canvas");
  canvas.width = config.width;
  canvas.height = config.height;
  const ctx = canvas.getContext("2d");
  const texture = new CanvasTexture(ctx.canvas);
  return { canvas, ctx, texture };
}

var psrdnoise = "float psrdnoise(vec2 x,vec2 period,float alpha,out vec2 gradient){vec2 uv=vec2(x.x+x.y*0.5,x.y);vec2 i0=floor(uv);vec2 f0=fract(uv);float cmp=step(f0.y,f0.x);vec2 o1=vec2(cmp,1.0-cmp);vec2 i1=i0+o1;vec2 i2=i0+vec2(1.0,1.0);vec2 v0=vec2(i0.x-i0.y*0.5,i0.y);vec2 v1=vec2(v0.x+o1.x-o1.y*0.5,v0.y+o1.y);vec2 v2=vec2(v0.x+0.5,v0.y+1.0);vec2 x0=x-v0;vec2 x1=x-v1;vec2 x2=x-v2;vec3 iu,iv;vec3 xw,yw;if(any(greaterThan(period,vec2(0.0)))){xw=vec3(v0.x,v1.x,v2.x);yw=vec3(v0.y,v1.y,v2.y);if(period.x>0.0)xw=mod(vec3(v0.x,v1.x,v2.x),period.x);if(period.y>0.0)yw=mod(vec3(v0.y,v1.y,v2.y),period.y);iu=floor(xw+0.5*yw+0.5);iv=floor(yw+0.5);}else{iu=vec3(i0.x,i1.x,i2.x);iv=vec3(i0.y,i1.y,i2.y);}vec3 hash=mod(iu,289.0);hash=mod((hash*51.0+2.0)*hash+iv,289.0);hash=mod((hash*34.0+10.0)*hash,289.0);vec3 psi=hash*0.07482+alpha;vec3 gx=cos(psi);vec3 gy=sin(psi);vec2 g0=vec2(gx.x,gy.x);vec2 g1=vec2(gx.y,gy.y);vec2 g2=vec2(gx.z,gy.z);vec3 w=0.8-vec3(dot(x0,x0),dot(x1,x1),dot(x2,x2));w=max(w,0.0);vec3 w2=w*w;vec3 w4=w2*w2;vec3 gdotx=vec3(dot(g0,x0),dot(g1,x1),dot(g2,x2));float n=dot(w4,gdotx);vec3 w3=w2*w;vec3 dw=-8.0*w3*gdotx;vec2 dn0=w4.x*g0+dw.x*x0;vec2 dn1=w4.y*g1+dw.y*x1;vec2 dn2=w4.z*g2+dw.z*x2;gradient=10.9*(dn0+dn1+dn2);return 10.9*n;}";

const defaultConfig$3 = {
  colors: [16777215, 0],
  minStroke: 5,
  maxStroke: 5,
  timeCoef: 5e-4,
  coordScale: 2,
  displacementScale: 2e-3,
  mouseScale: 0.25,
  mouseLerp: 0.025
};
function index$3(params) {
  const config = { ...defaultConfig$3, ...params };
  const canvasTexture = useCanvasTexture({ width: 1, height: 4096 });
  drawTexture();
  const uniforms = {
    uMap: { value: canvasTexture.texture },
    uTime: { value: 0 },
    uCoordScale: { value: config.coordScale },
    uDisplacementScale: { value: config.displacementScale },
    uMouse: { value: new Vector2() }
  };
  const geometry = new PlaneGeometry();
  const material = new ShaderMaterial({
    uniforms,
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D uMap;
      uniform float uTime;
      uniform float uCoordScale;
      uniform float uDisplacementScale;
      uniform vec2 uMouse;
      varying vec2 vUv;
      ${psrdnoise}
      void main() {
        vec2 p = vec2(0.0);
        vec2 grad;
        float n = psrdnoise(vUv * uCoordScale + uMouse, p, uTime, grad);
        // grad *= uCoordScale;
        vec2 uv = vUv + uDisplacementScale * grad;
        gl_FragColor = texture2D(uMap, uv.yx);
      }
    `
  });
  const mesh = new Mesh(geometry, material);
  const mouseTarget = new Vector2();
  const threeConfig = {};
  const keys = ["el", "canvas", "width", "height", "resize"];
  keys.forEach((key) => {
    if (params[key] !== void 0) threeConfig[key] = params[key];
  });
  three({
    ...threeConfig,
    antialias: true,
    initScene({ camera, scene, wWidth, wHeight }) {
      mesh.scale.set(wWidth * 2, wHeight * 2, 1);
      scene.add(mesh);
      camera.position.set(0, -30, 7);
      camera.lookAt(0, -19, 0);
    },
    beforeRender({ clock }) {
      uniforms.uTime.value = clock.time * config.timeCoef;
      uniforms.uMouse.value.lerp(mouseTarget, config.mouseLerp);
    },
    onPointerMove({ nPosition }) {
      mouseTarget.set(-nPosition.x, nPosition.y).multiplyScalar(config.mouseScale);
    },
    onPointerLeave() {
      mouseTarget.set(0, 0);
    }
  });
  return { config, uniforms, drawTexture };
  function drawTexture() {
    const ctx = canvasTexture.ctx;
    ctx.lineWidth = 0;
    const { width, height } = canvasTexture.canvas;
    const cscale = colorScale(config.colors);
    let y = 0;
    let dy;
    while (y < height) {
      dy = config.minStroke + Math.random() * (config.maxStroke - config.minStroke);
      ctx.fillStyle = cscale.getColorAt(Math.random()).getStyle();
      ctx.beginPath();
      ctx.rect(0, y - 1, width, dy + 1);
      ctx.fill();
      ctx.closePath();
      y += dy;
    }
    canvasTexture.texture.needsUpdate = true;
  }
}

var mat3LookAt = "mat3 lookAt(vec3 origin,vec3 target,vec3 up){vec3 z=target-origin;if(z.x*z.x+z.y*z.y+z.z*z.z==0.0){z.z=1.0;}z=normalize(z);vec3 x=cross(up,z);if(x.x*x.x+x.y*x.y+x.z*x.z==0.0){if(abs(up.z)==1.0){z.x+=0.0001;}else{z.z+=0.0001;}x=cross(up,z);}x=normalize(x);vec3 y=cross(z,x);return mat3(x,y,z);}";

var mat4Compose = "mat4 compose(vec3 pos,mat3 rmat,vec3 scale){return mat4(rmat[0][0]*scale.x,rmat[0][1]*scale.x,rmat[0][2]*scale.x,0.0,rmat[1][0]*scale.y,rmat[1][1]*scale.y,rmat[1][2]*scale.y,0.0,rmat[2][0]*scale.z,rmat[2][1]*scale.z,rmat[2][2]*scale.z,0.0,pos.x,pos.y,pos.z,1.0);}";

const { randFloat: rnd$2, randFloatSpread: rndFS$2 } = MathUtils;
const defaultConfig$2 = {
  gpgpuSize: 64,
  background: 16777215,
  material: "basic",
  materialParams: {},
  texture: null,
  textureCount: 1,
  colors: [16777215, 16777215],
  lights: [
    { type: "ambient", params: [16777215, 0.5] },
    { type: "directional", params: [16777215, 1], props: { position: [0, 10, 0] } }
  ],
  wingsScale: [1, 1, 1],
  wingsWidthSegments: 8,
  wingsHeightSegments: 8,
  wingsSpeed: 0.75,
  wingsDisplacementScale: 1.25,
  noiseCoordScale: 0.01,
  noiseTimeCoef: 5e-4,
  noiseIntensity: 25e-4,
  attractionRadius1: 100,
  attractionRadius2: 150,
  maxVelocity: 0.1
};
function index$2(params) {
  const config = { ...defaultConfig$2, ...params };
  if (!["basic", "phong", "standard"].includes(config.material)) {
    throw new Error(`Invalid material ${config.material}`);
  }
  if (!Number.isInteger(config.wingsWidthSegments) || config.wingsWidthSegments % 2 !== 0) {
    throw new Error(`Invalid wingsWidthSegments ${config.wingsWidthSegments}`);
  }
  const WIDTH = config.gpgpuSize;
  const COUNT = WIDTH * WIDTH;
  let gpu;
  let dtPosition, dtVelocity;
  let velocityVariable, positionVariable;
  const uTexturePosition = { value: null };
  const uOldTexturePosition = { value: null };
  const uTextureVelocity = { value: null };
  const uTime = { value: 0 };
  const uNoiseCoordScale = { value: config.noiseCoordScale };
  const uNoiseIntensity = { value: config.noiseIntensity };
  const uMaxVelocity = { value: config.maxVelocity };
  const uAttractionRadius1 = { value: config.attractionRadius1 };
  const uAttractionRadius2 = { value: config.attractionRadius2 };
  const uWingsScale = { value: new Vector3(...config.wingsScale) };
  const uWingsSpeed = { value: config.wingsSpeed };
  const uWingsDisplacementScale = { value: config.wingsDisplacementScale };
  const gpuTexturesUniforms = { uTexturePosition, uOldTexturePosition, uTextureVelocity };
  const commonUniforms = { uTime, uNoiseCoordScale, uNoiseIntensity, uMaxVelocity, uAttractionRadius1, uAttractionRadius2, uWingsScale, uWingsSpeed, uWingsDisplacementScale };
  const uniforms = { ...gpuTexturesUniforms, ...commonUniforms };
  let geometry, material, iMesh;
  const _three = three({
    ...commonConfig$1(params),
    antialias: true,
    orbitControls: true,
    initRenderer({ renderer }) {
      initGPU(renderer);
    },
    initCamera({ camera }) {
      camera.position.set(0, 50, 70);
    },
    initScene({ scene }) {
      initScene(scene);
    },
    beforeRender({ clock }) {
      uTime.value = clock.time * config.noiseTimeCoef;
      gpu.compute();
      uTexturePosition.value = positionVariable.renderTargets[gpu.currentTextureIndex].texture;
      uOldTexturePosition.value = positionVariable.renderTargets[gpu.currentTextureIndex === 0 ? 1 : 0].texture;
      uTextureVelocity.value = velocityVariable.renderTargets[gpu.currentTextureIndex].texture;
    }
  });
  return { three: _three, config, uniforms, setColors };
  function initGPU(renderer) {
    gpu = new GPUComputationRenderer(WIDTH, WIDTH, renderer);
    if (!renderer.capabilities.isWebGL2) {
      gpu.setDataType(HalfFloatType);
    }
    dtPosition = gpu.createTexture();
    dtVelocity = gpu.createTexture();
    initTextures(dtPosition, dtVelocity);
    velocityVariable = gpu.addVariable("textureVelocity", `
      ${psrdnoise$1}
      uniform float uTime;
      uniform float uNoiseCoordScale;
      uniform float uNoiseIntensity;
      uniform float uMaxVelocity;
      uniform float uAttractionRadius1;
      uniform float uAttractionRadius2;
      uniform float uWingsSpeed;
      void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        vec4 pos = texture2D(texturePosition, uv);
        vec4 vel = texture2D(textureVelocity, uv);

        vec3 grad;
        float n = psrdnoise(pos.xyz * uNoiseCoordScale, vec3(0), uTime, grad);
        grad = grad * uNoiseIntensity;
        vel.xyz = vel.xyz + (pos.w * 0.75) * grad;

        vec3 dv = -pos.xyz;
        float coef = smoothstep(uAttractionRadius1, uAttractionRadius2, length(dv));
        vel.xyz = vel.xyz + pos.w * coef * normalize(dv);
        vel.xyz = clamp(vel.xyz, -uMaxVelocity, uMaxVelocity);

        vel.w = mod(vel.w + length(vel.xyz) * (0.5 + pos.w) * uWingsSpeed, 6.2831853071);
        gl_FragColor = vel;
      }
    `, dtVelocity);
    positionVariable = gpu.addVariable("texturePosition", `
      ${psrdnoise$1}
      uniform float uTime;
      void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        vec4 pos = texture2D(texturePosition, uv);
        vec4 vel = texture2D(textureVelocity, uv);
        pos.xyz += vel.xyz;
        gl_FragColor = pos;
      }
    `, dtPosition);
    gpu.setVariableDependencies(velocityVariable, [positionVariable, velocityVariable]);
    gpu.setVariableDependencies(positionVariable, [positionVariable, velocityVariable]);
    Object.keys(commonUniforms).forEach((key) => {
      velocityVariable.material.uniforms[key] = uniforms[key];
      positionVariable.material.uniforms[key] = uniforms[key];
    });
    const error = gpu.init();
    if (error !== null) {
      throw new Error(error);
    }
  }
  function initScene(scene) {
    if (config.background !== void 0) {
      scene.background = new Color(config.background);
    }
    initLights(scene, config.lights);
    geometry = new PlaneGeometry(2, 2, config.wingsWidthSegments, config.wingsHeightSegments).rotateX(Math.PI / 2);
    const gpuUvs = new Float32Array(COUNT * 2);
    const mapIndexes = new Float32Array(COUNT);
    let i1 = 0;
    let i2 = 0;
    for (let j = 0; j < WIDTH; j++) {
      for (let i = 0; i < WIDTH; i++) {
        gpuUvs[i1++] = i / (WIDTH - 1);
        gpuUvs[i1++] = j / (WIDTH - 1);
        mapIndexes[i2++] = Math.floor(Math.random() * config.textureCount);
      }
    }
    geometry.setAttribute("gpuUv", new InstancedBufferAttribute(gpuUvs, 2));
    geometry.setAttribute("mapIndex", new InstancedBufferAttribute(mapIndexes, 1));
    const materialParams = { side: DoubleSide, ...config.materialParams };
    if (config.texture) {
      materialParams.map = new TextureLoader().load(config.texture);
    }
    materialParams.onBeforeCompile = (shader) => {
      shader.defines = {
        COMPUTE_NORMALS: config.material !== "basic",
        WINGS_WIDTH_SEGMENTS: config.wingsWidthSegments,
        WINGS_HEIGHT_SEGMENTS: config.wingsHeightSegments,
        WINGS_DX: (2 / config.wingsWidthSegments).toFixed(10),
        WINGS_DZ: (2 / config.wingsHeightSegments).toFixed(10),
        TEXTURE_COUNT: config.textureCount.toFixed(10)
      };
      Object.keys(uniforms).forEach((key) => {
        shader.uniforms[key] = uniforms[key];
      });
      shader.vertexShader = `
        uniform sampler2D uTexturePosition;
        uniform sampler2D uOldTexturePosition;
        uniform sampler2D uTextureVelocity;
        uniform vec3 uWingsScale;
        uniform float uWingsDisplacementScale;
        attribute vec2 gpuUv;
        attribute float mapIndex;
        varying vec4 vPos;
        varying vec4 vVel;
        varying float vMapIndex;
        ${mat3LookAt}
        ${mat4Compose}
      ` + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace("#include <defaultnormal_vertex>", "");
      shader.vertexShader = shader.vertexShader.replace("#include <normal_vertex>", "");
      shader.vertexShader = shader.vertexShader.replace("#include <begin_vertex>", `
        vPos = texture2D(uTexturePosition, gpuUv);
        vec4 oldPos = texture2D(uOldTexturePosition, gpuUv);
        vVel = texture2D(uTextureVelocity, gpuUv);
        vMapIndex = float(mapIndex);

        mat3 rmat = lookAt(oldPos.xyz, vPos.xyz, vec3(0, 1, 0));
        mat4 im = compose(vPos.xyz, rmat, (0.5 + vPos.w) * uWingsScale);

        vec3 transformed = vec3(position);

        #ifdef COMPUTE_NORMALS
          vec3 transformedNormal = objectNormal; 
        #endif

        float dx = abs(transformed.x);
        if (dx > 0.0) {
          float sdx = smoothstep(0.0, 1.0 + WINGS_DX, dx);
          #if WINGS_HEIGHT_SEGMENTS > 1
            float dz = transformed.z + 1.0;
            float sdz = smoothstep(0.0, 2.0 + WINGS_DZ, dz);
            transformed.y = sin(vVel.w - sdx + sdz) * sdx * uWingsDisplacementScale;
          #else
            transformed.y = sin(vVel.w - sdx) * sdx * uWingsDisplacementScale;
          #endif

          #ifdef COMPUTE_NORMALS
            #if WINGS_HEIGHT_SEGMENTS > 1
              float s = sign(transformed.x);
              float sdx1 = smoothstep(0.0, 1.0 + WINGS_DX, dx + WINGS_DX);
              float sdz1 = smoothstep(0.0, 2.0 + WINGS_DZ, dz + WINGS_DZ);
              float dvy1 = sin(vVel.w - sdx + sdz1) * sdx * uWingsDisplacementScale - transformed.y;
              float dvy2 = sin(vVel.w - sdx1 + sdz) * sdx1 * uWingsDisplacementScale - transformed.y;
              vec3 v1 = vec3(0.0, dvy1, s * WINGS_DZ);
              vec3 v2 = vec3(s * WINGS_DX, dvy2, 0.0);
              transformedNormal = -normalize(cross(v1, v2));
            #else
              float s = sign(transformed.x);
              float sdx1 = smoothstep(0.0, 1.0 + WINGS_DX, dx + WINGS_DX);
              float dvy1 = sin(vVel.w - sdx1) * sdx * uWingsDisplacementScale - transformed.y;
              vec3 v1 = vec3(0.0, 0.0, s);
              vec3 v2 = vec3(s * WINGS_DX, dvy1, 0.0);
              transformedNormal = -normalize(cross(v1, v2));
            #endif  
          #endif
        }

        #ifdef COMPUTE_NORMALS
          #ifdef USE_INSTANCING
            mat3 m = mat3( im );
            transformedNormal /= vec3( dot( m[ 0 ], m[ 0 ] ), dot( m[ 1 ], m[ 1 ] ), dot( m[ 2 ], m[ 2 ] ) );
            transformedNormal = m * transformedNormal;
          #endif
          transformedNormal = normalMatrix * transformedNormal;
          #ifdef FLIP_SIDED
            transformedNormal = - transformedNormal;
          #endif
          #ifdef USE_TANGENT
            vec3 transformedTangent = ( modelViewMatrix * vec4( objectTangent, 0.0 ) ).xyz;
            #ifdef FLIP_SIDED
              transformedTangent = - transformedTangent;
            #endif
          #endif
          #ifndef FLAT_SHADED
            vNormal = normalize( transformedNormal );
            #ifdef USE_TANGENT
              vTangent = normalize( transformedTangent );
              vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
            #endif
          #endif
        #endif
      `);
      shader.vertexShader = shader.vertexShader.replace("#include <project_vertex>", `
        vec4 mvPosition = vec4( transformed, 1.0 );
        #ifdef USE_INSTANCING
          mvPosition = im * mvPosition;
        #endif
        mvPosition = modelViewMatrix * mvPosition;
        gl_Position = projectionMatrix * mvPosition;
      `);
      shader.fragmentShader = `
        varying float vMapIndex;
      ` + shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace("#include <map_fragment>", `
        #ifdef USE_MAP
          vec2 uv = vUv;
          uv.x = (vMapIndex + vUv.x) / TEXTURE_COUNT;
          vec4 sampledDiffuseColor = texture2D(map, uv);
          diffuseColor *= sampledDiffuseColor;
        #endif
      `);
    };
    switch (config.material) {
      case "standard":
        material = new MeshStandardMaterial(materialParams);
        break;
      case "phong":
        material = new MeshPhongMaterial(materialParams);
        break;
      default:
        material = new MeshBasicMaterial(materialParams);
    }
    iMesh = new InstancedMesh(geometry, material, COUNT);
    setColors(config.colors);
    scene.add(iMesh);
  }
  function setColors(colors) {
    if (Array.isArray(colors) && colors.length > 1) {
      const cscale = colorScale(colors);
      for (let i = 0; i < COUNT; i++) {
        iMesh.setColorAt(i, cscale.getColorAt(i / COUNT));
      }
      iMesh.instanceColor.needsUpdate = true;
    }
  }
  function initTextures(texturePosition, textureVelocity) {
    const dummy = new Vector3();
    const posArray = texturePosition.image.data;
    const velArray = textureVelocity.image.data;
    for (let k = 0, kl = posArray.length; k < kl; k += 4) {
      dummy.set(rndFS$2(1), rndFS$2(1), rndFS$2(1)).normalize().multiplyScalar(rndFS$2(config.attractionRadius1 * 2)).toArray(posArray, k);
      posArray[k + 3] = rnd$2(0.1, 1);
      dummy.set(rndFS$2(1), rndFS$2(1), rndFS$2(1)).normalize().multiplyScalar(rndFS$2(0.5)).toArray(velArray, k);
      velArray[k + 3] = 0;
    }
  }
}

const { randFloat: rnd$1, randFloatSpread: rndFS$1 } = MathUtils;
const defaultConfig$1 = {
  gpgpuSize: 256,
  bloomStrength: 1.5,
  bloomRadius: 0.5,
  bloomThreshold: 0.25,
  colors: [Math.random() * 16777215, Math.random() * 16777215, Math.random() * 16777215],
  geometry: "custom",
  geometryScale: [1, 1, 1],
  lights: [
    { type: "ambient", params: [16777215, 0.5] },
    { type: "point", params: [16777215, 1], props: { position: [0, 0, 0] } },
    { type: "point", params: [16748640, 0.75], props: { position: [0, -100, -100] } },
    { type: "point", params: [6328575, 0.75], props: { position: [0, 100, 100] } }
  ],
  materialParams: {},
  noiseCoordScale: 0.01,
  noiseIntensity: 25e-4,
  noiseTimeCoef: 4e-4,
  attractionRadius1: 150,
  attractionRadius2: 250,
  maxVelocity: 0.25
};
function index$1(params) {
  const config = { ...defaultConfig$1, ...params };
  const WIDTH = config.gpgpuSize;
  const COUNT = WIDTH * WIDTH;
  let gpu;
  let dtPosition, dtVelocity;
  let velocityVariable, positionVariable;
  const uTexturePosition = { value: null };
  const uOldTexturePosition = { value: null };
  const uTextureVelocity = { value: null };
  const uScale = { value: new Vector3(...config.geometryScale) };
  const uTime = { value: 0 };
  const uNoiseCoordScale = { value: config.noiseCoordScale };
  const uNoiseIntensity = { value: config.noiseIntensity };
  const uMaxVelocity = { value: config.maxVelocity };
  const uAttractionRadius1 = { value: config.attractionRadius1 };
  const uAttractionRadius2 = { value: config.attractionRadius2 };
  const uMouse = { value: new Vector3() };
  const gpuTexturesUniforms = { uTexturePosition, uOldTexturePosition, uTextureVelocity };
  const commonUniforms = { uScale, uTime, uNoiseCoordScale, uNoiseIntensity, uMaxVelocity, uAttractionRadius1, uAttractionRadius2, uMouse };
  const uniforms = { ...gpuTexturesUniforms, ...commonUniforms };
  let effectComposer;
  let renderPass, bloomPass;
  let camera;
  let geometry, material, iMesh;
  const _three = three({
    ...commonConfig$1(params),
    antialias: false,
    orbitControls: true,
    initRenderer({ renderer }) {
      initGPU(renderer);
    },
    initCamera(three2) {
      camera = three2.camera;
      camera.position.z = 70;
    },
    initScene({ renderer, width, height, camera: camera2, scene }) {
      initScene(scene);
      renderPass = new RenderPass(scene, camera2);
      bloomPass = new UnrealBloomPass(new Vector2(width, height), config.bloomStrength, config.bloomRadius, config.bloomThreshold);
      effectComposer = new EffectComposer(renderer);
      effectComposer.addPass(renderPass);
      effectComposer.addPass(bloomPass);
    },
    afterResize({ width, height }) {
      if (effectComposer) effectComposer.setSize(width, height);
    },
    beforeRender({ clock }) {
      uTime.value = clock.time * config.noiseTimeCoef;
      gpu.compute();
      uTexturePosition.value = positionVariable.renderTargets[gpu.currentTextureIndex].texture;
      uOldTexturePosition.value = positionVariable.renderTargets[gpu.currentTextureIndex === 0 ? 1 : 0].texture;
      uTextureVelocity.value = velocityVariable.renderTargets[gpu.currentTextureIndex].texture;
    },
    render() {
      effectComposer.render();
    }
    // onPointerMove ({ nPosition }) {
    //   raycaster.setFromCamera(nPosition, camera)
    //   camera.getWorldDirection(mousePlane.normal)
    //   raycaster.ray.intersectPlane(mousePlane, mousePosition)
    // },
    // onPointerLeave () {
    //   mousePosition.set(0, 0, 0)
    // }
  });
  return { three: _three, config, uniforms, setColors };
  function initGPU(renderer) {
    gpu = new GPUComputationRenderer(WIDTH, WIDTH, renderer);
    if (!renderer.capabilities.isWebGL2) {
      gpu.setDataType(HalfFloatType);
    }
    dtPosition = gpu.createTexture();
    dtVelocity = gpu.createTexture();
    initTextures(dtPosition, dtVelocity);
    velocityVariable = gpu.addVariable("textureVelocity", `
      ${psrdnoise$1}
      uniform float uTime;
      uniform vec3 uMouse;
      uniform float uNoiseCoordScale;
      uniform float uNoiseIntensity;
      uniform float uMaxVelocity;
      uniform float uAttractionRadius1;
      uniform float uAttractionRadius2;

      void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        vec4 pos = texture2D(texturePosition, uv);
        vec4 vel = texture2D(textureVelocity, uv);

        vec3 grad;
        float n = psrdnoise(pos.xyz * uNoiseCoordScale, vec3(0), uTime, grad);
        vel.xyz += (pos.w * 0.75) * grad * uNoiseIntensity;

        vec3 dv = -pos.xyz;
        float coef = smoothstep(uAttractionRadius1, uAttractionRadius2, length(dv));
        vel.xyz = vel.xyz + pos.w * coef * normalize(dv);
        vel.xyz = clamp(vel.xyz, -uMaxVelocity, uMaxVelocity);

        gl_FragColor = vel;
      }
    `, dtVelocity);
    positionVariable = gpu.addVariable("texturePosition", `
      ${psrdnoise$1}
      uniform float uTime;
      uniform vec3 uMouse;
      void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        vec4 pos = texture2D(texturePosition, uv);
        vec4 vel = texture2D(textureVelocity, uv);
        pos.xyz += vel.xyz;
        gl_FragColor = pos;
      }
    `, dtPosition);
    gpu.setVariableDependencies(velocityVariable, [positionVariable, velocityVariable]);
    gpu.setVariableDependencies(positionVariable, [positionVariable, velocityVariable]);
    Object.keys(commonUniforms).forEach((key) => {
      velocityVariable.material.uniforms[key] = uniforms[key];
      positionVariable.material.uniforms[key] = uniforms[key];
    });
    const error = gpu.init();
    if (error !== null) {
      throw new Error(error);
    }
  }
  function initScene(scene) {
    if (config.background !== void 0) {
      scene.background = new Color(config.background);
    }
    initLights(scene, config.lights);
    switch (config.geometry) {
      case "box":
        geometry = new BoxGeometry();
        break;
      case "capsule":
        geometry = new CapsuleGeometry(0.2, 1, 4, 8).rotateX(Math.PI / 2);
        break;
      case "cone":
        geometry = new ConeGeometry(0.4, 2, 6).rotateX(Math.PI / 2);
        break;
      case "octahedron":
        geometry = new OctahedronGeometry(1, 0).rotateX(Math.PI / 2);
        break;
      case "sphere":
        geometry = new SphereGeometry(0.5, 8, 8);
        break;
      default:
        geometry = customGeometry(1);
    }
    const gpuUvs = new Float32Array(COUNT * 2);
    let index = 0;
    for (let j = 0; j < WIDTH; j++) {
      for (let i = 0; i < WIDTH; i++) {
        gpuUvs[index++] = i / (WIDTH - 1);
        gpuUvs[index++] = j / (WIDTH - 1);
      }
    }
    geometry.setAttribute("gpuUv", new InstancedBufferAttribute(gpuUvs, 2));
    material = new MeshStandardMaterial({
      metalness: 0.75,
      roughness: 0.25,
      side: DoubleSide,
      ...config.materialParams,
      onBeforeCompile: (shader) => {
        Object.keys(uniforms).forEach((key) => {
          shader.uniforms[key] = uniforms[key];
        });
        shader.vertexShader = `
          uniform sampler2D uTexturePosition;
          uniform sampler2D uOldTexturePosition;
          uniform sampler2D uTextureVelocity;
          uniform vec3 uScale;
          attribute vec2 gpuUv;
          varying vec4 vPos;
          varying vec4 vVel;
          ${mat3LookAt}
          ${mat4Compose}
        ` + shader.vertexShader;
        shader.vertexShader = shader.vertexShader.replace("#include <defaultnormal_vertex>", `
          vPos = texture2D(uTexturePosition, gpuUv);
          vec4 oldPos = texture2D(uOldTexturePosition, gpuUv);
          vVel = texture2D(uTextureVelocity, gpuUv);

          mat3 rmat = lookAt(oldPos.xyz, vPos.xyz, vec3(0, 1, 0));
          mat4 im = compose(vPos.xyz, rmat, (0.5 + vPos.w) * uScale);

          vec3 transformedNormal = objectNormal;
          mat3 m = mat3(im);
          transformedNormal /= vec3( dot( m[ 0 ], m[ 0 ] ), dot( m[ 1 ], m[ 1 ] ), dot( m[ 2 ], m[ 2 ] ) );
          transformedNormal = m * transformedNormal;
          transformedNormal = normalMatrix * transformedNormal;
        `);
        shader.vertexShader = shader.vertexShader.replace("#include <project_vertex>", `
          vec4 mvPosition = modelViewMatrix * im * vec4(transformed, 1.0);
          gl_Position = projectionMatrix * mvPosition;
        `);
      }
    });
    iMesh = new InstancedMesh(geometry, material, COUNT);
    setColors(config.colors);
    scene.add(iMesh);
  }
  function setColors(colors) {
    if (Array.isArray(colors) && colors.length > 1) {
      const cscale = colorScale(colors);
      for (let i = 0; i < COUNT; i++) {
        iMesh.setColorAt(i, cscale.getColorAt(i / COUNT));
      }
      iMesh.instanceColor.needsUpdate = true;
    }
  }
  function initTextures(texturePosition, textureVelocity) {
    const dummy = new Vector3();
    const posArray = texturePosition.image.data;
    const velArray = textureVelocity.image.data;
    for (let k = 0, kl = posArray.length; k < kl; k += 4) {
      dummy.set(rndFS$1(1), rndFS$1(1), rndFS$1(1)).normalize().multiplyScalar(rndFS$1(config.attractionRadius1 * 2)).toArray(posArray, k);
      posArray[k + 3] = rnd$1(0.1, 1);
      dummy.set(0, 0, 0).toArray(velArray, k);
      velArray[k + 3] = 0;
    }
  }
}
function customGeometry(size) {
  const vertices = [
    { p: [size * 0.5, 0, -size], n: [0, 1, 0] },
    { p: [-size * 0.5, 0, -size], n: [0, 1, 0] },
    { p: [0, 0, size], n: [0, 1, 0] },
    { p: [0, -size * 0.5, -size], n: [1, 0, 0] },
    { p: [0, size * 0.5, -size], n: [1, 0, 0] },
    { p: [0, 0, size], n: [1, 0, 0] }
  ];
  const indexes = [0, 1, 2, 3, 4, 5];
  const positions = [];
  const normals = [];
  for (const vertex of vertices) {
    positions.push(...vertex.p);
    normals.push(...vertex.n);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("normal", new Float32BufferAttribute(normals, 3));
  geometry.setIndex(indexes);
  return geometry;
}

const { randFloat: rnd, randFloatSpread: rndFS } = MathUtils;
const defaultConfig = {
  gpgpuSize: 64,
  background: 16777215,
  material: "basic",
  materialParams: {},
  texture: null,
  textureCount: 1,
  colors: [16777215, 16777215],
  lights: [
    { type: "ambient", params: [16777215, 0.25] },
    { type: "directional", params: [16777215, 1], props: { position: [0, 0, 50] } }
  ],
  fogDensity: 0.01,
  fishScale: [1, 1, 1],
  fishWidthSegments: 8,
  fishSpeed: 1.5,
  fishDisplacementScale: 0.2,
  noiseCoordScale: 0.01,
  noiseTimeCoef: 5e-4,
  noiseIntensity: 25e-4,
  attractionRadius1: 50,
  attractionRadius2: 100,
  maxVelocity: 0.1
};
function index(params) {
  const config = { ...defaultConfig, ...params };
  if (!["basic", "phong", "standard"].includes(config.material)) {
    throw new Error(`Invalid material ${config.material}`);
  }
  if (!Number.isInteger(config.fishWidthSegments) || config.fishWidthSegments % 2 !== 0) {
    throw new Error(`Invalid fishWidthSegments ${config.fishWidthSegments}`);
  }
  const WIDTH = config.gpgpuSize;
  const COUNT = WIDTH * WIDTH;
  let gpu;
  let dtPosition, dtVelocity;
  let velocityVariable, positionVariable;
  const uTexturePosition = { value: null };
  const uOldTexturePosition = { value: null };
  const uTextureVelocity = { value: null };
  const uTime = { value: 0 };
  const uNoiseCoordScale = { value: config.noiseCoordScale };
  const uNoiseIntensity = { value: config.noiseIntensity };
  const uMaxVelocity = { value: config.maxVelocity };
  const uAttractionRadius1 = { value: config.attractionRadius1 };
  const uAttractionRadius2 = { value: config.attractionRadius2 };
  const uFishScale = { value: new Vector3(...config.fishScale) };
  const uFishSpeed = { value: config.fishSpeed };
  const uFishDisplacementScale = { value: config.fishDisplacementScale };
  const gpuTexturesUniforms = { uTexturePosition, uOldTexturePosition, uTextureVelocity };
  const commonUniforms = { uTime, uNoiseCoordScale, uNoiseIntensity, uMaxVelocity, uAttractionRadius1, uAttractionRadius2, uFishScale, uFishSpeed, uFishDisplacementScale };
  const uniforms = { ...gpuTexturesUniforms, ...commonUniforms };
  let geometry, material, iMesh;
  const _three = three({
    ...commonConfig$1(params),
    antialias: true,
    orbitControls: true,
    initRenderer({ renderer }) {
      initGPU(renderer);
    },
    initCamera({ camera }) {
      camera.position.set(0, 0, 70);
    },
    initScene({ scene }) {
      initScene(scene);
    },
    beforeRender({ clock }) {
      uTime.value = clock.time * config.noiseTimeCoef;
      gpu.compute();
      uTexturePosition.value = positionVariable.renderTargets[gpu.currentTextureIndex].texture;
      uOldTexturePosition.value = positionVariable.renderTargets[gpu.currentTextureIndex === 0 ? 1 : 0].texture;
      uTextureVelocity.value = velocityVariable.renderTargets[gpu.currentTextureIndex].texture;
    }
  });
  return { three: _three, config, uniforms, setColors };
  function initGPU(renderer) {
    gpu = new GPUComputationRenderer(WIDTH, WIDTH, renderer);
    if (!renderer.capabilities.isWebGL2) {
      gpu.setDataType(HalfFloatType);
    }
    dtPosition = gpu.createTexture();
    dtVelocity = gpu.createTexture();
    initTextures(dtPosition, dtVelocity);
    velocityVariable = gpu.addVariable("textureVelocity", `
      ${psrdnoise$1}
      uniform float uTime;
      uniform float uNoiseCoordScale;
      uniform float uNoiseIntensity;
      uniform float uMaxVelocity;
      uniform float uAttractionRadius1;
      uniform float uAttractionRadius2;
      uniform float uFishSpeed;
      void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        vec4 pos = texture2D(texturePosition, uv);
        vec4 vel = texture2D(textureVelocity, uv);

        vec3 grad;
        float n = psrdnoise(pos.xyz * uNoiseCoordScale, vec3(0), uTime, grad);
        grad = grad * uNoiseIntensity;
        vel.xyz = vel.xyz + (pos.w * 0.75) * grad;

        vec3 dv = -pos.xyz;
        float coef = smoothstep(uAttractionRadius1, uAttractionRadius2, length(dv));
        vel.xyz = vel.xyz + pos.w * coef * normalize(dv);
        vel.xyz = clamp(vel.xyz, -uMaxVelocity, uMaxVelocity);

        vel.w = mod(vel.w + length(vel.xyz) * (0.5 + pos.w) * uFishSpeed, 6.2831853071);
        gl_FragColor = vel;
      }
    `, dtVelocity);
    positionVariable = gpu.addVariable("texturePosition", `
      ${psrdnoise$1}
      uniform float uTime;
      void main() {
        vec2 uv = gl_FragCoord.xy / resolution.xy;
        vec4 pos = texture2D(texturePosition, uv);
        vec4 vel = texture2D(textureVelocity, uv);
        pos.xyz += vel.xyz;
        gl_FragColor = pos;
      }
    `, dtPosition);
    gpu.setVariableDependencies(velocityVariable, [positionVariable, velocityVariable]);
    gpu.setVariableDependencies(positionVariable, [positionVariable, velocityVariable]);
    Object.keys(commonUniforms).forEach((key) => {
      velocityVariable.material.uniforms[key] = uniforms[key];
      positionVariable.material.uniforms[key] = uniforms[key];
    });
    const error = gpu.init();
    if (error !== null) {
      throw new Error(error);
    }
  }
  function initScene(scene) {
    if (config.background !== void 0) {
      scene.background = new Color(config.background);
      if (config.fogDensity) scene.fog = new FogExp2(config.background, config.fogDensity);
    }
    initLights(scene, config.lights);
    geometry = new PlaneGeometry(2, 1, config.fishWidthSegments, 1).rotateY(Math.PI / 2);
    const gpuUvs = new Float32Array(COUNT * 2);
    const mapIndexes = new Float32Array(COUNT);
    let i1 = 0;
    let i2 = 0;
    for (let j = 0; j < WIDTH; j++) {
      for (let i = 0; i < WIDTH; i++) {
        gpuUvs[i1++] = i / (WIDTH - 1);
        gpuUvs[i1++] = j / (WIDTH - 1);
        mapIndexes[i2++] = Math.floor(Math.random() * config.textureCount);
      }
    }
    geometry.setAttribute("gpuUv", new InstancedBufferAttribute(gpuUvs, 2));
    geometry.setAttribute("mapIndex", new InstancedBufferAttribute(mapIndexes, 1));
    const materialParams = { side: DoubleSide, ...config.materialParams };
    if (config.texture) {
      materialParams.map = new TextureLoader().load(config.texture);
    }
    materialParams.onBeforeCompile = (shader) => {
      shader.defines = {
        COMPUTE_NORMALS: config.material !== "basic",
        FISH_DZ: (2 / config.fishWidthSegments).toFixed(10),
        TEXTURE_COUNT: config.textureCount.toFixed(10)
      };
      Object.keys(uniforms).forEach((key) => {
        shader.uniforms[key] = uniforms[key];
      });
      shader.vertexShader = `
        uniform sampler2D uTexturePosition;
        uniform sampler2D uOldTexturePosition;
        uniform sampler2D uTextureVelocity;
        uniform vec3 uFishScale;
        uniform float uFishDisplacementScale;
        attribute vec2 gpuUv;
        attribute float mapIndex;
        varying vec4 vPos;
        varying vec4 vVel;
        varying float vMapIndex;
        ${mat3LookAt}
        ${mat4Compose}
      ` + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace("#include <defaultnormal_vertex>", "");
      shader.vertexShader = shader.vertexShader.replace("#include <normal_vertex>", "");
      shader.vertexShader = shader.vertexShader.replace("#include <begin_vertex>", `
        vPos = texture2D(uTexturePosition, gpuUv);
        vec4 oldPos = texture2D(uOldTexturePosition, gpuUv);
        vVel = texture2D(uTextureVelocity, gpuUv);
        vMapIndex = float(mapIndex);

        mat3 rmat = lookAt(oldPos.xyz, vPos.xyz, vec3(0, 1, 0));
        mat4 im = compose(vPos.xyz, rmat, (0.5 + vPos.w) * uFishScale);

        vec3 transformed = vec3(position);

        #ifdef COMPUTE_NORMALS
          vec3 transformedNormal = objectNormal; 
        #endif

        float dz = transformed.z + 1.0;
        float sdz = smoothstep(2.0, 0.0, dz);
        transformed.x += sin(vVel.w + dz * PI * 1.5) * sdz * uFishDisplacementScale;

        #ifdef COMPUTE_NORMALS
          float dz1 = dz - 0.2;
          float sdz1 = smoothstep(2.0, 0.0, dz1);
          float dx1 = sin(vVel.w + dz1 * PI * 1.5) * sdz1 * uFishDisplacementScale - transformed.x;
          vec3 v1 = vec3(dx1, 0.0, -FISH_DZ);
          vec3 v2 = vec3(0.0, 1.0, 0.0);
          transformedNormal = normalize(cross(v1, v2));
        #endif

        #ifdef COMPUTE_NORMALS
          #ifdef USE_INSTANCING
            mat3 m = mat3( im );
            transformedNormal /= vec3( dot( m[ 0 ], m[ 0 ] ), dot( m[ 1 ], m[ 1 ] ), dot( m[ 2 ], m[ 2 ] ) );
            transformedNormal = m * transformedNormal;
          #endif
          transformedNormal = normalMatrix * transformedNormal;
          #ifdef FLIP_SIDED
            transformedNormal = - transformedNormal;
          #endif
          #ifdef USE_TANGENT
            vec3 transformedTangent = ( modelViewMatrix * vec4( objectTangent, 0.0 ) ).xyz;
            #ifdef FLIP_SIDED
              transformedTangent = - transformedTangent;
            #endif
          #endif
          #ifndef FLAT_SHADED
            vNormal = normalize( transformedNormal );
            #ifdef USE_TANGENT
              vTangent = normalize( transformedTangent );
              vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
            #endif
          #endif
        #endif
      `);
      shader.vertexShader = shader.vertexShader.replace("#include <project_vertex>", `
        vec4 mvPosition = vec4( transformed, 1.0 );
        #ifdef USE_INSTANCING
          mvPosition = im * mvPosition;
        #endif
        mvPosition = modelViewMatrix * mvPosition;
        gl_Position = projectionMatrix * mvPosition;
      `);
      shader.fragmentShader = `
        varying float vMapIndex;
      ` + shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace("#include <map_fragment>", `
        #ifdef USE_MAP
          vec2 uv = vUv;
          uv.x = (vMapIndex + vUv.x) / TEXTURE_COUNT;
          vec4 sampledDiffuseColor = texture2D(map, uv);
          diffuseColor *= sampledDiffuseColor;
        #endif
      `);
    };
    switch (config.material) {
      case "standard":
        material = new MeshStandardMaterial(materialParams);
        break;
      case "phong":
        material = new MeshPhongMaterial(materialParams);
        break;
      default:
        material = new MeshBasicMaterial(materialParams);
    }
    iMesh = new InstancedMesh(geometry, material, COUNT);
    setColors(config.colors);
    scene.add(iMesh);
  }
  function setColors(colors) {
    if (Array.isArray(colors) && colors.length > 1) {
      const cscale = colorScale(colors);
      for (let i = 0; i < COUNT; i++) {
        iMesh.setColorAt(i, cscale.getColorAt(i / COUNT));
      }
      iMesh.instanceColor.needsUpdate = true;
    }
  }
  function initTextures(texturePosition, textureVelocity) {
    const dummy = new Vector3();
    const posArray = texturePosition.image.data;
    const velArray = textureVelocity.image.data;
    for (let k = 0, kl = posArray.length; k < kl; k += 4) {
      dummy.set(rndFS(1), rndFS(1), rndFS(1)).normalize().multiplyScalar(rndFS(config.attractionRadius1 * 2)).toArray(posArray, k);
      posArray[k + 3] = rnd(0.1, 1);
      dummy.set(rndFS(1), rndFS(1), rndFS(1)).normalize().multiplyScalar(rndFS(0.5)).toArray(velArray, k);
      velArray[k + 3] = 0;
    }
  }
}

export { index$2 as butterfliesBackground, index as fishesBackground, index$5 as neonCursor, index$3 as noisyLinesBackground, index$4 as particlesCursor, index$1 as swarmBackground };
//# sourceMappingURL=threejs.module.js.map
