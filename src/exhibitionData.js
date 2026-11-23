import motionSource from './galaxyMotion.js?raw'
import {asphaltTrack} from './asphalt-excerpt.js'

const projection = motionSource.slice(motionSource.indexOf('    function project(r,phase)'),motionSource.indexOf('    const bodies=')).trim()
const scroll = motionSource.slice(motionSource.indexOf('  if (window.gsap'),motionSource.indexOf('  function pointer')).trim()
const step = (name, explanation) => ({name,explanation})
const tech = (name,use,reason,feature,code) => ({name,use,reason,feature,code})
export const exhibitions = {
  'asphalt-night': {
    context:'A night-drive experience that gives automotive imagery a playable setting.',
    flow:[step('Vehicle selection','The museum edition lets a visitor choose a car before a race.'),step('Track position','The race logic interpolates between adjacent track samples and applies a lateral offset.'),step('3D scene','The selected car and track are presented in the browser.')],
    technologies:[tech('JavaScript','Interpolates positions along the sampled race track.','The position can be evaluated between samples for smoother movement.','Track coordinates and heading',{title:'Track position · museum edition',source:'asphalt-night.html',body:asphaltTrack})],
    alt:'Automotive concept artwork for Asphalt Night',
    credit:'Concept artwork for Asphalt Night. The live site is linked below.',
  },
  'home-decor': {
    context:'An image-led browsing experience for exploring interior spaces, finishes and materials.',
    flow:[step('Interior photography','Large visuals establish the space and atmosphere.'),step('Browse','Visitors explore the interiors at their own pace.'),step('Materials','Details such as natural light and warm finishes carry the visual direction.')],
    alt:'Interior concept artwork for Home Decor',
    credit:'Interior concept artwork. Open the live site to see the interface.',
  },
  'coding-course-registration': {
    context:'Make topic-based coding courses easier to discover and register for across online and in-person formats.',
    flow:[step('Browse topics','Students explore coding courses by topic.'),step('Choose a course','Students select training that matches their interests.'),step('Register','Registration is available through the training website.')],
    credit:'CodeSpring logo.',
  },
  'academic-research': {
    context:'A 2026 study of investor behavioral risk and the potential of AI-based algorithmic trading in Mongolia.',
    flow:[
      step('Investor behavior','Loss aversion, impulse investing, and herding can influence individual investment decisions.'),
      step('Mongolian market','The analysis considers the TOP-20 index, trading volume, market liquidity, and international comparisons.'),
      step('AI and algorithms','Data-driven algorithmic trading may help reduce emotion-driven investment risk.'),
    ],
    credit:'Research Conference Certificate of Appreciation.',
  },
  'personal-portfolio': {
    context:'Bring projects, research and achievements into one navigable digital exhibition.',
    flow:[step('Collection data','Existing projects and achievements supply planet labels, links and artwork.'),step('Orbital projection','Scroll and pointer inputs drive the projected positions of planets and labels.'),step('Exhibition route','The selected planet opens a shareable project exhibition.')],
    technologies:[
      tech('Three.js','Renders textured planets and rings.','A shared renderer gives each work an identifiable world.','Rotating planet portraits and the galaxy scene.'),
      tech('GSAP ScrollTrigger','Links galaxy progress to scrolling.','Scrubbing keeps movement tied to the visitor’s pace and supports reversing direction.','Scroll-driven orbit changes.',{title:'Scroll-linked progress',source:'src/galaxyMotion.js',body:scroll}),
      tech('JavaScript','Projects orbital coordinates into the scene.','One projection keeps the planet and its label together.','Cursor tilt, depth and orbital positions.',{title:'Orbital projection',source:'src/galaxyMotion.js',body:projection}),
      tech('React','Renders collection navigation and detail views.','A shared component can render each record with its own content and controls.','Planet navigation, project views and theme controls.')
    ],
    credit:'Portfolio screenshot.',
  },
  'ism-digital-museum': {
    flowTitle: "Explore the museum",
    context: 'Start with the department overview, then explore what students have made and get to know the faculty.',
    flow:[
      step('ISM department','Read the introduction to the Information Systems Management department.'),
      step('Student work','Explore projects created by students.'),
      step('Faculty','Find information about the department?s faculty.'),
    ],
  },
  'smart-recycling-app-m-bank-competition': {context:'The Green Pyramid project addresses waste reduction and recycling.',flow:[step('Project','Green Pyramid.'),step('Theme','Reuse, reduce and recycle.'),step('Recognition','Award for the Green Pyramid project.')],credit:'Award photo and printed Green Pyramid poster.'},
  'national-programming-olympiad': {context:'I represented the University of Finance and Economics at the 33rd National Programming Olympiad.',flow:[step('University','University of Finance and Economics.'),step('Event','33rd National Programming Olympiad.'),step('Record','2025 participation certificate.')],credit:'Olympiad certificate.'},
  'accelerated-coding-course': {context:'I completed the one-year accelerated coding program at IO Institute and the University of Finance and Economics.',flow:[step('Program','Accelerated Coding Course.'),step('Duration','One year.'),step('Completion','Recorded in the 2024 certificate.')],credit:'Course certificate.'},
  'rector-s-scholarship': {context:'I received the Rector’s Scholarship at the University of Finance and Economics in 2025.',flow:[step('Institution','University of Finance and Economics.'),step('Recognition','Rector’s Scholarship.'),step('Year','2025.')]},
}
