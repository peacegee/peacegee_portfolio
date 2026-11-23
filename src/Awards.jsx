import React, {useRef, useState} from 'react'
import {awards, credentials} from './projectData.js'
import {mongolianProjects} from './projects.mn.js'
import {useLanguage} from './Language.jsx'
import './exhibition.css'

const media = `${import.meta.env.BASE_URL}media/`

function AwardEntry({entry}) {
  const {language, t} = useLanguage()
  const localized = language === 'mn' ? mongolianProjects[entry.id] : null
  const images = entry.images || [{
    src: entry.image,
    alt: localized?.title || entry.title,
    caption: [entry.text, localized?.text || entry.text],
  }]
  const [active, setActive] = useState(0)
  const dialog = useRef(null)
  const image = images[active]
  const caption = image.caption[language === 'mn' ? 1 : 0]
  const alt = Array.isArray(image.alt) ? image.alt[language === 'mn' ? 1 : 0] : image.alt

  function move(delta) {
    setActive(index => Math.max(0, Math.min(images.length - 1, index + delta)))
  }
  function chooseImage(event) {
    if (images.length > 1) {
      const position = (event.clientX - event.currentTarget.getBoundingClientRect().left) / event.currentTarget.clientWidth
      if (position >= .68 && active < images.length - 1) return move(1)
      if (position <= .32 && active > 0) return move(-1)
    }
    dialog.current.showModal()
  }

  return <article className="award-entry">
    <div className="award-visual">
      <button className={`award-photo${entry.certificate ? ' certificate-photo' : ''}`} type="button"
        onClick={chooseImage} onKeyDown={event=>{
          if(event.key==='ArrowRight'){event.preventDefault();move(1)}
          if(event.key==='ArrowLeft'){event.preventDefault();move(-1)}
        }} aria-label={`${t('openAwardImage')}: ${caption}; ${t('galleryInstructions')}`}>
        <img src={media + image.src} alt={alt} loading="lazy" />
      </button>
      {images.length > 1 && <p className="award-position" aria-live="polite">{active + 1} / {images.length}</p>}
      <p className="award-caption">{caption}</p>
    </div>
    <div className="award-copy">
      <h3>{localized?.title || entry.title}</h3>
      {entry.project && <p className="award-project"><span>{t('projectLabel')}:</span> {entry.project}</p>}
      <p>{localized?.text || entry.text}</p>
      {entry.date && <p className="award-date">{entry.date}</p>}
    </div>
    <dialog ref={dialog} className="award-lightbox"
      aria-label={t('openAwardImage')}
      onClick={event => { if (event.target === event.currentTarget) event.currentTarget.close() }}
      onKeyDown={event => { if (event.key === 'Escape') event.stopPropagation() }}>
      <form method="dialog"><button aria-label={t('closeVisual')}>{t('close')}</button></form>
      <img src={media + image.src} alt={alt} />
      <p>{caption}</p>
    </dialog>
  </article>
}

export function Awards() {
  const {t} = useLanguage()
  const competition = awards.find(entry => entry.id === 'green-pyramid-competition')
  const entries = [
    ...credentials.filter(entry => entry.id !== 'smart-recycling-app-m-bank-competition'),
    {...credentials.find(entry => entry.id === 'smart-recycling-app-m-bank-competition'), ...competition, date: undefined},
    ...awards.filter(entry => entry.id !== 'green-pyramid-competition'),
  ]
  return <section className="awards shell" aria-labelledby="awards-title">
    <h2 id="awards-title">{t('awardsTitle')}</h2>
    <div className="awards-grid">
      {entries.map(entry => <AwardEntry key={entry.id} entry={entry} />)}
    </div>
  </section>
}
