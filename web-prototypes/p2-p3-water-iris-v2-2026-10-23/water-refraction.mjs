/* Adapted from WaterDrop.glsl by Paweł Płóciennik (MIT).
   https://github.com/gl-transitions/gl-transitions/blob/master/transitions/WaterDrop.glsl
   Destination is the untouched live DOM: only outgoing P2 water is refracted. */
export function createWaterRefraction(canvas){
 const gl=canvas.getContext('webgl',{alpha:true,premultipliedAlpha:false,antialias:false,preserveDrawingBuffer:true});if(!gl)return null;
 const vertex='attribute vec2 p;varying vec2 uv;void main(){uv=p*.5+.5;gl_Position=vec4(p,0.,1.);}';
 const fragment=`precision highp float;varying vec2 uv;uniform sampler2D image;uniform vec2 size,center;uniform float progress;
 float ease5(float t){t=clamp(t,0.,1.);return t*t*t*(t*(t*6.-15.)+10.);}
 void main(){vec2 point=vec2(uv.x,1.-uv.y),d=(point-center)*size/size.y;float dist=length(d);float q=ease5((progress-.035)/.91);
 float maxRadius=length(max(center,1.-center)*size/size.y)+.12;float radius=q*maxRadius;
 float band=max(.04,maxRadius*.045),edge=dist-radius;
 float envelope=exp(-pow(edge/(band*2.8),2.))*sin(3.14159265*q);
 vec2 direction=d/max(.001,dist);vec2 offset=direction*(sin(dist*31.-q*26.)*.008+sin(dist*53.-q*17.)*.003)*envelope;
 vec2 sampleAt=clamp(point+offset*vec2(size.y/size.x,1.),0.,1.);
 vec4 c=texture2D(image,sampleAt);float alpha=smoothstep(-band,band,edge);
 alpha*=1.-ease5((progress-.88)/.1);if(progress<.005)alpha=1.;if(progress>.985)alpha=0.;gl_FragColor=vec4(c.rgb,alpha);}`;
 function shader(type,src){const s=gl.createShader(type);gl.shaderSource(s,src);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw Error(gl.getShaderInfoLog(s));return s;}
 const program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));gl.useProgram(program);
 const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const attr=gl.getAttribLocation(program,'p');gl.enableVertexAttribArray(attr);gl.vertexAttribPointer(attr,2,gl.FLOAT,false,0,0);
 const texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
 const uniforms={};for(const key of ['progress','size','center'])uniforms[key]=gl.getUniformLocation(program,key);
 let W=1,H=1;
 return {resize(width,height,img,origin){W=width;H=height;const d=Math.min(devicePixelRatio||1,1.5);canvas.width=Math.round(W*d);canvas.height=Math.round(H*d);canvas.style.width=W+'px';canvas.style.height=H+'px';gl.viewport(0,0,canvas.width,canvas.height);
 const input=document.createElement('canvas');input.width=canvas.width;input.height=canvas.height;const ctx=input.getContext('2d');ctx.scale(d,d);ctx.fillStyle='#14191e';ctx.fillRect(0,0,W,H);const iw=Math.min(W,1440),ih=img.naturalHeight*iw/img.naturalWidth;ctx.drawImage(img,(W-iw)/2,H-ih,iw,ih);gl.bindTexture(gl.TEXTURE_2D,texture);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,input);gl.uniform2f(uniforms.size,W,H);gl.uniform2f(uniforms.center,origin.x/W,origin.y/H);},draw(q){canvas.style.visibility=q>.985?'hidden':'visible';if(q>.985)return;gl.uniform1f(uniforms.progress,q);gl.drawArrays(gl.TRIANGLES,0,6);},destroy(){gl.deleteTexture(texture);gl.deleteBuffer(buffer);gl.deleteProgram(program);}};
}
