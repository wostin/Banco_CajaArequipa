// Login.jsx — Core Financiero · Portal del personal autorizado
// Versión de entrega: sin usuarios de prueba ni datos demo visibles.
import { useState, useEffect, useRef } from 'react';
import Icon from '../components/Icon';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAVY  = '#062a52';
const TEAL  = '#16b8c6';
const TEAL2 = '#0fa0ad';
const MAX_INTENTOS = 5;
const BLOQUEO_SEG  = 300;

const HERO_LOCAL    = '/img/login-hero.jpg';
const HERO_FALLBACK = 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1000&q=80';

export default function Login() {
  const { loginUsuario, user } = useAuth();
  const navigate = useNavigate();

  const [usuario, setUsuario] = useState('');
  const [clave, setClave]     = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [intentos, setIntentos] = useState(0);
  const [bloqueado, setBloqueado] = useState(false);
  const [segundos, setSegundos]   = useState(0);
  const timerRef = useRef(null);

  useEffect(() => { if (user) navigate('/', { replace: true }); }, [user, navigate]);
  useEffect(() => {
    if (bloqueado && segundos > 0) timerRef.current = setTimeout(() => setSegundos(s => s - 1), 1000);
    else if (bloqueado && segundos === 0) { setBloqueado(false); setIntentos(0); setError(''); }
    return () => clearTimeout(timerRef.current);
  }, [bloqueado, segundos]);

  const fallar = (msg) => {
    const n = intentos + 1; setIntentos(n);
    if (n >= MAX_INTENTOS) { setBloqueado(true); setSegundos(BLOQUEO_SEG); setError(`Demasiados intentos. Espera ${BLOQUEO_SEG/60} min.`); }
    else setError(`${msg} · Intento ${n}/${MAX_INTENTOS}`);
  };

  const onRol = (rol) => {
    const rolesPersonal = ['asesor','administrador','jefe_regional','riesgos','comite','analista','admin','gerente'];
    if (!rol || !rolesPersonal.includes(rol)) {
      fallar('Acceso exclusivo para personal autorizado del banco.');
      return;
    }
    navigate('/', { replace: true });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (bloqueado) return;
    if (!usuario.trim()) { setError('Ingresa tu usuario (DNI).'); return; }
    if (!clave)          { setError('Ingresa tu contraseña.'); return; }
    setError(''); setLoading(true);
    try {
      const data = await loginUsuario(usuario.trim(), clave);
      onRol(data?.user?.rol);
    } catch (err) { fallar(err.response?.data?.message || 'Credenciales incorrectas.'); }
    finally { setLoading(false); }
  };

  const onHeroError = (e) => {
    if (!e.target.dataset.fb) { e.target.dataset.fb = '1'; e.target.src = HERO_FALLBACK; }
    else { e.target.style.display = 'none'; }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', fontFamily:"'DM Sans',system-ui,sans-serif", background:'#eef2f7' }}>
      <div style={{ flex:'1 1 46%', position:'relative', background:NAVY, color:'#fff', overflow:'hidden', minHeight:'100vh' }}>
        <img src={HERO_LOCAL} alt="Caja Arequipa" onError={onHeroError}
          style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />
        <div style={{ position:'absolute', inset:0,
          background:`linear-gradient(165deg, rgba(6,42,82,.92) 0%, rgba(6,42,82,.62) 45%, rgba(10,58,107,.45) 100%)` }} />
        <div style={{ position:'relative', height:'100%', minHeight:'100vh', padding:'48px 52px', display:'flex', flexDirection:'column', justifyContent:'space-between', boxSizing:'border-box' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <img src="/img/logo-caja-arequipa.png" alt="Caja Arequipa" style={{ height:40, objectFit:'contain' }} />
            </div>
            <span style={{ fontSize:11, opacity:.75, marginLeft:46 }}>40 años · Sistema Core Financiero</span>
          </div>
          <div>
            <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:36, lineHeight:1.18, marginBottom:14, textShadow:'0 2px 12px rgba(0,0,0,.35)' }}>
              Sistema Central<br/>de <span style={{ color:TEAL }}>Caja Arequipa</span>
            </h1>
            <p style={{ fontSize:14, opacity:.92, maxWidth:380, textShadow:'0 1px 8px rgba(0,0,0,.4)' }}>
              Acceso exclusivo para el personal autorizado. Gestiona créditos, clientes y operaciones del banco.
            </p>
          </div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap', fontSize:11 }}>
            {[['lock','SSL 256-bit'],['shield','Supervisado por la SBS'],['bank','Acceso Restringido']].map(([ic,b]) => (
              <span key={b} style={{ background:'rgba(0,0,0,.28)', padding:'6px 12px', borderRadius:20, backdropFilter:'blur(2px)', display:'inline-flex', alignItems:'center', gap:6 }}>
                <Icon name={ic} size={13} color="rgba(255,255,255,.9)"/> {b}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ flex:'1 1 54%', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
        <div style={{ width:'100%', maxWidth:420, background:'#fff', borderRadius:18, padding:'34px 34px 28px', boxShadow:'0 10px 40px rgba(6,42,82,.12)' }}>
          <h2 style={{ fontFamily:"'Sora',sans-serif", color:NAVY, fontSize:22, marginBottom:4 }}>Core Financiero</h2>
          <div style={{ fontSize:11.5, color:TEAL2, fontWeight:700, marginBottom:2 }}>SISTEMA CENTRAL DEL BANCO</div>
          <p style={{ color:'#7b89a3', fontSize:13, marginBottom:24 }}>Acceso exclusivo para el personal autorizado</p>

          {error && (
            <div style={{ background:'#fee2e2', color:'#dc2626', padding:'10px 14px', borderRadius:10, fontSize:12.5, marginBottom:16 }}>
              <span style={{display:'inline-flex',alignItems:'center',gap:6}}>
                <Icon name="alert" size={14} color="#dc2626"/> {error}
              </span>
            </div>
          )}

          <form onSubmit={submit}>
            <Field label="Usuario (DNI del personal)">
              <input value={usuario} onChange={e => setUsuario(e.target.value)}
                placeholder="Ingresa tu DNI" disabled={bloqueado} style={inp} />
            </Field>
            <Field label="Contraseña">
              <div style={{ position:'relative' }}>
                <input type={showPass?'text':'password'} value={clave} onChange={e => setClave(e.target.value)}
                  placeholder="••••••••" disabled={bloqueado} style={{ ...inp, paddingRight:64 }} />
                <button type="button" onClick={() => setShowPass(s => !s)} style={verBtn}>
                  {showPass?'Ocultar':'Ver'}
                </button>
              </div>
            </Field>
            <button type="submit" disabled={loading || bloqueado} style={{ ...btn(loading || bloqueado), marginTop:8 }}>
              {loading ? 'Verificando…' : 'Ingresar'}
            </button>
          </form>

          <p style={{ textAlign:'center', marginTop:20, fontSize:12, color:'#7b89a3' }}>
            ¿Eres cliente? Usa el{' '}
            <a href={import.meta.env.VITE_HOMEBANKING_URL || '#'} style={{ color:TEAL2, fontWeight:700 }}>
              Portal Homebanking
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

const inp = { width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid #d8dee9', fontSize:14, outline:'none', boxSizing:'border-box' };
const verBtn = { position:'absolute', right:10, top:9, border:'none', background:'none', color:TEAL2, fontSize:12, fontWeight:700, cursor:'pointer' };
const btn = (dis) => ({ width:'100%', padding:'12px 0', border:'none', borderRadius:10, cursor: dis?'not-allowed':'pointer',
  background: dis ? '#9fd6dc' : `linear-gradient(90deg, ${TEAL} 0%, ${TEAL2} 100%)`, color:'#fff', fontWeight:800, fontSize:15 });

function Field({ label, children }) {
  return (
    <div style={{ marginBottom:16 }}>
      <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#5b6b86', marginBottom:6 }}>{label}</label>
      {children}
    </div>
  );
}