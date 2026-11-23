import * as T from './three.module.js'

function surface(color,index,random) {
    const paint=document.createElement('canvas')
    paint.width=384;paint.height=192
    const g=paint.getContext('2d')
    const img=g.createImageData(paint.width,paint.height)
    const base=new T.Color(color)
    base.convertLinearToSRGB()
    const c=[base.r,base.g,base.b].map(v=>Math.round(v*255))
    for(let y=0;y<paint.height;y++)for(let x=0;x<paint.width;x++){
      const u=x/paint.width*Math.PI*2,v=y/paint.height*Math.PI
      const bands=Math.sin(v*(index%3===1?26:9)+Math.sin(u*3+v*9)*.65)
      const clouds=Math.sin(u*5+v*12+Math.sin(u*3-v*5)*1.9)*Math.cos(v*13-u*4)
      const patch=Math.sin(u*11+v*19)*Math.cos(v*17+u*5)
      const level=.88+.13*bands+.16*clouds+.09*patch+(random()-.5)*.11
      const off=(y*paint.width+x)*4
      for(let i=0;i<3;i++)img.data[off+i]=Math.min(255,c[i]*level+Math.max(0,clouds-.16)*31)
      img.data[off+3]=255
    }
    g.putImageData(img,0,0)
    const tex=new T.CanvasTexture(paint);tex.colorSpace=T.SRGBColorSpace
    return tex
  }
export function mount(host, config, colors, ready) {
  const canvas=document.createElement('canvas')
  const gl=canvas.getContext('webgl2',{alpha:true,antialias:true,powerPreference:'low-power'})
  if(!gl)return
  const renderer=new T.WebGLRenderer({canvas,context:gl,alpha:true,antialias:true})
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5))
  renderer.setClearColor(0,0)
  renderer.outputColorSpace=T.SRGBColorSpace
  host.append(canvas)
  const scene=new T.Scene(), camera=new T.OrthographicCamera(0,1,1,0,.1,2600)
  camera.position.z=850
  const world=new T.Group()
  scene.add(world)
  const ambient=new T.AmbientLight('#d9edff',.6), key=new T.DirectionalLight('#fff0d0',2.8)
  key.position.set(-3,4,6);scene.add(ambient,key)
  const sphere=new T.SphereGeometry(1,36,24)
  let seed=419
  const random=()=> (seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296
  const sun=new T.Mesh(sphere,new T.MeshBasicMaterial({map:surface('#ffbc59',12,random)}))
  world.add(sun)
  const planets=colors.map((color,index)=>{
    const cluster=new T.Group()
    const shell=new T.Mesh(sphere,new T.MeshStandardMaterial({map:surface(color,index,random),roughness:.91,emissive:color,emissiveIntensity:.04}))
    shell.material.onBeforeCompile = shader => {
      shader.fragmentShader = shader.fragmentShader.replace('#include <dithering_fragment>', `
        #include <dithering_fragment>
        float limb = pow(1.0 - abs(dot(normalize(normal), normalize(vViewPosition))), 3.3);
        gl_FragColor.rgb += limb * vec3(0.063, 0.094, 0.108);
      `)
    }
    shell.rotation.z=(index-4)*.11
    cluster.add(shell);world.add(cluster)
    if(index===1||index===6){
      for(let j=0;j<7;j++){
        const ring=new T.Mesh(new T.RingGeometry(1.16+j*.10,1.23+j*.10,64),new T.MeshBasicMaterial({color:j%2?'#b7aaa0':'#e2c9a6',side:T.DoubleSide,transparent:true,opacity:.19+j*.046,depthWrite:false}))
        ring.rotation.set(1.12,.18,-.25);cluster.add(ring)
      }
    }
    return {cluster,shell}
  })
  const coords=new Float32Array(2750*3)
  const starColors=new Float32Array(2750*3)
  const stars=new T.BufferGeometry()
  for(let i=0;i<2750;i++){
    const t=i*3, luminosity=.15+random()*.63
    coords[t]=random();coords[t+1]=random();coords[t+2]=-400-random()*250
    starColors.set([luminosity*.87,luminosity*.95,luminosity],t)
  }
  stars.setAttribute('position',new T.BufferAttribute(coords,3))
  stars.setAttribute('color',new T.BufferAttribute(starColors,3))
  const starMaterial=new T.PointsMaterial({size:1.25,sizeAttenuation:false,vertexColors:true,transparent:true,opacity:.68,depthWrite:false})
  const starClock={value:0}
  starMaterial.onBeforeCompile=shader=>{
    shader.uniforms.starClock=starClock
    shader.vertexShader='uniform float starClock;\n'+shader.vertexShader.replace(
      '#include <fog_vertex>',
      'gl_PointSize *= 0.83 + sin(starClock * 0.66 + position.x * 341.0 + position.y * 67.0) * 0.25;\n#include <fog_vertex>'
    )
  }
  const starfield=new T.Points(stars,starMaterial)
  starfield.frustumCulled=false
  world.add(starfield)
  const asteroids=new T.BufferGeometry(), drift=Array.from({length:470},()=>[random()*Math.PI*2,(random()-.5)*.045,random()])
  const beltCoords=new Float32Array(drift.length*3)
  asteroids.setAttribute('position',new T.BufferAttribute(beltCoords,3))
  const belt=new T.Points(asteroids,new T.PointsMaterial({color:'#a79575',size:1.9,sizeAttenuation:false,transparent:true,opacity:.52,depthWrite:false}))
  belt.frustumCulled=false;world.add(belt)
  const reduced=matchMedia('(prefers-reduced-motion: reduce)')
  let width=1,height=1,frame=0,shown=false,target=-1,travel=0,destination=0
  const resize=new ResizeObserver(()=>{
    width=host.clientWidth||1;height=host.clientHeight||1
    renderer.setSize(width,height,false)
    camera.right=width;camera.top=height;camera.updateProjectionMatrix()
  });resize.observe(host)
  const visibility=new IntersectionObserver(([entry])=>{shown=entry.isIntersecting})
  visibility.observe(host)
  const streakPoints=new Float32Array(6)
  const streakGeometry=new T.BufferGeometry()
  streakGeometry.setAttribute('position',new T.BufferAttribute(streakPoints,3))
  const streak=new T.Line(streakGeometry,new T.LineBasicMaterial({color:'#d7ebf1',transparent:true,opacity:0,depthWrite:false}))
  streak.frustumCulled=false
  world.add(streak)
  function draw(){
    frame=requestAnimationFrame(draw)
    if(!shown||document.hidden)return
    const {positions,center,theme,radii,focused,compact,projection}=config.current
    const time=reduced.matches?0:projection?.elapsed??0
    const {mouseX=0,mouseY=0,progress=0}=projection??{}
    starClock.value=time
    const meteor=time%27
    streak.visible=!reduced.matches&&meteor>24.7&&meteor<25.8
    if(streak.visible){
      const t=(meteor-24.7)/1.1,x=width*(.79-t*.34),y=height*(.88-t*.32)
      streakPoints.set([x,y,-200,x+width*.05,y+height*.05,-200])
      streakGeometry.attributes.position.needsUpdate=true
      streak.material.opacity=Math.sin(t*Math.PI)*(theme==='day'?.22:.58)
    }
    const daylight=theme==='day'
    starMaterial.opacity=daylight?.29:.72
    key.intensity+=((daylight?3.25:2.45)-key.intensity)*.09
    ambient.intensity+=((daylight?1.5:.78)-ambient.intensity)*.09
    const cx=center[0]*width,cy=(1-center[1])*height
    sun.position.set(cx,cy,0);sun.scale.setScalar((compact?38:Math.min(79,width*.067,height*.105))*(1+Math.sin(time*.56)*.038));sun.rotation.y=time*.035
    starfield.scale.set(width,height,1)
    starfield.position.set(mouseX*8+progress*12,mouseY*6-progress*5,0)
    for(const [i,[phase,spread,depth]] of drift.entries()){
      const a=phase+time*.012,r=compact?.34:.27
      const point=projection?.project(r+spread,a)
      beltCoords[i*3]=point?point[0]*width:cx+Math.cos(a)*(r+spread)*width
      beltCoords[i*3+1]=point?(1-point[1])*height:cy+Math.sin(a)*(r+spread)*(compact?.78:.55)*height
      beltCoords[i*3+2]=(point?.[2]??0)*100-39-depth*25
    }
    asteroids.attributes.position.needsUpdate=true
    travel+=(destination-travel)*(reduced.matches?1:.10)
    if (target >= 0) {
      const [x,y]=projection?.bodies[target]??positions[target]
      camera.position.x=(x-.5)*width*travel*.21
      camera.position.y=(.5-y)*height*travel*.21
    } else camera.position.set(0,0,850)
    camera.zoom=1+travel*.22
    camera.updateProjectionMatrix()
    for(const [i,{cluster,shell}] of planets.entries()){
      const [x,y,depth=0,perspective=1]=projection?.bodies[i]??positions[i]
      const boost=target===i?travel:0
      cluster.position.set(x*width,(1-y)*height,depth*210+boost*240)
      const radius=radii[i]*(compact?.64:1)*perspective*(1+boost*3)*(focused===i?1.115:1)
      cluster.scale.setScalar(cluster.scale.x+(radius-cluster.scale.x)*(reduced.matches?1:.16))
      shell.rotation.y=time*(.06+i*.009)+i
      shell.material.emissiveIntensity+=( (focused===i?.16:.028)-shell.material.emissiveIntensity)*.11
      const tint=focused!==null&&focused!==i?.68:1
      shell.material.color.setScalar(shell.material.color.r+(tint-shell.material.color.r)*.1)
      for(const ring of cluster.children.slice(1))ring.rotation.z=-.25+Math.sin(time*.17+i)*.10
      key.position.set(-3+mouseX*1.7,4+mouseY*.8,6)
    }
    renderer.render(scene,camera)
  }
  frame=requestAnimationFrame(draw);ready(true)
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();ready(false)})
  canvas.addEventListener('webglcontextrestored',()=>ready(true))
  return {fly(index,returning=false){target=index;destination=returning?0:1;travel=returning?1:0},reset(){target=-1;destination=0;travel=0},dispose(){
    cancelAnimationFrame(frame);resize.disconnect();visibility.disconnect()
    const geometries=new Set(),materials=new Set()
    scene.traverse(node=>{if(node.geometry)geometries.add(node.geometry);if(node.material)materials.add(node.material)})
    geometries.forEach(g=>g.dispose());materials.forEach(m=>{m.map?.dispose();m.dispose()});renderer.dispose();canvas.remove()
  }}
}

export function mountPortrait(host, color, index, onReady) {
  const canvas=document.createElement('canvas')
  const context=canvas.getContext('webgl2',{alpha:true,antialias:true,powerPreference:'low-power'})
  if(!context)return
  const renderer=new T.WebGLRenderer({canvas,context,alpha:true,antialias:true})
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5))
  renderer.setClearColor(0,0);renderer.outputColorSpace=T.SRGBColorSpace
  canvas.setAttribute('aria-hidden','true')
  host.append(canvas)
  const scene=new T.Scene(), camera=new T.PerspectiveCamera(34,1,.1,30)
  camera.position.z=6.2
  let seed=419
  const random=()=> (seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296
  for(let i=0;i<(index+1)*384*192;i++)random()
  const material=new T.MeshStandardMaterial({map:surface(color,index,random),roughness:.91,emissive:color,emissiveIntensity:.075})
  const planet=new T.Mesh(new T.SphereGeometry(1,48,32),material)
  planet.rotation.z=(index-4)*.11
  const group=new T.Group()
  group.add(planet);scene.add(group)
  const ring=new T.Group()
  if(index===1||index===6){
    for(let j=0;j<7;j++){
      const band=new T.Mesh(new T.RingGeometry(1.16+j*.10,1.23+j*.10,64),new T.MeshBasicMaterial({color:j%2?'#b7aaa0':'#e2c9a6',side:T.DoubleSide,transparent:true,opacity:.19+j*.046,depthWrite:false}))
      ring.add(band)
    }
    ring.rotation.set(1.12,.18,-.25);group.add(ring)
  }
  const key=new T.DirectionalLight('#fff0d0',2.8)
  key.position.set(-3,4,6)
  scene.add(key,new T.AmbientLight('#d9edff',.78))
  const reduced=matchMedia('(prefers-reduced-motion: reduce)')
  let frame=0,visible=true
  const resize=new ResizeObserver(()=>{
    const w=host.clientWidth,h=host.clientHeight
    if(!w||!h)return
    renderer.setSize(w,h,false);camera.aspect=w/h;camera.position.z=Math.max(6,5.3/camera.aspect);camera.updateProjectionMatrix()
  })
  const observe=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting})
  resize.observe(host);observe.observe(host)
  function draw(ms){
    frame=requestAnimationFrame(draw)
    if(!visible||document.hidden)return
    const t=reduced.matches?0:ms*.001
    planet.rotation.y=t*.12+index
    ring.rotation.z=-.25+Math.sin(t*.27)*.11
    key.position.x=-3+Math.sin(t*.34)*.75
    renderer.render(scene,camera)
  }
  frame=requestAnimationFrame(draw);onReady(true)
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();onReady(false)})
  canvas.addEventListener('webglcontextrestored',()=>onReady(true))
  return ()=>{
    cancelAnimationFrame(frame);resize.disconnect();observe.disconnect()
    group.traverse(node=>{node.geometry?.dispose();node.material?.map?.dispose();node.material?.dispose()})
    renderer.dispose();canvas.remove()
  }
}
