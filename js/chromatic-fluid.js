/* Dependency-free adaptation of the Chromatic Fluid WebGL component for this static portfolio. */
window.PF = window.PF || {};

(function() {
  var vertexShader = 'attribute vec2 position; varying vec2 vUv; void main() { vUv = (position + 1.0) * 0.5; gl_Position = vec4(position, 0.0, 1.0); }';
  var fragmentShader = 'precision highp float; uniform vec2 u_resolution; uniform float u_time; varying vec2 vUv; float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);} float noise(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);} float fbm(vec2 p){float v=0.,a=.5;mat2 r=mat2(cos(.5),sin(.5),-sin(.5),cos(.5));for(int i=0;i<4;i++){v+=a*noise(p);p=r*p*2.;a*=.5;}return v;} void main(){vec2 uv=vUv;float t=u_time*.22;vec2 p=(uv-.5)*vec2(u_resolution.x/u_resolution.y,1.)*2.;float base=fbm(p*.8+t*.2);float f=fbm(p*1.2+base*.8+t*.3);float e=.01;float nx=fbm(p+vec2(e,0.)+base*.8+t*.3)-f;float ny=fbm(p+vec2(0.,e)+base*.8+t*.3)-f;vec3 n=normalize(vec3(nx,ny,e*1.5));vec3 h=normalize(vec3(1.,1.,1.8));float s=pow(max(dot(n,h),0.),48.);vec3 c=mix(vec3(.035),vec3(s)*1.35,.92);float v=smoothstep(1.8,.18,length(uv-.5));gl_FragColor=vec4(clamp(c*v,0.,1.),1.);}';

  function compile(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  PF.initChromaticFluid = function initChromaticFluid() {
    var canvas = document.getElementById('chromatic-fluid');
    var host = document.querySelector('.hero');
    if (!canvas || !host || !window.WebGLRenderingContext) return;

    var gl = canvas.getContext('webgl', { antialias: false, powerPreference: 'low-power' });
    if (!gl) return;

    var vertex = compile(gl, gl.VERTEX_SHADER, vertexShader);
    var fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentShader);
    if (!vertex || !fragment) return;

    var program = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    var position = gl.getAttribLocation(program, 'position');
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    var resolution = gl.getUniformLocation(program, 'u_resolution');
    var time = gl.getUniformLocation(program, 'u_time');
    var frameId = 0;
    var start = performance.now();
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function isDark() { return document.documentElement.getAttribute('data-theme') === 'dark'; }
    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      var rect = host.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(resolution, canvas.width, canvas.height);
    }
    function draw(now) {
      if (!isDark()) { frameId = 0; return; }
      gl.uniform1f(time, (now - start) / 1000);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      if (!reduced) frameId = requestAnimationFrame(draw);
    }
    function startRender() {
      if (!isDark() || frameId) return;
      resize();
      if (reduced) draw(start); else frameId = requestAnimationFrame(draw);
    }

    var resizeObserver = window.ResizeObserver ? new ResizeObserver(function() { resize(); }) : null;
    if (resizeObserver) resizeObserver.observe(host); else window.addEventListener('resize', resize, { passive: true });
    new MutationObserver(function() { if (isDark()) startRender(); }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    startRender();
  };
})();
