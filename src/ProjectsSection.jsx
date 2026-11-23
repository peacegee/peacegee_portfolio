import React from 'react'
import {projects} from './projectData.js'
import {mongolianProjects} from './projects.mn.js'
import {useLanguage} from './Language.jsx'
import './exhibition.css'

const media = `${import.meta.env.BASE_URL}media/`

export function ProjectsSection() {
  const {language, t} = useLanguage()

  function planetUrl(id) {
    const url = new URL(location.href)
    url.searchParams.set('planet', id)
    url.hash = 'work'
    return url.href
  }

  return <section className="projects-list shell" aria-labelledby="projects-title">
    <h2 id="projects-title">{t('projectsTitle')}</h2>
    <div className="projects-grid">
      {projects.map((project, index) => {
        const localized = language === 'mn' ? mongolianProjects[project.id] : null
        const title = localized?.title || project.title
        return <article className="project-list-entry" key={project.id}>
          <div className="project-row-heading">
            <p className="mono">{String(index + 1).padStart(2, '0')} · {localized?.category || project.category}</p>
            <h3>{title}</h3>
          </div>
          <div className="project-row-details">
            <p>{localized?.description || project.description}</p>
            <div className="project-list-actions">
              <a href={planetUrl(project.id)} aria-label={`${t('viewProject')}: ${title}`}>{t('viewProject')}</a>
              {project.url && !project.url.startsWith('#') && <a href={project.url} target="_blank" rel="noopener noreferrer" aria-label={`${t('projectDemo')}: ${title}`}>{t('projectDemo')}</a>}
              {project.sourceUrl && <a href={project.sourceUrl} target="_blank" rel="noopener noreferrer" aria-label={`${t('projectSource')}: ${title}`}>{t('projectSource')}</a>}
              {project.researchPaper && <a href={media + project.researchPaper} target="_blank" rel="noopener noreferrer">{t('readPaper')}</a>}
            </div>
          </div>
        </article>
      })}
    </div>
  </section>
}
