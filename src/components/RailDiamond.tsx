import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

// The gold "verified" diamond, as the marker that travels the left rail. It spins faster the faster you scroll.
export default function RailDiamond({ active }: { active: string }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const target = useRef(0)

  // where should the diamond sit for the active section?
  useEffect(() => {
    const place = () => {
      const tick = document.querySelector<HTMLElement>(`[data-tick="${active}"]`)
      if (tick) target.current = tick.getBoundingClientRect().top - 14
    }
    place()
    window.addEventListener('resize', place)
    document.addEventListener('visibilitychange', place)
    document.fonts?.ready.then(place)
    return () => { window.removeEventListener('resize', place); document.removeEventListener('visibilitychange', place) }
  }, [active])

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
    const S = 44
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(S, S, false)
    renderer.setClearColor(0x000000, 0)
    const scene = new THREE.Scene()
    const pmrem = new THREE.PMREMGenerator(renderer)
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = env
    const cam = new THREE.OrthographicCamera(-S / 2, S / 2, S / 2, -S / 2, 1, 200)
    cam.position.z = 100
    const mat = new THREE.MeshPhysicalMaterial({ color: 0xd1a94f, metalness: 1, roughness: 0.22 })
    const geo = new THREE.BoxGeometry(15, 15, 13)
    const mesh = new THREE.Mesh(geo, mat)
    mesh.rotation.z = Math.PI / 4
    scene.add(mesh)
    const light = new THREE.DirectionalLight(0xffffff, 1.4)
    light.position.set(2, 3, 5)
    scene.add(light)

    let y = target.current
    let vy = 0
    let spin = 0.4
    let lastScroll = window.scrollY
    let raf = 0
    canvas.style.transform = `translateY(${y}px)`

    const frame = () => {
      raf = requestAnimationFrame(frame)
      const dy = target.current - y
      vy += dy * 0.05
      vy *= 0.78
      y += vy
      const sv = Math.abs(window.scrollY - lastScroll)
      lastScroll = window.scrollY
      spin += (Math.min(sv * 0.02, 0.28) + Math.abs(vy) * 0.01 - spin + 0.006) * 0.08
      mesh.rotation.y += spin
      mesh.rotation.x = Math.sin(performance.now() * 0.0006) * 0.2
      canvas.style.transform = `translateY(${y.toFixed(1)}px)`
      renderer.render(scene, cam)
    }
    if (reduced) {
      mesh.rotation.y = 0.6
      mesh.rotation.x = 0.15
      const snap = () => { canvas.style.transform = `translateY(${target.current}px)`; renderer.render(scene, cam) }
      snap()
      const id = setInterval(snap, 400)
      return () => { clearInterval(id); renderer.dispose() }
    }
    frame()
    return () => {
      cancelAnimationFrame(raf)
      geo.dispose(); mat.dispose(); env.dispose(); pmrem.dispose(); renderer.dispose()
    }
  }, [])

  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed left-[10px] top-0 z-50 hidden lg:block" style={{ width: 44, height: 44 }} />
}
