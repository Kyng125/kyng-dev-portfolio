import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import glyphData from '../data/kyngGlyphs.json'

type Cmd = (string | number)[]
const TRACK = -0.012 // tracking in em
const GOLD = 0xd1a94f

function shapesFor(cmds: Cmd[]) {
  const sp = new THREE.ShapePath()
  for (const c of cmds) {
    const [t, ...n] = c as [string, ...number[]]
    const u = (v: number) => v / glyphData.upm
    if (t === 'M') sp.moveTo(u(n[0]), u(n[1]))
    else if (t === 'L') sp.lineTo(u(n[0]), u(n[1]))
    else if (t === 'Q') sp.quadraticCurveTo(u(n[0]), u(n[1]), u(n[2]), u(n[3]))
    else if (t === 'C') sp.bezierCurveTo(u(n[0]), u(n[1]), u(n[2]), u(n[3]), u(n[4]), u(n[5]))
  }
  return sp.toShapes()
}

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

    const scene = new THREE.Scene()
    const pmrem = new THREE.PMREMGenerator(renderer)
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = envTex
    scene.environmentIntensity = 0.7

    const FOV = 28
    const camera = new THREE.PerspectiveCamera(FOV, 1, 10, 8000)

    // Letters: extruded brushed silver, each its own mesh so they can answer the cursor
    const silver = new THREE.MeshPhysicalMaterial({
      color: 0x8a919c,
      metalness: 1,
      roughness: 0.3,
      anisotropy: 0.7,
      anisotropyRotation: 0.25,
      clearcoat: 0.15,
      clearcoatRoughness: 0.4,
    })
    const goldMat = new THREE.MeshPhysicalMaterial({ color: GOLD, metalness: 1, roughness: 0.22 })

    const pivot = new THREE.Group() // tilts as one body
    scene.add(pivot)

    interface Letter { mesh: THREE.Mesh; baseX: number; baseY: number; z: number; rx: number; ry: number; vz: number; vrx: number; vry: number }
    const letters: Letter[] = []
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
      const mesh = new THREE.Mesh(geo, silver)
      const baseX = penX + cx
      mesh.position.set(baseX, cy, 0)
      pivot.add(mesh)
      letters.push({ mesh, baseX, baseY: cy, z: 0, rx: 0, ry: 0, vz: 0, vrx: 0, vry: 0 })
      penX += g.adv / glyphData.upm + TRACK
    })
    const textW = penX - TRACK
    // Verified mark: a small gold diamond where a full stop would sit
    const dSize = 0.075
    const diamond = new THREE.Mesh(new THREE.BoxGeometry(dSize, dSize, dSize * 0.9), goldMat)
    diamond.rotation.z = Math.PI / 4
    diamond.position.set(textW + 0.07, dSize * 0.72, 0)
    pivot.add(diamond)
    const fullW = textW + 0.07 + dSize
    const asc = 0.66
    const desc = 0.22
    const centerEm = { x: fullW / 2, y: (asc - desc) / 2 }
    pivot.children.forEach((c) => c.position.x -= centerEm.x) // center the word on the pivot
    pivot.children.forEach((c) => c.position.y -= centerEm.y)
    letters.forEach((l) => { l.baseX -= centerEm.x; l.baseY -= centerEm.y })

    // Lights: a travelling key that the cursor drives, a cool rim for the edges
    const key = new THREE.PointLight(0xffffff, 0, 0, 0)
    scene.add(key)
    const rim = new THREE.DirectionalLight(0x5a86ff, 0.55)
    rim.position.set(-1, 0.6, -0.4)
    scene.add(rim)
    const fill = new THREE.DirectionalLight(0xffffff, 0.35)
    fill.position.set(0.4, 1, 1)
    scene.add(fill)

    // layout in pixels: 1 world unit = 1 css px at z = 0
    let W = 1, H = 1, em = 100
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
      const nameW = Math.min(W - padLeft - 24, 1000, maxByH)
      em = nameW / fullW
      pivot.scale.setScalar(em)
      const nameH = (asc + desc) * em
      const cx = padLeft + nameW / 2
      const cy = Math.max(104 + nameH / 2, H * 0.3)
      pivot.position.set(cx - W / 2, H / 2 - cy, 0)
      key.distance = 0
      key.intensity = 0
    }

    // pointer state
    const ptr = { x: 0, y: 0, nx: 0, ny: 0, active: false, last: -1e9 }
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      ptr.x = e.clientX - r.left
      ptr.y = e.clientY - r.top
      ptr.nx = Math.max(-1, Math.min(1, (ptr.x / r.width) * 2 - 1))
      ptr.ny = Math.max(-1, Math.min(1, (ptr.y / r.height) * 2 - 1))
      ptr.active = ptr.y >= 0 && ptr.y <= r.height
      ptr.last = performance.now()
    }
    const onLeave = () => { ptr.last = -1e9 }
    if (!reduced) {
      window.addEventListener('pointermove', onMove, { passive: true })
      document.addEventListener('pointerleave', onLeave)
    }

    const tilt = { x: 0, y: 0 }
    const lightPos = new THREE.Vector3()
    const lightTarget = new THREE.Vector3()
    const ease = (x: number) => 1 - Math.pow(1 - x, 4)
    let t0 = performance.now()
    let raf = 0
    let visible = true

    const idleLight = (t: number, out: THREE.Vector3) => {
      // one slow pass across the word every ~14s so the metal keeps catching light
      const s = (Math.sin(t * 0.00045) + 1) / 2
      out.set((s - 0.5) * W * 0.55 + pivot.position.x, pivot.position.y + em * 0.25, em * 1.1)
    }

    const draw = (now: number, dt: number) => {
      const t = now - t0
      const intro = reduced ? 1 : Math.min(1, t / 2600)

      // light follows the cursor, otherwise drifts
      const live = now - ptr.last < 2500 && !reduced
      if (live) lightTarget.set(ptr.x - W / 2, H / 2 - ptr.y, em * 0.9)
      else if (reduced) lightTarget.set(pivot.position.x - em * 0.5, pivot.position.y + em * 0.3, em * 1.1)
      else idleLight(now, lightTarget)
      lightPos.lerp(lightTarget, live ? 0.2 : 0.04)
      key.position.copy(lightPos)
      key.intensity = (live ? 2.4 : 1.3) * Math.min(1, intro * 1.5)
      key.distance = 0
      key.decay = 0

      // body tilt: toward the cursor, clearly visible
      const tx = live ? -ptr.ny * 0.3 : 0
      const ty = live ? ptr.nx * 0.5 : 0
      tilt.x += (tx - tilt.x) * 0.07
      tilt.y += (ty - tilt.y) * 0.07
      pivot.rotation.x = tilt.x
      pivot.rotation.y = tilt.y

      // per-letter response: letters near the cursor rise toward it and lean away
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
        // damped spring
        l.vz += (targetZ - l.z) * 0.12; l.vz *= 0.74; l.z += l.vz
        l.vry += (targetRy - l.ry) * 0.12; l.vry *= 0.74; l.ry += l.vry
        l.vrx += (targetRx - l.rx) * 0.12; l.vrx *= 0.74; l.rx += l.vrx
        l.mesh.position.z = l.z + (1 - e) * -0.5
        l.mesh.rotation.y = l.ry + (1 - e) * (i % 2 ? 1.1 : -1.1)
        l.mesh.rotation.x = l.rx + (1 - e) * 0.35
        l.mesh.scale.setScalar(0.85 + 0.15 * e)
      })
      // the diamond tracks the light slightly
      diamond.rotation.y = tilt.y * 1.5 + Math.sin(now * 0.0006) * 0.12
      diamond.rotation.x = tilt.x * 1.5
      void dt
      renderer.render(scene, camera)
    }

    let last = performance.now()
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      if (!visible || document.hidden) { last = now; return }
      draw(now, now - last)
      last = now
    }

    const ro = new ResizeObserver(() => {
      layout()
      if (reduced) draw(performance.now() + 4000, 16)
    })
    ro.observe(canvas)
    layout()
    t0 = performance.now()
    if (reduced) {
      // a single considered frame, no loop and no cursor response
      draw(performance.now() + 4000, 16)
    } else {
      raf = requestAnimationFrame(loop)
    }
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting })
    io.observe(canvas)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
      scene.traverse((o) => (o as THREE.Mesh).geometry?.dispose?.())
      silver.dispose()
      goldMat.dispose()
      envTex.dispose()
      pmrem.dispose()
      renderer.dispose()
    }
  }, [onFail])

  return <canvas ref={ref} aria-hidden="true" className="h-full w-full" style={{ touchAction: 'pan-y' }} />
}
