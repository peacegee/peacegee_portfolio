import React,{useEffect,useRef,useState} from 'react'
import {LanguageSwitcher, useLanguage} from './Language.jsx'
import {mongolianExhibitions} from './exhibitions.mn.js'
import {exhibitions} from './exhibitionData.js'
import './exhibition.css'
import {mountPortrait} from './vendor/galaxy3d.js'

const reduced=matchMedia('(prefers-reduced-motion: reduce)')
const tokens=/(\/\/[^\n]*|'[^'\n]*'|"[^"\n]*"|\b(?:function|const|return|if|else|let|true|false)\b|\b\d+(?:\.\d+)?\b)/g

function Code({source}) {
  return <pre tabIndex="0"><code>{source.split(tokens).map((part,i)=><span key={i} className={i%2?(part.startsWith('//')?'comment':/^['"]/.test(part)?'string':/^\d/.test(part)?'number':'keyword'):undefined}>{part}</span>)}</code></pre>
}

function Portrait({color,index}){
  const host=useRef(null)
  const [ready,setReady]=useState(false)
  useEffect(()=>{
    let live=true,dispose
    if(live)dispose=mountPortrait(host.current,color,index,setReady)
    return()=>{live=false;dispose?.()}
  },[color,index])
  return <div className="exhibit-portrait" ref={host} aria-hidden="true">
    <span className="portrait-orbit"/>
    {!ready&&<span className="exhibit-sphere" data-ring={index===1||index===6}/>}
  </div>
}

export function PlanetExhibition({project,index,total,theme,setTheme,surface,heading,back,navigate}){
  const {language,t}=useLanguage()
  const original=exhibitions[project.id]
  const localized=language==='mn' ? mongolianExhibitions[project.id] : null
  const data=localized ? {
    ...original,
    ...localized,
    technologies: original.technologies?.map((item,i)=>({
      ...item,
      ...localized.technologies[i],
      code: item.code && {...item.code,title:localized.technologies[i].codeTitle},
    })),
  } : original
  const [node,setNode]=useState(0)
  const [technology,setTechnology]=useState(0)
  const [example,setExample]=useState(0)
  const zoom=useRef(null)
  const activeTechnology=data.technologies?.[technology]
  const examples=data.technologies?.flatMap(item=>item.code?[item.code]:[])??[]
  const code=examples[example]
  const asset=project.preview&&'/media/'+project.preview
  useEffect(()=>{
    const element=surface.current
    if(reduced.matches||!window.gsap||!window.ScrollTrigger)return
    window.gsap.registerPlugin(window.ScrollTrigger)
    const animations=[window.gsap.fromTo(element.querySelector('.exhibit-portrait'),{scale:.92},{scale:1,duration:1.1,ease:'power2.out'})]
    for(const section of element.querySelectorAll('.exhibit-chapter')){
      animations.push(window.gsap.fromTo(section,{y:24},{y:0,scrollTrigger:{scroller:element,trigger:section,start:'top 96%',end:'top 68%',scrub:.45}}))
    }
    const portrait=element.querySelector('.exhibit-portrait')
    animations.push(window.gsap.to(portrait,{y:35,scrollTrigger:{scroller:element,trigger:element.querySelector('.exhibit-opening'),start:'top top',end:'bottom top',scrub:.5}}))
    return()=>animations.forEach(animation=>{animation.scrollTrigger?.kill();animation.kill()})
  },[surface])

  return <article className="planet-page exhibit-page" ref={surface} aria-labelledby="planet-heading" style={{'--feature-color':project.color}} onKeyDown={event=>{if(event.key==='Escape'&&!zoom.current?.open)back()}}>
    <nav className="planet-page-nav" aria-label={t('exhibitionNav')}>
      <button onClick={back}>← {t('back')}</button>
      <div><button onClick={()=>navigate((index+total-1)%total,true)}>{t('previous')}</button><button onClick={()=>navigate((index+1)%total,true)}>{t('next')}</button><button onClick={()=>setTheme(theme==='night'?'day':'night')}>{t(theme==='night'?'day':'night')}</button><LanguageSwitcher /></div>
    </nav>
    <div className="exhibit-opening">
      <div className="exhibit-stage"><Portrait color={project.color} index={index}/><p className="mono">{t('planet')} {String(index+1).padStart(2,'0')} / {total}</p></div>
      <div className="exhibit-intro">
        <p className="mono">{project.category}</p>
        <h1 ref={heading} tabIndex="-1" id="planet-heading">{project.title}</h1>
        <p className="exhibit-lead">{project.description}</p>
        {data.context!==project.description&&<p className="exhibit-context">{data.context}</p>}
        <div className="exhibit-actions">
          {project.url&&(project.url.startsWith('#')?<button type="button" onClick={back}>{t('portfolioReturn')}</button>:<a href={project.url} target="_blank" rel="noopener noreferrer">{project.action}</a>)}
          {asset&&<button onClick={()=>zoom.current.showModal()}><img src={asset} alt=""/><span>{t(project.certificate?'certificate':'enlarge')}</span></button>}
        </div>
      </div>
    </div>
    <div className="exhibit-body">
      {project.notes&&<section className="exhibit-chapter exhibit-notes"><h2>{project.notesTitle||t('designNotes')}</h2><p>{project.notes}</p></section>}
      <section className="exhibit-chapter">
        <h2>{t(project.date?'milestones':project.theme==='research'?'conferenceRecord':'how')}</h2>
        <div className="exhibit-flow" aria-label={t('sequence')}>
          {data.flow.map((item,i)=><button key={i} onClick={()=>setNode(i)} aria-pressed={node===i} data-reached={i<=node}><span aria-hidden="true"/>{item.name}</button>)}
        </div>
        <p className="exhibit-explanation" aria-live="polite">{data.flow[node].explanation}</p>
      </section>
      {!!data.technologies?.length&&<section className="exhibit-chapter">
        <h2>{t('technology')}</h2>
        <div className="exhibit-technologies" aria-label={t('technologies')}>
          {data.technologies.map((item,i)=><button key={item.name} onClick={()=>{setTechnology(i);if(item.code)setExample(examples.indexOf(item.code))}} aria-pressed={technology===i}>{item.name}</button>)}
        </div>
        <dl className="exhibit-tech-info" aria-live="polite">
          <div><dt>{t('techUse')}</dt><dd>{activeTechnology.use}</dd></div>
          <div><dt>{t('techReason')}</dt><dd>{activeTechnology.reason}</dd></div>
          <div><dt>{t('techFeature')}</dt><dd>{activeTechnology.feature}</dd></div>
        </dl>
      </section>}
      {code&&<section className="exhibit-chapter exhibit-code">
        <h2>{t('code')}</h2>
        <div className="exhibit-technologies" aria-label={t('excerpts')}>
          {examples.map((item,i)=><button key={i} onClick={()=>setExample(i)} aria-pressed={example===i}>{item.title}</button>)}
        </div>
        <p className="mono code-source">{code.source}</p>
        <Code source={code.body}/>
        <p>{data.technologies.find(item=>item.code===code)?.use}</p>
      </section>}
      {asset&&<section className="exhibit-chapter">
        <h2>{t(project.certificate?'supporting':'visual')}</h2>
        <figure className="exhibit-gallery">
          <button onClick={()=>zoom.current.showModal()} aria-label={t(project.certificate?'enlargeCertificate':'enlargeVisual')}><img src={asset} loading="lazy" alt={data.alt||data.credit||project.title}/></button>
          <figcaption>{data.credit}</figcaption>
        </figure>
      </section>}
    </div>
    {asset&&<dialog ref={zoom} className="exhibit-lightbox" aria-label={project.title} onClick={event=>{if(event.target===event.currentTarget)event.currentTarget.close()}} onKeyDown={event=>{if(event.key==='Escape')event.stopPropagation()}}>
      <form method="dialog"><button aria-label={t('closeVisual')}>{t('close')}</button><LanguageSwitcher /></form>
      <img src={asset} alt={data.alt||data.credit||project.title}/>
    </dialog>}
  </article>
}
