import React,{useEffect,useRef,useState} from 'react'
import {createPortal} from 'react-dom'
import './galaxy.css'
import {PlanetExhibition} from './PlanetExhibition.jsx'
import {attachGalaxyMotion} from './galaxyMotion.js'
import {mount} from './vendor/galaxy3d.js'
import {useLanguage} from './Language.jsx'
import {projects, credentials} from './projectData.js'
import {mongolianProjects} from './projects.mn.js'

const palettes=['#cc825d','#d5b682','#619b88','#608cae','#8caebd','#a28ddd','#6caa86','#9d8268','#92b4c9','#c0a26a']
const desktop=[[.33,.26],[.57,.22],[.73,.32],[.81,.56],[.70,.75],[.47,.79],[.24,.69],[.12,.49],[.15,.28],[.89,.23]]
const mobile=[[.19,.23],[.53,.23],[.82,.24],[.82,.40],[.83,.59],[.83,.76],[.50,.80],[.17,.77],[.16,.59],[.16,.41]]
const radii=[25,34,25,31,25,25,29,23,24,21]
const media=`${import.meta.env.BASE_URL}media/`
const reduced=matchMedia('(prefers-reduced-motion: reduce)')
const readPlanet=()=>new URLSearchParams(location.search).get('planet')

const records = [...projects, ...credentials].map((project, index) => ({
  ...project,
  color: palettes[index],
  preview: project.preview || project.image,
}))

export function Galaxy({theme,setTheme}){
  const {language,t} = useLanguage()
  const items = records.map(record => {
    const project = language === 'mn' ? {...record, ...mongolianProjects[record.id]} : record
    return project.date || project.achievement
      ? {...project, description: project.text, category: project.date ? project.date+' · '+t('achievement') : project.category||t('achievement')}
      : project
  })
  const [focused,setFocused]=useState(null)
  const [active,setActive]=useState(()=>readPlanet())
  const [ready,setReady]=useState(false)
  const [compact,setCompact]=useState(()=>matchMedia('(max-width: 720px)').matches)
  const [offset,setOffset]=useState({x:0,y:0})
  const [zoom,setZoom]=useState(1)
  const [flight,setFlight]=useState(null)
  const [tapped,setTapped]=useState(null)
  const track=useRef(null),returnScroll=useRef(null)
  const scene=useRef(null),engine=useRef(null),surface=useRef(null),heading=useRef(null),drag=useRef(null),last=useRef(null),timer=useRef(null)
  const config=useRef({})
  const selected=items.findIndex(p=>p.id===active)
  const positions=compact?mobile:desktop
  const center=compact?[.50,.49]:[.45,.50]
  config.current={...config.current,positions,center,theme,focused,radii,compact,held:Boolean(flight||selected>=0)}

  useEffect(()=>attachGalaxyMotion(track.current,config),[])

  useEffect(()=>{
    const query=matchMedia('(max-width: 720px)')
    const change=()=>setCompact(query.matches)
    query.addEventListener('change',change)
    let alive=true
    if(alive)engine.current=mount(scene.current,config,palettes,setReady)
    return()=>{alive=false;query.removeEventListener('change',change);engine.current?.dispose();clearTimeout(timer.current)}
  },[])
  useEffect(()=>{
    const onPop=()=>{clearTimeout(timer.current);engine.current?.reset();setFlight(null);setActive(readPlanet())}
    addEventListener('popstate',onPop)
    return()=>removeEventListener('popstate',onPop)
  },[])
  useEffect(()=>{
    if(selected<0)return
    const root=document.getElementById('root')
    const old=document.body.style.overflow
    document.body.style.overflow='hidden'
    root.inert=true
    heading.current?.focus()
    return()=>{root.inert=false;document.body.style.overflow=old}
  },[selected>=0])
  useEffect(()=>{
    if(selected<0)return
    surface.current.scrollTop=0
    heading.current?.focus({preventScroll:true})
    if(!reduced.matches&&window.gsap)window.gsap.fromTo(surface.current.querySelectorAll('.exhibit-intro > *'),{opacity:.15,y:24},{opacity:1,y:0,duration:.72,stagger:.10,overwrite:true})
  },[selected])

  function navigate(index,replace=false) {
    const url=new URL(location.href)
    url.hash='work'
    if(index>=0)url.searchParams.set('planet',items[index].id)
    else url.searchParams.delete('planet')
    history[replace?'replaceState':'pushState'](null,'',url)
    setActive(index>=0?items[index].id:null)
  }
  function flightPosition(index) {
    const rect=document.querySelectorAll('.planet-button')[index].getBoundingClientRect()
    return {x:(rect.left+rect.width/2)/innerWidth*100,y:(rect.top+rect.height/2)/innerHeight*100}
  }
  function enter(index,event) {
    if(flight)return
    if(event?.nativeEvent.pointerType==='touch'&&tapped!==index){setTapped(index);setFocused(index);return}
    setFocused(index)
    last.current=document.querySelectorAll('.planet-button')[index]
    returnScroll.current=scrollY
    setTapped(null)
    if(reduced.matches){navigate(index);return}
    setFlight({index,...flightPosition(index),returning:false})
    engine.current?.fly(index)
    timer.current=setTimeout(()=>{navigate(index);setFlight(null)},980)
  }
  function back() {
    const index=selected
    navigate(-1,true)
    requestAnimationFrame(()=>{
      if(returnScroll.current===null)track.current.scrollIntoView({behavior:'instant'})
      else scrollTo({top:returnScroll.current,behavior:'instant'})
      if(!reduced.matches){
        setFlight({index,...flightPosition(index),returning:true})
        engine.current?.fly(index,true)
        timer.current=setTimeout(()=>setFlight(null),670)
      }
      const destination=last.current || document.querySelectorAll('.planet-button')[index]
      destination?.focus({preventScroll:true})
    })
  }

  const project=items[selected]
  const preview=focused===null?null:items[focused]
  return <div className="solar-track" id="work" ref={track}><section className="solar-section" aria-labelledby="work-title" data-theme={theme} data-focused={focused!==null} data-travel={Boolean(flight&&!flight.returning)}>
    <div className="solar-sky" aria-hidden="true"/>
    <div className="solar-heading"><p className="mono">Enkhmend Gantumur</p><h2 id="work-title">{t('solarTitle')}</h2></div>
    <div className="solar-map" onPointerDown={e=>{if(e.target.closest('button,a')||e.pointerType==='touch')return;drag.current={x:e.clientX,y:e.clientY,...{originX:offset.x,originY:offset.y}};e.currentTarget.setPointerCapture(e.pointerId)}} onPointerMove={e=>{if(!drag.current)return;const d=drag.current;setOffset({x:Math.max(-48,Math.min(48,d.originX+(e.clientX-d.x)*.36)),y:Math.max(-34,Math.min(34,d.originY+(e.clientY-d.y)*.36))})}} onPointerUp={()=>drag.current=null} onPointerCancel={()=>drag.current=null}>
      <div className="solar-transform" style={{transform:`translate(${offset.x}px,${offset.y}px) scale(${zoom})`}}>
        <svg className="solar-orbits" viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">
          {positions.map((_,i)=><path key={i} className={focused===i?'active-orbit':undefined}/>)}
        </svg>
        <div className="solar-canvas" ref={scene} aria-hidden="true"/>
        <div className="solar-sun" style={{left:center[0]*100+'%',top:center[1]*100+'%'}} aria-hidden="true"><span/></div>
        <span className="sun-name mono" style={{left:center[0]*100+'%',top:center[1]*100+'%'}}>Enkhmend</span>
        {items.map((item,i)=><button key={item.id} className="planet-button" type="button" data-active={focused===i} data-ring={i===1||i===7} style={{left:positions[i][0]*100+'%',top:positions[i][1]*100+'%','--planet-color':item.color,'--planet-size':(compact?radii[i]*1.28:radii[i]*2)+'px'}} aria-label={item.featuredProject ? t('project')+': '+item.title : item.title} onPointerEnter={e=>{if(e.pointerType==='mouse')setFocused(i)}} onPointerLeave={e=>{if(e.pointerType==='mouse')setFocused(null)}} onFocus={()=>setFocused(i)} onBlur={()=>{if(tapped===null)setFocused(null)}} onClick={e=>enter(i,e)}>
          <span className="planet-ball" data-webgl={ready} aria-hidden="true"/><span className="planet-caption"><small>{String(i+1).padStart(2,'0')}{item.featuredProject&&<span className="planet-project-label">{t('project')}</span>}</small>{item.title}</span>
        </button>)}
      </div>
    </div>
    {preview&&<div className="solar-preview">{preview.preview&&<img src={media+preview.preview} alt=""/>}<div>{preview.featuredProject&&<span className="planet-project-label">{t('project')}</span>}<strong>{preview.title}</strong><p>{preview.description}</p>{tapped!==null&&<button type="button" onClick={()=>enter(tapped)}>{t(preview.featuredProject?'viewProject':'enter')}</button>}</div></div>}
    <div className="solar-tools"><button onClick={()=>setZoom(zoom===1?1.1:1)}>{t(zoom===1?'zoomIn':'zoomOut')}</button><button onClick={()=>{setZoom(1);setOffset({x:0,y:0})}}>{t('reset')}</button></div>
    <p className="solar-instruction">{t('instruction')}</p>
    {flight&&createPortal(<div className={'planet-flight exhibit-flight'+(flight.returning?' returning':'')} style={{'--fx':flight.x+'%','--fy':flight.y+'%','--flight-color':items[flight.index].color}} aria-hidden="true"><span className="flight-globe"/>{items[flight.index].preview&&<img src={media+items[flight.index].preview} alt=""/>}</div>,document.body)}
    {project&&createPortal(<PlanetExhibition key={project.id} project={project} index={selected} total={items.length} theme={theme} setTheme={setTheme} surface={surface} heading={heading} back={back} navigate={navigate}/>,document.body)}
  </section></div>
}
