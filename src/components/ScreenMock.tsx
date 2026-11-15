import type { CaseFile } from '../data/projects'

type Id = CaseFile['id']

function Aqua() {
  return (
    <>
      <rect className="shape f-panel" x="16" y="16" width="136" height="268" rx="6" />
      <rect className="shape f-panel" x="40" y="44" width="88" height="190" rx="4" />
      <rect className="shape f-blue aq-level" x="41" y="120" width="86" height="113" rx="3" />
      <path className="shape f-stroke-silver" d="M41 120 q 21 -8 43 0 t 43 0" />
      <text className="only-r t-big" x="40" y="262">62%</text>
      <rect className="shape f-panel" x="168" y="16" width="296" height="130" rx="6" />
      <polyline className="shape f-stroke-blue aq-trend" fill="none" points="184,120 220,112 256,116 292,92 328,84 364,70 400,58 448,44" />
      <rect className="shape f-line" x="184" y="30" width="80" height="6" rx="3" />
      <rect className="shape f-panel" x="168" y="158" width="140" height="58" rx="6" />
      <rect className="shape f-gold" x="182" y="172" width="8" height="8" rx="4" />
      <rect className="shape f-line" x="198" y="173" width="90" height="6" rx="3" />
      <rect className="shape f-line" x="182" y="192" width="110" height="6" rx="3" />
      <rect className="shape f-panel" x="324" y="158" width="140" height="58" rx="6" />
      <rect className="shape f-silver" x="338" y="172" width="8" height="8" rx="4" />
      <rect className="shape f-line" x="354" y="173" width="80" height="6" rx="3" />
      <rect className="shape f-line" x="338" y="192" width="100" height="6" rx="3" />
      <rect className="shape f-panel" x="168" y="228" width="296" height="56" rx="6" />
      <rect className="shape f-line" x="184" y="244" width="120" height="6" rx="3" />
      <rect className="shape f-line" x="184" y="262" width="200" height="6" rx="3" />
    </>
  )
}

function Pocket() {
  return (
    <>
      <rect className="shape f-panel" x="16" y="16" width="448" height="46" rx="6" />
      <rect className="shape f-blue" x="32" y="31" width="16" height="16" rx="8" />
      <rect className="shape f-line" x="58" y="36" width="130" height="6" rx="3" />
      <rect className="shape f-panel" x="360" y="28" width="88" height="22" rx="11" />
      <text className="only-r" x="376" y="43">Synced</text>
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect className="shape f-panel" x="16" y={76 + i * 52} width="290" height="44" rx="6" />
          <rect className="shape f-silver" x="30" y={90 + i * 52} width="16" height="16" rx="3" />
          <rect className="shape f-line" x="58" y={92 + i * 52} width={120 - i * 12} height="6" rx="3" />
          <rect className="shape f-line" x="58" y={105 + i * 52} width="70" height="5" rx="2" />
        </g>
      ))}
      <rect className="shape f-panel" x="318" y="76" width="146" height="200" rx="6" />
      <rect className="shape f-gold" x="332" y="92" width="10" height="10" rx="5" />
      <rect className="shape f-line" x="350" y="93" width="88" height="6" rx="3" />
      <rect className="shape f-line" x="332" y="120" width="116" height="30" rx="4" />
      <rect className="shape f-blue" x="332" y="164" width="116" height="30" rx="4" />
      <rect className="shape f-line" x="332" y="214" width="60" height="22" rx="11" />
      <rect className="shape f-blue" x="402" y="214" width="46" height="22" rx="11" />
    </>
  )
}

function Cloud() {
  return (
    <>
      <rect className="shape f-panel" x="16" y="16" width="448" height="54" rx="6" />
      <rect className="shape f-line" x="32" y="36" width="150" height="8" rx="4" />
      <rect className="shape f-panel" x="372" y="26" width="76" height="34" rx="6" />
      <text className="only-r t-big" x="384" y="50">12:41</text>
      <rect className="shape f-panel" x="16" y="84" width="300" height="200" rx="6" />
      <rect className="shape f-line" x="32" y="102" width="240" height="8" rx="4" />
      <rect className="shape f-line" x="32" y="118" width="190" height="8" rx="4" />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect className={`shape ${i === 1 ? 'f-stroke-blue' : 'f-panel'}`} x="32" y={146 + i * 42} width="268" height="32" rx="5" />
          <rect className="shape f-silver" x="44" y={157 + i * 42} width="10" height="10" rx="5" />
          <rect className="shape f-line" x="66" y={158 + i * 42} width={150 - i * 20} height="7" rx="3" />
        </g>
      ))}
      <rect className="shape f-panel" x="328" y="84" width="136" height="94" rx="6" />
      <rect className="shape f-blue" x="342" y="100" width="64" height="8" rx="4" />
      <rect className="shape f-line" x="342" y="122" width="100" height="6" rx="3" />
      <rect className="shape f-line" x="342" y="138" width="84" height="6" rx="3" />
      <rect className="shape f-gold" x="342" y="154" width="42" height="12" rx="6" />
      <rect className="shape f-panel" x="328" y="190" width="136" height="94" rx="6" />
      <rect className="shape f-silver" x="342" y="204" width="40" height="40" rx="20" />
      <rect className="shape f-line" x="392" y="212" width="56" height="6" rx="3" />
      <rect className="shape f-line" x="392" y="228" width="40" height="6" rx="3" />
    </>
  )
}

function Wifi() {
  const bars = [30, 52, 38, 76, 44, 92, 58, 70, 36, 48]
  return (
    <>
      <rect className="shape f-panel" x="16" y="16" width="140" height="62" rx="6" />
      <rect className="shape f-gold" x="30" y="30" width="10" height="10" rx="5" />
      <rect className="shape f-line" x="48" y="31" width="64" height="6" rx="3" />
      <text className="only-r t-big" x="30" y="66">4</text>
      <rect className="shape f-panel" x="170" y="16" width="140" height="62" rx="6" />
      <rect className="shape f-blue" x="184" y="30" width="10" height="10" rx="5" />
      <rect className="shape f-line" x="202" y="31" width="64" height="6" rx="3" />
      <text className="only-r t-big" x="184" y="66">17</text>
      <rect className="shape f-panel" x="324" y="16" width="140" height="62" rx="6" />
      <rect className="shape f-silver" x="338" y="30" width="10" height="10" rx="5" />
      <rect className="shape f-line" x="356" y="31" width="64" height="6" rx="3" />
      <text className="only-r t-big" x="338" y="66">9</text>
      <rect className="shape f-panel" x="16" y="92" width="210" height="192" rx="6" />
      {bars.map((h, i) => (
        <rect key={i} className={`shape ${i === 5 ? 'f-gold' : 'f-blue'}`} x={30 + i * 19} y={268 - h} width="12" height={h} rx="2" />
      ))}
      <rect className="shape f-panel" x="240" y="92" width="224" height="192" rx="6" />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <rect className={`shape ${i === 0 ? 'f-gold' : 'f-silver'}`} x="254" y={108 + i * 34} width="8" height="8" rx="4" />
          <rect className="shape f-line" x="272" y={108 + i * 34} width={140 - (i % 3) * 20} height="6" rx="3" />
          <rect className="shape f-line" x="272" y={121 + i * 34} width="90" height="5" rx="2" />
        </g>
      ))}
    </>
  )
}

const map: Record<Id, () => React.ReactElement> = { aquasense: Aqua, pocket: Pocket, cloudlearn: Cloud, wifiguard: Wifi }

export default function ScreenMock({ id }: { id: Id }) {
  const Body = map[id]
  return (
    <svg viewBox="0 0 480 300" aria-hidden="true">
      <Body />
    </svg>
  )
}
