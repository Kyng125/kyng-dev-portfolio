import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

const SILVER = 0xc3c8d1
const BLUE = 0x4a7bff
const GOLD = 0xd1a94f

interface NodeDef {
  id: string
  label: string
  pos: [number, number, number]
  kind: 'hub' | 'online' | 'offline' | 'conflict'
}

const nodes: NodeDef[] = [
  { id: 'hub', label: 'Lab node', pos: [0, 0, 0], kind: 'hub' },
  { id: 'a', label: 'Laptop', pos: [2.6, 0.7, 0.4], kind: 'online' },
  { id: 'b', label: 'Phone', pos: [-1.6, 1.1, 2.1], kind: 'conflict' },
  { id: 'c', label: 'Tablet', pos: [-1.9, 0.5, -2.0], kind: 'conflict' },
  { id: 'd', label: 'Phone, offline', pos: [0.8, -1.5, -2.4], kind: 'offline' },
  { id: 'e', label: 'Desktop', pos: [1.2, -1.1, 2.5], kind: 'online' },
]

export default function ArchDiagram3D() {
  const wrap = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([])

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
    const scene = new THREE.Scene()
    const pmrem = new THREE.PMREMGenerator(renderer)
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = env
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 60)
    camera.position.set(3.9, 2.4, 5.4)

    const controls = new OrbitControls(camera, canvas)
    controls.enableZoom = false
    controls.enablePan = false
    controls.enableDamping = true
    controls.autoRotate = !reduced
    controls.autoRotateSpeed = 0.5
    controls.minPolarAngle = Math.PI * 0.2
    controls.maxPolarAngle = Math.PI * 0.8
    canvas.style.touchAction = 'pan-y'
    const stopAuto = () => { controls.autoRotate = false }
    controls.addEventListener('start', stopAuto)

    const metal = (c: number, r = 0.3) => new THREE.MeshStandardMaterial({ color: c, metalness: 1, roughness: r })
    const meshes: THREE.Object3D[] = []
    const vecs = nodes.map((n) => new THREE.Vector3(...n.pos))

    nodes.forEach((n, i) => {
      let mesh: THREE.Mesh
      if (n.kind === 'hub') mesh = new THREE.Mesh(new THREE.OctahedronGeometry(0.5, 0), metal(SILVER, 0.28))
      else if (n.kind === 'offline')
        mesh = new THREE.Mesh(new THREE.SphereGeometry(0.2, 24, 18), new THREE.MeshStandardMaterial({ color: SILVER, metalness: 0.6, roughness: 0.6, transparent: true, opacity: 0.35, wireframe: true }))
      else if (n.kind === 'conflict') mesh = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 18), metal(GOLD, 0.25))
      else mesh = new THREE.Mesh(new THREE.SphereGeometry(0.2, 24, 18), metal(SILVER, 0.25))
      mesh.position.copy(vecs[i])
      scene.add(mesh)
      meshes.push(mesh)
    })

    // links
    const packets: { mesh: THREE.Mesh; i: number; t: number; s: number; dir: 1 | -1 }[] = []
    nodes.forEach((n, i) => {
      if (i === 0) return
      const geo = new THREE.BufferGeometry().setFromPoints([vecs[0], vecs[i]])
      const dashed = n.kind === 'offline'
      const mat = dashed
        ? new THREE.LineDashedMaterial({ color: SILVER, dashSize: 0.12, gapSize: 0.12, transparent: true, opacity: 0.4 })
        : new THREE.LineBasicMaterial({ color: SILVER, transparent: true, opacity: 0.45 })
      const line = new THREE.Line(geo, mat)
      if (dashed) line.computeLineDistances()
      scene.add(line)
      if (!dashed) {
        const pk = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 8), new THREE.MeshBasicMaterial({ color: n.kind === 'conflict' ? GOLD : BLUE }))
        scene.add(pk)
        packets.push({ mesh: pk, i, t: Math.random(), s: 0.2 + Math.random() * 0.15, dir: i % 2 ? 1 : -1 })
      }
    })

    // faint ground ring for orientation
    const ground = new THREE.Mesh(new THREE.RingGeometry(3.28, 3.3, 96), new THREE.MeshBasicMaterial({ color: SILVER, transparent: true, opacity: 0.25, side: THREE.DoubleSide }))
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -2.2
    scene.add(ground)

    const key = new THREE.DirectionalLight(0xffffff, 1.2)
    key.position.set(4, 6, 4)
    scene.add(key)

    const resize = () => {
      const w = host.clientWidth, h = host.clientHeight
      if (!w || !h) return
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(host)
    resize()

    const proj = new THREE.Vector3()
    const place = () => {
      const w = host.clientWidth, h = host.clientHeight
      nodes.forEach((n, i) => {
        const el = labelRefs.current[i]
        if (!el) return
        proj.copy(vecs[i]).project(camera)
        const x = (proj.x * 0.5 + 0.5) * w
        const y = (-proj.y * 0.5 + 0.5) * h
        el.style.transform = `translate(${x}px, ${y}px) translate(-50%, ${n.kind === 'hub' ? '24px' : '18px'})`
      })
    }

    let visible = true
    const clock = new THREE.Clock()
    let raf = 0
    const draw = () => {
      const dt = Math.min(clock.getDelta(), 0.05)
      packets.forEach((p) => {
        p.t += dt * p.s
        if (p.t > 1) p.t = 0
        const k = p.dir === 1 ? p.t : 1 - p.t
        p.mesh.position.lerpVectors(vecs[0], vecs[p.i], k)
      })
      meshes[0].rotation.y += dt * 0.4
      controls.update()
      renderer.render(scene, camera)
      place()
    }
    const loop = () => {
      raf = requestAnimationFrame(loop)
      if (visible && !document.hidden) draw()
    }
    if (reduced) {
      packets.forEach((p) => p.mesh.position.lerpVectors(vecs[0], vecs[p.i], 0.5))
      controls.addEventListener('change', draw)
      draw()
    } else loop()

    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting })
    io.observe(host)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      controls.dispose()
      scene.traverse((o) => {
        const m = o as THREE.Mesh
        m.geometry?.dispose?.()
        const mat = m.material as THREE.Material | THREE.Material[] | undefined
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose())
        else mat?.dispose?.()
      })
      env.dispose()
      pmrem.dispose()
      renderer.dispose()
    }
  }, [])

  return (
    <div ref={wrap} className="relative h-[380px] w-full overflow-hidden hair sm:h-[440px]">
      <canvas
        ref={canvasRef}
        className="h-full w-full cursor-grab active:cursor-grabbing"
        role="img"
        aria-label="Orbitable diagram: five devices sync through one lab node. Edits from the phone and tablet that collide are marked in gold, and one offline phone queues changes."
      />
      <div className="pointer-events-none absolute inset-0 text-xs text-silver" aria-hidden="true">
        {nodes.map((n, i) => (
          <span
            key={n.id}
            ref={(el) => { labelRefs.current[i] = el }}
            className="absolute left-0 top-0 whitespace-nowrap rounded-full bg-black/70 px-2 py-0.5"
          >
            {n.label}
          </span>
        ))}
      </div>
      <p className="pointer-events-none absolute bottom-3 left-4 text-xs text-steel">Drag to orbit</p>
    </div>
  )
}
