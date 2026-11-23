import React, {useEffect,useRef,useState} from 'react'
import './world.css'
import {useLanguage} from './Language.jsx'

const reduce = matchMedia('(prefers-reduced-motion: reduce)')
const initialHour = new Date().getHours()
export const initialTheme = localStorage.getItem('horizon-theme') ?? (initialHour >= 6 && initialHour < 19 ? 'day' : 'night')

export function Atmosphere({theme}) {
  const canvas = useRef(null)
  const mix = useRef({night:theme === 'night' ? 1 : 0})
  const redraw = useRef(null)
  useEffect(() => {
    const night = theme === 'night' ? 1 : 0
    const tween = !reduce.matches && window.gsap ? window.gsap.to(mix.current,{night,duration:1.9,ease:'power2.inOut',onUpdate:()=>redraw.current?.()}) : null
    if (!tween) {mix.current.night=night; redraw.current?.()}
    return () => tween?.kill()
  },[theme])
  useEffect(() => {
    const el=canvas.current, g=el.getContext('2d')
    if (!g) return
    let w,h,frame,px=0,py=0,time=0
    let seed=21
    const random=()=> (seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296
    const stars=Array.from({length:330},()=>[random(),random()*.8,random(),random()*8])
    const plants=Array.from({length:42},()=>[random(),random(),random(),random()])
    const particles=Array.from({length:34},()=>[random(),random(),random()])
    function color(day, night, mix) {
      const a = parseInt(day.slice(1), 16), b = parseInt(night.slice(1), 16)
      const rgb = [16,8,0].map(shift => {
        const start = (a >> shift) & 255
        return Math.round(start + (((b >> shift) & 255) - start) * mix)
      })
      return `rgb(${rgb.join(',')})`
    }
    function paint(ms) {
      time=reduce.matches?0:ms*.001
      const n=mix.current.night
      g.clearRect(0,0,w,h)
      g.fillStyle='#b8d5df';g.fillRect(0,0,w,h)
      g.globalAlpha=n;g.fillStyle='#091726';g.fillRect(0,0,w,h);g.globalAlpha=1
      const horizon=g.createLinearGradient(0,h*.26,0,h)
      horizon.addColorStop(0,'transparent');horizon.addColorStop(1,color('#f1e2bd','#263d49',n))
      g.fillStyle=horizon;g.fillRect(0,0,w,h)
      g.globalAlpha=(1-n)*(.19+Math.sin(time*.22)*.045)
      g.fillStyle='#fff2c2'
      for(let i=0;i<4;i++){
        g.beginPath();g.moveTo(w*.76,h*.24);g.lineTo(w*(.31+i*.095),h);g.lineTo(w*(.37+i*.095),h);g.fill()
      }
      g.globalAlpha=1
      for(const [x,y,z,p] of stars) {
        g.globalAlpha=n*(.25+.72*z)*(.73+.27*Math.sin(time*(.4+z)+p))
        g.fillStyle='#e5eff1';g.beginPath();g.arc(x*w+px*z*11,y*h+py*z*7,.35+z*1.35,0,Math.PI*2);g.fill()
      }
      for(let c=0;c<3;c++) {
        g.globalAlpha=n*(.08+.07*Math.sin(time*.32+c));g.strokeStyle='#a9d4de';g.beginPath()
        for(let j=0;j<5;j++){const [x,y]=stars[c*5+j];const atX=w*(.18+c*.27)+(x-.5)*w*.18+Math.sin(time*.12+c)*12,atY=h*.18+y*h*.26;j?g.lineTo(atX,atY):g.moveTo(atX,atY)}
        g.stroke()
      }
      const trail=(time%29)-25
      if(trail>0&&trail<1.4&&!reduce.matches){g.globalAlpha=n*Math.sin(trail/1.4*Math.PI)*.5;g.strokeStyle='#eaffff';g.beginPath();g.moveTo(w*.67-trail*135,h*.15+trail*95);g.lineTo(w*.67-trail*135+65,h*.15+trail*95-45);g.stroke()}
      const orb=(x,y,r,alpha,color,halo)=>{
        g.globalAlpha=alpha;const glow=g.createRadialGradient(x,y,r*.6,x,y,r*3.7);glow.addColorStop(0,halo);glow.addColorStop(1,'transparent');g.fillStyle=glow;g.fillRect(x-r*4,y-r*4,r*8,r*8)
        g.fillStyle=color;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill()
      }
      const r=Math.max(21,Math.min(64,w*.046))
      orb(w*.76,h*(.24+n*.52),r,1-n,'#fff3c4','#fff4b5af')
      orb(w*.77,h*(.58-n*.34),r,n,'#e5e8db','#abcfe565')
      if(n>0){g.globalAlpha=n*.13;for(const [a,b,d] of stars.slice(0,18)){g.fillStyle='#61777c';g.beginPath();g.arc(w*.77+(a-.5)*r*1.25,h*(.58-n*.34)+(b-.4)*r*1.45,r*(.03+d*.16),0,7);g.fill()}}
      for(let i=0;i<7;i++){
        const x=((i*.23+time*.004)%1.5-.22)*w,y=h*(.21+i*.062)
        g.save();g.translate(x,y);g.scale(1,.13);const fog=g.createRadialGradient(0,0,0,0,0,w*.235);fog.addColorStop(0,n>.5?'#8aafc22b':'#fffcf1ac');fog.addColorStop(1,'transparent');g.globalAlpha=.8;g.fillStyle=fog;g.fillRect(-w*.24,-w*.24,w*.48,w*.48);g.restore()
      }
      for(let k=0;k<4;k++){
        g.globalAlpha=1;g.fillStyle=color(['#a1b5a1','#829c86','#587d6a','#365e50'][k],['#2b4650','#203a43','#162e35','#10252c'][k],n)
        g.beginPath();g.moveTo(0,h);for(let x=0;x<=w+12;x+=12){const a=x/w;g.lineTo(x,h*(.73+k*.059)+Math.sin(a*7+k*1.7)*h*.045+Math.cos(a*15+k)*h*.015)}g.lineTo(w,h);g.fill()
      }
      for(const [x,s,phase,p] of plants){
        const lean=Math.sin(time*.8+phase*9)*8
        const height=h*(.047+s*.15), stem=x*w, tip=stem+lean+(p-.5)*31
        g.globalAlpha=.75;g.strokeStyle=color('#65835b','#648d85',n);g.lineWidth=1.2;g.beginPath();g.moveTo(stem,h);g.quadraticCurveTo(stem-8,h-height*.5,tip,h-height);g.stroke()
        g.fillStyle=color('#71946a','#4d776e',n);g.beginPath();g.ellipse((tip+stem)*.5+4,h-height*.51,9,2.5,-.5,0,7);g.fill()
        if(s>.39){g.fillStyle=color(p>.45?'#f5dfaa':'#f6edda','#b4c9b7',n);for(let i=0;i<5;i++){g.beginPath();g.ellipse(tip+Math.cos(i*1.256)*3,h-height+Math.sin(i*1.256)*3,3.9,2.15,i*1.256,0,7);g.fill()}g.fillStyle='#d7a853';g.beginPath();g.arc(tip,h-height,2,0,7);g.fill()}
      }
      for(const [x,y,z] of particles){g.globalAlpha=.16+z*.35;g.fillStyle=n>.55?'#b9dae5':'#fff5ca';g.beginPath();g.ellipse(((x+time*(.005+z*.007))%1)*w+px*8,(y*.65+.31)*h+Math.sin(time+z*8)*12+py*8,z> .92?4:1.6,z>.92?2.2:1.4,z,0,7);g.fill()}
      g.globalAlpha=1
    }
    function tick(ms){paint(ms);if(!reduce.matches)frame=requestAnimationFrame(tick)}
    function restart(){cancelAnimationFrame(frame);tick(performance.now())}
    function resize(){const d=Math.min(devicePixelRatio,1.5);w=el.clientWidth;h=el.clientHeight;el.width=w*d;el.height=h*d;g.setTransform(d,0,0,d,0,0);paint(performance.now())}
    function pointer(event){px=event.clientX/innerWidth-.5;py=event.clientY/innerHeight-.5}
    const visibility=new IntersectionObserver(([entry])=>{if(entry.isIntersecting)restart();else cancelAnimationFrame(frame)})
    visibility.observe(el)
    redraw.current=()=>paint(performance.now())
    resize();addEventListener('resize',resize);addEventListener('pointermove',pointer,{passive:true});reduce.addEventListener('change',restart)
    return()=>{cancelAnimationFrame(frame);visibility.disconnect();removeEventListener('resize',resize);removeEventListener('pointermove',pointer);reduce.removeEventListener('change',restart);redraw.current=null}
  },[])
  return <canvas ref={canvas} className="atmosphere" aria-hidden="true" />
}

export function Sound({theme}){
  const {t}=useLanguage()
  const audio=useRef(null)
  const [playing,setPlaying]=useState(false)
  const [volume,setVolume]=useState(.3)
  useEffect(()=>{
    const a=audio.current
    if(!a)return
    const now=a.ctx.currentTime
    a.master.gain.setTargetAtTime(playing?volume*.32:0,now,.35)
    a.day.gain.setTargetAtTime(theme==='day'?1:0,now,.65)
    a.night.gain.setTargetAtTime(theme==='night'?1:0,now,.65)
  },[theme,playing,volume])
  useEffect(()=>()=>{audio.current?.ctx.close()},[])
  useEffect(()=>{
    if(!playing)return
    const timer=setInterval(()=>{
      const a=audio.current
      if(!a||a.ctx.state!=='running')return
      const now=a.ctx.currentTime, oscillator=a.ctx.createOscillator(), env=a.ctx.createGain(), day=theme==='day'
      oscillator.type='sine';oscillator.frequency.setValueAtTime(day?1550:523,now);oscillator.frequency.exponentialRampToValueAtTime(day?2700:740,now+.18)
      env.gain.setValueAtTime(.0001,now);env.gain.exponentialRampToValueAtTime(day?.025:.012,now+.07);env.gain.exponentialRampToValueAtTime(.0001,now+(day?.42:1.8))
      oscillator.connect(env).connect(day?a.day:a.night);oscillator.start();oscillator.stop(now+2)
    },4600)
    return()=>clearInterval(timer)
  },[playing,theme])
  async function toggle(){
    if(playing){setPlaying(false);return}
    try{
      if(!audio.current){
        const ctx=new AudioContext(), master=ctx.createGain(), day=ctx.createGain(), night=ctx.createGain()
        master.gain.value=0;master.connect(ctx.destination);day.connect(master);night.connect(master)
        const wind=ctx.createBuffer(1,ctx.sampleRate*4,ctx.sampleRate), data=wind.getChannelData(0)
        let last=0;for(let i=0;i<data.length;i++){last=.97*last+Math.random()*.06-.03;data[i]=last}
        const source=ctx.createBufferSource(), filter=ctx.createBiquadFilter()
        source.buffer=wind;source.loop=true;filter.frequency.value=620;source.connect(filter).connect(day);source.start()
        for(const frequency of [65.41,98,130.81,196]){const drone=ctx.createOscillator(), gain=ctx.createGain();drone.type='sine';drone.frequency.value=frequency;gain.gain.value=.035;drone.connect(gain).connect(night);drone.start()}
        audio.current={ctx,master,day,night}
      }
      await audio.current.ctx.resume();setPlaying(true)
    }catch{setPlaying(false)}
  }
  return <div className="sound"><button type="button" onClick={toggle} aria-pressed={playing}>{t(playing?'mute':'play')}</button><input aria-label={t('volume')} type="range" min="0" max="1" step=".01" value={volume} onChange={e=>setVolume(Number(e.target.value))}/></div>
}
