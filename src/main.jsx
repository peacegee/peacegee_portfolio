import React, { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'
import { Atmosphere, Sound, initialTheme } from './World.jsx'
import { Galaxy } from './Galaxy.jsx'
import { LanguageProvider, LanguageSwitcher, useLanguage } from './Language.jsx'

const github = import.meta.env.VITE_GITHUB_URL || "https://github.com/peacegee"
const instagram = import.meta.env.VITE_INSTAGRAM_URL || 'https://www.instagram.com/_peace__g/'

function App() {
  const {t} = useLanguage()
  const skillGroups = [
    {heading: 'skillsWeb', detail: 'skillsWebDetail', tools: ['JavaScript', 'React', 'HTML & CSS', 'Vite', 'Three.js', 'GSAP']},
    {heading: 'skillsData', detail: 'skillsDataDetail', tools: ['SQL Server', 'Excel', t('dataCleaning'), t('dataValidation')]},
    {heading: 'skillsCode', detail: 'skillsCodeDetail', tools: ['C#', t('teamwork')]},
  ]
  const email = 'enkhmend926@gmail.com'
  const [copyStatus, setCopyStatus] = React.useState('')
  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(email)
      setCopyStatus('copied')
    } catch {
      setCopyStatus('copyFailed')
    }
  }

  const [theme, setTheme] = React.useState(initialTheme)
  useEffect(() => {
    document.documentElement.dataset.horizon = theme
    localStorage.setItem('horizon-theme', theme)
  }, [theme])
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !window.gsap || !window.ScrollTrigger) return
    window.gsap.registerPlugin(window.ScrollTrigger)
    const animation = window.gsap.to('.hero-copy', {y:-60, scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}})
    return () => {animation.scrollTrigger?.kill();animation.kill()}
  }, [])
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
          observer.unobserve(entry.target)
        }
      }
    }, { threshold: 0.12 })
    document.querySelectorAll('[data-reveal]').forEach((section) => observer.observe(section))
    const updateProgress = () => {
      const max = document.documentElement.scrollHeight - innerHeight
      document.documentElement.style.setProperty('--scroll', max > 0 ? scrollY / max : 0)
    }
    updateProgress()
    addEventListener('scroll', updateProgress, { passive: true })
    addEventListener('resize', updateProgress)
    return () => {
      observer.disconnect()
      removeEventListener('scroll', updateProgress)
      removeEventListener('resize', updateProgress)
    }
  }, [])

  return (
    <>
      <a className="skip" href="#main">{t('skip')}</a>
      <div className="scroll-progress" aria-hidden="true" />
      <header className="header">
        <div className="shell header-inner">
          <a className="brand" href="#top" aria-label={t('home')}>EG<span>.</span></a>
          <nav aria-label={t('navigation')}>
            <a href="#about">{t('about')}</a><a href="#work">{t('galaxy')}</a><a href="#contact">{t('contact')}</a><div className="mode-controls"><button className="theme-toggle" type="button" onClick={()=>setTheme(theme==='night'?'day':'night')}>{t(theme==='night'?'day':'night')}</button><LanguageSwitcher /></div>
          </nav>
        </div>
      </header>
      <main id="main">
        <section className="hero horizon" id="top" aria-labelledby="hero-title">
          <Atmosphere theme={theme} />
          <div className="shell hero-copy">
            <p className="mono horizon-location">{t('location')}</p>
            <h1 id="hero-title">{t('heroFirst')}<br/><em>{t('heroSecond')}</em></h1>
            <p>{t('heroIntro')}</p>
            <a className="pill" href="#work">{t('explore')}</a>
          </div>
          <div className="shell horizon-controls"><Sound theme={theme}/></div>
        </section>

        <Galaxy theme={theme} setTheme={setTheme} />

        <section id="about" className="shell about" aria-labelledby="about-title">
          <div className="about-heading" data-reveal>
            <h2 id="about-title">{t('aboutTitle')}<span>.</span></h2>
            <p className="intro">{t('aboutIntro')}</p>
            <p>{t('aboutWork')}</p>
          </div>
          <div className="about-details" data-reveal>
            <h3>{t('skills')}</h3>
            <ul className="skill-groups">
              {skillGroups.map(({heading, detail, tools}) => (
                <li className="skill-group" key={heading}>
                  <h4>{t(heading)}</h4>
                  <p>{t(detail)}</p>
                  <ul className="chips">
                    {tools.map(tool => <li key={tool}>{tool}</li>)}
                  </ul>
                </li>
              ))}
            </ul>
            <h3>{t('interests')}</h3>
            <dl className="interests">
              <div><dt>{t('swimming')}</dt><dd>{t('swimmer')}</dd></div>
              <div><dt>{t('basketball')}</dt><dd>{t('athlete')}</dd></div>
            </dl>
          </div>
        </section>

      </main>

      <footer id="contact" className="orbit-footer">
        <div className="shell">
          <div className="footer-main">
            <h2>{t('farewell')}<span>.</span></h2>
            <div className="footer-contact">
              <button className="pill footer-email" type="button" onClick={copyEmail} aria-label={`${t('copyEmail')} ${email}`}>
                {email}<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>
              </button>
              <span className="copy-status" role="status">{copyStatus && t(copyStatus)}</span>
            </div>
          </div>
          <div className="footer-links">
            <div className="footer-signature"><strong>peacegee</strong><p>{t('closing')}</p></div>
            <div className="footer-social">
              <a href={github} target="_blank" rel="noopener noreferrer" aria-label="GitHub"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 19c-4 1.4-4-2.5-6-3m12 6v-3.9c.04-1-.36-1.94-1.1-2.62 3.67-.41 7.52-1.8 7.52-8.12A6.3 6.3 0 0 0 19.74 3c.16-.42.73-2.04-.16-4.24 0 0-1.37-.43-4.49 1.67a15.6 15.6 0 0 0-8.18 0C3.78-1.67 2.41-1.24 2.41-1.24 1.52.96 2.09 2.58 2.25 3A6.3 6.3 0 0 0 .56 7.37c0 6.31 3.85 7.7 7.51 8.11-.47.4-.8 1.04-.95 1.78V22" transform="translate(2 3) scale(.83)"/></svg></a>
              <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".7" fill="currentColor"/></svg></a>
              <a href="#top" aria-label={t('top')}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20V4m-6 6 6-6 6 6"/></svg></a>
            </div>
          </div>
        </div>
      </footer>

    </>
  )
}

createRoot(document.getElementById('root')).render(<LanguageProvider><App /></LanguageProvider>)
