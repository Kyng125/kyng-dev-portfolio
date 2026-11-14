import Rail from './components/Rail'
import Hero from './components/Hero'
import CaseFiles from './components/CaseFiles'
import { Also, Method, Contact } from './components/Rest'

export default function App() {
  return (
    <>
      <a href="#work" className="skip">Skip to case files</a>
      <Rail />
      <main className="lg:pl-16">
        <Hero />
        <CaseFiles />
        <Also />
        <Method />
        <Contact />
      </main>
    </>
  )
}
