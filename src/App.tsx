import { HashRouter, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { Accueil } from './pages/Accueil'
import { ChapitrePage } from './pages/Chapitre'
import { Session } from './pages/Session'
import { Tableau } from './pages/Tableau'
import { Reglages } from './pages/Reglages'
import { Cahier } from './pages/Cahier'

function Onglets() {
  const loc = useLocation()
  if (loc.pathname.startsWith('/jouer')) return null
  const lien = ({ isActive }: { isActive: boolean }) =>
    `flex flex-1 flex-col items-center gap-0.5 py-2 text-xs ${isActive ? 'font-semibold text-[var(--ink)]' : 'text-[var(--muted)]'}`
  return (
    <nav className="pb-safe fixed inset-x-0 bottom-0 z-20 border-t border-[var(--line)] bg-[var(--bg)]/95 backdrop-blur">
      <div className="mx-auto flex max-w-3xl">
        <NavLink to="/" end className={lien}>
          <span className="text-xl">♟</span>Jouer
        </NavLink>
        <NavLink to="/cahier" className={lien}>
          <span className="text-xl">📒</span>Cahier
        </NavLink>
        <NavLink to="/tableau" className={lien}>
          <span className="text-xl">📈</span>Progrès
        </NavLink>
        <NavLink to="/reglages" className={lien}>
          <span className="text-xl">⚙︎</span>Données
        </NavLink>
      </div>
    </nav>
  )
}

export function App() {
  return (
    <HashRouter>
      <main className="pt-safe mx-auto max-w-3xl px-4 pb-28">
        <Routes>
          <Route path="/" element={<Accueil />} />
          <Route path="/chapitre/:id" element={<ChapitrePage />} />
          <Route path="/jouer" element={<Session />} />
          <Route path="/tableau" element={<Tableau />} />
          <Route path="/cahier" element={<Cahier />} />
          <Route path="/reglages" element={<Reglages />} />
        </Routes>
      </main>
      <Onglets />
    </HashRouter>
  )
}
