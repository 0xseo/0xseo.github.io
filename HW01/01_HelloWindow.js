// Global constants
const canvas = document.getElementById("glCanvas"); // Get the canvas element
const gl = canvas.getContext("webgl2"); // Get the WebGL2 context

if (!gl) {
  console.error("WebGL 2 is not supported by your browser.");
}

// Set canvas size: 현재 window 전체를 canvas로 사용
canvas.width = 500;
canvas.height = 500;

// Initialize WebGL settings: viewport and clear color
gl.viewport(0, 0, canvas.width, canvas.height);
gl.enable(gl.SCISSOR_TEST);

// Start rendering
render();

// Render loop
function render() {
  const halfWidth = canvas.width / 2;
  const halfHeight = canvas.height / 2;

  gl.viewport(0, halfHeight, halfWidth, halfHeight);
  gl.scissor(0, halfHeight, halfWidth, halfHeight);
  gl.clearColor(1.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.viewport(halfWidth, halfHeight, halfWidth, halfHeight);
  gl.scissor(halfWidth, halfHeight, halfWidth, halfHeight);
  gl.clearColor(0.0, 1.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.viewport(0, 0, halfWidth, halfHeight);
  gl.scissor(0, 0, halfWidth, halfHeight);
  gl.clearColor(0.0, 0.0, 1.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.viewport(halfWidth, 0, halfWidth, halfHeight);
  gl.scissor(halfWidth, 0, halfWidth, halfHeight);
  gl.clearColor(1.0, 1.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
}

// Resize viewport when window size changes
window.addEventListener("resize", () => {
  canvas.width = Math.min(500, window.innerWidth, window.innerHeight);
  canvas.height = Math.min(500, window.innerWidth, window.innerHeight);
  gl.viewport(0, 0, canvas.width, canvas.height);
  render();
});
