const shaderSource = {
  vertex: `
    attribute vec4 a_position;
    attribute vec4 a_color;

    uniform mat4 u_modelViewMatrix;
    uniform mat4 u_projectionMatrix;

    varying vec4 v_color;


    void main() {
        gl_Position = u_projectionMatrix * u_modelViewMatrix * a_position;
        v_color = a_color;
    }
  `,
  fragment: `
     precision mediump float;
     varying vec4 v_color;

     void main() {
         gl_FragColor = v_color;
     }
  `,
};

function compileShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  return shader;
}

const vertexShader = compileShader(gl, gl.VERTEX_SHADER, shaderSource.vertex);
const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, shaderSource.fragment);


function createProgram(gl, vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  return program;
}

const program = createProgram(gl, vertexShader, fragmentShader);
gl.useProgram(program);

function createAndBindBuffer(gl, target, data, attributeLocation, size) {
  const buffer = gl.createBuffer();
  gl.bindBuffer(target, buffer);
  gl.bufferData(target, data, gl.STATIC_DRAW);
  gl.vertexAttribPointer(attributeLocation, size, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(attributeLocation);
  return buffer;
}

const positions = new Float32Array([
  // front bottom right
  -0.1, -0.1, -1.0,
  -0.1,  0.1, -1.0,
   0.1, -0.1, -1.0,
  // front top left
  -0.1,  0.1, -1.01,
   0.1,  0.1, -1.01,
   0.1, -0.1, -1.01,
  ]);

const colors = new Float32Array([
  // front bottom right
    0.0, 1.0, 0.0, 1.0, 
    0.0, 1.0, 0.0, 1.0,
    1.0, 0.0, 0.0, 1.0,
  // front top left
    1.0, 0.0, 0.0, 1.0, 
    1.0, 0.0, 0.0, 1.0,
    1.0, 0.0, 0.0, 1.0,

  ]);

const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
const positionBuffer = createAndBindBuffer(gl, gl.ARRAY_BUFFER, positions, positionAttributeLocation, 3);

const colorAttributeLocation = gl.getAttribLocation(program, 'a_color');
const colorBuffer = createAndBindBuffer(gl, gl.ARRAY_BUFFER, colors, colorAttributeLocation, 4);


const projectionMatrix = mat4.create();
const uProjectionMatrix = gl.getUniformLocation(program, 'u_projectionMatrix');
const uModelViewMatrix = gl.getUniformLocation(program, 'u_modelViewMatrix');
mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 0.1, 250);
gl.uniformMatrix4fv(uProjectionMatrix, false, projectionMatrix);
gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix);
gl.clearColor(0.0, 0.0, 0.5, 1.0);
gl.enable(gl.DEPTH_TEST);

function animate() {
  // Update model-view matrix
  handleKeyInput();
  position = vec3.lerp([], position, targetPosition, 0.1);
  let eye = [position[0], position[1], position[2]];
  let target = [position[0] + Math.sin(mouseX), position[1] + Math.sin(mouseY), position[2] - Math.cos(mouseX)];
  let up = [0, 1, 0];
  mat4.lookAt(modelViewMatrix, eye, target, up);

  gl.clear(gl.COLOR_BUFFER_BIT);
  const tempMatrix = mat4.clone(modelViewMatrix);
  mat4.translate(modelViewMatrix, tempMatrix, [1, 0, 0]);
  gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix);
  // Draw the cubes with texture coordinates
  gl.drawArrays(gl.TRIANGLES, 0, 36);
  mat4.copy(modelViewMatrix, tempMatrix);
  requestAnimationFrame(animate);
}

animate();



