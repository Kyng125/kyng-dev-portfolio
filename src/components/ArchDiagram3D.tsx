import { useCallback, useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

const SILVER = 0xc3c8d1
const BLUE = 0x4a7bff
const GOLD = 0xd1a94f

interface Dev { id: string; label: string; pos: [number, number, number] }
const devs: Dev[] = [
  { id: 'laptop', label: 'Laptop', pos: [2.6, 0.7, 0.4] },
  { id: 'phone', label: 'Phone', pos: [-1.6, 1.1, 2.1] },
  { id: 'tablet', label: 'Tablet', pos: [-1.9, 0.5, -2.0] },
  { id: 'desktop', label: 'Desktop', pos: [1.2, -1.1, 2.5] },
  { id: 'phone2', label: 'Second phone', pos: [0.8, -1.5, -2.4] },
]

interface Sim {
  online: boolean[]
  queued: number[]
  start: number[] // offline session start (ms) when queued > 0
  recent: { i: number; start: number; end: number }[]
  conflict: number
  flash: number[] // 0..1 gold flash per device
  hubFlash: number
  burst: { i: number; dir: 1 | -1; t: number; gold: boolean }[]
}

const fresh = (): Sim => ({
  online: devs.map(() => true), queued: devs.map(() => 0), start: devs.map(() => 0), recent: [],
  conflict: 0, flash: devs.map(() => 0), hubFlash: 0, burst: [],
})

export default function ArchDiagram3D() {
  const wrap = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([])
  const sim = useRef<Sim>(fresh())
  const [ui, setUi] = useState({ online: sim.current.online.slice(), queued: sim.current.queued.slice(), conflicts: 0 })
  const [msg, setMsg] = useState('All five devices are online and in sync.')

  const publish = () => setUi({ online: sim.current.online.slice(), queued: sim.current.queued.slice(), conflicts: sim.current.conflict })

  const toggle = useCallback((i: number) => {
    const s = sim.current
    const now = performance.now()
    if (s.online[i]) {
      s.online[i] = false
      s.start[i] = 0
      setMsg(`${devs[i].label} is offline. Edits made on it will queue.`)
    } else {
      s.online[i] = true
      const n = s.queued[i]
      if (n > 0) {
        for (let k = 0; k < Math.min(n, 6); k++) s.burst.push({ i, dir: -1, t: -k * 0.16, gold: false })
        const mine = { i, start: s.start[i], end: now }
        const clash = s.recent.find((r) => r.i !== i && r.start < mine.end && mine.start < r.end && now - r.end < 25000)
        if (clash) {
          s.conflict += 1
          s.flash[i] = 1; s.flash[clash.i] = 1; s.hubFlash = 1
          s.burst.forEach((b) => { if (b.i === i) b.gold = true })
          setMsg(`${devs[i].label} and ${devs[clash.i].label} both edited while offline. The two changes collided and are flagged for review, not silently merged.`)
        } else setMsg(`${devs[i].label} is back. ${n} queued ${n === 1 ? 'edit' : 'edits'} synced.`)
        s.recent.push(mine)
        s.recent = s.recent.slice(-6)
        s.queued[i] = 0
      } else setMsg(`${devs[i].label} is back online. Nothing was waiting.`)
    }
    publish()
  }, [])

  const reset = () => { sim.current = fresh(); publish(); setMsg('Reset. All five devices are online and in sync.') }

  // offline devices accumulate edits over time
  useEffect(() => {
    const id = setInterval(() => {
      const s = sim.current
      let changed = false
      s.online.forEach((on, i) => {
        if (!on && s.queued[i] < 9) {
          if (s.queued[i] === 0) s.start[i] = performance.now()
          s.queued[i] += 1
          changed = true
        }
      })
      if (changed) publish()
    }, 1800)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const host = wrap.current
    if (!canvas || !host) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    } catch {
      return
    }
    renderer.setClearColor(0x000000, 0)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 0.85
    const scene = new THREE.Scene()
    const pmrem = new THREE.PMREMGenerator(renderer)
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = env
    scene.environmentIntensity = 0.5
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 60)
    camera.position.set(4.7, 2.9, 6.5)

    const controls = new OrbitControls(camera, canvas)
    controls.enableZoom = false
    controls.enablePan = false
    controls.enableDamping = true
    controls.autoRotate = !reduced
    controls.autoRotateSpeed = 0.45
    controls.minPolarAngle = Math.PI * 0.2
    controls.maxPolarAngle = Math.PI * 0.8
    canvas.style.touchAction = 'pan-y'
    controls.addEventListener('start', () => { controls.autoRotate = false })

    const machined = () => new THREE.MeshPhysicalMaterial({ color: 0x9aa1ad, metalness: 1, roughness: 0.26, anisotropy: 0.6, clearcoat: 0.2 })
    const vecs = devs.map((d) => new THREE.Vector3(...d.pos))
    const hubMat = machined()
    const hub = new THREE.Mesh(new THREE.OctahedronGeometry(0.55, 0), hubMat)
    const hubEdge = new THREE.LineSegments(new THREE.EdgesGeometry(hub.geometry), new THREE.LineBasicMaterial({ color: 0xf3f4f6, transparent: true, opacity: 0.55 }))
    hub.add(hubEdge)
    scene.add(hub)

    const boxGeo = new THREE.BoxGeometry(0.5, 0.34, 0.34)
    const edgeGeo = new THREE.EdgesGeometry(boxGeo)
    const devMeshes = devs.map((_, i) => {
      const m = machined()
      const mesh = new THREE.Mesh(boxGeo, m)
      const edge = new THREE.LineSegments(edgeGeo, new THREE.LineBasicMaterial({ color: 0xf3f4f6, transparent: true, opacity: 0.5 }))
      mesh.add(edge)
      mesh.position.copy(vecs[i])
      mesh.lookAt(0, 0, 0)
      mesh.userData.i = i
      scene.add(mesh)
      return { mesh, m, edge }
    })

    const lines = devs.map((_, i) => {
      const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), vecs[i]])
      const mat = new THREE.LineDashedMaterial({ color: SILVER, dashSize: 0.14, gapSize: 0.1, transparent: true, opacity: 0.5 })
      const l = new THREE.Line(geo, mat)
      l.computeLineDistances()
      scene.add(l)
      return l
    })

    const pkGeo = new THREE.SphereGeometry(0.05, 10, 8)
    const pkMat = { blue: new THREE.MeshBasicMaterial({ color: BLUE }), gold: new THREE.MeshBasicMaterial({ color: GOLD }) }
    const idle = devs.map((_, i) => ({ t: i * 0.2, s: 0.18 + i * 0.02, mesh: new THREE.Mesh(pkGeo, pkMat.blue) }))
    idle.forEach((p) => scene.add(p.mesh))
    const burstMeshes: THREE.Mesh[] = []

    const ground = new THREE.Mesh(new THREE.RingGeometry(3.28, 3.3, 96), new THREE.MeshBasicMaterial({ color: SILVER, transparent: true, opacity: 0.22, side: THREE.DoubleSide }))
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -2.2
    scene.add(ground)
    const key = new THREE.DirectionalLight(0xffffff, 1.0)
    key.position.set(4, 6, 4)
    scene.add(key)

    const resize = () => {
      const w = host.clientWidth, h = host.clientHeight
      if (!w || !h) return
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      draw()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(host)

    // click a device in the scene (ignore drags)
    const ray = new THREE.Raycaster()
    const ndc = new THREE.Vector2()
    let down = { x: 0, y: 0 }
    const onDown = (e: PointerEvent) => { down = { x: e.clientX, y: e.clientY } }
    const onUp = (e: PointerEvent) => {
      if (Math.hypot(e.clientX - down.x, e.clientY - down.y) > 5) return
      const r = canvas.getBoundingClientRect()
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
      ray.setFromCamera(ndc, camera)
      const hit = ray.intersectObjects(devMeshes.map((d) => d.mesh), false)[0]
      if (hit) toggle(hit.object.userData.i as number)
    }
    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointerup', onUp)

    const proj = new THREE.Vector3()
    const place = () => {
      const w = host.clientWidth, h = host.clientHeight
      devs.forEach((_, i) => {
        const el = labelRefs.current[i]
        if (!el) return
        proj.copy(vecs[i]).project(camera)
        el.style.transform = `translate(${(proj.x * 0.5 + 0.5) * w}px, ${(-proj.y * 0.5 + 0.5) * h}px) translate(-50%, 20px)`
      })
    }

    const gold = new THREE.Color(GOLD)
    const base = new THREE.Color(0x9aa1ad)
    const dark = new THREE.Color(0x474c55)
    let visible = true
    const clock = { last: performance.now(), getDelta() { const n = performance.now(); const d = (n - this.last) / 1000; this.last = n; return d } }
    let raf = 0
    function draw() {
      const dt = Math.min(clock.getDelta(), 0.05)
      const s = sim.current
      hub.rotation.y += reduced ? 0 : dt * 0.4
      s.hubFlash = Math.max(0, s.hubFlash - dt * 0.5)
      hubMat.color.copy(base).lerp(gold, s.hubFlash)
      devMeshes.forEach((d, i) => {
        s.flash[i] = Math.max(0, s.flash[i] - dt * 0.35)
        const target = s.online[i] ? base : dark
        d.m.color.copy(target).lerp(gold, s.flash[i])
        d.m.roughness = s.online[i] ? 0.26 : 0.55
        ;(d.edge.material as THREE.LineBasicMaterial).opacity = s.online[i] ? 0.55 : 0.25
        const lm = lines[i].material as THREE.LineDashedMaterial
        lm.opacity = s.online[i] ? 0.5 : 0.18
        d.mesh.position.y = vecs[i].y + (s.online[i] ? 0 : -0.08)
      })
      idle.forEach((p, i) => {
        p.mesh.visible = s.online[i]
        if (!s.online[i]) return
        p.t = (p.t + dt * p.s) % 1
        const k = i % 2 ? p.t : 1 - p.t
        p.mesh.position.lerpVectors(new THREE.Vector3(), vecs[i], reduced ? 0.5 : k)
      })
      // sync bursts
      s.burst.forEach((b) => { b.t += dt * 0.9 })
      s.burst = s.burst.filter((b) => b.t < 1)
      while (burstMeshes.length < s.burst.length) { const m = new THREE.Mesh(pkGeo, pkMat.blue); m.scale.setScalar(1.5); scene.add(m); burstMeshes.push(m) }
      burstMeshes.forEach((m, k) => {
        const b = s.burst[k]
        m.visible = !!b && b.t > 0
        if (!b || b.t <= 0) return
        m.material = b.gold ? pkMat.gold : pkMat.blue
        m.position.lerpVectors(vecs[b.i], new THREE.Vector3(), Math.min(b.t, 1))
      })
      controls.update()
      renderer.render(scene, camera)
      place()
    }
    const loop = () => {
      raf = requestAnimationFrame(loop)
      if (visible && !document.hidden) draw()
    }
    resize()
    if (reduced) {
      controls.addEventListener('change', draw)
      const id = setInterval(draw, 300)
      raf = id as unknown as number
    } else loop()

    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting })
    io.observe(host)

    return () => {
      cancelAnimationFrame(raf)
      if (reduced) clearInterval(raf as unknown as number)
      ro.disconnect(); io.disconnect()
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointerup', onUp)
      controls.dispose()
      scene.traverse((o) => {
        const m = o as THREE.Mesh
        m.geometry?.dispose?.()
        const mat = m.material as THREE.Material | THREE.Material[] | undefined
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose())
        else mat?.dispose?.()
      })
      env.dispose(); pmrem.dispose(); renderer.dispose()
    }
  }, [toggle])

  return (
    <div>
      <div ref={wrap} className="relative h-[380px] w-full overflow-hidden hair sm:h-[440px]">
        <canvas
          ref={canvasRef}
          className="h-full w-full cursor-grab active:cursor-grabbing"
          role="img"
          aria-label="Orbitable simulation of five devices syncing through one lab node. Use the buttons below the diagram to take devices offline and bring them back."
        />
        <div className="pointer-events-none absolute inset-0 text-xs text-silver" aria-hidden="true">
          {devs.map((d, i) => (
            <span key={d.id} ref={(el) => { labelRefs.current[i] = el }} className="absolute left-0 top-0 whitespace-nowrap rounded-full bg-black/70 px-2 py-0.5">
              {d.label}{ui.queued[i] > 0 ? ` · ${ui.queued[i]} queued` : ''}
            </span>
          ))}
        </div>
        <p className="pointer-events-none absolute bottom-3 left-4 text-xs text-steel">Drag to orbit. Click a device to take it offline.</p>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {devs.map((d, i) => (
          <button
            key={d.id}
            type="button"
            aria-pressed={!ui.online[i]}
            onClick={() => toggle(i)}
            className={`border px-3 py-1.5 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue ${ui.online[i] ? 'border-line text-silver hover:text-bone' : 'border-silver text-bone'}`}
          >
            {d.label}: {ui.online[i] ? 'online' : `offline${ui.queued[i] ? `, ${ui.queued[i]} queued` : ''}`}
          </button>
        ))}
        <button type="button" onClick={reset} className="px-3 py-1.5 text-sm text-steel underline decoration-line underline-offset-4 hover:text-bone focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue">
          Reset
        </button>
      </div>
      <p role="status" aria-live="polite" className="mt-3 min-h-[2.75rem] text-sm text-silver">
        {msg}{ui.conflicts > 0 && <span className="text-gold"> Conflicts flagged: {ui.conflicts}.</span>}
      </p>
      <p className="mt-1 text-xs text-steel">An illustrative simulation of the sync idea, not live traffic. Gold marks two edits that collided.</p>
    </div>
  )
}
