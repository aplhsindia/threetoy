import {
    AdditiveBlending,
    BufferAttribute,
    BufferGeometry,
    Color,
    HalfFloatType,
    MathUtils,
    Points,
    ShaderMaterial,
    Vector2,
    SphereGeometry,
    BackSide,
    Mesh
} from "three";
import {GPUComputationRenderer} from "three/examples/jsm/misc/GPUComputationRenderer.js";
import three from "../../three";
import {colorScale} from "../../tools/color";
import psrdnoise from "../../glsl/psrdnoise3.glsl";

const {randFloat: rnd, randFloatSpread: rndFS} = MathUtils;

const defaultConfig = {
    gpgpuSize: 256,
    centerColor:0x056C71,
    edgeColor:0x003234,
    colors: [0xF87A2C, 0xF87A2C, 0xF87A2C],
    color: 0xF87A2C,
    coordScale: 1.5,
    noiseIntensity: 0.001,
    noiseTimeCoef: 0.0001,
    pointSize: 5,
    pointDecay: 0.005,
    sleepRadiusX: 250,
    sleepRadiusY: 250,
    sleepTimeCoefX: 0.001,
    sleepTimeCoefY: 0.002,
    hover: 0,
    position:[{ x: 0, y: 0 }]
};

export default function (params) {
    const config = {...defaultConfig, ...params};

    const WIDTH = config.gpgpuSize;
    const COUNT = WIDTH * WIDTH;

    let gpu;
    let dtPosition, dtVelocity;
    let velocityVariable, positionVariable;

    const uTime = {value: 0};
    const uCoordScale = {value: config.coordScale};
    const uNoiseIntensity = {value: config.noiseIntensity};
    const uPointSize = {value: config.pointSize};
    const uPointDecay = {value: config.pointDecay};
    const uColor = {value: new Color(config.color)};
    const uMouse = {value: new Vector2()};
    const uMouseDirection = {value: new Vector2()};
    const uniforms = {uTime, uCoordScale, uNoiseIntensity, uPointSize, uPointDecay, uColor, uMouse, uMouseDirection};

    let geometry, material, mesh;

    let hover = config.hover;
    const mouseTarget = new Vector2();

    var mindex = 0;

    const changes =  config.position;
    let mchange = {x:0,y:-100}


    three({
        ...commonConfig(params),
        alpha: true, // Enable transparency for the renderer
        antialias: false,
        initRenderer({renderer}) {
            renderer.setClearColor(0x000000, 0); // Make the canvas background transparent
            initGPU(renderer);
        },
        initScene({scene}) {
            initParticles();
            scene.background = null;
            scene.add(mesh);

        },
        beforeRender({width, wWidth, wHeight, clock, pointer}) {
            if (!hover) {

                // Update mouseTarget based on the latest change
                mouseTarget.x = mchange.x ?? 0;
                mouseTarget.y = mchange.y ?? 0;

            } else {
                // When hovering, update the mouse target based on pointer position
                mouseTarget.x = pointer.nPosition.x * 0.5 * wWidth;
                mouseTarget.y = pointer.nPosition.y * 0.5 * wHeight;
            }

            // Smooth transition of mouse position with lerp
            uMouse.value.lerp(mouseTarget, 0.05);

            // Update the time and compute GPU operations
            uTime.value = clock.time * config.noiseTimeCoef;
            gpu.compute();
            material.uniforms.texturePosition.value = gpu.getCurrentRenderTarget(positionVariable).texture;
            material.uniforms.textureVelocity.value = gpu.getCurrentRenderTarget(velocityVariable).texture;
            function handleWheel(event) {
                event.preventDefault(); // Prevents page scroll
                console.log("Wheel event fired");
            }
        },

        onPointerMove({delta}) {
            uMouseDirection.value.copy(delta);
        },
        onPointerLeave() {
            //hover = false
        },
        onWheel(event) {
            // Debugging: Check if the event is firing

        }
    });


    window.addEventListener('wheel', handleWheel, { passive: false });


    function handleWheel(event) {
        event.preventDefault();  // Prevent the default scroll behavior

        const scrollAmount = event.deltaY;
        console.log("Scroll amount (deltaY):", scrollAmount);

        if (scrollAmount > 0) {
            // Scroll down, increment mindex
            if (mindex < changes.length - 1) {
                mindex++;
            }
        } else if (scrollAmount < 0) {
            // Scroll up, decrement mindex
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

            // Simulate a mousemove event at the new pixel coordinates
            const moveEvent = new MouseEvent('mousemove', {
                clientX: change.x,  // X position in pixels
                clientY: change.y,  // Y position in pixels
            });

            // Dispatch the event to simulate the movement
            document.dispatchEvent(moveEvent);
        }
    }
    // Start the mouse movement simulation



    return {config, uniforms};

    /**
     */
    function initGPU(renderer) {
        gpu = new GPUComputationRenderer(WIDTH, WIDTH, renderer);
      /*  if (!renderer.capabilities.isWebGL2) {
            gpu.setDataType(HalfFloatType);
        }
*/
        dtPosition = gpu.createTexture();
        dtVelocity = gpu.createTexture();
        initTextures(dtPosition, dtVelocity);

        velocityVariable = gpu.addVariable("textureVelocity", `
      ${psrdnoise}
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

        Object.keys(uniforms).forEach(key => {
            velocityVariable.material.uniforms[key] = uniforms[key];
            positionVariable.material.uniforms[key] = uniforms[key];
        });

        const error = gpu.init();
        if (error !== null) {
            console.error(error);
        }
    }

    /**
     */
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
                texturePosition: {value: null},
                textureVelocity: {value: null},
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

    /**
     */
    function initTextures(texturePosition, textureVelocity) {
        const posArray = texturePosition.image.data;
        const velArray = textureVelocity.image.data;
        for (let k = 0, kl = posArray.length; k < kl; k += 4) {
            posArray[k + 0] = rndFS(1);
            posArray[k + 1] = rndFS(1);
            posArray[k + 2] = -100000;
            posArray[k + 3] = rnd(0.1, 1);

            velArray[k + 0] = 0; // rndFS(0.2)
            velArray[k + 1] = 0; // rndFS(0.2)
            velArray[k + 2] = 0; // rndFS(0.2)
            velArray[k + 3] = rnd(0.1, 1);
        }
    }
}
/**
 */
function commonConfig(params) {
    const config = {};
    const keys = ["el", "canvas", "width", "height", "resize"];
    keys.forEach(key => {
        if (params[key] !== undefined) config[key] = params[key];
    });
    return config;
}
