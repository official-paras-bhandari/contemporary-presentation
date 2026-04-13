import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as random from 'maath/random/dist/maath-random.esm'
import confetti from 'canvas-confetti'
import {
  BarChart2, Brain, Zap, Search, Target, Activity,
  Factory, Package, Building2, Stethoscope, Wind, TrendingUp,
  AlertTriangle, Scale, BookOpen, Lock, Biohazard, ShieldCheck,
  Rocket, Cloud, Leaf, Bot, ShoppingCart, Clapperboard,
  GraduationCap, Globe, MessageSquare, Cpu, Network
} from 'lucide-react'

/* ─────────────────────── 3-D STAR BACKGROUND ─────────────────────── */
function Stars() {
  const ref = useRef()
  const [sphere] = useState(() => random.inSphere(new Float32Array(6000), { radius: 1.5 }))
  useFrame((_, dt) => {
    ref.current.rotation.x -= dt / 12
    ref.current.rotation.y -= dt / 18
  })
  return (
    <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
      <PointMaterial transparent color="#8b5cf6" size={0.003} sizeAttenuation depthWrite={false} />
    </Points>
  )
}

/* ─────────────────────── NEURAL-NETWORK SVG ─────────────────────── */
const LAYERS = [[6], [8], [8], [6], [4]]
function NeuralNet({ accent = '#a78bfa' }) {
  const W = 360, H = 300
  const cols = LAYERS.length
  const nodes = LAYERS.map((l, ci) => l[0]).reduce((acc, n, ci) => {
    const x = (ci / (cols - 1)) * (W - 60) + 30
    for (let j = 0; j < n; j++) {
      const y = ((j + 0.5) / n) * H
      acc.push({ x, y, ci, j, id: `n-${ci}-${j}` })
    }
    return acc
  }, [])

  const edges = []
  for (let ci = 0; ci < cols - 1; ci++) {
    const from = nodes.filter(n => n.ci === ci)
    const to = nodes.filter(n => n.ci === ci + 1)
    from.forEach(f => to.forEach(t => edges.push({ f, t, id: `e-${f.id}-${t.id}` })))
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="nn-svg">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
      </defs>
      {edges.map((e, i) => (
        <line key={e.id}
          x1={e.f.x} y1={e.f.y} x2={e.t.x} y2={e.t.y}
          stroke={accent} strokeWidth={0.5} opacity={0.25}
        />
      ))}
      {/* animated flow signals */}
      {edges.filter((_, i) => i % 7 === 0).map((e, i) => (
        <circle key={`flow-${i}`} r="2.5" fill={accent} opacity="0.9" filter="url(#glow)">
          <animateMotion
            dur={`${1.5 + (i % 4) * 0.5}s`} repeatCount="indefinite"
            begin={`${i * 0.3}s`}
            path={`M${e.f.x},${e.f.y} L${e.t.x},${e.t.y}`}
          />
        </circle>
      ))}
      {nodes.map((n, i) => (
        <circle key={n.id}
          cx={n.x} cy={n.y} r={n.ci === 0 || n.ci === cols - 1 ? 6 : 5}
          fill="none" stroke={accent} strokeWidth={1.5} opacity={0.7} filter="url(#glow)"
        >
          <animate attributeName="r"
            values={`${n.ci === 0 ? 6 : 5};${n.ci === 0 ? 9 : 7};${n.ci === 0 ? 6 : 5}`}
            dur={`${2 + (i % 3)}s`} repeatCount="indefinite" begin={`${(i * 0.17) % 2}s`}
          />
          <animate attributeName="opacity" values="0.4;1;0.4"
            dur={`${2 + (i % 3)}s`} repeatCount="indefinite" begin={`${(i * 0.17) % 2}s`}
          />
        </circle>
      ))}
    </svg>
  )
}

/* ─────────────────────── ANIMATED COUNTER ─────────────────────── */
function Counter({ target, prefix = '', suffix = '', duration = 1800 }) {
  const [val, setVal] = useState(0)
  const started = useRef(false)
  const ref = useRef()
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true
        const start = performance.now()
        const tick = (now) => {
          const t = Math.min((now - start) / duration, 1)
          const eased = 1 - Math.pow(1 - t, 4)
          setVal(Math.round(eased * target))
          if (t < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.3 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [target, duration])
  return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>
}

/* ─────────────────────── ANIMATED BAR CHART ─────────────────────── */
function BarChart({ bars, accent }) {
  const [ready, setReady] = useState(false)
  useEffect(() => { const t = setTimeout(() => setReady(true), 600); return () => clearTimeout(t) }, [])
  const max = Math.max(...bars.map(b => b.val))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {bars.map((b, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', width: '7rem', textAlign: 'right', flexShrink: 0 }}>{b.label}</span>
          <div style={{ flex: 1, height: '28px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', overflow: 'hidden' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: ready ? `${(b.val / max) * 100}%` : 0 }}
              transition={{ delay: 0.2 + i * 0.12, duration: 1, ease: [0.4, 0, 0.2, 1] }}
              style={{ height: '100%', background: `linear-gradient(90deg, ${accent}, ${accent}99)`, borderRadius: '6px', position: 'relative' }}
            />
          </div>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, fontFamily: 'Space Mono', width: '4rem', color: accent }}>{b.display}</span>
        </div>
      ))}
    </div>
  )
}

/* ─────────────────────── FLOATING RING DECORATION ─────────────────────── */
function Rings({ color }) {
  return (
    <div style={{ position: 'relative', width: 260, height: 260, flexShrink: 0 }}>
      {[260, 200, 140].map((s, i) => (
        <motion.div key={i}
          animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
          transition={{ duration: 12 + i * 4, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute',
            top: (260 - s) / 2, left: (260 - s) / 2,
            width: s, height: s, borderRadius: '50%',
            border: `1px dashed ${color}${i === 0 ? '40' : i === 1 ? '60' : '90'}`,
          }}
        />
      ))}
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Network size={64} strokeWidth={1} style={{ opacity: 0.7 }} />
      </div>
    </div>
  )
}

/* ─────────────────────── SLIDES DATA ─────────────────────── */
const SLIDES = [
  { id: 'hero' },
  { id: 'intro' },
  { id: 'maturity' },
  { id: 'health' },
  { id: 'auto' },
  { id: 'personal' },
  { id: 'bias' },
  { id: 'privacy' },
  { id: 'reg' },
  { id: 'future' },
  { id: 'recs' },
  { id: 'outro' },
]

/* ─────────────────────── SLIDE CONTENT ─────────────────────── */
function SlideHero() {
  return (
    <div className="panel" style={{ minHeight: '82vh' }}>
      <div className="s1-inner">
        <div className="s1-left">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <span className="label" style={{ background: 'rgba(167,139,250,0.15)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.3)' }}>
              <span className="badge-dot" style={{ background: '#a78bfa' }} />
              PROF608 · Problem-Based Task
            </span>
          </motion.div>
          <motion.h1 className="big text-v" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, type: 'spring', stiffness: 100 }}>
            Machine<br />Learning
          </motion.h1>
          <motion.h2 style={{ fontSize: '1.5rem', fontWeight: 300, color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            Transforming <span style={{ color: '#fff', fontWeight: 700 }}>Organisations</span><br />and <span style={{ color: '#fff', fontWeight: 700 }}>Society</span>
          </motion.h2>
          <div className="glow-line" />
          <motion.p className="body-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>
            An in-depth analysis of ML's current maturity,<br />
            opportunities, challenges, and strategic implications.
          </motion.p>
        </div>
        <div className="s1-right" style={{ background: 'rgba(167,139,250,0.04)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%', maxWidth: 360 }}>
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
              <NeuralNet accent="#a78bfa" />
            </motion.div>
            <div style={{ display: 'grid', gap: '0.75rem' }}>
              {['Executive Summary', 'Opportunities & Challenges', 'Future Implications'].map((t, i) => (
                <motion.div key={t}
                  initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.12 }}
                  style={{ padding: '1rem 1.5rem', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ background: '#a78bfa', width: 6, height: 6, borderRadius: '50%' }} />
                  <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{t}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SlideIntro() {
  return (
    <div className="panel">
      <div className="two-col" style={{ minHeight: '82vh' }}>
        <div className="col-pad border-right">
          <motion.span className="lc-tag text-v" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 0.1 }}>
            Section 01 — Introduction
          </motion.span>
          <motion.h2 className="big text-v" style={{ fontSize: 'clamp(3rem,6vw,7rem)' }}
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            What Is ML?
          </motion.h2>
          <motion.p className="body-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            Machine Learning enables systems to <span className="em">learn from data</span> without explicit programming — a field spanning decades, now at industrial scale.
          </motion.p>
          <div style={{ display: 'grid', gap: '1rem', marginTop: '0.5rem' }}>
            {[
              { icon: <BarChart2 size={22} />, label: 'Supervised', desc: 'Learns from labeled training data', color: '#a78bfa' },
              { icon: <Search size={22} />, label: 'Unsupervised', desc: 'Discovers hidden structure', color: '#60a5fa' },
              { icon: <Target size={22} />, label: 'Reinforcement', desc: 'Optimises via reward feedback', color: '#34d399' },
            ].map((item, i) => (
              <motion.div key={item.label}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.12 }}
                className="pill">
                <div className="pill-icon" style={{ background: `${item.color}20`, color: item.color }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: item.color }}>{item.label}</div>
                  <div style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{item.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="col-accent" style={{ background: 'rgba(167,139,250,0.04)' }}>
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
            <NeuralNet accent="#a78bfa" />
          </motion.div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            style={{ textAlign: 'center', padding: '2rem', background: 'rgba(167,139,250,0.08)', borderRadius: '24px', border: '1px solid rgba(167,139,250,0.15)' }}>
            <div className="mono text-v" style={{ fontSize: '3rem' }}>
              <Counter target={150} suffix="B+" prefix="$" />
            </div>
            <div className="stat-label" style={{ marginTop: '0.5rem' }}>Global AI/ML Spend 2024 (USD)</div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function SlideMaturity() {
  const bars = [
    { label: 'NLP', val: 92, display: '92%' },
    { label: 'Computer Vision', val: 88, display: '88%' },
    { label: 'Predictive Analytics', val: 95, display: '95%' },
    { label: 'Generative AI', val: 76, display: '76%' },
    { label: 'Robotics / RL', val: 61, display: '61%' },
  ]
  return (
    <div className="panel">
      <div className="two-col" style={{ minHeight: '82vh' }}>
        <div className="col-pad border-right">
          <span className="lc-tag text-b">Section 02 — Maturity Analysis</span>
          <motion.h2 className="big text-b" style={{ fontSize: 'clamp(3rem,6vw,7rem)' }}
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            State &<br />Maturity
          </motion.h2>
          <motion.p className="body-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
            Gartner positions most ML sub-fields on the <span className="em">Slope of Enlightenment</span> — pragmatic, value-generating deployments commonplace. GPT-era foundation models are a qualitative leap.
          </motion.p>
          <div className="glow-line" style={{ background: 'linear-gradient(90deg, transparent, #60a5fa, transparent)' }} />
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <BarChart bars={bars} accent="#60a5fa" />
          </motion.div>
        </div>
        <div className="col-accent" style={{ gap: '2rem' }}>
          <Rings color="#60a5fa" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', width: '100%' }}>
            {[
              { val: 500, suffix: 'B+', label: 'Projected USD spend by 2030', color: '#60a5fa' },
              { val: 2012, suffix: '', label: 'ImageNet deep learning breakthrough', color: '#a78bfa' },
            ].map(s => (
              <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '1.5rem', textAlign: 'center' }}>
                <div style={{ fontFamily: 'Bebas Neue', fontSize: '2.8rem', color: s.color, lineHeight: 1 }}>
                  <Counter target={s.val} suffix={s.suffix} prefix="$" />
                </div>
                <div style={{ fontSize: '0.7rem', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function SlideHealth() {
  return (
    <div className="panel" style={{ minHeight: '82vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', flex: 1 }}>
        <div className="col-pad border-right">
          <span className="lc-tag" style={{ color: '#34d399', opacity: 0.6 }}>Opportunity 01 — Healthcare</span>
          <motion.h2 className="big text-g" style={{ fontSize: 'clamp(3rem,6vw,7rem)' }}
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            Healthcare<br />Diagnostics
          </motion.h2>
          <motion.p className="body-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
            Deep convolutional networks match <span className="em">board-certified specialist performance</span> in diabetic retinopathy, skin cancer, and chest X-ray interpretation.
          </motion.p>
          <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1rem' }}>
            {[
              { icon: <Stethoscope size={20} />, text: 'Esteva et al. (2017): Dermatologist-level skin cancer classification' },
              { icon: <Wind size={20} />, text: 'CheXNet: Radiologist-level pneumonia detection (Rajpurkar 2017)' },
              { icon: <TrendingUp size={20} />, text: 'Predictive models for sepsis risk, patient readmission' },
            ].map((item, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.12 }}
                style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem 1.25rem', borderRadius: 16, background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)' }}>
                <span style={{ color: '#34d399', flexShrink: 0 }}>{item.icon}</span>
                <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.65)' }}>{item.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="col-accent" style={{ background: 'rgba(52,211,153,0.04)' }}>
          <motion.div initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, type: 'spring', stiffness: 80 }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ padding: '2.5rem', borderRadius: '50%', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', boxShadow: '0 0 60px rgba(52,211,153,0.2)' }}>
              <Brain size={80} style={{ color: '#34d399' }} strokeWidth={1} />
            </div>
          </motion.div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
            {[
              { label: 'Diagnostic Accuracy', val: 94, color: '#34d399' },
              { label: 'Cost Reduction Potential', val: 78, color: '#60a5fa' },
              { label: 'Earlier Detection Rate', val: 82, color: '#a78bfa' },
            ].map((m, i) => (
              <motion.div key={m.label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 + i * 0.1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>{m.label}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: m.color }}>{m.val}%</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${m.val}%` }}
                    transition={{ delay: 0.8 + i * 0.15, duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
                    style={{ height: '100%', background: m.color, borderRadius: 3 }} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function SlideAuto() {
  return (
    <div className="panel" style={{ minHeight: '82vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', flex: 1 }}>
        <div className="col-pad border-right">
          <span className="lc-tag text-y" style={{ opacity: 0.6 }}>Opportunity 02 — Automation</span>
          <motion.h2 className="big text-y" style={{ fontSize: 'clamp(3rem,6vw,7rem)' }}
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            Intelligent<br />Automation
          </motion.h2>
          <motion.p className="body-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
            Cognitive automation extends beyond rules-based RPA — processing <span className="em">natural language, images, audio</span> for tasks previously requiring human judgement.
          </motion.p>
          <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1rem' }}>
            {[
              { icon: <Factory size={20} />, text: 'Predictive maintenance in manufacturing' },
              { icon: <Package size={20} />, text: 'Demand forecasting in logistics & retail' },
              { icon: <Building2 size={20} />, text: 'Intelligent document processing in finance' },
            ].map((item, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.12 }}
                style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem 1.25rem', borderRadius: 16, background: 'rgba(251,191,36,0.06)', border: '1px solid rgba(251,191,36,0.15)' }}>
                <span style={{ color: '#fbbf24', flexShrink: 0 }}>{item.icon}</span>
                <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.65)' }}>{item.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="col-accent" style={{ background: 'rgba(251,191,36,0.03)', gap: '2rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Bebas Neue', fontSize: '6rem', color: '#fbbf24', lineHeight: 1, textShadow: '0 0 40px rgba(251,191,36,0.5)' }}>
              $<Counter target={4.4} suffix="T" />
            </div>
            <div style={{ fontSize: '0.8rem', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: 4 }}>
              Annual economic potential<br />(McKinsey Global Institute, 2023)
            </div>
          </div>
          <div style={{ width: '100%', background: 'rgba(255,255,255,0.03)', borderRadius: 20, padding: '1.5rem', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ fontSize: '0.75rem', opacity: 0.5, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem' }}>Amazon Revenue from ML Recs</div>
            <div style={{ fontFamily: 'Bebas Neue', fontSize: '3.5rem', color: '#fbbf24' }}>35%</div>
            <div style={{ fontSize: '0.75rem', opacity: 0.45, marginTop: 4 }}>+$1B Netflix annual value from personalisation</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SlidePersonal() {
  return (
    <div className="panel" style={{ minHeight: '82vh' }}>
      <div className="full-pad" style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', alignItems: 'center' }}>
        <motion.span className="lc-tag text-b" style={{ opacity: 0.6, flexDirection: 'column', textAlign: 'center' }}
          initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} transition={{ delay: 0.1 }}>
          Opportunity 03
        </motion.span>
        <motion.h2 className="big text-b" style={{ fontSize: 'clamp(4rem,8vw,9rem)' }}
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          Personalisation
        </motion.h2>
        <motion.p className="body-text" style={{ maxWidth: 600, textAlign: 'center' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          Recommender systems deliver <span className="em">hyper-relevant experiences at scale</span> — from consumer e-commerce to adaptive education platforms.
        </motion.p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.5rem', width: '100%', marginTop: '1rem' }}>
          {[
            { icon: <ShoppingCart size={32} />, brand: 'Amazon', stat: '35%', desc: 'Revenue from ML recs', color: '#60a5fa' },
            { icon: <Clapperboard size={32} />, brand: 'Netflix', stat: '$1B', desc: 'Annual value via personalisation', color: '#f87171' },
            { icon: <GraduationCap size={32} />, brand: 'EdTech', stat: '40%', desc: 'Learning gap close rate', color: '#34d399' },
          ].map((c, i) => (
            <motion.div key={c.brand}
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.13 }}
              style={{ padding: '2rem', borderRadius: 24, background: 'rgba(96,165,250,0.07)', border: '1px solid rgba(96,165,250,0.15)', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: c.color }}>{c.icon}</div>
              <div style={{ fontFamily: 'Bebas Neue', fontSize: '3rem', color: '#60a5fa', lineHeight: 1 }}>{c.stat}</div>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, marginTop: 4 }}>{c.brand}</div>
              <div style={{ fontSize: '0.7rem', opacity: 0.45, marginTop: 2 }}>{c.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SlideBias() {
  return (
    <div className="panel" style={{ minHeight: '82vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', flex: 1 }}>
        <div className="col-pad border-right">
          <span className="lc-tag text-r" style={{ opacity: 0.6 }}>Challenge 01 — Ethics</span>
          <motion.h2 className="big text-r" style={{ fontSize: 'clamp(3rem,6vw,7rem)' }}
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            Bias &<br />Fairness
          </motion.h2>
          <motion.p className="body-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
            ML models trained on historical data <span className="em">inherit discrimination</span>. High-stakes domains amplify these failures into real-world harm.
          </motion.p>
          <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1rem' }}>
            {[
              { icon: <AlertTriangle size={20} />, text: 'Gender Shades (Buolamwini & Gebru, 2018): 34% error ↑ for darker-skinned women' },
              { icon: <Scale size={20} />, text: 'Criminal recidivism, automated hiring, credit underwriting impacts' },
              { icon: <BookOpen size={20} />, text: 'Fairness is normative — requires interdisciplinary engagement' },
            ].map((item, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.12 }}
                style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem 1.25rem', borderRadius: 16, background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.15)' }}>
                <span style={{ color: '#f87171', flexShrink: 0 }}>{item.icon}</span>
                <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.65)' }}>{item.text}</span>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="col-accent" style={{ background: 'rgba(248,113,113,0.04)' }}>
          <motion.div initial={{ opacity: 0, rotate: -10, scale: 0.7 }} animate={{ opacity: 1, rotate: 0, scale: 1 }} transition={{ delay: 0.3, type: 'spring' }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ padding: '2.5rem', borderRadius: '50%', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', boxShadow: '0 0 60px rgba(248,113,113,0.2)' }}>
              <AlertTriangle size={80} style={{ color: '#f87171' }} strokeWidth={1} />
            </div>
          </motion.div>
          <div style={{ display: 'grid', gap: '1rem', width: '100%' }}>
            {[
              { label: 'Error rate disparity (Lighter vs Darker skin)', val: 34, color: '#f87171' },
              { label: 'Dataset representation gap', val: 61, color: '#fbbf24' },
              { label: 'Models lacking disaggregated eval', val: 78, color: '#f87171' },
            ].map((m, i) => (
              <div key={m.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>{m.label}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: m.color, fontFamily: 'Space Mono' }}>{m.val}%</span>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${m.val}%` }}
                    transition={{ delay: 0.8 + i * 0.15, duration: 1.2 }}
                    style={{ height: '100%', background: m.color, borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function SlidePrivacy() {
  return (
    <div className="panel" style={{ minHeight: '82vh' }}>
      <div className="full-pad" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        <motion.span className="lc-tag text-y" style={{ opacity: 0.6 }}
          initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} transition={{ delay: 0.1 }}>
          Challenge 02 — Privacy & Security
        </motion.span>
        <motion.h2 className="big text-y" style={{ fontSize: 'clamp(3rem,6vw,7rem)' }}
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          Privacy &<br />Security
        </motion.h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.25rem' }}>
          {[
            { icon: <Lock size={36} />, title: 'GDPR & Aus. Privacy Act', desc: 'Data minimisation, consent, purpose limitation obligations apply to all ML training data.', color: '#fbbf24' },
            { icon: <Biohazard size={36} />, title: 'Data Poisoning', desc: 'Adversarial attacks, model inversion, membership inference represent novel threat surfaces for deployed ML.', color: '#f87171' },
            { icon: <ShieldCheck size={36} />, title: 'Mitigations', desc: 'Differential privacy, federated learning, secure multi-party computation — each with utility trade-offs.', color: '#34d399' },
          ].map((c, i) => (
            <motion.div key={c.title}
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.12 }}
              style={{ padding: '2rem', borderRadius: 24, background: `rgba(255,255,255,0.03)`, border: `1px solid ${c.color}25` }}>
              <div style={{ marginBottom: '1rem', color: c.color }}>{c.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: c.color, marginBottom: '0.5rem' }}>{c.title}</div>
              <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{c.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SlideReg() {
  return (
    <div className="panel" style={{ minHeight: '82vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', flex: 1 }}>
        <div className="col-pad border-right">
          <span className="lc-tag text-v" style={{ opacity: 0.6 }}>Challenge 03 — Regulation</span>
          <motion.h2 className="big text-v" style={{ fontSize: 'clamp(3rem,6vw,7rem)' }}
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            Regulatory<br />Landscape
          </motion.h2>
          <motion.p className="body-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
            The <span className="em">EU AI Act (2024)</span> establishes a risk-tiered framework — the most comprehensive to date. Australia relies on fragmented voluntary guidelines.
          </motion.p>
          <div style={{ marginTop: '1rem', padding: '1.5rem 2rem', borderRadius: 20, background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.2)', borderLeft: '4px solid #a78bfa' }}>
            <div style={{ fontWeight: 700, color: '#a78bfa', marginBottom: 6 }}>EU AI Act Risk Tiers</div>
            {['Unacceptable Risk → Banned', 'High Risk → Mandatory Assessment', 'Limited Risk → Transparency req.', 'Minimal Risk → Self-regulated'].map((t, i) => (
              <motion.div key={t} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + i * 0.1 }}
                style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', padding: '0.3rem 0', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                {t}
              </motion.div>
            ))}
          </div>
        </div>
        <div className="col-accent" style={{ gap: '1.5rem' }}>
          {[
            { icon: <Globe size={20} />, region: 'European Union', status: 'AI Act 2024', color: '#a78bfa', desc: 'Comprehensive risk-based' },
            { icon: <Globe size={20} />, region: 'Australia', status: 'Voluntary Guidelines', color: '#fbbf24', desc: 'Sectoral + voluntary' },
            { icon: <Globe size={20} />, region: 'United States', status: 'EO 14110', color: '#60a5fa', desc: 'Executive order framework' },
          ].map((r, i) => (
            <motion.div key={r.region}
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.12 }}
              style={{ width: '100%', padding: '1.5rem 2rem', borderRadius: 20, background: 'rgba(255,255,255,0.03)', border: `1px solid ${r.color}30`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ color: r.color }}>{r.icon}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{r.region}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.45, marginTop: 2 }}>{r.desc}</div>
                </div>
              </div>
              <span style={{ padding: '0.35rem 1rem', borderRadius: 100, background: `${r.color}20`, color: r.color, fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>{r.status}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SlideFuture() {
  return (
    <div className="panel" style={{ minHeight: '82vh' }}>
      <div className="full-pad" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        <span className="lc-tag text-g" style={{ opacity: 0.6 }}>Section 05 — Future</span>
        <motion.h2 className="big text-g" style={{ fontSize: 'clamp(3rem,7vw,8rem)' }}
          initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          Future<br />Trajectory
        </motion.h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1.25rem' }}>
          {[
            { icon: <Rocket size={36} />, title: 'Scaling', desc: 'Foundation models continue improving predictably with compute and data', color: '#34d399' },
            { icon: <Cloud size={36} />, title: 'Democratisation', desc: 'AutoML and cloud APIs lower barrier for SMEs and public sector', color: '#60a5fa' },
            { icon: <Leaf size={36} />, title: 'Sustainability', desc: 'Training carbon footprint rivals transatlantic aviation — regulatory scrutiny incoming', color: '#34d399' },
            { icon: <Bot size={36} />, title: 'Multimodal', desc: 'Integration of vision, language, audio into unified reasoning systems', color: '#a78bfa' },
          ].map((c, i) => (
            <motion.div key={c.title}
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + i * 0.12, type: 'spring', stiffness: 100 }}
              style={{ padding: '2rem 1.5rem', borderRadius: 24, background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', color: c.color }}>{c.icon}</div>
              <div style={{ fontWeight: 700, color: '#34d399', marginBottom: '0.5rem' }}>{c.title}</div>
              <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{c.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SlideRecs() {
  return (
    <div className="panel" style={{ minHeight: '82vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', flex: 1 }}>
        <div className="col-pad border-right" style={{ gap: '2rem' }}>
          <span className="lc-tag text-b" style={{ opacity: 0.6 }}>Recommendations — Healthcare</span>
          <motion.h2 className="big text-b" style={{ fontSize: 'clamp(3rem,6vw,7rem)' }}
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            Strategic<br />Actions
          </motion.h2>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {[
              { n: '01', title: 'Human-in-the-Loop', desc: 'No ML diagnostic output actionable without clinician review', color: '#3b82f6' },
              { n: '02', title: 'Explainable AI (XAI)', desc: 'SHAP & LIME integrated into all patient-facing deployment pipelines', color: '#a78bfa' },
              { n: '03', title: 'Data Governance', desc: 'Clear provenance, consent management, and drift detection protocols', color: '#34d399' },
              { n: '04', title: 'Regulatory Engagement', desc: 'Proactive participation with ISO/IEC SC 42 and Standards Australia', color: '#fbbf24' },
            ].map((r, i) => (
              <motion.div key={r.n}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start', padding: '1.25rem', borderRadius: 20, background: 'rgba(255,255,255,0.03)', border: `1px solid ${r.color}20` }}>
                <div style={{ fontFamily: 'Bebas Neue', fontSize: '2.5rem', color: r.color, lineHeight: 1 }}>{r.n}</div>
                <div>
                  <div style={{ fontWeight: 700, color: r.color }}>{r.title}</div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.55, marginTop: 3, lineHeight: 1.5 }}>{r.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        <div className="col-accent" style={{ background: 'rgba(59,130,246,0.04)' }}>
          <Rings color="#3b82f6" />
          <div style={{ textAlign: 'center', padding: '2rem', background: 'rgba(59,130,246,0.08)', borderRadius: 24, border: '1px solid rgba(59,130,246,0.2)', width: '100%' }}>
            <div style={{ fontSize: '0.7rem', opacity: 0.4, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 8 }}>Planning Horizon</div>
            <div style={{ fontFamily: 'Bebas Neue', fontSize: '5rem', color: '#60a5fa', lineHeight: 1 }}>2–3</div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', opacity: 0.6 }}>Years</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SlideOutro() {
  const [fired, setFired] = useState(false)
  useEffect(() => {
    if (!fired) {
      setFired(true)
      const fire = (opts) => confetti({ ...opts, particleCount: 80, spread: 80, colors: ['#a78bfa', '#60a5fa', '#34d399', '#fbbf24'] })
      setTimeout(() => fire({ origin: { x: 0.25, y: 0.6 } }), 300)
      setTimeout(() => fire({ origin: { x: 0.75, y: 0.6 } }), 500)
      setTimeout(() => fire({ origin: { x: 0.5,  y: 0.5 } }), 700)
    }
  }, [])
  return (
    <div className="panel" style={{ minHeight: '82vh' }}>
      <div className="full-pad" style={{ maxWidth: 750, margin: '0 auto', alignItems: 'center', textAlign: 'center', gap: '2rem' }}>
        <motion.span className="lc-tag text-v" style={{ opacity: 0.6, flexDirection: 'column' }}
          initial={{ opacity: 0 }} animate={{ opacity: 0.6 }} transition={{ delay: 0.1 }}>
          Conclusion
        </motion.span>
        <motion.h2 className="big" style={{ fontSize: 'clamp(4rem,8vw,9rem)', background: 'linear-gradient(135deg, #a78bfa, #60a5fa, #34d399)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}>
          Thank You
        </motion.h2>
        <motion.p className="body-text" style={{ maxWidth: 560 }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          Organisations that invest not only in technical capability but in <span className="em">governance, ethics, and human judgement</span> will secure durable competitive and ethical advantage.
        </motion.p>
        <div className="glow-line" style={{ width: '100%' }} />
        <motion.div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', width: '100%' }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
          {['PROF608', 'Week 10', 'Machine Learning'].map((t, i) => (
            <div key={t} style={{ padding: '1rem', borderRadius: 16, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', fontSize: '0.85rem', fontWeight: 600, opacity: 0.7 }}>{t}</div>
          ))}
        </motion.div>
        <motion.div style={{ padding: '1.5rem 2.5rem', borderRadius: 24, background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.25)', fontSize: '1.1rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
          <MessageSquare size={20} style={{ color: '#a78bfa' }} />
          Questions welcome
        </motion.div>
      </div>
    </div>
  )
}

const SLIDE_COMPONENTS = [
  SlideHero, SlideIntro, SlideMaturity, SlideHealth, SlideAuto,
  SlidePersonal, SlideBias, SlidePrivacy, SlideReg, SlideFuture, SlideRecs, SlideOutro
]

/* ─────────────────────── SLIDE TRANSITION VARIANTS ─────────────────────── */
const variants = {
  enter: (d) => ({ opacity: 0, y: d > 0 ? 60 : -60, scale: 0.97, filter: 'blur(10px)' }),
  center: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } },
  exit:   (d) => ({ opacity: 0, y: d > 0 ? -60 : 60, scale: 0.97, filter: 'blur(10px)', transition: { duration: 0.45, ease: [0.4, 0, 1, 1] } }),
}

/* ─────────────────────── CURSOR ─────────────────────── */
function Cursor() {
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [fol, setFol] = useState({ x: 0, y: 0 })
  useEffect(() => {
    const onMove = (e) => setPos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])
  useEffect(() => {
    let raf
    const loop = () => {
      setFol(prev => ({ x: prev.x + (pos.x - prev.x) * 0.15, y: prev.y + (pos.y - prev.y) * 0.15 }))
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [pos])
  return (
    <>
      <div className="cur" style={{ left: pos.x, top: pos.y }} />
      <div className="cur-ring" style={{ left: fol.x, top: fol.y }} />
    </>
  )
}

/* ─────────────────────── APP ─────────────────────── */
export default function App() {
  const [cur, setCur] = useState(0)
  const [dir, setDir] = useState(0)
  const total = SLIDE_COMPONENTS.length

  const go = useCallback((index) => {
    if (index < 0 || index >= total) return
    setDir(index > cur ? 1 : -1)
    setCur(index)
  }, [cur, total])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') go(cur + 1)
      if (e.key === 'ArrowLeft') go(cur - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [cur, go])

  const SlideComp = SLIDE_COMPONENTS[cur]

  return (
    <div className="wrap">
      <Cursor />

      {/* ── Three.js starfield background (unchanged) ── */}
      <div className="bg-canvas">
        <Canvas camera={{ position: [0, 0, 1] }}>
          <Stars />
        </Canvas>
      </div>

      {/* ── Gradient overlay to give depth ── */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 80% 70% at 50% 50%, rgba(139,92,246,0.08) 0%, transparent 70%)',
      }} />

      {/* ── Progress bar ── */}
      <div className="progress">
        <div className="progress-fill" style={{ width: `${((cur + 1) / total) * 100}%` }} />
      </div>

      {/* ── Slide viewport ── */}
      <div className="slides-viewport">
        <AnimatePresence custom={dir} mode="wait">
          <motion.div key={cur} custom={dir} variants={variants}
            initial="enter" animate="center" exit="exit"
            className="slide active">
            <SlideComp />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Dot nav ── */}
      <div className="dot-nav">
        {SLIDE_COMPONENTS.map((_, i) => (
          <div key={i} className={`dot${cur === i ? ' on' : ''}`} onClick={() => go(i)} />
        ))}
      </div>

      {/* ── Arrows ── */}
      <div className="arrow-nav">
        <button className="arr" onClick={() => go(cur - 1)} disabled={cur === 0}
          style={{ fontSize: '1.25rem' }}>‹</button>
        <span className="slide-counter">{String(cur + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}</span>
        <button className="arr" onClick={() => go(cur + 1)} disabled={cur === total - 1}
          style={{ fontSize: '1.25rem' }}>›</button>
      </div>
    </div>
  )
}
