import React, {createContext, useContext, useLayoutEffect, useRef, useState} from 'react'
import {messages} from './messages.js'

const LanguageContext = createContext(null)
const storageKey = 'portfolio-language'
const options = [
  {id: 'en', short: 'EN', name: 'English'},
  {id: 'mn', short: 'MN', name: 'Монгол'},
]

export function LanguageProvider({children}) {
  const [language, setLanguage] = useState(() => localStorage.getItem(storageKey) === 'mn' ? 'mn' : 'en')
  const scroll = useRef(null)
  const t = key => messages[key][language === 'mn' ? 1 : 0]

  function selectLanguage(next) {
    if (next === language) return
    const detail = document.querySelector('.exhibit-page')
    scroll.current = {detail, detailTop: detail?.scrollTop, x: window.scrollX, y: window.scrollY}
    setLanguage(next)
  }

  useLayoutEffect(() => {
    document.documentElement.lang = language
    document.title = t('pageTitle')
    document.querySelector('meta[name="description"]').content = t('pageDescription')
    localStorage.setItem(storageKey, language)
    if (scroll.current) {
      const {detail, detailTop, x, y} = scroll.current
      if (detail) detail.scrollTop = detailTop
      window.scrollTo({left: x, top: y, behavior: 'instant'})
      scroll.current = null
    }
  }, [language])

  return <LanguageContext.Provider value={{language, selectLanguage, t}}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  return useContext(LanguageContext)
}

export function LanguageSwitcher() {
  const {language, selectLanguage, t} = useLanguage()
  return <div className="language-toggle" role="group" aria-label={t('language')}>
    {options.map(option => <button key={option.id} type="button" lang={option.id}
      aria-label={option.name} aria-pressed={language === option.id} onClick={() => selectLanguage(option.id)}>
      {option.short}
    </button>)}
  </div>
}
