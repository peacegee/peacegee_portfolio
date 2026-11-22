const clamp = (value, max) => Math.max(-max, Math.min(max, value))
const motion = matchMedia('(prefers-reduced-motion: reduce)')

export function attachGalaxyMotion(track, config) {
  const stage = track.querySelector('.solar-section')
  const map = stage.querySelector('.solar-map')
  const sky = stage.querySelector('.solar-sky')
  const buttons = [...stage.querySelectorAll('.planet-button')]
  const paths = [...stage.querySelectorAll('.solar-orbits path')]
  const cursor = {x:0,y:0}
  const view = {x:0,y:0,progress:0}
  const scroll = {progress:0}
  let elapsed = 0, frame = 0, previous = 0, visible = false
  const top = () => parseFloat(getComputedStyle(stage).top) || 0
  const updateScroll = () => {
    const distance = Math.max(1,track.offsetHeight-stage.offsetHeight)
    scroll.progress = Math.max(0,Math.min(1,(top()-track.getBoundingClientRect().top)/distance))
  }
  let tween
  if (window.gsap && window.ScrollTrigger) {
    window.gsap.registerPlugin(window.ScrollTrigger)
    tween = window.gsap.to(scroll, {progress:1,ease:'none',scrollTrigger:{
      trigger:track,start:()=>`top ${top()}px`,end:()=>'+='+Math.max(1,track.offsetHeight-stage.offsetHeight),
      scrub:.65,invalidateOnRefresh:true
    }})
  } else addEventListener('scroll',updateScroll,{passive:true})
  function pointer(event) {
    if(event.pointerType==='touch')return
    const rect=stage.getBoundingClientRect()
    cursor.x=clamp((event.clientX-rect.left)/rect.width*2-1,1)
    cursor.y=clamp((event.clientY-rect.top)/rect.height*2-1,1)
  }
  function resetPointer(){cursor.x=0;cursor.y=0}
  map.addEventListener('pointermove',pointer,{passive:true})
  map.addEventListener('pointerleave',resetPointer)
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting})
  observer.observe(stage)
  function draw(now){
    frame=requestAnimationFrame(draw)
    const dt=Math.min(.045,(now-(previous||now))/1000)
    previous=now
    if(!visible||document.hidden)return
    const {center,positions,compact,held}=config.current
    const still=motion.matches
    if(!still&&!held)elapsed+=dt
    const damping=1-Math.exp(-dt*4.1)
    if(!held){
      view.x+=(cursor.x-view.x)*damping
      view.y+=(cursor.y-view.y)*damping
      view.progress+=(scroll.progress-view.progress)*damping
    }
    const progress=still?0:view.progress
    const mouseX=still?0:view.x,mouseY=still?0:view.y
    const yaw=progress*(compact?.15:.38)+mouseX*(compact?.045:.115)
    const pitch=-progress*.13+mouseY*.14
    const roll=progress*(compact?.04:.095)+mouseX*.06
    const scale=1+progress*.055
    const ratio=compact?.84:.59
    const aspect=Math.max(.45,map.clientWidth/map.clientHeight)
    const cosY=Math.cos(yaw),sinY=Math.sin(yaw),cosX=Math.cos(pitch),sinX=Math.sin(pitch),cosR=Math.cos(roll),sinR=Math.sin(roll)
    function project(r,phase){
      const x=Math.cos(phase)*r,y=Math.sin(phase)*r*ratio*1.15,z=Math.sin(phase)*r*.72
      const xx=x*cosY+z*sinY,zz=z*cosY-x*sinY
      const yy=y*cosX-zz*sinX,depth=y*sinX+zz*cosX
      const perspective=scale/(1-depth*.31)
      return [center[0]+(xx*cosR-yy*sinR/aspect)*perspective,center[1]+(xx*sinR*aspect+yy*cosR)*perspective,depth,perspective]
    }
    const bodies=positions.map(([x,y],i)=>{
      const vertical=(y-center[1])/(ratio*1.15)
      const radius=Math.hypot(x-center[0],vertical)
      const phase=Math.atan2(vertical,x-center[0])
      const orbit=still?0:progress*(compact?.105:.21)+Math.sin(elapsed*(.075+i*.011)+i)*.026
      let path=''
      for(let j=0;j<61;j++){
        const [a,b]=project(radius,j/60*Math.PI*2)
        path+=(j?'L':'M')+(a*1000).toFixed(1)+','+(b*1000).toFixed(1)
      }
      paths[i].setAttribute('d',path+'Z')
      const point=project(radius,phase+orbit)
      const button=buttons[i]
      button.style.left=point[0]*100+'%'
      button.style.top=point[1]*100+'%'
      button.style.setProperty('--depth-scale',point[3].toFixed(3))
      return point
    })
    config.current.projection={bodies,project,elapsed,mouseX,mouseY,progress}
    sky.style.setProperty('--sky-x',(mouseX*-13-progress*10).toFixed(1)+'px')
    sky.style.setProperty('--sky-y',(mouseY*-8+progress*12).toFixed(1)+'px')
    stage.style.setProperty('--sun-pulse',(still?1:1+Math.sin(elapsed*.56)*.038).toFixed(3))
  }
  frame=requestAnimationFrame(draw)
  return ()=>{
    cancelAnimationFrame(frame);observer.disconnect()
    if(tween){tween.scrollTrigger?.kill();tween.kill()}else removeEventListener('scroll',updateScroll)
    map.removeEventListener('pointermove',pointer);map.removeEventListener('pointerleave',resetPointer)
  }
}
