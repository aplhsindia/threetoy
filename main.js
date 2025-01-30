import './style.css'

import particlesCursor from './src/cursors/particles'


(async function () {

      particlesCursor({
        el: document.getElementById('app'),
        gpgpuSize: 100,
        colors: [0xFFBF84, 0xF87A2C],
        color: 0xF87A2C, centerColor:0x056C71,
        edgeColor:0x003234,
        coordScale: 10,
        pointSize: 3,
        noiseIntensity: 0.002,
        noiseTimeCoef: 0.0002,
        sleepRadiusX: 250,
        sleepRadiusY: 250,
          position: [
            { x: 0, y: -100},    // Initial x = 0, y = 0 (immediate)
            { x: 0, y: 0},
            { x: 0, y: 0},
            { x: 30, y:30},
            { x: 30, y: 40},
        ],
        hover: 0
    })
})()
