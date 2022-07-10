import { query } from './utilities/query'
import './style.scss'

interface State {
  selected: number
  xOffset: number
  yOffset: number
  sortingArray: number[]
  cssArray: string[]
  cssString: string
}

/**
 * Declarations
 */
const state: State = {
  selected: 0,
  xOffset: 0,
  yOffset: 0,
  sortingArray: [],
  cssArray: [],
  cssString: '',
}

const button = {
  keyframe: query<'button'>('#record'),
  play: query<'button'>('#play'),
  stop: query<'button'>('#stop'),
}

const timeline = query<'input'>('.timeline')
const actor = query<'div'>('.actor')

const keyFrames = new Map()
const keyFramesSort = new Map()

/**
 * Cria uma folha de estilo para
 * manter as propriedades da animação
 */
let styleEl = document.createElement('style')
document.head.appendChild(styleEl)
let styleSheet = styleEl.sheet!

let firstCoords = actor.getBoundingClientRect()
actor.style.left = firstCoords.left + 'px'
actor.style.top = firstCoords.top + 'px'

actor.onmousedown = mouseDownActor

document.onmousemove = mouseMoveWindow
document.onmouseup = mouseUpWindow
document.onkeyup = keyUpControl

button.stop.disabled = true
button.play.onclick = clickPlay
button.stop.onclick = clickStop
button.keyframe.onclick = clickKeyFrame

function keyUpControl(e: KeyboardEvent) {
  const currentFrame = timeline.valueAsNumber
  if (currentFrame > +timeline.min && e.code === 'ArrowLeft') {
    timeline.value = (currentFrame - 1).toString()
  }
  if (currentFrame < +timeline.max && e.code === 'ArrowRight') {
    timeline.value = (currentFrame + 1).toString()
  }
  console.log(e)

  if (e.code === 'KeyG') clickKeyFrame()
  if (e.code === 'KeyR') clickPlay()
  if (e.code === 'keyP') clickStop()
}

function mouseDownActor(e: MouseEvent) {
  if (!actor.classList.contains('play')) {
    state.selected = 1
    state.xOffset = e.clientX - +actor.style.left.slice(0, -2)
    state.yOffset = e.clientY - +actor.style.top.slice(0, -2)
  }
}
function mouseUpWindow() {
  state.selected = 0
}
function mouseMoveWindow(e: MouseEvent) {
  if (state.selected) {
    actor.style.left = `${e.x - state.xOffset}px`
    actor.style.top = `${e.y - state.yOffset}px`
  }
}
function clickPlay() {
  button.keyframe.disabled = true
  timeline.disabled = true
  button.play.disabled = true
  button.stop.disabled = false
  convertToAnim()
}
function clickStop() {
  button.keyframe.disabled = false
  timeline.disabled = false
  button.play.disabled = false
  button.stop.disabled = true
  state.sortingArray = []
  state.cssArray = []
  state.cssString = ''
  emptyStyleSheet()
  actor.classList.remove('play')
}

function convertToAnim() {
  keyFramesSort.clear()

  Array.from(keyFrames.keys()).forEach((k) => {
    // crie um array com as chaves
    state.sortingArray.push(k)
  })
  // ordena as chaves
  state.sortingArray.sort((a, b) => a - b)
  // encontra chaves equivalentes e adiciona no map ordenado
  state.sortingArray.forEach((e) => {
    keyFramesSort.set(e, keyFrames.get(e))
  })

  // cria posições para a animação
  keyFramesSort.forEach((value, key) => {
    state.cssArray.push(`${key}%  {left: ${value.x}px; top: ${value.y}px}`)
  })
  state.cssString = `@keyframes anim { ${state.cssArray.join(' ')} }`

  styleSheet.insertRule(state.cssString)
  actor.classList.add('play')
}
function clickKeyFrame() {
  /**
   * As recodificação precisam de sua posição horizontal gravada
   * para que possamos reorganizar e reproduzir da esquerda para
   * a direita, independentemente da ordem em que foram gravados
   */
  const actorCoords = actor.getBoundingClientRect()
  keyFrames.set(timeline.value, { x: actorCoords.left, y: actorCoords.top })
}

function emptyStyleSheet() {
  while (styleSheet.cssRules[0]) {
    styleSheet.deleteRule(0)
  }
}
