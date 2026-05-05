
const scene    = new THREE.Scene();
const camera   = new THREE.PerspectiveCamera(65, innerWidth/innerHeight, 0.05, 120);
camera.position.set(0, 1.65, 9);

const renderer = new THREE.WebGLRenderer({ antialias:true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
renderer.toneMapping       = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.85;
document.body.appendChild(renderer.domElement);

scene.fog = new THREE.FogExp2(0x0d0907, 0.025);
scene.background = new THREE.Color(0x0d0907);

window.addEventListener('resize', ()=>{
  camera.aspect = innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

scene.add(new THREE.AmbientLight(0xfff0d8, 0.15));

const fillLight = new THREE.PointLight(0xffd8a0, 0.5, 28);
fillLight.position.set(0, 8, 0);
scene.add(fillLight);

const spotData = [
  [-6.5, 8.2, -4,  -6.5, 2.5, -10.8],
  [-0.5, 8.2, -4,  -0.5, 2.5, -10.8],
  [ 5.5, 8.2, -4,   5.5, 2.5, -10.8],
  [-9,   8.2, -7,  -10.8, 2.5, -7],
  [-9,   8.2, -1,  -10.8, 2.5, -1],
  [ 9,   8.2, -7,   10.8, 2.5, -7],
  [ 9,   8.2, -1,   10.8, 2.5, -1],
  [ 9,   8.2,  5,   10.8, 2.5,  5],
  [-9,   8.2,  5,  -10.8, 2.5,  5],
];

const spots = spotData.map(([px,py,pz,tx,ty,tz])=>{
  const s = new THREE.SpotLight(0xffeedd, 3.2, 18, Math.PI/7.5, 0.45, 1.4);
  s.position.set(px,py,pz);
  s.target.position.set(tx,ty,tz);
  s.castShadow = true;
  s.shadow.mapSize.set(512,512);
  scene.add(s); scene.add(s.target);
  return s;
});


function addMesh(geo, mat, x=0,y=0,z=0, rx=0,ry=0,rz=0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x,y,z); m.rotation.set(rx,ry,rz);
  m.castShadow=true; m.receiveShadow=true;
  scene.add(m); return m;
}
const M = (col,r=0.92,me=0) => new THREE.MeshStandardMaterial({color:col,roughness:r,metalness:me});


addMesh(new THREE.PlaneGeometry(24,24), M(0x1a1208,0.95), 0,0,0, -Math.PI/2);


const wallM = M(0x1c1508,0.97);
addMesh(new THREE.BoxGeometry(24,11,0.2),  wallM,    0,  5.5, -12);
addMesh(new THREE.BoxGeometry(0.2,11,24),  wallM,  -12,  5.5,   0);
addMesh(new THREE.BoxGeometry(0.2,11,24),  wallM,   12,  5.5,   0);
addMesh(new THREE.BoxGeometry(7, 11,0.2),  wallM, -8.5,  5.5,  12);
addMesh(new THREE.BoxGeometry(7, 11,0.2),  wallM,  8.5,  5.5,  12);


addMesh(new THREE.PlaneGeometry(24,24), M(0x120e08,0.98), 0,11,0, Math.PI/2);

const skM = M(0x0f0a04,0.9);
addMesh(new THREE.BoxGeometry(24,0.18,0.08),  skM,     0, 0.09, -11.9);
addMesh(new THREE.BoxGeometry(0.08,0.18,24),  skM, -11.9, 0.09,     0);
addMesh(new THREE.BoxGeometry(0.08,0.18,24),  skM,  11.9, 0.09,     0);


const rM = M(0x261a08,0.75,0.1);
addMesh(new THREE.BoxGeometry(24,0.09,0.09),    rM,      0, 9, -11.93);
addMesh(new THREE.BoxGeometry(0.09,0.09,24),    rM, -11.93, 9,      0);
addMesh(new THREE.BoxGeometry(0.09,0.09,24),    rM,  11.93, 9,      0);


const stripM = M(0x140e06, 0.98);
for(let i=-10; i<=10; i+=2){
  addMesh(new THREE.BoxGeometry(0.04,0.01,24), stripM, i, 0.005, 0);
}


const interactables = [];

function makeCanvas(fn, w=600, h=480) {
  const c = document.createElement('canvas');
  c.width=w; c.height=h;
  fn(c.getContext('2d'), w, h);
  return new THREE.CanvasTexture(c);
}

function painting(tex, pw, ph, x, y, z, ry, frameHex, title, body) {
  const fMat = M(frameHex, 0.65, 0.18);
  const fw=pw+0.16, fh=ph+0.16, fd=0.07;
  const frame = new THREE.Mesh(new THREE.BoxGeometry(fw,fh,fd), fMat);
  frame.position.set(x,y,z); frame.rotation.y=ry;
  frame.castShadow=true; scene.add(frame);

  const offset = fd/2+0.008;
  const canv = new THREE.Mesh(
    new THREE.PlaneGeometry(pw,ph),
    new THREE.MeshStandardMaterial({map:tex, roughness:0.82})
  );
  canv.position.set(x - Math.sin(ry)*offset, y, z - Math.cos(ry)*offset);
  canv.rotation.y=ry; scene.add(canv);

  interactables.push({mesh:frame, title, body, kind:'art'});
}



function paintMoon1(ctx,w,h){
  const bg=ctx.createLinearGradient(0,0,0,h);
  bg.addColorStop(0,'#04061a'); bg.addColorStop(0.55,'#0e1630'); bg.addColorStop(1,'#06111e');
  ctx.fillStyle=bg; ctx.fillRect(0,0,w,h);
  for(let i=0;i<220;i++){
    const r=Math.random()*1.4+0.2;
    ctx.beginPath(); ctx.arc(Math.random()*w, Math.random()*h*0.75, r, 0, Math.PI*2);
    ctx.fillStyle=`rgba(255,252,230,${Math.random()*0.75+0.2})`; ctx.fill();
  }
  const mg=ctx.createRadialGradient(w*.5,h*.3,0,w*.5,h*.3,w*.22);
  mg.addColorStop(0,'rgba(255,248,210,0.22)'); mg.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=mg; ctx.fillRect(0,0,w,h);
  const mGrad=ctx.createRadialGradient(w*.47,h*.28,0,w*.5,h*.3,w*.13);
  mGrad.addColorStop(0,'#fffdf2'); mGrad.addColorStop(0.6,'#f0e8c5'); mGrad.addColorStop(1,'#c5ae72');
  ctx.beginPath(); ctx.arc(w*.5,h*.3,w*.13,0,Math.PI*2); ctx.fillStyle=mGrad; ctx.fill();
  const sea=ctx.createLinearGradient(0,h*.62,0,h);
  sea.addColorStop(0,'#0a1828'); sea.addColorStop(1,'#040c14');
  ctx.fillStyle=sea; ctx.fillRect(0,h*.62,w,h);
  ctx.strokeStyle='rgba(255,248,210,0.18)'; ctx.lineWidth=2;
  for(let i=0;i<10;i++){
    const ry=h*.64+i*h*.036;
    ctx.beginPath(); ctx.moveTo(w*.5-60-i*9,ry);
    ctx.bezierCurveTo(w*.5-15,ry-8,w*.5+15,ry-8,w*.5+60+i*9,ry); ctx.stroke();
  }
  const hl=ctx.createLinearGradient(w*.46,h*.62,w*.54,h);
  hl.addColorStop(0,'rgba(255,248,210,0.18)'); hl.addColorStop(1,'rgba(255,248,210,0.02)');
  ctx.fillStyle=hl; ctx.fillRect(w*.46,h*.62,w*.08,h*.38);
}

function paintMoon2(ctx,w,h){
  const bg=ctx.createLinearGradient(0,0,0,h);
  bg.addColorStop(0,'#030608'); bg.addColorStop(0.7,'#0c1520'); bg.addColorStop(1,'#121a10');
  ctx.fillStyle=bg; ctx.fillRect(0,0,w,h);
  for(let i=0;i<180;i++){
    ctx.beginPath(); ctx.arc(Math.random()*w,Math.random()*h*.72,Math.random()*1.1+0.15,0,Math.PI*2);
    ctx.fillStyle=`rgba(200,215,255,${Math.random()*.6+0.15})`; ctx.fill();
  }
  ctx.fillStyle='#f2e5b8';
  ctx.beginPath(); ctx.arc(w*.62,h*.2,w*.1,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#0c1520';
  ctx.beginPath(); ctx.arc(w*.655,h*.2,w*.085,0,Math.PI*2); ctx.fill();
  const hG=ctx.createLinearGradient(0,h*.55,0,h);
  hG.addColorStop(0,'rgba(15,28,15,0.95)'); hG.addColorStop(1,'rgba(5,10,5,1)');
  ctx.fillStyle=hG;
  ctx.beginPath(); ctx.moveTo(0,h);
  ctx.bezierCurveTo(w*.12,h*.6,w*.28,h*.56,w*.42,h*.66);
  ctx.bezierCurveTo(w*.56,h*.76,w*.72,h*.54,w*.88,h*.64);
  ctx.bezierCurveTo(w*.93,h*.67,w,h*.6,w,h); ctx.closePath(); ctx.fill();
  for(let i=0;i<5;i++){
    const mist=ctx.createLinearGradient(0,h*.52+i*h*.06,0,h*.58+i*h*.06);
    mist.addColorStop(0,'rgba(160,185,165,0)');
    mist.addColorStop(0.5,`rgba(160,185,165,${0.04+i*.005})`);
    mist.addColorStop(1,'rgba(160,185,165,0)');
    ctx.fillStyle=mist; ctx.fillRect(0,h*.52+i*h*.06,w,h*.08);
  }
}


function paintMoon3(ctx,w,h){
  ctx.fillStyle='#160a06'; ctx.fillRect(0,0,w,h);
  const blueW=ctx.createRadialGradient(w*.25,h*.45,0,w*.25,h*.45,w*.7);
  blueW.addColorStop(0,'rgba(30,50,110,0.45)'); blueW.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=blueW; ctx.fillRect(0,0,w,h);
  ctx.strokeStyle='rgba(205,162,70,0.9)'; ctx.lineWidth=3.5;
  ctx.beginPath(); ctx.arc(w*.6,h*.4,w*.17,0,Math.PI*2); ctx.stroke();
  ctx.strokeStyle='rgba(205,162,70,0.22)'; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.arc(w*.6,h*.4,w*.11,0,Math.PI*2); ctx.stroke();
  ctx.strokeStyle='rgba(205,162,70,0.08)'; ctx.lineWidth=1;
  ctx.beginPath(); ctx.arc(w*.6,h*.4,w*.24,0,Math.PI*2); ctx.stroke();
  ctx.lineCap='round'; ctx.lineWidth=22;
  for(let i=0;i<6;i++){
    ctx.strokeStyle=`rgba(185,135,55,${0.08+Math.random()*.1})`;
    ctx.beginPath();
    ctx.moveTo(Math.random()*w*.6, Math.random()*h);
    ctx.lineTo(Math.random()*w, Math.random()*h); ctx.stroke();
  }
  for(let i=0;i<100;i++){
    ctx.beginPath(); ctx.arc(Math.random()*w,Math.random()*h,Math.random()*1.2,0,Math.PI*2);
    ctx.fillStyle=`rgba(215,178,80,${Math.random()*.45})`; ctx.fill();
  }
}


function paintTravel1(ctx,w,h){
  const sky=ctx.createLinearGradient(0,0,0,h*.62);
  sky.addColorStop(0,'#180a14'); sky.addColorStop(0.45,'#8a3525'); sky.addColorStop(1,'#e07e3a');
  ctx.fillStyle=sky; ctx.fillRect(0,0,w,h*.62);
  const sunG=ctx.createRadialGradient(w*.55,h*.5,0,w*.55,h*.5,w*.15);
  sunG.addColorStop(0,'rgba(255,225,150,0.95)'); sunG.addColorStop(1,'rgba(255,140,40,0)');
  ctx.fillStyle=sunG; ctx.fillRect(0,0,w,h);
  const sea=ctx.createLinearGradient(0,h*.6,0,h);
  sea.addColorStop(0,'#244462'); sea.addColorStop(1,'#0c1c2e');
  ctx.fillStyle=sea; ctx.fillRect(0,h*.6,w,h);
  ctx.fillStyle='rgba(255,200,100,0.18)';
  ctx.fillRect(w*.42,h*.6,w*.26,h*.4);
  ctx.fillStyle='#160c06';
  function roof(pts){
    ctx.beginPath(); ctx.moveTo(pts[0],pts[1]);
    for(let i=2;i<pts.length;i+=2) ctx.lineTo(pts[i],pts[i+1]);
    ctx.closePath(); ctx.fill();
  }
  roof([0,h, 0,h*.54, w*.14,h*.5, w*.2,h*.55, w*.25,h]);
  roof([w*.22,h, w*.22,h*.47, w*.36,h*.43, w*.44,h*.49, w*.48,h]);
  roof([w*.46,h, w*.46,h*.42, w*.6,h*.38, w*.68,h*.44, w*.72,h]);
  roof([w*.7,h, w*.7,h*.5, w*.84,h*.46, w*.92,h*.52, w,h*.48, w,h]);
  ctx.fillStyle='#120a04';
  ctx.beginPath(); ctx.arc(w*.4,h*.45,w*.05,0,Math.PI*2); ctx.fill();
}

function paintTravel2(ctx,w,h){
  const bg=ctx.createLinearGradient(0,0,0,h);
  bg.addColorStop(0,'#06080e'); bg.addColorStop(1,'#0c0e12');
  ctx.fillStyle=bg; ctx.fillRect(0,0,w,h);
  ctx.fillStyle='#181208';
  for(let r=0;r<8;r++) for(let c=0;c<7;c++){
    const cx=c*(w/6.5)+(r%2)*(w/13), cy=h*.56+r*(h*.065);
    ctx.fillRect(cx+2,cy+2,w/6.5-4,h*.065-3);
  }
  function lantern(lx,ly,col){
    const lg=ctx.createRadialGradient(lx,ly,0,lx,ly,32);
    lg.addColorStop(0,col); lg.addColorStop(1,'rgba(0,0,0,0)');
    ctx.fillStyle=lg; ctx.fillRect(lx-45,ly-45,90,90);
    ctx.fillStyle=col; ctx.beginPath(); ctx.ellipse(lx,ly,13,19,0,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='rgba(0,0,0,.45)'; ctx.lineWidth=1;
    for(let i=-2;i<=2;i++){ ctx.beginPath(); ctx.moveTo(lx+i*5,ly-17); ctx.lineTo(lx+i*5,ly+17); ctx.stroke(); }
    ctx.strokeStyle='rgba(255,255,255,.12)'; ctx.lineWidth=1;
    ctx.beginPath(); ctx.roundRect(lx-13,ly-19,26,38,2); ctx.stroke();
  }
  lantern(w*.18,h*.25,'rgba(215,50,30,0.9)');
  lantern(w*.5, h*.18,'rgba(215,50,30,0.9)');
  lantern(w*.82,h*.25,'rgba(215,50,30,0.9)');
  lantern(w*.33,h*.37,'rgba(215,50,30,0.75)');
  lantern(w*.67,h*.37,'rgba(215,50,30,0.75)');
  lantern(w*.12,h*.47,'rgba(215,50,30,0.55)');
  lantern(w*.88,h*.47,'rgba(215,50,30,0.55)');
  ctx.strokeStyle='rgba(90,65,30,.55)'; ctx.lineWidth=1.5;
  ctx.beginPath(); ctx.moveTo(0,h*.2); ctx.bezierCurveTo(w*.3,h*.23,w*.7,h*.23,w,h*.2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0,h*.33); ctx.bezierCurveTo(w*.3,h*.36,w*.7,h*.36,w,h*.33); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0,h*.44); ctx.bezierCurveTo(w*.3,h*.47,w*.7,h*.47,w,h*.44); ctx.stroke();
}


function paintTravel3(ctx,w,h){
  const bg=ctx.createLinearGradient(0,0,0,h);
  bg.addColorStop(0,'#0c1210'); bg.addColorStop(1,'#181e14');
  ctx.fillStyle=bg; ctx.fillRect(0,0,w,h);
  ctx.fillStyle='#161208';
  ctx.beginPath(); ctx.moveTo(w*.36,h); ctx.lineTo(w*.64,h); ctx.lineTo(w*.54,0); ctx.lineTo(w*.46,0); ctx.closePath(); ctx.fill();
  ctx.strokeStyle='rgba(12,16,10,0.9)'; ctx.lineCap='round';
  function tree(tx,side,scale=1){
    const d=side==='l'?-1:1;
    ctx.lineWidth=(16+Math.random()*10)*scale;
    ctx.beginPath(); ctx.moveTo(tx,h); ctx.lineTo(tx+d*22*scale,h*.08); ctx.stroke();
    for(let b=0;b<6;b++){
      ctx.lineWidth=(5+Math.random()*5)*scale;
      const by=h*.15+b*(h*.135);
      ctx.beginPath(); ctx.moveTo(tx+d*b*5*scale,by); ctx.lineTo(tx+d*(55+b*18)*scale,by-25+b*6); ctx.stroke();
    }
  }
  for(let i=0;i<4;i++) tree(w*.04+i*w*.08,'l',1-i*.1);
  for(let i=0;i<4;i++) tree(w*.96-i*w*.08,'r',1-i*.1);
  for(let i=0;i<7;i++){
    const mist=ctx.createLinearGradient(0,h*.15+i*h*.1,0,h*.22+i*h*.1);
    mist.addColorStop(0,'rgba(170,190,175,0)');
    mist.addColorStop(.5,`rgba(170,190,175,${.038+i*.006})`);
    mist.addColorStop(1,'rgba(170,190,175,0)');
    ctx.fillStyle=mist; ctx.fillRect(0,h*.15+i*h*.1,w,h*.1);
  }
  const glow=ctx.createRadialGradient(w*.5,0,0,w*.5,0,w*.4);
  glow.addColorStop(0,'rgba(210,230,210,0.35)'); glow.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=glow; ctx.fillRect(0,0,w,h);
}


function paintArt1(ctx,w,h){
  ctx.fillStyle='#280e06'; ctx.fillRect(0,0,w,h);
  const layers=[
    [0,     0,    w, h*.45, 'rgba(165,72,32,0.65)'],
    [0,  h*.38,   w, h*.32, 'rgba(190,110,40,0.5)'],
    [0,  h*.62,   w, h*.38, 'rgba(145,55,25,0.72)'],
  ];
  layers.forEach(([x,y,lw,lh,col])=>{
    ctx.fillStyle=col; ctx.save(); ctx.translate(x+lw/2,y+lh/2);
    ctx.rotate((Math.random()-.5)*.12); ctx.fillRect(-lw/2,-lh/2,lw,lh); ctx.restore();
  });
  ctx.lineCap='round';
  for(let i=0;i<14;i++){
    ctx.strokeStyle=`rgba(200,158,52,${0.12+Math.random()*.18})`; ctx.lineWidth=20+Math.random()*12;
    ctx.beginPath(); ctx.moveTo(Math.random()*w,Math.random()*h); ctx.lineTo(Math.random()*w,Math.random()*h); ctx.stroke();
  }
  const circ=ctx.createRadialGradient(w*.72,h*.28,0,w*.72,h*.28,w*.18);
  circ.addColorStop(0,'rgba(205,165,55,0.2)'); circ.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=circ; ctx.fillRect(0,0,w,h);
  for(let i=0;i<90;i++){
    ctx.beginPath(); ctx.arc(Math.random()*w,Math.random()*h,Math.random()*1.4,0,Math.PI*2);
    ctx.fillStyle=`rgba(215,175,65,${Math.random()*.5})`; ctx.fill();
  }
}


function paintArt2(ctx,w,h){
  ctx.fillStyle='#05101a'; ctx.fillRect(0,0,w,h);
  for(let i=0;i<9;i++){
    const g=ctx.createLinearGradient(0,h*i/9,w,h*(i+1)/9);
    g.addColorStop(0,`hsla(${195+i*7},${48+i*4}%,${18+i*3}%,0.42)`);
    g.addColorStop(1,`hsla(${205+i*5},56%,${13+i*2}%,0.32)`);
    ctx.fillStyle=g; ctx.fillRect(0,h*i/9,w,h/9+2);
  }
  ctx.strokeStyle='rgba(130,195,200,0.28)'; ctx.lineWidth=1.5;
  for(let i=0;i<22;i++){
    const y=Math.random()*h; ctx.beginPath(); ctx.moveTo(0,y);
    ctx.bezierCurveTo(w*.3,y-18+Math.random()*36,w*.7,y+18-Math.random()*36,w,y+Math.random()*20-10); ctx.stroke();
  }
  const bloom=ctx.createRadialGradient(w*.38,h*.3,0,w*.38,h*.3,w*.32);
  bloom.addColorStop(0,'rgba(165,230,230,0.18)'); bloom.addColorStop(1,'rgba(0,0,0,0)');
  ctx.fillStyle=bloom; ctx.fillRect(0,0,w,h);
}


function paintArt3(ctx,w,h){
  ctx.fillStyle='#ede5ce'; ctx.fillRect(0,0,w,h);
  const blocks=[
    ['#8a9c72', 0,      0,      w*.54, h*.58],
    ['#c6a438', w*.48,  0,      w*.52, h*.38],
    ['#7a6245', 0,      h*.52,  w*.38, h*.48],
    ['#d0c098', w*.32,  h*.36,  w*.68, h*.64],
    ['#b87c5a', w*.7,   h*.5,   w*.3,  h*.5 ],
  ];
  blocks.forEach(([col,x,y,bw,bh])=>{ ctx.fillStyle=col; ctx.fillRect(x,y,bw,bh); });
  ctx.strokeStyle='rgba(235,228,215,0.7)'; ctx.lineWidth=9;
  ctx.beginPath(); ctx.moveTo(w*.5,0); ctx.lineTo(w*.5,h); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0,h*.48); ctx.lineTo(w,h*.48); ctx.stroke();
  ctx.strokeStyle='rgba(235,228,215,0.35)'; ctx.lineWidth=5;
  ctx.beginPath(); ctx.moveTo(0,h*.36); ctx.lineTo(w,h*.36); ctx.stroke();
  ctx.fillStyle='rgba(235,228,215,0.88)';
  ctx.beginPath(); ctx.arc(w*.74,h*.2,w*.08,0,Math.PI*2); ctx.fill();
}

painting(makeCanvas(paintMoon1,700,540),   2.4,1.85, -6.5,2.9,-11.88,  0,           0x2a1e10, 'Full Moon Over Still Water',        'There is a lake I used to visit as a child. On cloudless nights the moon would settle into it perfectly — two moons, one above, one below. I would stand very still and feel the whole world holding its breath with me.');
painting(makeCanvas(paintTravel1,700,540), 2.4,1.85, -0.2,2.9,-11.88,  0,           0x1e1208, 'Dusk Over the Rooftops',             'A city I wandered into without a plan. The evening light turned everything copper. Someone on a balcony was playing guitar badly and it was perfect. I sat on a stone step and didn\'t move for an hour. Some places ask nothing of you.');
painting(makeCanvas(paintArt3,700,540),    2.4,1.85,  6.0,2.9,-11.88,  0,           0x3a2a10, 'Colour Study (Sage, Ochre, Ivory)',  'I made this in my head on a Sunday afternoon when the light came through the curtains at exactly the right angle. Some moments are made entirely of colour. This is one of them.');


painting(makeCanvas(paintMoon2,540,680),   1.82,2.28, -11.88,3.1,-5.5, Math.PI/2,  0x181008, 'Crescent Over the Hills',            'The kind of moon that makes you feel the night has a heartbeat. I have chased this particular sky across three countries. It always finds me exactly when I need it.');
painting(makeCanvas(paintTravel3,540,680), 1.82,2.28, -11.88,3.1, 0.5, Math.PI/2,  0x1a1a0e, 'The Path Through',                   'Every place I have loved has had a path like this — disappearing into mist you cannot quite see through. The fog is not frightening. It is permission to not need to know what comes next.');
painting(makeCanvas(paintArt1,540,400),    1.82,1.35, -11.88,5.35,-2.5, Math.PI/2, 0x2a1808, 'Terracotta & Gold',                  'The colours of warmth. Of a kitchen in late afternoon, a table set without thinking about it, the radio on. There is a specific quality of orange light that means home, and this is its colour exactly.');


painting(makeCanvas(paintTravel2,540,680), 1.82,2.28,  11.88,3.1,-5.5, -Math.PI/2, 0x0e0e18, 'Lantern Street',                     'A street in Kyoto at New Year. Every lantern a different shade of red. We walked slowly and didn\'t speak much. Some things are too beautiful for words and you honour them with silence.');
painting(makeCanvas(paintMoon3,540,680),   1.82,2.28,  11.88,3.1, 1.0, -Math.PI/2, 0x281a08, 'Moon (Gold on Blue)',                'Not a painting of the moon — a painting of the feeling of the moon. Something just out of reach but consistent. Faithful. It rises every night whether or not anyone is watching.');
painting(makeCanvas(paintArt2,540,400),    1.82,1.35,  11.88,5.35,-2.5,-Math.PI/2, 0x0e1820, 'Coastal Memory',                     'Mornings with salt air and cold coffee. The sea in the distance making the sound it makes that fills every silence without covering it. I close my eyes some nights and I am still there.');


const books = [
  { title:'The Remains of the Day — Kazuo Ishiguro',
    body:'A novel about the things we choose not to say. About dignity and regret and all the summers that slipped past the window while we were being careful. I read it on a train and missed my stop and didn\'t mind at all.' },
  { title:'To the Lighthouse — Virginia Woolf',
    body:'She wanted to go. The weather changed. Life happened in between. Woolf understood that most of living occurs in the pause between intention and arrival — in the waiting room of our own desires.' },
  { title:'Housekeeping — Marilynne Robinson',
    body:'Robinson wrote a book about impermanence that somehow makes permanence feel possible. The lake. The sisters. The house that filled with water and became something else. I return to it every winter.' },
  { title:'A Field Guide to Getting Lost — Rebecca Solnit',
    body:'On wandering — how being lost is sometimes the most honest way to find something. A book to read when you are between places in more ways than one. She gave me permission to not know where I was going.' },
  { title:'The Periodic Table — Primo Levi',
    body:'Each chapter named after an element. Chemistry as memoir. The precision of molecules as a container for the messiness of a life. Unexpected and exact in equal measure, like the best homes are.' },
  { title:'Braiding Sweetgrass — Robin Wall Kimmerer',
    body:'On plants as teachers, on reciprocity, on gratitude as an ecology rather than a feeling. I started reading it outside and found I couldn\'t go back in. The grass looked different after.' },
  { title:'Giovanni\'s Room — James Baldwin',
    body:'Every sentence clean and devastating. A book about love and the cities we carry inside us long after we\'ve left them. Paris has never seemed so close and so impossible at the same time.' },
  { title:'The Rings of Saturn — W.G. Sebald',
    body:'Walking the Suffolk coast, time folding in on itself. History and landscape and a particular quality of melancholy braided into something entirely its own kind. A book that feels like memory itself.' },
  { title:'The Overstory — Richard Powers',
    body:'Nine human stories inside one vast tree story. Powers made me feel, for the first time, that a forest has an interior life as rich as any room I\'ve ever sat in. I have not looked at trees the same way since.' },
  { title:'Tenth of December — George Saunders',
    body:'Short stories — absurd, warm, full of people trying their absolute best and almost failing. He makes you love humanity even at its most confused and well-meaning. Especially then.' },
  { title:'The Door — Magda Szabó',
    body:'A strange, fierce Hungarian novel about two women and a locked door between them. About how we never fully know the people we think we know best. One of the truest books about intimacy ever written.' },
  { title:'When Breath Becomes Air — Paul Kalanithi',
    body:'On medicine and mortality, written while dying. Not sad in the way you expect — more like a long, clear note held until the very last page. A book about what makes a life, not just a living.' },
  { title:'Pachinko — Min Jin Lee',
    body:'Four generations of a Korean family. Love and sacrifice and the particular weight of choices made before you were born. A book that made me want to call everyone I love immediately.' },
  { title:'Station Eleven — Emily St. John Mandel',
    body:'\'Survival is insufficient.\' Everything that matters about art and memory and why beauty is not a luxury but a necessity. A book about the end of things that feels like a love letter to the world.' },
  { title:'The Secret History — Donna Tartt',
    body:'I read it in four sittings over a long weekend it rained the entire time. The kind of book that colonises the room you\'re sitting in. I still think about it when autumn light hits a certain way.' },
  { title:'Olive Kitteridge — Elizabeth Strout',
    body:'A woman, a small Maine town, a lifetime of small moments that accumulate into something enormous. Strout writes about ordinary life with the gravity it actually deserves.' },
];

const bookCols = [0x6b2a1a,0x1a3a6b,0x2a6b2a,0x6b5a1a,0x5a1a6b,0x1a6b5a,
                  0x8b3a22,0x22578b,0x2a7a4a,0x7a6a1a,0x6a1a7a,0x1a7a6a,
                  0xaa4422,0x225588,0x338844];


function buildShelf(cx, cz, ry){
  const sM  = new THREE.MeshStandardMaterial({color:0x1e1208, roughness:0.88, metalness:0.04});
  const SW=3.8, SD=0.38, SH=4, shelves=4;

 
  const back = new THREE.Mesh(new THREE.BoxGeometry(SW, SH+.2, .06), sM);
  const boff  = Math.cos(ry)*.16;
  const boffz = Math.sin(ry)*.16;
  back.position.set(cx+boff, SH/2, cz-boffz);
  back.rotation.y=ry; back.castShadow=true; back.receiveShadow=true; scene.add(back);

  
  [-SW/2, SW/2].forEach(dx=>{
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.07, SH+.2, SD), sM);
    s.position.set(cx+Math.cos(ry)*dx, SH/2, cz+Math.sin(ry)*dx);
    s.rotation.y=ry; s.castShadow=true; s.receiveShadow=true; scene.add(s);
  });

 
  for(let sh=0; sh<shelves; sh++){
    const sy = sh*(SH/shelves)+0.05;

    
    const plank = new THREE.Mesh(new THREE.BoxGeometry(SW, .07, SD), sM);
    plank.position.set(cx, sy, cz);
    plank.rotation.y=ry; plank.castShadow=true; plank.receiveShadow=true; scene.add(plank);

    
    let bx = -SW/2+.15;
    const num = Math.floor(8+Math.random()*5);
    for(let b=0; b<num && bx<SW/2-.1; b++){
      const bw   = .09+Math.random()*.08;
      const bh   = .52+Math.random()*.4;
      const bidx = ((sh*6+b+Math.abs(Math.round(cx))*3) % books.length);
      const bMat = new THREE.MeshStandardMaterial({color:bookCols[bidx%bookCols.length], roughness:.86});
      const bm   = new THREE.Mesh(new THREE.BoxGeometry(bw,bh,.26), bMat);
      bm.position.set(cx+Math.cos(ry)*bx, sy+.035+bh/2, cz+Math.sin(ry)*bx);
      bm.rotation.y=ry; bm.rotation.z=(Math.random()-.5)*.1;
      bm.castShadow=true; scene.add(bm);
      interactables.push({mesh:bm, title:books[bidx].title, body:books[bidx].body, kind:'book'});
      bx += bw+.025;
    }
  }
}


buildShelf(-3.5, -11.4,  0);
buildShelf( 3.0, -11.4,  0);
buildShelf(-11.4, -3.0,  Math.PI/2);
buildShelf(-11.4,  5.0,  Math.PI/2);
buildShelf( 11.4, -3.0, -Math.PI/2);
buildShelf( 11.4,  5.0, -Math.PI/2);


const benchM = M(0x1e1208,.9,.05);
const bench  = new THREE.Mesh(new THREE.BoxGeometry(2.4,.3,.7), benchM);
bench.position.set(0,.15,4.5); bench.castShadow=true; bench.receiveShadow=true; scene.add(bench);
[[-1,.95],[-1,-.95],[1,.95],[1,-.95]].forEach(([lx,lz])=>{
  const leg = new THREE.Mesh(new THREE.BoxGeometry(.1,.15,.1), benchM);
  leg.position.set(lx, .075, 4.5+lz*.3); scene.add(leg);
});
const cush = new THREE.Mesh(new THREE.BoxGeometry(2.2,.1,.62), M(0x4a2e1a,1));
cush.position.set(0,.34,4.5); cush.castShadow=true; scene.add(cush);


const DC   = 220;
const dGeo = new THREE.BufferGeometry();
const dArr = new Float32Array(DC*3);
const dVel = [];
for(let i=0; i<DC; i++){
  dArr[i*3]   = (Math.random()-.5)*22;
  dArr[i*3+1] = Math.random()*8+.5;
  dArr[i*3+2] = (Math.random()-.5)*22;
  dVel.push((Math.random()-.5)*.0025, .0008+Math.random()*.0018, (Math.random()-.5)*.0025);
}
dGeo.setAttribute('position', new THREE.BufferAttribute(dArr,3));
const dustPts = new THREE.Points(dGeo,
  new THREE.PointsMaterial({color:0xfff6e0, size:.028, transparent:true, opacity:.28,
    blending:THREE.AdditiveBlending, depthWrite:false}));
scene.add(dustPts);


let yaw=0, pitch=0, locked=false;
let mF=false, mB=false, mL=false, mR=false;
let near=null, panelOpen=false;
const raycaster = new THREE.Raycaster();
const clock     = new THREE.Clock();

document.getElementById('enter-btn').addEventListener('click', e=>{ e.stopPropagation(); enter(); });
document.getElementById('splash').addEventListener('click', enter);
document.getElementById('pclose').addEventListener('click', closePanel);

function enter(){
  const s = document.getElementById('splash');
  s.classList.add('hidden');
  setTimeout(()=> s.style.display='none', 1300);
  document.getElementById('crosshair').classList.add('on');
  renderer.domElement.requestPointerLock();
}

document.addEventListener('pointerlockchange', ()=>{ locked = !!document.pointerLockElement; });

document.addEventListener('mousemove', e=>{
  if(!locked) return;
  yaw   -= e.movementX*.0018;
  pitch -= e.movementY*.0018;
  pitch  = Math.max(-1.05, Math.min(1.05, pitch));
});

document.addEventListener('keydown', e=>{
  if(e.code==='KeyW'||e.code==='ArrowUp')    mF=true;
  if(e.code==='KeyS'||e.code==='ArrowDown')  mB=true;
  if(e.code==='KeyA'||e.code==='ArrowLeft')  mL=true;
  if(e.code==='KeyD'||e.code==='ArrowRight') mR=true;
  if(e.code==='Escape') closePanel();
});

document.addEventListener('keyup', e=>{
  if(e.code==='KeyW'||e.code==='ArrowUp')    mF=false;
  if(e.code==='KeyS'||e.code==='ArrowDown')  mB=false;
  if(e.code==='KeyA'||e.code==='ArrowLeft')  mL=false;
  if(e.code==='KeyD'||e.code==='ArrowRight') mR=false;
});

document.addEventListener('click', e=>{
  if(e.target.id==='pclose' || !locked) return;
  if(panelOpen){ closePanel(); return; }
  if(near) openPanel(near);
});

function openPanel(obj){
  document.getElementById('plabel').textContent = obj.kind==='book' ? 'from the shelf' : 'on the wall';
  document.getElementById('ptitle').textContent = obj.title;
  document.getElementById('pbody').textContent  = obj.body;
  document.getElementById('panel').classList.add('open');
  panelOpen = true;
}
function closePanel(){
  document.getElementById('panel').classList.remove('open');
  panelOpen = false;
}


function animate(){
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

 
  const dir   = new THREE.Vector3(); camera.getWorldDirection(dir); dir.y=0; dir.normalize();
  const right = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0,1,0));
  const vel   = new THREE.Vector3();
  if(mF) vel.addScaledVector(dir,   .06);
  if(mB) vel.addScaledVector(dir,  -.06);
  if(mL) vel.addScaledVector(right,-.06);
  if(mR) vel.addScaledVector(right, .06);
  camera.position.add(vel);
  camera.position.x = Math.max(-10.2, Math.min(10.2,  camera.position.x));
  camera.position.z = Math.max(-10.2, Math.min(10.8,  camera.position.z));
  camera.position.y = 1.65;
  camera.quaternion.setFromEuler(new THREE.Euler(pitch, yaw, 0, 'YXZ'));

  
  raycaster.setFromCamera({x:0,y:0}, camera);
  const hits = raycaster.intersectObjects(interactables.map(o=>o.mesh));
  const hEl  = document.getElementById('ihint');
  if(hits.length>0 && hits[0].distance<4){
    near = interactables.find(o=>o.mesh===hits[0].object) || null;
    hEl.classList.add('on');
  } else {
    near = null;
    hEl.classList.remove('on');
  }

  
  fillLight.intensity = 0.48 + Math.sin(t*.75)*.03;
  spots.forEach((s,i)=>{ s.intensity = 3.0 + Math.sin(t*1.05+i*.65)*.14; });

  
  const dp = dustPts.geometry.attributes.position.array;
  for(let i=0; i<DC; i++){
    dp[i*3]   += dVel[i*3];
    dp[i*3+1] += dVel[i*3+1];
    dp[i*3+2] += dVel[i*3+2];
    if(dp[i*3+1]>8.5) dp[i*3+1]=.4;
    if(dp[i*3]>11)    dp[i*3]=-11;  if(dp[i*3]<-11)   dp[i*3]=11;
    if(dp[i*3+2]>11)  dp[i*3+2]=-11; if(dp[i*3+2]<-11) dp[i*3+2]=11;
  }
  dustPts.geometry.attributes.position.needsUpdate=true;

  renderer.render(scene, camera);
}
animate();
