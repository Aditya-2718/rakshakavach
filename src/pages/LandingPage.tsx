import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Activity,
  Layers,
  Sparkles,
  BellRing,
  Cpu,
  BarChart3,
  Wifi,
  Database,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Radio,
  FileCheck2,
  Users,
  Zap,
  Menu,
  X,
  ChevronRight,
  TrendingUp,
  Server,
  Map as MapIcon
} from 'lucide-react';
import { Footer } from '../components/layout/Footer';
import { Mine3DHeroCanvas } from '../components/hero/Mine3DHeroCanvas';

export const LandingPage: React.FC = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div style={{ background: 'var(--bg-app)', color: 'var(--text-main)', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* ------------------------------------------------------------------ */}
      {/* 1. NAVIGATION BAR */}
      {/* ------------------------------------------------------------------ */}
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          background: 'rgba(6, 10, 20, 0.45)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          transition: 'background var(--transition-normal)'
        }}
      >
        <div className="mg-container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
            {/* Logo */}
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(6, 182, 212, 0.15))',
                  border: '1.5px solid rgba(245, 158, 11, 0.75)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fbbf24',
                  boxShadow: '0 0 16px rgba(245, 158, 11, 0.3)'
                }}
              >
                <Shield size={22} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '1.28rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff', lineHeight: 1.1 }}>
                  Raksha<span style={{ color: '#f59e0b' }}>kavach</span>
                </span>
                <span style={{ fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 500 }}>
                  Ground Subsidence Telemetry & AI
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div
              style={{
                display: 'none',
                alignItems: 'center',
                gap: '1.75rem',
                fontSize: '0.88rem',
                fontWeight: 500,
                color: 'rgba(255, 255, 255, 0.75)'
              }}
              className="desktop-nav"
            >
              <a href="#hero" style={{ color: '#ffffff', fontWeight: 600 }}>Home</a>
              <a href="#how-it-works" style={{ transition: 'color var(--transition-fast)' }}>How It Works</a>
              <a href="#features" style={{ transition: 'color var(--transition-fast)' }}>Features</a>
              <a href="#tech-stack" style={{ transition: 'color var(--transition-fast)' }}>Technology</a>
              <a href="#benefits" style={{ transition: 'color var(--transition-fast)' }}>Benefits</a>
              <Link
                to="/dashboard"
                style={{
                  color: '#fbbf24',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                Safety Dashboard <ChevronRight size={14} />
              </Link>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'none', alignItems: 'center', gap: '0.75rem' }} className="desktop-actions">
              <Link to="/login" className="mg-btn mg-btn-secondary mg-btn-sm" style={{ backdropFilter: 'blur(8px)', background: 'rgba(255, 255, 255, 0.06)' }}>
                Sign In
              </Link>
              <Link
                to="/register"
                className="mg-btn mg-btn-sm"
                style={{
                  background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                  color: '#060a14',
                  fontWeight: 700,
                  border: 'none',
                  boxShadow: '0 2px 10px rgba(245, 158, 11, 0.35)'
                }}
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="mg-btn mg-btn-secondary mg-btn-sm mobile-menu-btn"
              style={{ display: 'flex' }}
              aria-label="Toggle mobile menu"
            >
              {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileNavOpen && (
          <div
            style={{
              background: 'rgba(10, 16, 31, 0.96)',
              backdropFilter: 'blur(20px)',
              borderBottom: '1px solid var(--border-medium)',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}
          >
            <a
              href="#hero"
              onClick={() => setMobileNavOpen(false)}
              style={{ padding: '0.5rem 0', fontSize: '1rem', color: '#ffffff', fontWeight: 600 }}
            >
              Home
            </a>
            <a
              href="#how-it-works"
              onClick={() => setMobileNavOpen(false)}
              style={{ padding: '0.5rem 0', fontSize: '1rem', color: 'var(--text-secondary)' }}
            >
              How It Works
            </a>
            <a
              href="#features"
              onClick={() => setMobileNavOpen(false)}
              style={{ padding: '0.5rem 0', fontSize: '1rem', color: 'var(--text-secondary)' }}
            >
              Features
            </a>
            <a
              href="#tech-stack"
              onClick={() => setMobileNavOpen(false)}
              style={{ padding: '0.5rem 0', fontSize: '1rem', color: 'var(--text-secondary)' }}
            >
              Technology
            </a>
            <a
              href="#benefits"
              onClick={() => setMobileNavOpen(false)}
              style={{ padding: '0.5rem 0', fontSize: '1rem', color: 'var(--text-secondary)' }}
            >
              Benefits
            </a>
            <Link
              to="/dashboard"
              onClick={() => setMobileNavOpen(false)}
              style={{ padding: '0.5rem 0', fontSize: '1rem', color: '#fbbf24', fontWeight: 600 }}
            >
              Safety Dashboard &rarr;
            </Link>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <Link to="/login" className="mg-btn mg-btn-secondary" style={{ flex: 1 }}>
                Sign In
              </Link>
              <Link
                to="/register"
                className="mg-btn"
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                  color: '#060a14',
                  fontWeight: 700
                }}
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      <style>{`
        section {
          scroll-margin-top: 72px;
        }
        @media (min-width: 900px) {
          .desktop-nav { display: flex !important; }
          .desktop-actions { display: flex !important; }
          .mobile-menu-btn { display: none !important; }
        }
        .hero-btn-primary {
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .hero-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(245, 158, 11, 0.6), 0 0 40px rgba(245, 158, 11, 0.3) !important;
          filter: brightness(1.08);
        }
        .hero-btn-secondary {
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .hero-btn-secondary:hover {
          transform: translateY(-2px);
          background: rgba(22, 34, 60, 0.85) !important;
          border-color: rgba(251, 191, 36, 0.8) !important;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5), 0 0 20px rgba(245, 158, 11, 0.25) !important;
        }
        @media (max-width: 640px) {
          .hero-cta-group {
            flex-direction: column !important;
            width: 100% !important;
          }
          .hero-cta-group a {
            width: 100% !important;
            justify-content: center !important;
          }
          .hero-stat-divider {
            display: none !important;
          }
          .hero-stats-bar {
            width: 100% !important;
            justify-content: space-around !important;
          }
        }
      `}</style>

      {/* ------------------------------------------------------------------ */}
      {/* 2. HERO SECTION */}
      {/* ------------------------------------------------------------------ */}
      <section
        id="hero"
        style={{
          position: 'relative',
          minHeight: '100svh',
          width: '100%',
          backgroundColor: '#060a14',
          backgroundImage: "url('/images/mine-hero.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          display: 'flex',
          alignItems: 'center',
          paddingTop: '7.5rem',
          paddingBottom: '5rem',
          overflow: 'hidden',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        {/* Cinematic Hybrid 3D WebGL Mine Environment */}
        <Mine3DHeroCanvas />

        {/* Layered dark gradient overlay — stronger on the left and toward the bottom */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 1,
            background: [
              'linear-gradient(to right, rgba(6, 10, 20, 0.95) 0%, rgba(6, 10, 20, 0.88) 36%, rgba(6, 10, 20, 0.55) 62%, rgba(6, 10, 20, 0.2) 85%, rgba(6, 10, 20, 0.08) 100%)',
              'linear-gradient(to top, #060a14 0%, rgba(6, 10, 20, 0.88) 14%, rgba(6, 10, 20, 0.3) 38%, transparent 68%)',
              'linear-gradient(to bottom, rgba(6, 10, 20, 0.75) 0%, rgba(6, 10, 20, 0.25) 18%, transparent 35%)'
            ].join(', ')
          }}
        />

        {/* Hero Content */}
        <div className="mg-container" style={{ position: 'relative', zIndex: 2, width: '100%' }}>
          <div style={{ maxWidth: 780 }}>
            {/* DGMS Pill Tag */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.55rem',
                padding: '0.4rem 1rem',
                borderRadius: 'var(--radius-pill)',
                background: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid rgba(245, 158, 11, 0.45)',
                color: '#fbbf24',
                fontSize: '0.78rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '1.75rem',
                boxShadow: '0 0 20px rgba(245, 158, 11, 0.15)',
                backdropFilter: 'blur(8px)'
              }}
            >
              <Radio size={14} className="pulse-radar" style={{ color: '#fbbf24' }} />
              DGMS-Compliant Underground Mining Safety AI
            </div>

            {/* Headline */}
            <h1
              style={{
                fontSize: 'clamp(2.6rem, 5.8vw, 4.4rem)',
                fontWeight: 800,
                lineHeight: 1.12,
                letterSpacing: '-0.03em',
                marginBottom: '1.5rem'
              }}
            >
              <span
                style={{
                  display: 'block',
                  color: '#f8fafc',
                  textShadow: '0 2px 20px rgba(0, 0, 0, 0.6)'
                }}
              >
                See the Risk.
              </span>
              <span
                style={{
                  display: 'block',
                  background: 'linear-gradient(135deg, #fde68a 0%, #f59e0b 45%, #d97706 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  color: '#fbbf24',
                  textShadow: '0 0 35px rgba(245, 158, 11, 0.3)',
                  marginTop: '0.2rem'
                }}
              >
                Before the Ground Moves.
              </span>
            </h1>

            {/* Supporting Text */}
            <p
              style={{
                fontSize: 'clamp(1.05rem, 1.8vw, 1.25rem)',
                lineHeight: 1.65,
                color: 'rgba(241, 245, 249, 0.92)',
                marginBottom: '2.5rem',
                maxWidth: 680,
                fontWeight: 400,
                textShadow: '0 2px 14px rgba(0, 0, 0, 0.8)'
              }}
            >
              AI-powered subsidence monitoring, real-time sensor intelligence, and predictive early warnings designed to help protect underground mine workers.
            </p>

            {/* Action Buttons */}
            <div
              className="hero-cta-group"
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1.25rem',
                marginBottom: '3rem'
              }}
            >
              <Link
                to="/monitoring"
                className="hero-btn-primary"
                style={{
                  background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
                  color: '#090d16',
                  fontWeight: 700,
                  fontSize: '1.02rem',
                  padding: '0.95rem 2rem',
                  borderRadius: 'var(--radius-md, 10px)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 24px rgba(245, 158, 11, 0.45), 0 0 32px rgba(245, 158, 11, 0.25)',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                <Activity size={19} />
                Explore Live Monitoring
                <ArrowRight size={17} />
              </Link>

              <Link
                to="/predictions"
                className="hero-btn-secondary"
                style={{
                  background: 'rgba(10, 16, 31, 0.75)',
                  backdropFilter: 'blur(12px)',
                  color: '#ffffff',
                  fontWeight: 600,
                  fontSize: '1.02rem',
                  padding: '0.95rem 2rem',
                  borderRadius: 'var(--radius-md, 10px)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  textDecoration: 'none',
                  border: '1.5px solid rgba(245, 158, 11, 0.55)',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
                  cursor: 'pointer'
                }}
              >
                <Sparkles size={19} style={{ color: '#fbbf24' }} />
                View Risk Intelligence
              </Link>
            </div>

            {/* Geotechnical Badges & Field Validation */}
            <div
              className="hero-stats-bar"
              style={{
                display: 'inline-flex',
                flexWrap: 'wrap',
                gap: '1.75rem',
                alignItems: 'center',
                padding: '1.1rem 1.65rem',
                borderRadius: 'var(--radius-lg, 16px)',
                background: 'rgba(6, 10, 20, 0.72)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
                maxWidth: 'fit-content'
              }}
            >
              <div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Target Coalfields
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>
                  Jharia &bull; Raniganj
                </div>
              </div>
              <div className="hero-stat-divider" style={{ width: '1px', height: '28px', background: 'rgba(255, 255, 255, 0.12)' }} />
              <div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Sensor Precision
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fbbf24', marginTop: '2px' }}>
                  &plusmn;0.05 mm Strata
                </div>
              </div>
              <div className="hero-stat-divider" style={{ width: '1px', height: '28px', background: 'rgba(255, 255, 255, 0.12)' }} />
              <div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Warning Horizon
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#38bdf8', marginTop: '2px' }}>
                  72 hrs Predictive AI
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 3. PROBLEM STATEMENT SECTION */}
      {/* ------------------------------------------------------------------ */}
      <section
        style={{
          padding: '5.5rem 0',
          background: 'var(--bg-primary)',
          borderBottom: '1px solid var(--border-subtle)'
        }}
      >
        <div className="mg-container">
          <div style={{ textAlign: 'center', maxWidth: 760, margin: '0 auto 3.5rem auto' }}>
            <span className="mg-badge mg-badge-warning" style={{ marginBottom: '0.85rem' }}>
              The Geotechnical Challenge
            </span>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff', marginBottom: '1rem' }}>
              Why Traditional Mine Surveys Fail to Prevent Disasters
            </h2>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
              In Indian underground coal mining (Bord &amp; Pillar depillaring and Longwall extraction), ground movements are dynamic and non-linear. Relying on periodic manual surveys creates critical blind spots that endanger miners and surface infrastructure.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
              marginBottom: '3.5rem'
            }}
          >
            {/* Card 1 */}
            <div className="mg-card">
              <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--risk-critical-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--risk-critical)', marginBottom: '1.25rem' }}>
                <AlertTriangle size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.65rem' }}>
                Periodic Optical Surveys Are Too Slow
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Total stations and optical leveling carried out at 30 to 90-day intervals only observe movement <span style={{ color: '#ffffff', fontWeight: 600 }}>after</span> displacement has already propagated to the surface. Critical roof caving events develop within hours.
              </p>
            </div>

            {/* Card 2 */}
            <div className="mg-card">
              <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'rgba(249, 115, 22, 0.1)', border: '1px solid var(--risk-warning-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--risk-warning)', marginBottom: '1.25rem' }}>
                <Layers size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.65rem' }}>
                Catastrophic Crown Holes &amp; Troughs
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Sudden void migrations create crown holes and continuous subsidence troughs that shatter overlying PWD roadways, railway alignments, high-voltage transmission lines, and regional water tables.
              </p>
            </div>

            {/* Card 3 */}
            <div className="mg-card">
              <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid var(--risk-moderate-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--risk-moderate)', marginBottom: '1.25rem' }}>
                <Users size={22} />
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.65rem' }}>
                Threat to Communities &amp; Habitats
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                In coal belts like Jharia and Raniganj, densely populated villages and towns sit directly above old and active workings. Subsidence causes structural fissures in residential dwellings, crop land loss, and forest degradation.
              </p>
            </div>
          </div>

          {/* Subterranean Strata Cross-Section & Telemetry Node */}
          <div
            style={{
              position: 'relative',
              background: 'radial-gradient(circle at 50% 30%, #152342 0%, #0b1224 80%)',
              borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--border-medium)',
              padding: '2rem',
              boxShadow: 'var(--shadow-lg), 0 0 40px rgba(6, 182, 212, 0.12)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <span className="mg-badge mg-badge-cyan" style={{ marginBottom: '0.35rem' }}>Subterranean Geological Inspection</span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff' }}>
                  Real-Time Strata Cross-Section &amp; Multi-Point Borehole Telemetry
                </h3>
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Bord &amp; Pillar Extraction Overburden Model
              </span>
            </div>

            {/* Geological Scene SVG: Surface, Overburden Strata, Coal Seam, Borehole Sensors & Telemetry */}
            <div style={{ width: '100%', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: '1.5rem' }}>
              <svg viewBox="0 0 540 260" width="100%" height="auto" style={{ display: 'block', background: '#070d1b' }}>
                <defs>
                  <linearGradient id="strata1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1e293b" />
                    <stop offset="100%" stopColor="#0f172a" />
                  </linearGradient>
                  <linearGradient id="coalSeam" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#020617" />
                    <stop offset="100%" stopColor="#0f172a" />
                  </linearGradient>
                  <linearGradient id="troughGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Topography Surface line with developing subsidence trough */}
                <path
                  d="M 10,65 Q 150,65 240,78 Q 280,84 320,78 Q 400,65 530,65 L 530,250 L 10,250 Z"
                  fill="url(#strata1)"
                />

                {/* Ground Surface contour */}
                <path
                  d="M 10,65 Q 150,65 240,78 Q 280,84 320,78 Q 400,65 530,65"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  fill="none"
                />

                {/* Subsidence Trough Strain Zone */}
                <path
                  d="M 210,75 Q 280,95 350,75 L 350,110 Q 280,125 210,110 Z"
                  fill="url(#troughGrad)"
                  stroke="#ef4444"
                  strokeDasharray="4 3"
                />

                {/* Surface Infrastructure (PWD Road & Pylons) */}
                <rect x="50" y="58" width="60" height="6" rx="2" fill="#64748b" />
                <line x1="80" y1="58" x2="80" y2="35" stroke="#94a3b8" strokeWidth="2" />
                <line x1="72" y1="42" x2="88" y2="42" stroke="#94a3b8" strokeWidth="1.5" />

                {/* Subsurface Coal Seam (Seam XI/XII) */}
                <path
                  d="M 10,195 L 200,195 L 210,225 L 10,225 Z"
                  fill="url(#coalSeam)"
                  stroke="#334155"
                />
                <path
                  d="M 360,195 L 530,195 L 530,225 L 360,225 Z"
                  fill="url(#coalSeam)"
                  stroke="#334155"
                />

                {/* Void / Goaf Caving Zone */}
                <rect x="210" y="195" width="150" height="30" fill="#090d16" stroke="#f97316" strokeDasharray="3 3" />
                <text x="285" y="214" fill="#f97316" fontSize="10" fontWeight="bold" textAnchor="middle">
                  DEPILLARING GOAF VOID
                </text>

                {/* Borehole Extensometer 101 */}
                <line x1="280" y1="84" x2="280" y2="195" stroke="#00e5ff" strokeWidth="2" strokeDasharray="4 2" />
                <circle cx="280" cy="84" r="5" fill="#ef4444" />
                <circle cx="280" cy="140" r="3" fill="#00e5ff" />
                <circle cx="280" cy="195" r="4" fill="#00e5ff" />
                <text x="292" y="90" fill="#ef4444" fontSize="9" fontWeight="bold">MPBX-101 (14.8mm)</text>

                {/* Wireless Gateway tower at surface */}
                <line x1="460" y1="65" x2="460" y2="30" stroke="#06b6d4" strokeWidth="2" />
                <circle cx="460" cy="28" r="4" fill="#06b6d4" />
                <path d="M 450,22 Q 460,16 470,22" stroke="#06b6d4" strokeWidth="1.5" fill="none" opacity="0.8" />
                <path d="M 445,18 Q 460,10 475,18" stroke="#06b6d4" strokeWidth="1.5" fill="none" opacity="0.6" />
                <text x="460" y="15" fill="#38bdf8" fontSize="8" fontWeight="bold" textAnchor="middle">LoRaWAN MESH</text>

                {/* Strata Labels */}
                <text x="25" y="140" fill="#64748b" fontSize="9">Overburden Sandstone (145m)</text>
                <text x="25" y="214" fill="#94a3b8" fontSize="9" fontWeight="bold">Coal Seam XI (Bord &amp; Pillar)</text>
              </svg>
            </div>

            {/* Mini Live Telemetry Preview Card */}
            <div
              style={{
                background: 'rgba(10, 16, 31, 0.85)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-cyan)',
                padding: '1.25rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--risk-critical)', animation: 'pulse-radar 1.5s infinite' }} />
                  <strong style={{ fontSize: '0.88rem', color: 'var(--text-main)' }}>
                    Live Telemetry Node: MPBX-101
                  </strong>
                </div>
                <span className="mg-badge mg-badge-critical mg-badge-sm">
                  Critical Strain
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '0.85rem' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Differential Disp.</div>
                  <div className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--risk-critical)' }}>14.8 mm</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Subsidence Rate</div>
                  <div className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--risk-warning)' }}>3.4 mm/d</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Strata Tilt</div>
                  <div className="font-mono" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--cyan-bright)' }}>4.6 mm/m</div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                <span>Sector: Panel 4B Depillaring Face (Jharia)</span>
                <span style={{ color: 'var(--cyan-bright)' }}>Illustrative Geotechnical Telemetry</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 4. HOW MINEGUARD WORKS (5 CONNECTED STEPS) */}
      {/* ------------------------------------------------------------------ */}
      <section
        id="how-it-works"
        style={{
          padding: '5.5rem 0',
          background: 'var(--bg-app)',
          borderBottom: '1px solid var(--border-subtle)'
        }}
      >
        <div className="mg-container">
          <div style={{ textAlign: 'center', maxWidth: 740, margin: '0 auto 3.5rem auto' }}>
            <span className="mg-badge mg-badge-cyan" style={{ marginBottom: '0.85rem' }}>
              The 5-Stage Early Warning Pipeline
            </span>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '1rem' }}>
              How MineGuard Protects Mining Operations
            </h2>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
              From deep borehole rock anchors to real-time control room alarms, MineGuard forms an unbreakable geotechnical safety net.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
              gap: '1.25rem',
              position: 'relative'
            }}
          >
            {[
              {
                step: '01',
                title: 'Sense',
                icon: Cpu,
                color: '#06b6d4',
                desc: 'Borehole extensometers, tiltmeters, geophones, and crackmeters capture sub-millimeter displacement and vibration at continuous intervals.'
              },
              {
                step: '02',
                title: 'Transmit',
                icon: Wifi,
                color: '#38bdf8',
                desc: 'Subterranean repeaters and intrinsically safe LoRaWAN gateways relay telemetry to surface nodes even through rugged rock mass.'
              },
              {
                step: '03',
                title: 'Analyze',
                icon: Sparkles,
                color: '#a855f7',
                desc: 'FastAPI telemetry pipelines and deep learning autoencoders detect abnormal strain velocity and isolate mechanical noise.'
              },
              {
                step: '04',
                title: 'Visualize',
                icon: MapIcon,
                color: '#f59e0b',
                desc: 'Web GIS cartography displays subsidence contours, spatial risk heatmap sectors, and 3D strata vector displacements in real time.'
              },
              {
                step: '05',
                title: 'Alert',
                icon: BellRing,
                color: '#ef4444',
                desc: 'Automated DGMS-aligned SMS, email escalation chains, and audible control-room klaxons trigger safe evacuation protocols.'
              }
            ].map((st) => {
              const Icon = st.icon;
              return (
                <div
                  key={st.step}
                  className="mg-card"
                  style={{
                    position: 'relative',
                    borderTop: `3px solid ${st.color}`,
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span className="font-mono" style={{ fontSize: '1.2rem', fontWeight: 800, color: st.color }}>
                      {st.step}
                    </span>
                    <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: `${st.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: st.color }}>
                      <Icon size={18} />
                    </div>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
                    {st.title}
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                    {st.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 5. FEATURES SECTION */}
      {/* ------------------------------------------------------------------ */}
      <section
        id="features"
        style={{
          padding: '5.5rem 0',
          background: 'var(--bg-primary)',
          borderBottom: '1px solid var(--border-subtle)'
        }}
      >
        <div className="mg-container">
          <div style={{ textAlign: 'center', maxWidth: 740, margin: '0 auto 3.5rem auto' }}>
            <span className="mg-badge mg-badge-cyan" style={{ marginBottom: '0.85rem' }}>
              Engineered for Extreme Underground Conditions
            </span>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '1rem' }}>
              Comprehensive Platform Capabilities
            </h2>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
              Designed to withstand severe moisture, coal dust, high vibration, and intermittent power in underground coal mines.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))',
              gap: '1.5rem'
            }}
          >
            {[
              {
                title: 'Real-Time Sensor Monitoring',
                icon: Activity,
                color: '#06b6d4',
                desc: 'Continuous multi-point borehole extensometers, vibrating-wire crackmeters, and in-place inclinometers telemetry streamed live.'
              },
              {
                title: 'AI Anomaly Detection',
                icon: Sparkles,
                color: '#38bdf8',
                desc: 'Bi-LSTM neural networks and Isolation Forests detect non-linear strata strain signatures 48 to 72 hours before visible cracking.'
              },
              {
                title: 'Subsidence Trend Analysis',
                icon: TrendingUp,
                color: '#10b981',
                desc: 'Automated velocity (mm/day) calculation, acceleration rate curve fitting, and empirical Knothe subsidence prediction models.'
              },
              {
                title: 'GIS-Based Risk Maps',
                icon: MapIcon,
                color: '#f59e0b',
                desc: 'Leaflet geospatial mapping with high-resolution satellite imagery, subsidence trough contours, and extraction panel overlays.'
              },
              {
                title: 'Early Warning & Incident SOP',
                icon: BellRing,
                color: '#ef4444',
                desc: 'DGMS circular-compliant evacuation procedures, escalation matrices, and digital audit logging for regulatory reviews.'
              },
              {
                title: 'Historical Analytics & Reports',
                icon: BarChart3,
                color: '#6366f1',
                desc: 'Cross-sensor correlation, rainfall-induced strata softening graphs, and one-click PDF/CSV compliance exports.'
              },
              {
                title: 'Low-Power Sensor Support',
                icon: Zap,
                color: '#eab308',
                desc: 'Ultra-low-power LoRaWAN sensor nodes with up to 5-year battery life, sleeping algorithms, and autonomous mesh routing.'
              },
              {
                title: 'Offline-First & Auto-Sync',
                icon: Database,
                color: '#14b8a6',
                desc: 'Robust underground gateway caching ensures zero data loss during main trunk power outages or comms severing.'
              }
            ].map((f, idx) => {
              const Icon = f.icon;
              return (
                <div key={idx} className="mg-card mg-card-interactive" style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', background: `${f.color}15`, border: `1px solid ${f.color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: f.color, marginBottom: '1.25rem' }}>
                    <Icon size={22} />
                  </div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.6rem' }}>
                    {f.title}
                  </h3>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 6. SYSTEM ARCHITECTURE SECTION */}
      {/* ------------------------------------------------------------------ */}
      <section
        id="tech-stack"
        style={{
          padding: '5.5rem 0',
          background: 'var(--bg-app)',
          borderBottom: '1px solid var(--border-subtle)'
        }}
      >
        <div className="mg-container">
          <div style={{ textAlign: 'center', maxWidth: 740, margin: '0 auto 3.5rem auto' }}>
            <span className="mg-badge mg-badge-cyan" style={{ marginBottom: '0.85rem' }}>
              Full-Stack Engineering Pipeline
            </span>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '1rem' }}>
              System Architecture &amp; Data Flow
            </h2>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.65 }}>
              An end-to-end telemetry pipeline designed for sub-second geotechnical alert dispatch.
            </p>
          </div>

          {/* Visual Architecture Flow Diagram */}
          <div
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-xl)',
              padding: '2.5rem 1.5rem',
              boxShadow: 'var(--shadow-lg)',
              marginBottom: '3rem'
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '1rem',
                alignItems: 'center',
                textAlign: 'center'
              }}
            >
              {[
                { title: 'Sensor Nodes', sub: 'Extensometers, IPI, Geophones', icon: Cpu, badge: 'LoRa/RS485' },
                { title: 'Wireless Gateway', sub: 'Sub-surface Mesh Receiver', icon: Wifi, badge: 'MQTT / LoRaWAN' },
                { title: 'FastAPI Backend', sub: 'Telemetry Ingestion Engine', icon: Server, badge: 'Phase 2 Ready' },
                { title: 'Database & AI', sub: 'TimescaleDB + Scikit/PyTorch', icon: Database, badge: 'Sub-second ML' },
                { title: 'React Dashboard', sub: 'Industrial Web Command Center', icon: Activity, badge: 'Phase 1 Active' },
                { title: 'Early Warning', sub: 'DGMS SMS, Siren, Email Alerts', icon: BellRing, badge: 'Immediate' }
              ].map((node, i, arr) => {
                const Icon = node.icon;
                return (
                  <React.Fragment key={node.title}>
                    <div
                      style={{
                        background: 'rgba(10, 16, 31, 0.8)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-lg)',
                        padding: '1.25rem 0.75rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        position: 'relative'
                      }}
                    >
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: 'var(--radius-md)',
                          background: 'rgba(6, 182, 212, 0.1)',
                          border: '1px solid var(--border-cyan)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--cyan-bright)',
                          marginBottom: '0.75rem'
                        }}
                      >
                        <Icon size={20} />
                      </div>
                      <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.25rem' }}>
                        {node.title}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', lineHeight: 1.3 }}>
                        {node.sub}
                      </div>
                      <span className="mg-badge mg-badge-cyan mg-badge-sm" style={{ fontSize: '0.68rem' }}>
                        {node.badge}
                      </span>
                    </div>

                    {i < arr.length - 1 && (
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          color: 'var(--cyan-bright)',
                          opacity: 0.6
                        }}
                      >
                        <ArrowRight size={20} style={{ transform: 'rotate(0deg)' }} />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 7. OPERATOR BENEFITS SECTION */}
      {/* ------------------------------------------------------------------ */}
      <section
        id="benefits"
        style={{
          padding: '5.5rem 0',
          background: 'var(--bg-primary)',
          borderBottom: '1px solid var(--border-subtle)'
        }}
      >
        <div className="mg-container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '3rem',
              alignItems: 'center'
            }}
          >
            <div>
              <span className="mg-badge mg-badge-cyan" style={{ marginBottom: '1rem' }}>
                Operational &amp; Regulatory Value
              </span>
              <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '1.25rem' }}>
                Engineered for Mine Operators &amp; Safety Officers
              </h2>
              <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: '2rem' }}>
                MineGuard is built specifically around the challenges of Indian public and private coal operations (BCCL, ECL, SECL, SCCL, Tata Steel Mining), balancing safety mandates with continuous production.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {[
                  {
                    title: 'Full Compliance with DGMS Safety Circulars',
                    desc: 'Pre-calibrated thresholds matching Directorate General of Mines Safety guidelines for depillaring and goaf edge monitoring.'
                  },
                  {
                    title: 'Zero-Fatality Underground Workings',
                    desc: 'Evacuate depillaring crews ahead of dynamic air blasts and major strata falls caused by overhang roof cantilever collapse.'
                  },
                  {
                    title: 'Protection of Surface Infrastructure & Rail Corridors',
                    desc: 'Avoid multi-crore damages and legal liabilities from railway siding bucklings or highway collapses.'
                  },
                  {
                    title: 'Optimized Depillaring Extraction Rates',
                    desc: 'Extract coal with confidence knowing real-time ground strain boundaries, maximizing recovery while safeguarding personnel.'
                  }
                ].map((b, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.85rem' }}>
                    <div style={{ color: 'var(--cyan-bright)', marginTop: '2px', flexShrink: 0 }}>
                      <CheckCircle2 size={20} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.25rem' }}>
                        {b.title}
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {b.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Colliery Safety Certification Card */}
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(15, 24, 47, 0.95), rgba(6, 10, 20, 0.95))',
                border: '1px solid var(--border-medium)',
                borderRadius: 'var(--radius-xl)',
                padding: '2rem',
                boxShadow: 'var(--shadow-lg)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
                <FileCheck2 size={28} color="var(--cyan-bright)" />
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>
                    MineGuard Audit Certification
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    Colliery Deployment Readiness Verification
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Colliery License:</span>
                  <span className="font-mono" style={{ fontWeight: 600, color: '#ffffff' }}>DGMS/DHN/2026/A-09</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Active Telemetry Nodes:</span>
                  <span className="font-mono" style={{ fontWeight: 600, color: 'var(--cyan-bright)' }}>42 Monitored</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Model Anomaly Confidence:</span>
                  <span className="font-mono" style={{ fontWeight: 600, color: 'var(--teal-accent)' }}>94.2% Predictive</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>FastAPI Gateway Latency:</span>
                  <span className="font-mono" style={{ fontWeight: 600, color: '#ffffff' }}>&lt; 45 ms Target</span>
                </div>
              </div>

              <div style={{ background: 'rgba(6, 182, 212, 0.06)', border: '1px solid var(--border-cyan)', borderRadius: 'var(--radius-md)', padding: '1rem', textAlign: 'center' }}>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
                  Explore how MineGuard operates with live geotechnical datasets.
                </p>
                <Link to="/dashboard" className="mg-btn mg-btn-primary" style={{ width: '100%' }}>
                  Launch Command Center &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* 8. FINAL CALL TO ACTION */}
      {/* ------------------------------------------------------------------ */}
      <section
        style={{
          padding: '6rem 0',
          background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(6, 182, 212, 0.12), transparent 70%)',
          textAlign: 'center'
        }}
      >
        <div className="mg-container">
          <div style={{ maxWidth: 680, margin: '0 auto' }}>
            <span className="mg-badge mg-badge-cyan" style={{ marginBottom: '1.25rem' }}>
              Phase 1 Frontend Demonstration Ready
            </span>
            <h2 style={{ fontSize: 'clamp(2rem, 4.5vw, 3.2rem)', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: '1.25rem' }}>
              Secure Your Mine Perimeter Today
            </h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2.5rem' }}>
              Access the safety dashboard, analyze simulated geotechnical strain across Indian coalfields, and prepare your colliery for Phase 2 FastAPI integration.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
              <Link to="/dashboard" className="mg-btn mg-btn-primary mg-btn-lg">
                Enter Safety Command Center <ArrowRight size={18} />
              </Link>
              <Link to="/login" className="mg-btn mg-btn-secondary mg-btn-lg">
                Safety Officer Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};
