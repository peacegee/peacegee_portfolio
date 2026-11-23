import React,{useEffect,useRef,useState} from 'react'
import {LanguageSwitcher, useLanguage} from './Language.jsx'
import {mongolianExhibitions} from './exhibitions.mn.js'
import {exhibitions} from './exhibitionData.js'
import './exhibition.css'

const reduced=matchMedia('(prefers-reduced-motion: reduce)')
const media=`${import.meta.env.BASE_URL}media/`
const tokens=/(\/\/[^\n]*|'[^'\n]*'|"[^"\n]*"|\b(?:function|const|return|if|else|let|true|false)\b|\b\d+(?:\.\d+)?\b)/g

function Code({source}) {
  return <pre tabIndex="0"><code>{source.split(tokens).map((part,i)=><span key={i} className={i%2?(part.startsWith('//')?'comment':/^['"]/.test(part)?'string':/^\d/.test(part)?'number':'keyword'):undefined}>{part}</span>)}</code></pre>
}

export function PlanetExhibition({project,index,total,theme,setTheme,surface,heading,back,navigate}){
  const {language,t}=useLanguage()
  const original={...exhibitions[project.id],gallery:project.gallery}
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
  const [slideIndex,setSlideIndex]=useState(0)
  const [sliding,setSliding]=useState(null)
  const zoom=useRef(null)
  const slideTimer=useRef(null)
  const activeTechnology=data.technologies?.[technology]
  const examples=data.technologies?.flatMap(item=>item.code?[item.code]:[])??[]
  const code=examples[example]
  const asset=project.preview&&media+project.preview
  const gallery=(data.gallery?.length ? data.gallery : asset ? [{
    src:asset,
    alt:data.alt||data.credit||project.title,
    caption:data.credit||project.title,
  }] : []).map(item=>({
    ...item,
    src:item.src.startsWith(media)?item.src:media+item.src,
    caption:Array.isArray(item.caption)?item.caption[language==='mn'?1:0]:item.caption,
    alt:Array.isArray(item.alt)?item.alt[language==='mn'?1:0]:item.alt||(Array.isArray(item.caption)?item.caption[language==='mn'?1:0]:item.caption)||data.alt||project.title,
  }))
  const currentImage=gallery[slideIndex]
  useEffect(()=>{
    return()=>clearTimeout(slideTimer.current)
  },[])

  function moveGallery(delta) {
    const next=slideIndex+delta
    if(next<0||next>=gallery.length)return
    setSlideIndex(next)
    if(reduced.matches)return setSliding(null)
    clearTimeout(slideTimer.current)
    setSliding({from:slideIndex,to:next,direction:delta>0?'forward':'backward'})
    slideTimer.current=setTimeout(()=>setSliding(null),460)
  }
  function chooseGalleryImage(event) {
    if(gallery.length>1){
      const position=(event.clientX-event.currentTarget.getBoundingClientRect().left)/event.currentTarget.clientWidth
      if(position>=.68&&slideIndex<gallery.length-1)return moveGallery(1)
      if(position<=.32&&slideIndex>0)return moveGallery(-1)
    }
    zoom.current.showModal()
  }

  return <article className="planet-page exhibit-page" ref={surface} aria-labelledby="planet-heading" style={{'--feature-color':project.color}} onKeyDown={event=>{if(event.key==='Escape'&&!zoom.current?.open)back()}}>
    <nav className="planet-page-nav" aria-label={t('exhibitionNav')}>
      <button onClick={back}>← {t('back')}</button>
      <div><button onClick={()=>navigate((index+total-1)%total,true)}>{t('previous')}</button><button onClick={()=>navigate((index+1)%total,true)}>{t('next')}</button><button onClick={()=>setTheme(theme==='night'?'day':'night')}>{t(theme==='night'?'day':'night')}</button><LanguageSwitcher /></div>
    </nav>
    <div className="exhibit-opening" style={{'--feature-color':project.color}}>
      <div className="exhibit-intro">
        <p className="mono">{project.featuredProject&&<><span className="planet-project-label">{t('project')}</span>{' '}</>}{project.category}</p>
        <h1 ref={heading} tabIndex="-1" id="planet-heading">{project.title}</h1>
        <p className="exhibit-lead">{project.description}</p>
        {data.context!==project.description&&<p className="exhibit-context">{data.context}</p>}
        {project.researchTopic&&<p className="exhibit-role"><strong>{t('researchTopic')}</strong>{project.researchTopic[language==='mn'?1:0]}</p>}
        {project.authors&&<p className="exhibit-role"><strong>{t('authors')}</strong>{project.authors.join(' · ')}</p>}
        {(project.role||data.role)&&<p className="exhibit-role"><strong>{t('myRole')}</strong>{project.role||data.role}</p>}
        {!!data.flow?.length&&<div className="exhibit-summary">
          <h2>{t('projectFeatures')}</h2>
          <ul>{data.flow.map(item=><li key={item.name}>{item.name}</li>)}</ul>
        </div>}
        {!!data.technologies?.length&&<div className="exhibit-summary">
          <h2>{t('tools')}</h2>
          <ul>{data.technologies.map(item=><li key={item.name}>{item.name}</li>)}</ul>
        </div>}
        <div className="exhibit-actions">
          {project.url&&(project.url.startsWith('#')?<button type="button" onClick={back}>{t('portfolioReturn')}</button>:<a href={project.url} target="_blank" rel="noopener noreferrer">{project.action||t('projectDemo')}</a>)}
          {project.sourceUrl&&<a href={project.sourceUrl} target="_blank" rel="noopener noreferrer">{t('projectSource')}</a>}
          {project.researchPaper&&<a href={media+project.researchPaper} target="_blank" rel="noopener noreferrer">{t('readPaper')}</a>}
        </div>
      </div>
      {currentImage&&<figure className={`exhibit-gallery${project.certificate?' certificate-gallery':''}`}>
        <button className="gallery-image-button" type="button" onClick={chooseGalleryImage} onKeyDown={event=>{
          if(event.key==='ArrowRight'){event.preventDefault();moveGallery(1)}
          if(event.key==='ArrowLeft'){event.preventDefault();moveGallery(-1)}
        }} aria-label={`${t('openScreenshot')}: ${currentImage.caption}; ${t('galleryInstructions')}`}>
          <span className="gallery-viewport">
            {sliding
              ? <><img className={`gallery-image gallery-out ${sliding.direction}`} src={gallery[sliding.from].src} alt={gallery[sliding.from].alt}/><img className={`gallery-image gallery-in ${sliding.direction}`} src={gallery[sliding.to].src} alt={gallery[sliding.to].alt}/></>
              : <img className="gallery-image" src={currentImage.src} alt={currentImage.alt} loading="lazy"/>}
          </span>
        </button>
        {gallery.length>1&&<p className="gallery-position" aria-live="polite">{slideIndex+1} / {gallery.length}</p>}
        <figcaption>{currentImage.caption}</figcaption>
      </figure>}
    </div>
    <div className="exhibit-body">
      {project.notes&&<section className="exhibit-chapter exhibit-notes"><h2>{project.notesTitle||t('designNotes')}</h2><p>{project.notes}</p></section>}
      <section className="exhibit-chapter">
        <h2>{data.flowTitle||t(project.date?'milestones':project.theme==='research'?'conferenceRecord':'how')}</h2>
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
    </div>
    {currentImage&&<dialog ref={zoom} className="exhibit-lightbox" aria-label={project.title} onClick={event=>{if(event.target===event.currentTarget)event.currentTarget.close()}} onKeyDown={event=>{if(event.key==='Escape')event.stopPropagation()}}>
      <form method="dialog"><button aria-label={t('closeVisual')}>{t('close')}</button><LanguageSwitcher /></form>
      <img src={currentImage.src} alt={currentImage.alt}/>
      <p>{currentImage.caption}</p>
    </dialog>}
  </article>
}
