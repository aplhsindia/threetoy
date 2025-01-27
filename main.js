import './style.css'

import particlesCursor from './src/cursors/particles'


(async function () {

      particlesCursor({
        el: document.getElementById('app'),
        gradient:[0x056C71,0x003234],
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
            { x: 0, y: 0, time: 5000 },    // Initial x = 0, y = 0 (immediate)
            { x: 0, y: -40, time: 5000 },   // Change x to 10 and y to -20 after 1 second
            { x: 0, y: 10, time: 5000 },   // Change x to 30 and y to -10 after 1 second
            { x: 0, y: 40, time: 5000 },   // Change x to 50 and y to 20 after 1 second
            { x: 0, y: 20, time: 5000 },   // Change x to 50 and y to 20 after 1 second
            { x: 20, y: 40, time: 5000 },   // Change x to 50 and y to 20 after 1 second
            { x: 0, y: 0, time: 5000 },   // Change x to 50 and y to 20 after 1 second
            { x: 40, y: 0, time: 5000 },   // Change x to 50 and y to 20 after 1 second
            { x: 0, y: 10, time: 5000 },   // Change x to 50 and y to 20 after 1 second
            { x: 10, y: 30, time: 5000 },   // Change x to 50 and y to 20 after 1 second
            { x: 0, y: 30, time: 5000 },   // Change x to 50 and y to 20 after 1 second
            { x: 0, y: -40, time: 5000 }   // Change x to 100 and y to 30 after 1 second
        ],
        hover: 1
    })
})()
