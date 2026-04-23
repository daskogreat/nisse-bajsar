import { useEffect, useMemo, useState } from 'react'
import './App.css'

const STORAGE_KEY = 'nisse-bajsar-entries'
const LOGIN_USER = 'Nisse'
const LOGIN_PASS = 'Patron2010'

const CONSISTENCY_OPTIONS = [
  { id: 'hard', emoji: '🪨', label: 'Hård' },
  { id: 'slightly-hard', emoji: '🍠', label: 'Lite hård' },
  { id: 'normal', emoji: '🙂', label: 'Normal' },
  { id: 'soft', emoji: '☁️', label: 'Mjuk' },
  { id: 'loose', emoji: '💥', label: 'Lös 💥' },
]

const WEEK_DAYS = ['Mån', 'Tis', 'Ons', 'Tor', 'Fre', 'Lör', 'Sön']
const MEDICINE_OPTIONS = [
  { id: 'tablett', label: 'Tablett' },
  { id: 'flytande', label: 'Flytande' },
  { id: 'annat', label: 'Annat' },
]

const monthLabel = (date) =>
  date.toLocaleDateString('sv-SE', { month: 'long', year: 'numeric' })

const dayKey = (date) => date.toISOString().slice(0, 10)

const getCalendarStart = (date) => {
  const first = new Date(date.getFullYear(), date.getMonth(), 1)
  const offset = (first.getDay() + 6) % 7
  first.setDate(first.getDate() - offset)
  return first
}

const buildCalendarDays = (monthDate) => {
  const start = getCalendarStart(monthDate)
  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start)
    day.setDate(start.getDate() + index)
    return day
  })
}

const getStreak = (entries) => {
  let streak = 0
  const current = new Date()
  current.setHours(0, 0, 0, 0)

  while (entries[dayKey(current)]?.entries?.length) {
    streak += 1
    current.setDate(current.getDate() - 1)
  }

  return streak
}

const normalizeEntries = (raw) => {
  if (!raw || typeof raw !== 'object') return {}

  return Object.fromEntries(
    Object.entries(raw).map(([key, value]) => {
      if (Array.isArray(value?.entries)) {
        return [key, { entries: value.entries }]
      }
      if (value?.consistency) {
        return [
          key,
          {
            entries: [{ type: 'poop', consistency: value.consistency }],
          },
        ]
      }
      return [key, { entries: [] }]
    }),
  )
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginSuccess, setLoginSuccess] = useState(false)
  const [monthDate, setMonthDate] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [entries, setEntries] = useState({})
  const [selectedDay, setSelectedDay] = useState(new Date())
  const [panelMode, setPanelMode] = useState('actions')
  const [showSuccess, setShowSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    try {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object') {
        setEntries(normalizeEntries(parsed))
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  }, [entries])

  const selectedDayData = entries[dayKey(selectedDay)] ?? { entries: [] }
  const selectedDayEntries = selectedDayData.entries
  const poopEntry = selectedDayEntries.find((item) => item.type === 'poop')
  const medicineEntry = selectedDayEntries.find((item) => item.type === 'medicine')
  const days = useMemo(() => buildCalendarDays(monthDate), [monthDate])
  const streak = useMemo(() => getStreak(entries), [entries])

  const showFeedback = (message) => {
    setSuccessMessage(message)
    setShowSuccess(true)
    window.setTimeout(() => setShowSuccess(false), 1500)
  }

  const savePoop = (consistencyId) => {
    const key = dayKey(selectedDay)
    setEntries((current) => ({
      ...current,
      [key]: {
        entries: [
          ...(current[key]?.entries ?? []).filter((item) => item.type !== 'poop'),
          { type: 'poop', consistency: consistencyId, savedAt: new Date().toISOString() },
        ],
      },
    }))

    const hasMedicine = Boolean(medicineEntry)
    showFeedback(hasMedicine ? 'Toppen! Allt loggat 👍' : 'Snyggt jobbat Nisse! 🚀')
    setPanelMode('actions')
  }

  const handleConsistencyPick = (consistencyId) => {
    savePoop(consistencyId)
  }

  const saveMedicine = (kind) => {
    const key = dayKey(selectedDay)
    setEntries((current) => ({
      ...current,
      [key]: {
        entries: [
          ...(current[key]?.entries ?? []).filter((item) => item.type !== 'medicine'),
          { type: 'medicine', taken: true, kind, savedAt: new Date().toISOString() },
        ],
      },
    }))

    const hasPoop = Boolean(poopEntry)
    showFeedback(hasPoop ? 'Toppen! Allt loggat 👍' : 'Bra jobbat! 💪')
    setPanelMode('actions')
  }

  const handleLogin = (event) => {
    event.preventDefault()

    if (username === LOGIN_USER && password === LOGIN_PASS) {
      setLoginError('')
      setLoginSuccess(true)
      window.setTimeout(() => {
        setIsLoggedIn(true)
        setLoginSuccess(false)
      }, 450)
      return
    }

    setLoginError('Oops! Försök igen 🙂')
  }

  const selectedOption = CONSISTENCY_OPTIONS.find((option) => option.id === poopEntry?.consistency)

  if (!isLoggedIn) {
    return (
      <main className="app-shell">
        <section className={`panel login-card ${loginSuccess ? 'login-success' : ''}`}>
          <h1>Nisse bajsar</h1>
          <p className="login-help">Logga in för att börja.</p>

          <form className="login-form" onSubmit={handleLogin}>
            <label>
              <span>Användarnamn</span>
              <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                inputMode="text"
              />
            </label>

            <label>
              <span>Lösenord</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
              />
            </label>

            <button type="submit" className="save-btn login-btn">
              Logga in
            </button>
          </form>

          {loginError ? <p className="error-text">{loginError}</p> : null}
        </section>
      </main>
    )
  }

  return (
    <main className="app-shell">
      <header className="title-card">
        <h1>Nisse bajsar</h1>
        <p>Tryck på en dag och välj en ruta.</p>
      </header>

      <section className="panel">
        <div className="calendar-header">
          <button
            type="button"
            className="nav-btn"
            aria-label="Förra månaden"
            onClick={() =>
              setMonthDate(
                new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1),
              )
            }
          >
            ←
          </button>
          <h2>{monthLabel(monthDate)}</h2>
          <button
            type="button"
            className="nav-btn"
            aria-label="Nästa månaden"
            onClick={() =>
              setMonthDate(
                new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1),
              )
            }
          >
            →
          </button>
        </div>
        <div className="weekday-row">
          {WEEK_DAYS.map((day) => (
            <span key={day}>{day}</span>
          ))}
        </div>
        <div className="calendar-grid">
          {days.map((date) => {
            const key = dayKey(date)
            const hasEntry = Boolean(entries[key])
            const isCurrentMonth = date.getMonth() === monthDate.getMonth()
            const isSelected = dayKey(selectedDay) === key

            return (
              <button
                key={key}
                type="button"
                className={`day-btn ${isSelected ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedDay(date)
                  setPanelMode('actions')
                }}
                aria-label={`${date.toLocaleDateString('sv-SE')} ${
                  hasEntry ? 'har logg' : 'ingen logg'
                }`}
              >
                <span className={!isCurrentMonth ? 'faded' : ''}>{date.getDate()}</span>
                {entries[key]?.entries?.some((item) => item.type === 'poop') ? (
                  <span className="entry-indicator entry-poop">💩</span>
                ) : null}
                {entries[key]?.entries?.some((item) => item.type === 'medicine') ? (
                  <span className="entry-indicator entry-medicine">💊</span>
                ) : null}
                {!hasEntry ? <span className="entry-soft-dot" /> : null}
              </button>
            )
          })}
        </div>
      </section>

      <section className="panel day-panel">
        <div className="log-header">
          <h2>{selectedDay.toLocaleDateString('sv-SE', { weekday: 'long', day: 'numeric', month: 'long' })}</h2>
          {streak > 1 ? (
            <p className="streak">Du har loggat {streak} dagar i rad! 🔥</p>
          ) : (
            <p className="streak">Välj vad du vill logga.</p>
          )}
        </div>

        <div className="history">
          {selectedDayEntries.length ? (
            <>
              {poopEntry ? (
                <p>
                  💩 {selectedOption?.label ?? 'Okänd'}
                </p>
              ) : null}
              {medicineEntry ? <p>💊 Medicin tagen ({medicineEntry.kind ?? 'Annat'})</p> : null}
            </>
          ) : (
            <p>Inget loggat ännu.</p>
          )}
        </div>

        {panelMode === 'actions' ? (
          <div className="action-grid">
            <button
              type="button"
              className="action-btn"
              onClick={() => setPanelMode('poop')}
            >
              💩 Lägg till bajs
            </button>
            <button
              type="button"
              className="action-btn medicine-btn"
              onClick={() => setPanelMode('medicine')}
            >
              💊 Lägg till medicin
            </button>
          </div>
        ) : (
          <>
            {panelMode === 'poop' ? (
              <div className="consistency-grid" role="group" aria-label="Välj konsistens">
                {CONSISTENCY_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`consistency-card ${poopEntry?.consistency === option.id ? 'active' : ''}`}
                    onClick={() => handleConsistencyPick(option.id)}
                  >
                    <span className="big-emoji" aria-hidden="true">
                      {option.emoji}
                    </span>
                    <span className="card-title">{option.label}</span>
                  </button>
                ))}
              </div>
            ) : null}

            {panelMode === 'medicine' ? (
              <div className="medicine-grid" role="group" aria-label="Välj medicin">
                {MEDICINE_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`medicine-card ${medicineEntry?.kind === option.id ? 'active' : ''}`}
                    onClick={() => saveMedicine(option.id)}
                  >
                    💊 {option.label}
                  </button>
                ))}
              </div>
            ) : null}

            <button type="button" className="back-btn" onClick={() => setPanelMode('actions')}>
              Tillbaka
            </button>
          </>
        )}

        {showSuccess ? <p className="success-pop">{successMessage}</p> : null}
      </section>
    </main>
  )
}

export default App
