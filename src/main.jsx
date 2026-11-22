import React, { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'
import { Atmosphere, Sound, initialTheme } from './World.jsx'
import { Galaxy } from './Galaxy.jsx'

const projects = [
  {
    title: 'Asphalt Night', category: 'Automotive web experience', theme: 'asphalt', image: 'asphalt.webp',
    description: 'An automotive web experience that takes its visual cues from night drives and street-car culture.',
    notes: 'The visual direction uses low light, deep contrast and automotive photography to evoke a late-night garage.', action: 'Enter the garage', url: 'https://asphaltnight.vercel.app/',
  },
  {
    title: 'Home Decor', category: 'Interior design website', theme: 'decor', image: 'decor.webp',
    description: 'A home decor website that puts interiors, materials and visual browsing front and center.',
    notes: 'The visual direction uses warm neutrals, natural light and large interior photographs to keep attention on the spaces.', action: 'Explore the site', url: 'https://homedecor-ruby.vercel.app/',
  },
  {
    title: 'Coding Course Registration', category: 'Hybrid learning platform', theme: 'courses',
    cover: 'CODING COURSES',
    description: 'A website where students can browse coding courses by topic and register for training.',
    notesTitle: 'How it works',
    notes: 'The platform brings online and in-person instruction together. Students can explore topic-based courses and sign up through the website.',
    action: 'Open the training website', url: 'https://frontend-five-steel-rmav3cua9k.vercel.app/',
  },
  {
    title: 'Academic Research', category: 'Bank of Mongolia Research Conference · 2026', theme: 'research',
    cover: 'ACADEMIC RESEARCH',
    description: 'Research conference participation listed in my CV for 2026.',
    notesTitle: 'Conference',
    notes: 'The Bank of Mongolia organized the 2026 research conference.',
    action: 'View research details',
  },
  {
    title: 'Personal Portfolio', category: 'SWE334 · React and Vite', theme: 'portfolio',
    description: 'An interactive portfolio built to present my web projects, education and competition work.',
    notes: 'The site combines an editorial layout with interactive 3D navigation, full-screen project exhibitions and responsive styling.',
    action: 'Explore the portfolio', url: '#top',
  },
]

const credentials = [
  { title: 'Student Project Competition', date: '2026', text: 'Team Waffle took first place with Pyramid at UFE’s Student Project Competition on March 26, 2026.', image: 'competition.webp' },
  { title: 'Smart Recycling App · M Bank Competition', date: '2025', text: 'First place for a student app project focused on recycling.', image: 'recycle.webp' },
  { title: 'National Programming Olympiad', date: '2025', text: 'Represented the University of Finance and Economics at the 33rd National Programming Olympiad.', image: 'olympiad.webp' },
  { title: 'Accelerated Coding Course', date: '2024', text: 'Completed a one-year program at IO Institute and the University of Finance and Economics.', image: 'coding.webp' },
  { title: 'Rector’s Scholarship', date: '2025', text: 'Received the Rector’s Scholarship at the University of Finance and Economics.' },
]

const github = import.meta.env.VITE_GITHUB_URL || "https://github.com/peacegee"
const instagram = import.meta.env.VITE_INSTAGRAM_URL || 'https://www.instagram.com/_peace__g/'

function App() {
  const email = 'enkhmend926@gmail.com'
  const [copyStatus, setCopyStatus] = React.useState('')
  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(email)
      setCopyStatus('Email copied')
    } catch {
      setCopyStatus('Select the address to copy it.')
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
      <a className="skip" href="#main">Skip to content</a>
      <div className="scroll-progress" aria-hidden="true" />
      <header className="header">
        <div className="shell header-inner">
          <a className="brand" href="#top" aria-label="Enkhmend Gantumur home">EG<span>.</span></a>
          <nav aria-label="Main navigation">
            <a href="#about">About</a><a href="#work">Galaxy</a><a href="#contact">Contact</a><button className="theme-toggle" type="button" onClick={()=>setTheme(theme==='night'?'day':'night')}>{theme==='night'?'Day mode':'Night mode'}</button>
          </nav>
        </div>
      </header>
      <main id="main">
        <section className="hero horizon" id="top" aria-labelledby="hero-title">
          <Atmosphere theme={theme} />
          <div className="shell hero-copy">
            <p className="mono horizon-location">Ulaanbaatar · Mongolia</p>
            <h1 id="hero-title">Living<br/><em>Horizons</em></h1>
            <p>A digital exhibition by Enkhmend Gantumur.</p>
            <a className="pill" href="#work">Explore the galaxy</a>
          </div>
          <div className="shell horizon-controls"><Sound theme={theme}/></div>
        </section>

        <Galaxy theme={theme} projects={projects} credentials={credentials} setTheme={setTheme} />

        <section id="about" className="shell about" aria-labelledby="about-title">
          <div className="about-heading" data-reveal>
            <h2 id="about-title">About me<span>.</span></h2>
            <p className="intro">I’m Enkhmend, a fourth-year Information Systems Management student at the University of Finance and Economics.</p>
            <p>I’m interested in how clear interfaces and well-organized data can solve everyday problems. During my internship at IO Tech, I used SQL and Excel to clean, check and analyze data for reports.</p>
          </div>
          <div className="about-details" data-reveal>
            <h3>Tools &amp; skills</h3>
            <ul className="chips">{['JavaScript', 'React', 'HTML & CSS', 'C#', 'SQL Server', 'Excel', 'Data cleaning', 'Teamwork'].map((item) => <li key={item}>{item}</li>)}</ul>
            <h3>Outside of code</h3>
            <dl className="interests">
              <div><dt>Swimming</dt><dd>Amateur swimmer</dd></div>
              <div><dt>Basketball</dt><dd>Second-class athlete rank</dd></div>
            </dl>
          </div>
        </section>

      </main>

      <footer id="contact" className="orbit-footer">
        <div className="shell">
          <div className="footer-main">
            <h2>Until the next orbit<span>.</span></h2>
            <div className="footer-contact">
              <button className="pill footer-email" type="button" onClick={copyEmail} aria-label={`Copy email address ${email}`}>
                {email}<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg>
              </button>
              <span className="copy-status" role="status">{copyStatus}</span>
            </div>
          </div>
          <div className="footer-links">
            <div className="footer-signature"><strong>peacegee</strong><p>I hope something here stays with you after you close the tab.</p></div>
            <div className="footer-social">
              <a href={github} target="_blank" rel="noopener noreferrer" aria-label="GitHub"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 19c-4 1.4-4-2.5-6-3m12 6v-3.9c.04-1-.36-1.94-1.1-2.62 3.67-.41 7.52-1.8 7.52-8.12A6.3 6.3 0 0 0 19.74 3c.16-.42.73-2.04-.16-4.24 0 0-1.37-.43-4.49 1.67a15.6 15.6 0 0 0-8.18 0C3.78-1.67 2.41-1.24 2.41-1.24 1.52.96 2.09 2.58 2.25 3A6.3 6.3 0 0 0 .56 7.37c0 6.31 3.85 7.7 7.51 8.11-.47.4-.8 1.04-.95 1.78V22" transform="translate(2 3) scale(.83)"/></svg></a>
              <a href={instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".7" fill="currentColor"/></svg></a>
              <a href="#top" aria-label="Back to top"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20V4m-6 6 6-6 6 6"/></svg></a>
            </div>
          </div>
        </div>
      </footer>

    </>
  )
}

createRoot(document.getElementById('root')).render(<App />)
