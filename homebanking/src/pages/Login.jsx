// Login.jsx — Portal del Cliente (Banca por Internet Caja Arequipa)
// Acceso con Tarjeta + DNI + Clave, o con Correo + Contraseña.
// Versión de entrega: sin usuarios de prueba ni referencias internas.
import { useState, useEffect, useRef } from 'react';
import Icon from '../components/Icon';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ── Paleta de marca Caja Arequipa ──────────────────────
const NAVY  = '#062a52';
const TEAL  = '#16b8c6';
const TEAL2 = '#0fa0ad';
const MAX_INTENTOS = 5;
const BLOQUEO_SEG  = 300;

// ── FOTO DEL HERO ──────────────────────────────────────
const HERO_LOCAL    = '/img/login-hero.jpg';
const HERO_FALLBACK = 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1000&q=80';

const fmtTarjeta = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ').trim();

export default function Login() {
  const { login, loginTarjeta, user } = useAuth();
  const navigate = useNavigate();

  const [modo, setModo]   = useState('tarjeta');
  const [tarjeta, setTarjeta] = useState('');
  const [dni, setDni]     = useState('');
  const [clave, setClave] = useState('');
  const [recordar, setRecordar] = useState(false);
  const [noRobot, setNoRobot]   = useState(false);
  const [email, setEmail] = useState('');
  const [showPass, setShowPass] = useState(false);

  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [intentos, setIntentos] = useState(0);
  const [bloqueado, setBloqueado] = useState(false);
  const [segundos, setSegundos] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    try { const t = localStorage.getItem('ca_tarjeta'); if (t) { setTarjeta(fmtTarjeta(t)); setRecordar(true); } } catch {}
  }, []);
  useEffect(() => { if (user) navigate('/', { replace: true }); }, [user, navigate]);
  useEffect(() => {
    if (bloqueado && segundos > 0) timerRef.current = setTimeout(() => setSegundos(s => s - 1), 1000);
    else if (bloqueado && segundos === 0) { setBloqueado(false); setIntentos(0); setError(''); }
    return () => clearTimeout(timerRef.current);
  }, [bloqueado, segundos]);

  const tarjetaDigits = tarjeta.replace(/\D/g, '');

  const fallar = (msg) => {
    const n = intentos + 1; setIntentos(n);
    if (n >= MAX_INTENTOS) { setBloqueado(true); setSegundos(BLOQUEO_SEG); setError(`Demasiados intentos. Espera ${BLOQUEO_SEG/60} min.`); }
    else setError(`${msg} · Intento ${n}/${MAX_INTENTOS}`);
  };
  const onRol = (rol) => {
    // Solo clientes acceden al portal de banca por internet.
    if (rol && rol !== 'cliente') {
      fallar('Esta cuenta no corresponde al portal del cliente.');
      return;
    }
    navigate('/homebanking', { replace:true });
  };

  const submitTarjeta = async (e) => {
    e.preventDefault();
    if (bloqueado) return;
    if (tarjetaDigits.length !== 16) { setError('El número de tarjeta debe tener 16 dígitos.'); return; }
    if (dni.length !== 8)            { setError('El DNI debe tener 8 dígitos.'); return; }
    if (!clave)                      { setError('Ingresa tu clave.'); return; }
    if (!noRobot)                    { setError('Confirma que no eres un robot.'); return; }
    setError(''); setLoading(true);
    try {
      if (recordar) localStorage.setItem('ca_tarjeta', tarjetaDigits); else localStorage.removeItem('ca_tarjeta');
      const data = await loginTarjeta(tarjetaDigits, dni, clave);
      onRol(data?.user?.rol);
    } catch (err) { fallar(err.response?.data?.message || 'Datos incorrectos.'); }
    finally { setLoading(false); }
  };

  const submitCorreo = async (e) => {
    e.preventDefault();
    if (bloqueado) return;
    if (!email.includes('@')) { setError('Correo inválido.'); return; }
    if (!clave)               { setError('Ingresa tu contraseña.'); return; }
    setError(''); setLoading(true);
    try { const data = await login(email.trim().toLowerCase(), clave); onRol(data?.user?.rol); }
    catch (err) { fallar(err.response?.data?.message || 'Credenciales incorrectas.'); }
    finally { setLoading(false); }
  };

  const onHeroError = (e) => {
    if (!e.target.dataset.fb) { e.target.dataset.fb = '1'; e.target.src = HERO_FALLBACK; }
    else { e.target.style.display = 'none'; }
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', fontFamily:"'DM Sans',system-ui,sans-serif", background:'#eef2f7' }}>

      {/* ── Panel izquierdo: FOTO REAL + capa azul ────── */}
      <div style={{ flex:'1 1 46%', position:'relative', background:NAVY, color:'#fff', overflow:'hidden', minHeight:'100vh' }}>
        <img src={HERO_LOCAL} alt="Emprendedores Caja Arequipa" onError={onHeroError}
          style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />
        <div style={{ position:'absolute', inset:0,
          background:`linear-gradient(165deg, rgba(6,42,82,.92) 0%, rgba(6,42,82,.62) 45%, rgba(10,58,107,.45) 100%)` }} />

        <div style={{ position:'relative', height:'100%', minHeight:'100vh', padding:'48px 52px', display:'flex', flexDirection:'column', justifyContent:'space-between', boxSizing:'border-box' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:12 }}>
              <img src="/img/logo-caja-arequipa.png" alt="Caja Arequipa" style={{ height:40, objectFit:'contain' }} />
            </div>
            <span style={{ fontSize:11, opacity:.75, marginLeft:46 }}>40 años · Banca por Internet</span>
          </div>

          <div>
            <h1 style={{ fontFamily:"'Sora',sans-serif", fontSize:36, lineHeight:1.18, marginBottom:14, textShadow:'0 2px 12px rgba(0,0,0,.35)' }}>
              Haz crecer<br/>tu negocio con<br/><span style={{ color:TEAL }}>Caja Arequipa</span>
            </h1>
            <p style={{ fontSize:14, opacity:.92, maxWidth:380, textShadow:'0 1px 8px rgba(0,0,0,.4)' }}>
              Accede con tu Tarjeta de Débito, DNI y clave. Consulta saldos, paga servicios y solicita tu crédito 100% online, los 7 días de la semana.
            </p>
          </div>

          <div style={{ display:'flex', gap:10, flexWrap:'wrap', fontSize:11 }}>
            {[['lock','SSL 256-bit'],['shield','Supervisado por la SBS'],['bank','Fondo de Seguro de Depósitos']].map(([ic,b]) => (
              <span key={b} style={{ background:'rgba(0,0,0,.28)', padding:'6px 12px', borderRadius:20, backdropFilter:'blur(2px)', display:'inline-flex', alignItems:'center', gap:6 }}><Icon name={ic} size={13} color="rgba(255,255,255,.9)"/> {b}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Panel derecho: formulario ────────────────── */}
      <div style={{ flex:'1 1 54%', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
        <div style={{ width:'100%', maxWidth:420, background:'#fff', borderRadius:18, padding:'34px 34px 28px', boxShadow:'0 10px 40px rgba(6,42,82,.12)' }}>
          <h2 style={{ fontFamily:"'Sora',sans-serif", color:NAVY, fontSize:22, marginBottom:4 }}>Banca por Internet</h2>
          <div style={{ fontSize:11.5, color:'#0FA0AD', fontWeight:700, marginBottom:2 }}>PORTAL DEL CLIENTE</div>
          <p style={{ color:'#7b89a3', fontSize:13, marginBottom:20 }}>Ingresa para administrar tus cuentas</p>

          <div style={{ display:'flex', background:'#eef2f7', borderRadius:10, padding:4, marginBottom:22 }}>
            {[['tarjeta','Con Tarjeta'],['correo','Con Correo']].map(([k,l]) => (
              <button key={k} onClick={() => { setModo(k); setError(''); }}
                style={{ flex:1, padding:'8px 0', border:'none', borderRadius:8, cursor:'pointer', fontWeight:700, fontSize:13,
                  background: modo===k ? '#fff':'transparent', color: modo===k ? NAVY:'#7b89a3', boxShadow: modo===k ? '0 1px 4px rgba(0,0,0,.08)':'none' }}>{l}</button>
            ))}
          </div>

          {error && <div style={{ background:'#fee2e2', color:'#dc2626', padding:'10px 14px', borderRadius:10, fontSize:12.5, marginBottom:16 }} ><span style={{display:'inline-flex',alignItems:'center',gap:6}}><Icon name="alert" size={14} color="#dc2626"/> {error}</span></div>}

          {modo === 'tarjeta' && (
            <form onSubmit={submitTarjeta}>
              <Field label="Número de Tarjeta de Débito">
                <input value={tarjeta} onChange={e => setTarjeta(fmtTarjeta(e.target.value))} inputMode="numeric"
                  placeholder="0000 0000 0000 0000" disabled={bloqueado} style={{ ...inp, letterSpacing:2, fontFamily:'monospace' }} />
              </Field>
              <Field label="Número de Documento (DNI)">
                <input value={dni} onChange={e => setDni(e.target.value.replace(/\D/g,'').slice(0,8))} inputMode="numeric"
                  placeholder="00000000" disabled={bloqueado} style={inp} />
              </Field>
              <Field label="Clave de Internet">
                <div style={{ position:'relative' }}>
                  <input type={showPass?'text':'password'} value={clave} onChange={e => setClave(e.target.value)} placeholder="••••••••" disabled={bloqueado} style={{ ...inp, paddingRight:64 }} />
                  <button type="button" onClick={() => setShowPass(s => !s)} style={verBtn}>{showPass?'Ocultar':'Ver'}</button>
                </div>
              </Field>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', margin:'4px 0 14px', fontSize:12.5 }}>
                <label style={{ display:'flex', alignItems:'center', gap:7, color:'#5b6b86', cursor:'pointer' }}>
                  <input type="checkbox" checked={recordar} onChange={e => setRecordar(e.target.checked)} /> Recordar tarjeta
                </label>
                <a style={{ color:TEAL2, fontWeight:600, cursor:'pointer' }}>¿Olvidaste tu clave?</a>
              </div>
              <label style={{ display:'flex', alignItems:'center', gap:12, border:'1px solid #d8dee9', borderRadius:8, padding:'12px 14px', marginBottom:18, cursor:'pointer', background:'#fafbfd' }}>
                <input type="checkbox" checked={noRobot} onChange={e => setNoRobot(e.target.checked)} style={{ width:22, height:22 }} />
                <span style={{ fontSize:13, color:'#5b6b86', flex:1 }}>No soy un robot</span>
                <span style={{ fontSize:10, color:'#9aa6bd', textAlign:'center', lineHeight:1.2 }}>reCAPTCHA<br/>Privacidad · Términos</span>
              </label>
              <button type="submit" disabled={loading || bloqueado} style={btn(loading || bloqueado)}>{loading ? 'Verificando…' : 'Ingresar'}</button>
            </form>
          )}

          {modo === 'correo' && (
            <form onSubmit={submitCorreo}>
              <Field label="Correo electrónico">
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tucorreo@ejemplo.com" disabled={bloqueado} style={inp} />
              </Field>
              <Field label="Contraseña">
                <div style={{ position:'relative' }}>
                  <input type={showPass?'text':'password'} value={clave} onChange={e => setClave(e.target.value)} placeholder="••••••••" disabled={bloqueado} style={{ ...inp, paddingRight:64 }} />
                  <button type="button" onClick={() => setShowPass(s => !s)} style={verBtn}>{showPass?'Ocultar':'Ver'}</button>
                </div>
              </Field>
              <button type="submit" disabled={loading || bloqueado} style={{ ...btn(loading || bloqueado), marginTop:6 }}>{loading ? 'Verificando…' : 'Ingresar'}</button>
            </form>
          )}

          <p style={{ textAlign:'center', marginTop:18, fontSize:12.5, color:'#7b89a3' }}>
            ¿No tienes cuenta? <Link to="/register" style={{ color:TEAL2, fontWeight:700 }}>Regístrate</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const inp = { width:'100%', padding:'10px 12px', borderRadius:8, border:'1px solid #d8dee9', fontSize:14, outline:'none', boxSizing:'border-box' };
const verBtn = { position:'absolute', right:10, top:9, border:'none', background:'none', color:TEAL2, fontSize:12, fontWeight:700, cursor:'pointer' };
const btn = (dis) => ({ width:'100%', padding:'12px 0', border:'none', borderRadius:10, cursor: dis?'not-allowed':'pointer',
  background: dis ? '#9fd6dc' : `linear-gradient(90deg, ${TEAL} 0%, ${TEAL2} 100%)`, color:'#fff', fontWeight:800, fontSize:15, letterSpacing:.3 });

function Field({ label, children }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:'block', fontSize:12, fontWeight:700, color:'#5b6b86', marginBottom:6 }}>{label}</label>
      {children}
    </div>
  );
}