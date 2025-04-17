export class regularOctahedron {
  constructor(gl, options = {}) {
    this.gl = gl;

    this.vao = gl.createVertexArray();
    this.vbo = gl.createBuffer();
    this.ebo = gl.createBuffer();

    // 정팔면체의 꼭짓점
    const top = [0, Math.sqrt(2) / 2, 0];
    const bottom = [0, -Math.sqrt(2) / 2, 0];
    const front = [0, 0, Math.sqrt(2) / 2];
    const back = [0, 0, -Math.sqrt(2) / 2];
    const left = [-Math.sqrt(2) / 2, 0, 0];
    const right = [Math.sqrt(2) / 2, 0, 0];

    // 총 8개의 면 × 3개 꼭짓점 = 24개 꼭짓점
    this.vertices = new Float32Array([
      // top faces
      ...top,
      ...front,
      ...right, // front-right
      ...top,
      ...right,
      ...back, // right-back
      ...top,
      ...back,
      ...left, // back-left
      ...top,
      ...left,
      ...front, // left-front

      // bottom faces
      ...bottom,
      ...right,
      ...front, // front-right
      ...bottom,
      ...back,
      ...right, // right-back
      ...bottom,
      ...left,
      ...back, // back-left
      ...bottom,
      ...front,
      ...left, // left-front
    ]);

    // 면 법선 (flat shading: 면마다 동일)
    this.normals = new Float32Array([
      // 위쪽
      0, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 1, -1, 0, 1, -1,
      0, 1, -1, -1, 1, 0, -1, 1, 0, -1, 1, 0,

      // 아래쪽
      0, -1, 1, 0, -1, 1, 0, -1, 1, 1, -1, 0, 1, -1, 0, 1, -1, 0, 0, -1, -1, 0,
      -1, -1, 0, -1, -1, -1, -1, 0, -1, -1, 0, -1, -1, 0,
    ]);

    // 색상 (각 면마다 다른 색상)
    const faceColors = [
      [1, 0, 0, 1], // 빨강
      [1, 1, 0, 1], // 노랑
      [0, 1, 0, 1], // 초록
      [0, 1, 1, 1], // 시안
      [0, 0, 1, 1], // 파랑
      [1, 0, 1, 1], // 마젠타
      [0.5, 0.5, 0.5, 1], // 회색
      [1, 0.5, 0, 1], // 주황
    ];
    this.colors = new Float32Array(
      faceColors.flatMap((c) => [...c, ...c, ...c])
    );
    this.texCoords = new Float32Array([
      // ===== 위쪽 면들 (v = 0.5~1.0) =====

      // front-up (칸 0)
      0.5, 1.0, 0.0, 0.5, 0.25, 0.5,

      // right-up (칸 1)
      0.5, 1.0, 0.25, 0.5, 0.5, 0.5,

      // back-up (칸 2)
      0.5, 1.0, 0.5, 0.5, 0.75, 0.5,

      // left-up (칸 3)
      0.5, 1.0, 0.75, 0.5, 1.0, 0.5,

      // ===== 아래쪽 면들 (v = 0.0~0.5) =====

      // front-down (칸 0)
      0.5, 0.0, 0.25, 0.5, 0.0, 0.5,

      // right-down (칸 1)
      0.5, 0.0, 0.5, 0.5, 0.25, 0.5,

      // back-down (칸 2)
      0.5, 0.0, 0.75, 0.5, 0.5, 0.5,

      // left-down (칸 3)
      0.5, 0.0, 1.0, 0.5, 0.75, 0.5,
    ]);

    // 인덱스 (삼각형마다 연속된 3개 정점 사용)
    this.indices = new Uint16Array([
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
      21, 22, 23,
    ]);

    this.sameVertices = new Uint16Array([
      0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
      21, 22, 23,
    ]);

    this.vertexNormals = new Float32Array(this.normals.length);
    this.faceNormals = new Float32Array(this.normals.length);
    this.vertexNormals.set(this.normals);
    this.faceNormals.set(this.normals);

    this.initBuffers();
  }

  copyVertexNormalsToNormals() {
    this.normals.set(this.vertexNormals);
  }

  copyFaceNormalsToNormals() {
    this.normals.set(this.faceNormals);
  }

  initBuffers() {
    const gl = this.gl;

    const vSize = this.vertices.byteLength;
    const nSize = this.normals.byteLength;
    const cSize = this.colors.byteLength;
    const tSize = this.texCoords.byteLength;
    const totalSize = vSize + nSize + cSize + tSize;

    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, totalSize, gl.STATIC_DRAW);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.vertices);
    gl.bufferSubData(gl.ARRAY_BUFFER, vSize, this.normals);
    gl.bufferSubData(gl.ARRAY_BUFFER, vSize + nSize, this.colors);
    gl.bufferSubData(gl.ARRAY_BUFFER, vSize + nSize + cSize, this.texCoords);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ebo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0); // position
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, vSize); // normal
    gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 0, vSize + nSize); // color
    gl.vertexAttribPointer(3, 2, gl.FLOAT, false, 0, vSize + nSize + cSize); // texCoord

    gl.enableVertexAttribArray(0);
    gl.enableVertexAttribArray(1);
    gl.enableVertexAttribArray(2);
    gl.enableVertexAttribArray(3);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindVertexArray(null);
  }

  updateNormals() {
    const gl = this.gl;
    const vSize = this.vertices.byteLength;
    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferSubData(gl.ARRAY_BUFFER, vSize, this.normals);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
    gl.bindVertexArray(null);
  }

  draw(shader) {
    const gl = this.gl;
    shader.use();
    gl.bindVertexArray(this.vao);
    gl.drawElements(gl.TRIANGLES, 24, gl.UNSIGNED_SHORT, 0);
    gl.bindVertexArray(null);
  }

  delete() {
    const gl = this.gl;
    gl.deleteBuffer(this.vbo);
    gl.deleteBuffer(this.ebo);
    gl.deleteVertexArray(this.vao);
  }
}
