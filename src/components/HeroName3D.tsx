import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import glyphData from '../data/kyngGlyphs.json'

type Cmd = (string | number)[]
const TRACK = -0.012 // tracking in em
const GOLD = 0xd1a94f
const BLUE = 0x4a7bff

function shapesFor(cmds: Cmd[]) {
  const sp = new THREE.ShapePath()
  const u = (v: number) => v / glyphData.upm
  for (const c of cmds) {
    const [t, ...n] = c as [string, ...number[]]
    if (t === 'M') sp.moveTo(u(n[0]), u(n[1]))
    else if (t === 'L') sp.lineTo(u(n[0]), u(n[1]))
    else if (t === 'Q') sp.quadraticCurveTo(u(n[0]), u(n[1]), u(n[2]), u(n[3]))
    else if (t === 'C') sp.bezierCurveTo(u(n[0]), u(n[1]), u(n[2]), u(n[3]), u(n[4]), u(n[5]))
  }
  return sp.toShapes()
}

interface Rect { l: number; t: number; r: number; b: number }

interface Props {
  onFail: () => void
}

export default function HeroName3D({ onFail }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    } catch {
      onFail()
      return
    }
    renderer.setClearColor(0x000000, 0)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 0.85
    renderer.localClippingEnabled = true

    const scene = new THREE.Scene()
    const pmrem = new THREE.PMREMGenerator(renderer)
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = envTex
    scene.environmentIntensity = 0.7

    const FOV = 28
    const camera = new THREE.PerspectiveCamera(FOV, 1, 10, 8000)

    // The scan plane: solid metal exists only on its left. Everything right of it is still wireframe.
    const scanPlane = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0)

    const solidBase = {
      color: 0x8a919c,
      metalness: 1,
      roughness: 0.3,
      anisotropy: 0.7,
      anisotropyRotation: 0.25,
      clearcoat: 0.15,
      clearcoatRoughness: 0.4,
      clippingPlanes: [scanPlane],
      transparent: true,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    }
    const goldMat = new THREE.MeshPhysicalMaterial({ color: GOLD, metalness: 1, roughness: 0.22, clippingPlanes: [scanPlane], polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 })

    const pivot = new THREE.Group()
    scene.add(pivot)

    interface Letter {
      mesh: THREE.Mesh
      mat: THREE.MeshPhysicalMaterial
      wireMat: THREE.LineBasicMaterial
      baseX: number
      baseY: number
      z: number; rx: number; ry: number; vz: number; vrx: number; vry: number
      yieldV: number
    }
    const letters: Letter[] = []
    const wireMats: THREE.LineBasicMaterial[] = []
    let penX = 0
    const depth = 0.16
    glyphData.glyphs.forEach((g) => {
      const geo = new THREE.ExtrudeGeometry(shapesFor(g.cmds as Cmd[]), {
        depth,
        bevelEnabled: true,
        bevelThickness: 0.016,
        bevelSize: 0.012,
        bevelSegments: 4,
        curveSegments: 14,
      })
      geo.computeBoundingBox()
      const bb = geo.boundingBox!
      const cx = (bb.min.x + bb.max.x) / 2
      const cy = (bb.min.y + bb.max.y) / 2
      geo.translate(-cx, -cy, -depth / 2)
      const mat = new THREE.MeshPhysicalMaterial(solidBase)
      const mesh = new THREE.Mesh(geo, mat)
      // hairline construction lines: the wireframe state, and an engraved edge once rendered
      const wireMat = new THREE.LineBasicMaterial({ color: 0xc3c8d1, transparent: true, opacity: 0.6 })
      wireMats.push(wireMat)
      mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(geo, 22), wireMat))
      const baseX = penX + cx
      mesh.position.set(baseX, cy, 0)
      pivot.add(mesh)
      letters.push({ mesh, mat, wireMat, baseX, baseY: cy, z: 0, rx: 0, ry: 0, vz: 0, vrx: 0, vry: 0, yieldV: 0 })
      penX += g.adv / glyphData.upm + TRACK
    })
    const textW = penX - TRACK
    const dSize = 0.075
    const dGeo = new THREE.BoxGeometry(dSize, dSize, dSize * 0.9)
    const diamond = new THREE.Mesh(dGeo, goldMat)
    const dWireMat = new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: 0.7 })
    diamond.add(new THREE.LineSegments(new THREE.EdgesGeometry(dGeo), dWireMat))
    wireMats.push(dWireMat)
    diamond.rotation.z = Math.PI / 4
    diamond.position.set(textW + 0.07, dSize * 0.72, 0)
    pivot.add(diamond)
    const fullW = textW + 0.07 + dSize
    const asc = 0.66
    const desc = 0.22
    const centerEm = { x: fullW / 2, y: (asc - desc) / 2 }
    pivot.children.forEach((c) => { c.position.x -= centerEm.x; c.position.y -= centerEm.y })
    letters.forEach((l) => { l.baseX -= centerEm.x; l.baseY -= centerEm.y })

    // scan line: a thin blue edge travelling across the word while it resolves
    const scanLineMat = new THREE.MeshBasicMaterial({ color: BLUE, transparent: true, opacity: 0, depthWrite: false })
    const scanLine = new THREE.Mesh(new THREE.PlaneGeometry(2, 1), scanLineMat)
    scene.add(scanLine)

    const key = new THREE.PointLight(0xffffff, 0, 0, 0)
    scene.add(key)
    const rim = new THREE.DirectionalLight(0x5a86ff, 0.55)
    rim.position.set(-1, 0.6, -0.4)
    scene.add(rim)
    const fill = new THREE.DirectionalLight(0xffffff, 0.35)
    fill.position.set(0.4, 1, 1)
    scene.add(fill)

    let W = 1, H = 1, em = 100
    let baseY = 0
    let nameW = 100
    let rects: { r: Rect; k: number }[] = []
    let yieldEls: HTMLElement[] = []
    const host = canvas.closest('header') as HTMLElement | null

    // Text is measured line by line (not as one big box), so only letters that really sit behind a line of text yield.
    const measure = () => {
      const cr = canvas.getBoundingClientRect()
      yieldEls = host ? Array.from(host.querySelectorAll<HTMLElement>('[data-yield]')) : []
      rects = []
      const range = document.createRange()
      yieldEls.forEach((el, k) => {
        range.selectNodeContents(el)
        const list = Array.from(range.getClientRects()).filter((r) => r.width > 4 && r.height > 4)
        const src = list.length ? list : [el.getBoundingClientRect()]
        src.forEach((r) => rects.push({ k, r: { l: r.left - cr.left, t: r.top - cr.top, r: r.right - cr.left, b: r.bottom - cr.top } }))
      })
    }

    const METAL = new THREE.Color(0x8a919c)
    const DEEP = new THREE.Color(0x23262c)

    const layout = () => {
      W = canvas.clientWidth
      H = canvas.clientHeight
      if (!W || !H) return
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(W, H, false)
      camera.aspect = W / H
      camera.position.set(0, 0, (H / 2) / Math.tan((FOV * Math.PI) / 360))
      camera.far = camera.position.z * 4
      camera.updateProjectionMatrix()
      const padLeft = Math.max(24, (W - 1240) / 2 + 40)
      const maxByH = 0.86 * H
      measure()
      // on short screens, shrink the word so it ends above the first line of text instead of sitting behind it
      const textTop = rects.length ? Math.min(...rects.map((x) => x.r.t)) : H
      const room = textTop - 84 - 18
      const maxByRoom = room > 140 ? (room / (asc + desc)) * fullW : Infinity
      nameW = Math.min(W - padLeft - 24, 1000, maxByH, maxByRoom)
      em = nameW / fullW
      pivot.scale.setScalar(em)
      const nameH = (asc + desc) * em
      const cx = padLeft + nameW / 2
      const cy = Math.max(104 + nameH / 2, H * 0.3)
      pivot.position.x = cx - W / 2
      baseY = H / 2 - cy
      pivot.position.y = baseY
      scanLine.scale.set(2, nameH * 1.5, 1)
      measure()
    }

    // pointer state
    const ptr = { x: 0, y: 0, nx: 0, ny: 0, last: -1e9 }
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      ptr.x = e.clientX - r.left
      ptr.y = e.clientY - r.top
      ptr.nx = Math.max(-1, Math.min(1, (ptr.x / r.width) * 2 - 1))
      ptr.ny = Math.max(-1, Math.min(1, (ptr.y / r.height) * 2 - 1))
      ptr.last = performance.now()
    }
    const onLeave = () => { ptr.last = -1e9 }

    // scan state: 0 = fully wireframe, 1 = fully rendered
    const SCAN_MS = 2600
    let scanStart = performance.now() + 150
    let scanOut = false // when true the scan runs back to wireframe, then forward again
    const onClick = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest('a,button')) return
      const r = canvas.getBoundingClientRect()
      const x = e.clientX - r.left, y = e.clientY - r.top
      const l = W / 2 + pivot.position.x - nameW / 2, rr = l + nameW
      const t = H / 2 - pivot.position.y - 0.5 * (asc + desc) * em, b = t + (asc + desc) * em
      if (x >= l && x <= rr && y >= t && y <= b) { scanOut = true; scanStart = performance.now() }
    }
    if (!reduced) {
      window.addEventListener('pointermove', onMove, { passive: true })
      document.addEventListener('pointerleave', onLeave)
      window.addEventListener('click', onClick)
    }

    const tilt = { x: 0, y: 0 }
    const lightPos = new THREE.Vector3()
    const lightTarget = new THREE.Vector3()
    const ease = (x: number) => 1 - Math.pow(1 - x, 4)
    const easeIO = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)
    let t0 = performance.now()
    let raf = 0
    let visible = true
    const box = new THREE.Box3()
    const corner = new THREE.Vector3()
    const covered = new WeakMap<HTMLElement, boolean>()

    const idleLight = (t: number, out: THREE.Vector3) => {
      const s = (Math.sin(t * 0.00045) + 1) / 2
      out.set((s - 0.5) * W * 0.55 + pivot.position.x, pivot.position.y + em * 0.25, em * 1.1)
    }

    const screenRect = (mesh: THREE.Object3D): Rect => {
      box.setFromObject(mesh)
      let l = Infinity, t = Infinity, r = -Infinity, b = -Infinity
      for (let i = 0; i < 8; i++) {
        corner.set(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z).project(camera)
        const x = (corner.x * 0.5 + 0.5) * W
        const y = (-corner.y * 0.5 + 0.5) * H
        l = Math.min(l, x); r = Math.max(r, x); t = Math.min(t, y); b = Math.max(b, y)
      }
      // shrink a little: glyph boxes are generous, glyphs are not rectangles
      const sx = (r - l) * 0.08, sy = (b - t) * 0.08
      return { l: l + sx, r: r - sx, t: t + sy, b: b - sy }
    }
    const overlaps = (a: Rect, b: Rect, pad = 6) => a.l < b.r + pad && a.r > b.l - pad && a.t < b.b + pad && a.b > b.t - pad

    const draw = (now: number) => {
      const t = now - t0
      const intro = reduced ? 1 : Math.min(1, t / 2600)

      // wireframe -> render scan
      let scan = 1
      if (!reduced) {
        const p = Math.min(1, Math.max(0, (now - scanStart) / SCAN_MS))
        if (!scanOut) scan = easeIO(p)
        else {
          // run back to wireframe in the first third, then resolve again
          const q = Math.min(1, (now - scanStart) / (SCAN_MS * 1.2))
          scan = q < 0.35 ? 1 - easeIO(q / 0.35) : easeIO((q - 0.35) / 0.65)
          if (q >= 1) scanOut = false
        }
      }
      const half = nameW / 2 + 40
      const scanX = pivot.position.x - half + scan * 2 * half
      scanPlane.constant = scan >= 1 ? 1e5 : scanX
      const scanning = scan > 0.001 && scan < 0.999
      scanLine.position.set(scanX, pivot.position.y, 4)
      scanLineMat.opacity = scanning ? 0.85 * Math.sin(Math.PI * scan) : 0

      // light: follows the cursor, otherwise drifts
      const live = now - ptr.last < 2500 && !reduced
      if (live) lightTarget.set(ptr.x - W / 2, H / 2 - ptr.y, em * 0.9)
      else if (reduced) lightTarget.set(pivot.position.x - em * 0.5, pivot.position.y + em * 0.3, em * 1.1)
      else idleLight(now, lightTarget)
      lightPos.lerp(lightTarget, live ? 0.2 : 0.04)
      key.position.copy(lightPos)
      key.intensity = (live ? 2.4 : 1.3) * Math.min(1, intro * 1.5) * (0.35 + 0.65 * scan)
      key.distance = 0
      key.decay = 0

      // scroll: the word lags behind the page, so it slides behind the text below it
      const sy = reduced ? 0 : Math.min(window.scrollY, H)
      pivot.position.y = baseY - sy * 0.38

      // body tilt toward the cursor, plus a little scroll-driven pitch
      const tx = live ? -ptr.ny * 0.3 : 0
      const ty = live ? ptr.nx * 0.5 : 0
      tilt.x += (tx - tilt.x) * 0.07
      tilt.y += (ty - tilt.y) * 0.07
      pivot.rotation.x = tilt.x + (sy / H) * 0.45
      pivot.rotation.y = tilt.y

      // per-letter response
      const px = (ptr.x - W / 2 - pivot.position.x) / em
      const py = (H / 2 - ptr.y - pivot.position.y) / em
      letters.forEach((l, i) => {
        const stag = Math.min(1, Math.max(0, (t - i * 160) / 1500))
        const e = ease(stag)
        const dx = l.baseX - px
        const dy = l.baseY - py
        const infl = live ? Math.exp(-(dx * dx + dy * dy) / (2 * 0.32 * 0.32)) : 0
        const targetZ = infl * 0.2
        const targetRy = -dx * infl * 0.9
        const targetRx = dy * infl * 0.7
        l.vz += (targetZ - l.z) * 0.12; l.vz *= 0.74; l.z += l.vz
        l.vry += (targetRy - l.ry) * 0.12; l.vry *= 0.74; l.ry += l.vry
        l.vrx += (targetRx - l.rx) * 0.12; l.vrx *= 0.74; l.rx += l.vrx
        l.mesh.position.z = l.z + (1 - e) * -0.5
        l.mesh.rotation.y = l.ry + (1 - e) * (i % 2 ? 1.1 : -1.1)
        l.mesh.rotation.x = l.rx + (1 - e) * 0.35
        l.mesh.scale.setScalar(0.85 + 0.15 * e)
      })
      diamond.rotation.y = tilt.y * 1.5 + Math.sin(now * 0.0006) * 0.12
      diamond.rotation.x = tilt.x * 1.5

      // readability: where a letter sits behind text, it yields to its wireframe and the text brightens
      pivot.updateMatrixWorld(true)
      const hits = new Map<HTMLElement, boolean>()
      letters.forEach((l) => {
        const lr = screenRect(l.mesh)
        let over = false
        rects.forEach(({ r, k }) => {
          if (overlaps(lr, r, 2)) { over = true; if (l.yieldV > 0.15) hits.set(yieldEls[k], true) }
        })
        l.yieldV += ((over ? 1 : 0) - l.yieldV) * 0.12
        // never see-through: the letter stays at least half solid and only deepens in tone behind text
        l.mat.opacity = 1 - 0.4 * l.yieldV
        l.mat.color.copy(METAL).lerp(DEEP, 0.55 * l.yieldV)
        l.wireMat.opacity = 0.42 + 0.3 * l.yieldV + (scanning ? 0.18 : 0)
      })
      wireMats[wireMats.length - 1].opacity = 0.7
      yieldEls.forEach((el) => {
        const v = hits.get(el) === true
        if (covered.get(el) !== v) { covered.set(el, v); el.dataset.covered = v ? 'true' : 'false' }
      })

      renderer.render(scene, camera)
    }

    let last = performance.now()
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      if (!visible || document.hidden) { last = now; return }
      draw(now)
      last = now
    }
    void last

    const ro = new ResizeObserver(() => {
      layout()
      if (reduced) draw(performance.now() + 4000)
    })
    ro.observe(canvas)
    layout()
    document.fonts?.ready.then(() => { measure(); if (reduced) draw(performance.now() + 4000) })
    t0 = performance.now()
    if (reduced) {
      for (let i = 0; i < 40; i++) draw(performance.now() + 4000) // settle the yield blending
    } else {
      raf = requestAnimationFrame(loop)
    }
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting })
    io.observe(canvas)
    let lastTop = -1
    const remeasure = setInterval(() => {
      measure()
      const top = rects.length ? Math.min(...rects.map((x) => x.r.t)) : -1
      if (Math.abs(top - lastTop) > 4) { lastTop = top; layout() }
    }, 500)
    const onVis = () => { if (!document.hidden) { layout(); measure() } }
    document.addEventListener('visibilitychange', onVis)

    return () => {
      cancelAnimationFrame(raf)
      clearInterval(remeasure)
      document.removeEventListener('visibilitychange', onVis)
      ro.disconnect()
      io.disconnect()
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('click', onClick)
      scene.traverse((o) => (o as THREE.Mesh).geometry?.dispose?.())
      letters.forEach((l) => { l.mat.dispose(); l.wireMat.dispose() })
      goldMat.dispose(); dWireMat.dispose(); scanLineMat.dispose()
      envTex.dispose()
      pmrem.dispose()
      renderer.dispose()
    }
  }, [onFail])

  return <canvas ref={ref} aria-hidden="true" className="h-full w-full" style={{ touchAction: 'pan-y' }} />
}
