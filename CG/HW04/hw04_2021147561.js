/*-------------------------------------------------------------------------
08_Transformation.js

canvas의 중심에 한 edge의 길이가 0.3인 정사각형을 그리고, 
이를 크기 변환 (scaling), 회전 (rotation), 이동 (translation) 하는 예제임.
    T는 x, y 방향 모두 +0.5 만큼 translation
    R은 원점을 중심으로 2초당 1회전의 속도로 rotate
    S는 x, y 방향 모두 0.3배로 scale
이라 할 때, 
    keyboard 1은 TRS 순서로 적용
    keyboard 2는 TSR 순서로 적용
    keyboard 3은 RTS 순서로 적용
    keyboard 4는 RST 순서로 적용
    keyboard 5는 STR 순서로 적용
    keyboard 6은 SRT 순서로 적용
    keyboard 7은 원래 위치로 돌아옴
---------------------------------------------------------------------------*/
import { resizeAspectRatio, Axes } from "../util/util.js";
import { Shader, readShaderFile } from "../util/shader.js";

let isInitialized = false;
const canvas = document.getElementById("glCanvas");
const gl = canvas.getContext("webgl2");
let shader;
let axesVAO;
let cubeVAO;
let cubeTransforms = []; // 각 정사각형의 최종 변환 행렬 저장
let lastTime = 0;
const cubeColors = [
  [1.0, 0.0, 0.0, 1.0], // 빨강
  [0.0, 1.0, 1.0, 1.0], // 사이언
  [1.0, 1.0, 0.0, 1.0], // 노랑
];
const cubeStates = [
  {
    scale: 0.2,
    selfAngle: 0,
    orbitAngle: 0,
    position: [0, 0],
    selfSpeed: Math.PI / 4,
    orbitSpeed: 0,
  }, // 빨강
  {
    scale: 0.1,
    selfAngle: 0,
    orbitAngle: 0,
    position: [0.7, 0],
    selfSpeed: Math.PI,
    orbitSpeed: Math.PI / 6,
  }, // 사이언
  {
    scale: 0.05,
    selfAngle: 0,
    orbitAngle: 0,
    position: [0.2, 0],
    selfSpeed: Math.PI,
    orbitSpeed: 2 * Math.PI,
  }, // 노랑
];

document.addEventListener("DOMContentLoaded", () => {
  if (isInitialized) {
    console.log("Already initialized");
    return;
  }

  main()
    .then((success) => {
      if (!success) {
        console.log("프로그램을 종료합니다.");
        return;
      }
      isInitialized = true;
      requestAnimationFrame(animate);
    })
    .catch((error) => {
      console.error("프로그램 실행 중 오류 발생:", error);
    });
});

function initWebGL() {
  if (!gl) {
    console.error("WebGL 2 is not supported by your browser.");
    return false;
  }

  canvas.width = 700;
  canvas.height = 700;
  resizeAspectRatio(gl, canvas);
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clearColor(0.2, 0.3, 0.4, 1.0);

  return true;
}

function setupAxesBuffers(shader) {
  axesVAO = gl.createVertexArray();
  gl.bindVertexArray(axesVAO);

  const axesVertices = new Float32Array([
    -0.8,
    0.0,
    0.8,
    0.0, // x축
    0.0,
    -0.8,
    0.0,
    0.8, // y축
  ]);

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, axesVertices, gl.STATIC_DRAW);
  shader.setAttribPointer("a_position", 2, gl.FLOAT, false, 0, 0);

  gl.bindVertexArray(null);
}

function setupCubeBuffers(shader) {
  const cubeVertices = new Float32Array([
    -0.5,
    0.5, // 좌상단
    -0.5,
    -0.5, // 좌하단
    0.5,
    -0.5, // 우하단
    0.5,
    0.5, // 우상단
  ]);

  const indices = new Uint16Array([
    0,
    1,
    2, // 첫 번째 삼각형
    0,
    2,
    3, // 두 번째 삼각형
  ]);

  cubeVAO = gl.createVertexArray();
  gl.bindVertexArray(cubeVAO);

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, cubeVertices, gl.STATIC_DRAW);
  shader.setAttribPointer("a_position", 2, gl.FLOAT, false, 0, 0);

  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

  gl.bindVertexArray(null);
}

function applyTransform(index) {
  const { scale, selfAngle, orbitAngle, position } = cubeStates[index];

  // scaling transformation
  const s = mat4.create();
  mat4.scale(s, s, [scale, scale, 1]);

  // 자전 transformation
  const rSelf = mat4.create();
  mat4.rotate(rSelf, rSelf, selfAngle, [0, 0, 1]);

  // 공전 반지름만큼 이동
  const t = mat4.create();
  mat4.translate(t, t, [...position, 0]);

  // 공전(원점 중심 회전) transformation
  const rOrbit = mat4.create();
  mat4.rotate(rOrbit, rOrbit, orbitAngle, [0, 0, 1]);

  const transformation = mat4.create();

  if (index === 0) {
    mat4.multiply(transformation, t, rSelf);
    mat4.multiply(transformation, transformation, s);
  }
  if (index === 1) {
    mat4.multiply(transformation, transformation, rOrbit);
    mat4.multiply(transformation, transformation, t);
    mat4.multiply(transformation, transformation, rSelf);
    mat4.multiply(transformation, transformation, s);
  }
  if (index === 2) {
    // 지구 공전 반지름 위치로 이동 transformation
    const positionEarth = cubeStates[1].position;
    const tEarth = mat4.create();
    mat4.translate(tEarth, tEarth, [...positionEarth, 0]);

    // 지구 공전 transformation
    const orbitEarthAngle = cubeStates[1].orbitAngle;
    const rOrbitEarth = mat4.create();
    mat4.rotate(rOrbitEarth, rOrbitEarth, orbitEarthAngle, [0, 0, 1]);

    // 5. 지구 위치로 이동 (원점에서 지구 공전 반지름으로 이동 -> 원점 중심 회전)
    mat4.multiply(transformation, rOrbitEarth, tEarth);

    // 4. 원점 기준 공전
    mat4.multiply(transformation, transformation, rOrbit);

    // 3, 원점 기준 0.2만큼 이동
    mat4.multiply(transformation, transformation, t);

    // 2. 달 자전
    mat4.multiply(transformation, transformation, rSelf);

    // 1. scaling
    mat4.multiply(transformation, transformation, s);
  }

  cubeTransforms[index] = transformation;
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT);
  shader.use();

  shader.setMat4("u_transform", mat4.create());
  shader.setVec4("u_color", [1.0, 0.3, 0.0, 1.0]);
  gl.bindVertexArray(axesVAO);
  gl.drawArrays(gl.LINES, 0, 4);

  gl.bindVertexArray(cubeVAO);

  for (let i = 0; i < cubeStates.length; i++) {
    shader.setMat4("u_transform", cubeTransforms[i]);
    shader.setVec4("u_color", cubeColors[i]);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    console.log(i, cubeTransforms[i]);
  }
  gl.bindVertexArray(null);
}

function animate(currentTime) {
  if (!lastTime) lastTime = currentTime;
  const deltaTime = (currentTime - lastTime) / 1000;
  lastTime = currentTime;

  // 자전, 공전 각도 업데이트
  for (let state of cubeStates) {
    state.selfAngle += state.selfSpeed * deltaTime;
    state.orbitAngle += state.orbitSpeed * deltaTime;
  }

  // 포지션 계산
  for (let i = 0; i < cubeStates.length; i++) {
    applyTransform(i);
  }

  render();
  requestAnimationFrame(animate);
}

async function initShader() {
  const vertexShaderSource = await readShaderFile("shVert.glsl");
  const fragmentShaderSource = await readShaderFile("shFrag.glsl");
  return new Shader(gl, vertexShaderSource, fragmentShaderSource);
}

async function main() {
  try {
    if (!initWebGL()) {
      throw new Error("WebGL 초기화 실패");
    }

    // finalTransform = mat4.create();

    shader = await initShader();
    setupAxesBuffers(shader);
    setupCubeBuffers(shader);
    shader.use();
    return true;
  } catch (error) {
    console.error("Failed to initialize program:", error);
    alert("프로그램 초기화에 실패했습니다.");
    return false;
  }
}
