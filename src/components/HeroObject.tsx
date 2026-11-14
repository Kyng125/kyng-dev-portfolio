import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

const SILVER = 0xc3c8d1
const BLUE = 0x4a7bff
const GOLD = 0xd1a94f

function buildGraph(radius: number) {
  const geo = new THREE.IcosahedronGeometry(radius, 1)
  const pos = geo.getAttribute('position')
  const key = (i: number) =>
    `${pos.getX(i).toFixed(3)},${pos.getY(i).toFixed(3)},${pos.getZ(i).toFixed(3)}`
  const index = new Map<string, number>()
  const verts: THREE.Vector3[] = []
  const id = (i: number) => {
    const k = key(i)
    let v = index.get(k)
    if (v === undefined) {
      v = verts.length
      index.set(k, v)
      verts.push(new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i)))
    }
    return v
  }
  const edges = new Map<string, [number, number]>()
  for (let t = 0; t < pos.count; t += 3) {
    const a = id(t), b = id(t + 1), c = id(t + 2)
    for (const [p, q] of [[a, b], [b, c], [c, a]] as const) {
      const k = p < q ? `${p}-${q}` : `${q}-${p}`
      if (!edges.has(k)) edges.set(k, [p, q])
    }
  }
  geo.dispose()
  return { verts, edges: [...edges.values()] }
}

export default function HeroObject() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
    } catch {
      return
    }
    renderer.setClearColor(0x000000, 0)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 0.9

    const scene = new THREE.Scene()
    const pmrem = new THREE.PMREMGenerator(renderer)
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = envTex

    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 50)
    camera.position.set(0, 0, 7.4)

    const root = new THREE.Group()
    scene.add(root)

    // Core: faceted brushed-silver solid
    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.78, 0),
      new THREE.MeshStandardMaterial({ color: SILVER, metalness: 1, roughness: 0.3, flatShading: true }),
    )
    root.add(core)

    // Lattice: nodes and hairline edges
    const { verts, edges } = buildGraph(1.85)
    const lineGeo = new THREE.BufferGeometry()
    const arr = new Float32Array(edges.length * 6)
    edges.forEach(([a, b], i) => {
      arr.set([verts[a].x, verts[a].y, verts[a].z, verts[b].x, verts[b].y, verts[b].z], i * 6)
    })
    lineGeo.setAttribute('position', new THREE.BufferAttribute(arr, 3))
    const lineMat = new THREE.LineBasicMaterial({ color: SILVER, transparent: true, opacity: 0.38 })
    const lines = new THREE.LineSegments(lineGeo, lineMat)
    root.add(lines)

    // spokes from core to a subset of nodes
    const spokeGeo = new THREE.BufferGeometry()
    const spokeArr: number[] = []
    verts.forEach((v, i) => {
      if (i % 2 === 0) spokeArr.push(0, 0, 0, v.x, v.y, v.z)
    })
    spokeGeo.setAttribute('position', new THREE.Float32BufferAttribute(spokeArr, 3))
    const spokes = new THREE.LineSegments(
      spokeGeo,
      new THREE.LineBasicMaterial({ color: SILVER, transparent: true, opacity: 0.12 }),
    )
    root.add(spokes)

    const nodeMesh = new THREE.InstancedMesh(
      new THREE.SphereGeometry(0.05, 16, 12),
      new THREE.MeshStandardMaterial({ color: SILVER, metalness: 1, roughness: 0.25 }),
      verts.length,
    )
    const m = new THREE.Matrix4()
    verts.forEach((v, i) => {
      m.setPosition(v)
      nodeMesh.setMatrixAt(i, m)
    })
    root.add(nodeMesh)

    // Gold ring: the verified mark
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.55, 0.007, 8, 220),
      new THREE.MeshStandardMaterial({ color: GOLD, metalness: 1, roughness: 0.28 }),
    )
    ring.rotation.set(Math.PI / 2.35, 0.25, 0)
    root.add(ring)
    const goldNode = new THREE.Mesh(
      new THREE.SphereGeometry(0.085, 20, 16),
      new THREE.MeshStandardMaterial({ color: GOLD, metalness: 1, roughness: 0.2, emissive: GOLD, emissiveIntensity: 0.18 }),
    )
    ring.add(goldNode)

    // Blue packets travelling along edges
    const packetCount = 9
    const packets = new THREE.InstancedMesh(
      new THREE.SphereGeometry(0.045, 12, 10),
      new THREE.MeshBasicMaterial({ color: BLUE }),
      packetCount,
    )
    root.add(packets)
    const state = Array.from({ length: packetCount }, (_, i) => ({
      e: Math.floor(Math.random() * edges.length),
      t: (i / packetCount) % 1,
      s: 0.12 + Math.random() * 0.18,
      flip: Math.random() > 0.5,
    }))

    // Lights give the brushed look some direction
    const key = new THREE.DirectionalLight(0xffffff, 1.4)
    key.position.set(3, 4, 5)
    scene.add(key)
    const rim = new THREE.DirectionalLight(0x6f94ff, 0.9)
    rim.position.set(-4, -1, -3)
    scene.add(rim)

    const target = { x: 0, y: 0 }
    const current = { x: 0, y: 0 }
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      target.x = ((e.clientX - (r.left + r.width / 2)) / Math.max(r.width, 1)) * 0.7
      target.y = ((e.clientY - (r.top + r.height / 2)) / Math.max(r.height, 1)) * 0.5
    }
    if (!reduced) window.addEventListener('pointermove', onMove, { passive: true })

    const resize = () => {
      const w = canvas.clientWidth, h = canvas.clientHeight
      if (!w || !h) return
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.position.z = w / h < 0.9 ? 9.2 : 8.2
      camera.updateProjectionMatrix()
    }
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    resize()

    const ease = (x: number) => 1 - Math.pow(1 - x, 4)
    const tmp = new THREE.Vector3()
    const dummy = new THREE.Matrix4()
    let visible = true
    let raf = 0
    const clock = new THREE.Clock()
    let intro = reduced ? 1 : 0

    const frame = () => {
      const dt = Math.min(clock.getDelta(), 0.05)
      const t = clock.elapsedTime
      // one orchestrated moment: the lattice assembles outward from the core
      if (intro < 1) intro = Math.min(1, intro + dt / 2.4)
      const k = ease(intro)
      core.scale.setScalar(0.3 + 0.7 * Math.min(1, k * 1.6))
      lines.scale.setScalar(0.2 + 0.8 * k)
      spokes.scale.setScalar(0.2 + 0.8 * k)
      nodeMesh.scale.setScalar(0.2 + 0.8 * k)
      lineMat.opacity = 0.38 * Math.min(1, k * 1.4)
      ring.scale.setScalar(0.6 + 0.4 * k)
      ;(ring.material as THREE.MeshStandardMaterial).opacity = 1
      packets.visible = intro > 0.7

      current.x += (target.x - current.x) * 0.06
      current.y += (target.y - current.y) * 0.06
      root.rotation.y = t * 0.14 + current.x * 1.4
      root.rotation.x = -0.25 + current.y * 1.1
      core.rotation.y = -t * 0.22
      goldNode.position.set(Math.cos(t * 0.5) * 2.55, Math.sin(t * 0.5) * 2.55, 0)

      packets.visible && state.forEach((p, i) => {
        p.t += dt * p.s
        if (p.t >= 1) {
          p.t = 0
          p.e = Math.floor(Math.random() * edges.length)
          p.flip = Math.random() > 0.5
        }
        const [a, b] = edges[p.e]
        const from = p.flip ? verts[b] : verts[a]
        const to = p.flip ? verts[a] : verts[b]
        tmp.lerpVectors(from, to, p.t)
        dummy.setPosition(tmp)
        packets.setMatrixAt(i, dummy)
      })
      packets.instanceMatrix.needsUpdate = true
      renderer.render(scene, camera)
    }

    const loop = () => {
      raf = requestAnimationFrame(loop)
      if (visible && !document.hidden) frame()
    }

    if (reduced) {
      // Static composition: a single considered frame, no loop
      root.rotation.set(-0.25, 0.6, 0)
      goldNode.position.set(Math.cos(0.9) * 2.55, Math.sin(0.9) * 2.55, 0)
      state.forEach((_, i) => {
        const [a, b] = edges[(i * 7) % edges.length]
        tmp.lerpVectors(verts[a], verts[b], 0.5)
        dummy.setPosition(tmp)
        packets.setMatrixAt(i, dummy)
      })
      packets.instanceMatrix.needsUpdate = true
      renderer.render(scene, camera)
    } else {
      loop()
    }

    const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting })
    io.observe(canvas)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      window.removeEventListener('pointermove', onMove)
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh
        mesh.geometry?.dispose?.()
        const mat = mesh.material as THREE.Material | THREE.Material[] | undefined
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose())
        else mat?.dispose?.()
      })
      envTex.dispose()
      pmrem.dispose()
      renderer.dispose()
    }
  }, [])

  return (
    <canvas
      ref={ref}
      role="img"
      aria-label="A rotating silver lattice with a gold ring and blue signals moving along its edges"
      className="h-full w-full"
    />
  )
}
