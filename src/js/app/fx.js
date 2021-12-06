import vars from "./vars";

var fx = {

    // Check if browser supports WebGL
    hasWebGL: () => {
        var canvas = document.createElement("canvas");
        const gl =
          canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        if (gl && gl instanceof WebGLRenderingContext) {
          return true;
        } else {
          return false;
        }
    },

    // Convert Flat Coordinates to Sphere Coordinates
    convertFlatCoordsToSphereCoords: (x, y, globeRadius, globeWidth, globeHeight) => {
        let latitude = ((x - globeWidth) / globeWidth) * -180;
        let longitude = ((y - globeHeight) / globeHeight) * -90;
        latitude = (latitude * Math.PI) / 180;
        longitude = (longitude * Math.PI) / 180;
        const radius = Math.cos(longitude) * globeRadius;

        return {
        x: Math.cos(latitude) * radius,
        y: Math.sin(longitude) * globeRadius,
        z: Math.sin(latitude) * radius
        };
    },

    //check if point is inside a circle
    isPointInsideCircle(centerX, centerY, radius, pX, pY) {
      var dist_points = (centerX - pX) * (centerX - pX) + (centerY - pY) * (centerY - pY);
      radius *= radius;
      if (dist_points < radius) {
          return true;
      }
      return false;
    },

    removeFromLoop: (fx) => {
        let loopFunctions = vars.loopFunctions;
        for (var i in loopFunctions)
          if (loopFunctions[i][1] === fx) loopFunctions.splice(i, 1);
    },
}

export default fx;