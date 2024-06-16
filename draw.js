function init() {
  let state = {
    isDrawingEnabled: false,
    controlButton: null,
    canvas: null,
    ctx: null,
    points: [],
  }

  // --- canvas
  function createCanvas() {
    state.canvas = document.createElement('canvas')
    state.canvas.setAttribute(
      'style',
      'position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 9999'
    )
    state.canvas.width = window.innerWidth
    state.canvas.height = window.innerHeight
    state.ctx = state.canvas.getContext('2d')
    document.body.insertBefore(state.canvas, document.body.firstChild)

    document.addEventListener('click', handleCanvasClick)
    window.addEventListener('keyup', escapeHandler)
  }

  function removeCanvas() {
    document.removeEventListener('click', handleCanvasClick)
    window.removeEventListener('keyup', escapeHandler)

    document.body.removeChild(state.canvas)
    state.canvas = null
    state.ctx = null
    state.points = []
  }

  function drawDiagram() {
    const stdDeviationLimit = 2
    state.ctx.clearRect(0, 0, state.canvas.width, state.canvas.height)

    let lower = Math.min(state.points[0].y, state.points[1].y)
    let upper = Math.max(state.points[0].y, state.points[1].y)
    let distance = upper - lower
    // We'll assume that the boundaries are at 2 sigma
    let sections = distance / (stdDeviationLimit * 4)

    state.ctx.fillStyle = 'rgba(255, 0, 0, 0.1)'
    state.ctx.fillRect(0, lower, state.canvas.width, upper - lower)

    const labels = ['-2', '-1.5', '-1', '-0.5', '0', '+0.5', '+1', '+1.5', '+2']
    state.ctx.fillStyle = 'rgba(0, 0, 0, 1)'

    for (let l = 0; l <= stdDeviationLimit * 4; l++) {
      state.ctx.beginPath()
      state.ctx.moveTo(0, lower + l * sections)
      state.ctx.lineTo(state.canvas.width, lower + l * sections)
      state.ctx.stroke()
      state.ctx.font = '24px monospaced'
      const txt = state.ctx.measureText(labels[l])
      state.ctx.fillText(
        labels[l],
        state.canvas.width - txt.width - 10,
        lower + l * sections
      )
    }

    // Draw user-selected points
    state.ctx.fillStyle = 'red'
    state.points.forEach((point) => {
      state.ctx.beginPath()
      state.ctx.arc(point.x, point.y, 5, 0, Math.PI * 2)
      state.ctx.fill()
    })
  }

  function handleCanvasClick(event) {
    if (event.currentTarget === state.canvas || event.target === state.canvas) {
      const x = event.clientX
      const y = event.clientY

      state.points.push({ x, y })
      if (state.points.length > 2) {
        state.points = []
        state.points.push({ x, y })
      }
      if (state.points.length === 2) {
        state.ctx.clearRect(0, 0, state.canvas.width, state.canvas.height)
        drawDiagram()
      }
    }
  }

  function escapeHandler(event) {
    if (event.key === 'Escape') {
      state.ctx.clearRect(0, 0, state.canvas.width, state.canvas.height)
      state.points = []
    }
  }
  // --- canvas END

  function injectControl() {
    state.controlButton = document.createElement('div')
    state.controlButton.innerText = 'Toggle canvas'
    state.controlButton.setAttribute(
      'style',
      'background-color: #0ea5e9; position: fixed; top: 100px; left: 20px; height: 40px; padding: 0.5rem 1rem; cursor: pointer; z-index: 9999; color: #f8fafc; border-radius: 20px'
    )

    document.body.appendChild(state.controlButton)

    state.controlButton.addEventListener('click', toggleCanvas)
  }

  function removeControl() {
    if (state.canvas !== null) {
      removeCanvas()
    }
    state.controlButton.removeEventListener('click', toggleCanvas)

    document.body.removeChild(state.controlButton)

    state.controlButton = null
  }

  function toggleCanvas() {
    state.isDrawingEnabled = !state.isDrawingEnabled
    if (state.isDrawingEnabled) {
      createCanvas()
    } else {
      removeCanvas()
    }
  }

  return { state, inject: injectControl, remove: removeControl }
}

// Just for debugging reasons, we externalize the functions
const o = init()
o.inject()
