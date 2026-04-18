import { useEffect, useRef, useState, useCallback } from 'react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const ATTENDEE_TYPE_LABELS = {
  student: 'Student',
  retired: 'Retired',
  working_professional: 'Working Professional',
};

const styles = {
  page: {
    minHeight: 'calc(100vh - 60px)',
    background: '#0a0a0f',
    padding: '24px 16px 48px',
    color: '#f0ede8',
  },
  wrap: { maxWidth: 520, margin: '0 auto' },
  scanBox: {
    background: '#13131a',
    borderRadius: 16,
    border: '1.5px solid rgba(255,255,255,0.08)',
    overflow: 'hidden',
    marginBottom: 14,
    position: 'relative',
  },
  btnPrimary: {
    flex: 1,
    padding: '12px',
    background: '#f97316',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
  btnSecondary: {
    flex: 1,
    padding: '12px',
    background: '#1c1c26',
    color: '#f0ede8',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10,
    fontSize: 14,
    cursor: 'pointer',
  },
  statusBox: (type) => ({
    padding: '13px 16px',
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 500,
    marginBottom: 14,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    ...(type === 'loading' ? {
      background: 'rgba(96,165,250,0.08)',
      border: '1px solid rgba(96,165,250,0.2)',
      color: '#60a5fa',
    } : {
      background: 'rgba(239,68,68,0.08)',
      border: '1px solid rgba(239,68,68,0.2)',
      color: '#f87171',
    }),
  }),
  card: {
    background: '#13131a',
    borderRadius: 16,
    border: '1px solid rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
};

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }}>
      <circle cx="8" cy="8" r="6" fill="none" stroke="rgba(96,165,250,0.25)" strokeWidth="2.5" />
      <path d="M8 2a6 6 0 0 1 6 6" fill="none" stroke="#60a5fa" strokeWidth="2.5" strokeLinecap="round" />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </svg>
  );
}

export default function ScannerPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [loading, setLoading] = useState('');
  const [error, setError] = useState('');
  const [attendee, setAttendee] = useState(null);
  const [flash, setFlash] = useState(null); // null | 'validated' | 'already'
  const [manualId, setManualId] = useState('');
  const html5Ref = useRef(null);
  const lastScan = useRef('');
  const flashTimerRef = useRef(null);

  const stopScanner = useCallback(async () => {
    if (html5Ref.current) {
      try { await html5Ref.current.stop(); html5Ref.current.clear(); } catch { /* ignore */ }
      html5Ref.current = null;
    }
    setIsScanning(false);
  }, []);

  const startScanner = useCallback(async () => {
    setError('');
    lastScan.current = '';
    const { Html5Qrcode } = await import('html5-qrcode');
    const scanner = new Html5Qrcode('qr-reader');
    html5Ref.current = scanner;
    try {
      const cameras = await Html5Qrcode.getCameras();
      if (!cameras.length) {
        setError('No camera detected. Please connect a camera and try again.');
        return;
      }
      const camId = cameras[cameras.length - 1].id;
      await scanner.start(
        camId,
        { fps: 10, qrbox: { width: 240, height: 240 } },
        handleScanSuccess,
        () => { /* silent decode failures */ }
      );
      setIsScanning(true);
    } catch (err) {
      const msg = String(err);
      if (msg.includes('denied') || msg.includes('Permission')) {
        setError('Camera access denied. Please allow camera permission and reload the page.');
      } else {
        setError('Failed to start camera. Please ensure no other app is using the camera.');
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScanSuccess = useCallback(async (text) => {
    if (lastScan.current === text) return;
    lastScan.current = text;
    await stopScanner();
    parseAndProcess(text);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stopScanner]);

  const parseAndProcess = useCallback((text) => {
    text = text.trim();
    let id = null;

    if (text.includes('BEGIN:VCARD')) {
      const match = text.match(/^URL[^:]*:(.+)$/im);
      if (match) {
        try { id = new URL(match[1].trim()).searchParams.get('id'); } catch { /* ignore */ }
      }
      if (!id) {
        setError('Could not extract attendee information from the scanned QR code.');
        return;
      }
    } else if (text.startsWith('http')) {
      try { id = new URL(text).searchParams.get('id'); } catch { /* ignore */ }
      if (!id) {
        setError('The scanned URL does not contain a valid attendee ID.');
        return;
      }
    } else if (/^\d+$/.test(text)) {
      id = text;
    } else {
      setError('Unrecognised QR code format. Please scan a valid event QR code.');
      return;
    }

    fetchAndValidate(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAndValidate = useCallback(async (id) => {
    setLoading('Fetching attendee information...');
    setError('');
    setAttendee(null);

    try {
      const res = await fetch(`${API}/attendee/?id=${encodeURIComponent(id)}`);
      const data = await res.json();

      if (!res.ok || !data.status) {
        setLoading('');
        setError(data.error || 'Attendee not found. Please verify the ID and try again.');
        return;
      }

      setLoading('Validating attendee...');
      const vRes = await fetch(`${API}/validate/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: data.data.id }),
      });
      const vData = await vRes.json();
      const isAlready = vRes.status === 409;

      if (!vData.status && !isAlready) {
        setLoading('');
        setError(vData.error || 'Validation failed. Please try again.');
        return;
      }

      setAttendee(data.data);
      setFlash(isAlready ? 'already' : 'validated');
      setLoading('');

      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
      flashTimerRef.current = setTimeout(() => setFlash(null), 3500);
    } catch {
      setLoading('');
      setError('Network error. Please check that the backend server is running and accessible.');
    }
  }, []);

  const handleManualSearch = useCallback(() => {
    const id = manualId.trim();
    if (!id) return;
    if (!/^\d+$/.test(id)) {
      setError('Please enter a valid numeric registration ID.');
      return;
    }
    setManualId('');
    fetchAndValidate(id);
  }, [manualId, fetchAndValidate]);

  const handleReset = useCallback(() => {
    lastScan.current = '';
    setAttendee(null);
    setError('');
    setLoading('');
    setFlash(null);
  }, []);

  const handleScanAnother = useCallback(() => {
    handleReset();
    startScanner();
  }, [handleReset, startScanner]);

  useEffect(() => {
    return () => {
      stopScanner();
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    };
  }, [stopScanner]);

  const initials = (name = '') =>
    name.trim().split(' ').filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';

  return (
    <div style={styles.page}>
      {/* Flash overlay */}
      {flash && (
        <div
          onClick={() => setFlash(null)}
          role="dialog"
          aria-label={flash === 'validated' ? 'Validated successfully' : 'Already validated'}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.9)',
            zIndex: 999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <div style={{
            width: 96,
            height: 96,
            borderRadius: '50%',
            border: `3px solid ${flash === 'validated' ? '#22c55e' : '#facc15'}`,
            background: flash === 'validated' ? 'rgba(34,197,94,0.12)' : 'rgba(250,204,21,0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 46,
            animation: 'popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}>
            {flash === 'validated' ? '✓' : '!'}
          </div>
          <p style={{
            fontSize: 28,
            fontWeight: 700,
            color: flash === 'validated' ? '#22c55e' : '#facc15',
            marginTop: 20,
          }}>
            {flash === 'validated' ? 'Validated' : 'Already Checked In'}
          </p>
          <p style={{ fontSize: 14, color: '#7a7a8c', marginTop: 8, textAlign: 'center', padding: '0 40px' }}>
            {flash === 'validated'
              ? `${attendee?.name || 'Attendee'} has been successfully checked in.`
              : `${attendee?.name || 'Attendee'} was already checked in previously.`}
          </p>
          <p style={{ fontSize: 12, color: '#4b4b5a', marginTop: 28 }}>Tap anywhere to dismiss</p>
          <style>{`
            @keyframes popIn { from { transform: scale(0.4); opacity: 0; } to { transform: scale(1); opacity: 1; } }
          `}</style>
        </div>
      )}

      <div style={styles.wrap}>
        {/* Page title */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f0ede8' }}>
            Scan to <span style={{ color: '#f97316' }}>Validate</span>
          </h1>
          <span style={{
            background: 'rgba(249,115,22,0.12)',
            border: '1px solid rgba(249,115,22,0.3)',
            color: '#f97316',
            fontSize: 11,
            fontWeight: 600,
            padding: '4px 12px',
            borderRadius: 999,
            letterSpacing: '0.3px',
          }}>
            LIVE
          </span>
        </div>

        {/* Scanner viewport */}
        <div style={styles.scanBox}>
          <div id="qr-reader" style={{ width: '100%', minHeight: 280 }} />
        </div>

        {/* Camera controls */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          {!isScanning
            ? (
              <button style={styles.btnPrimary} onClick={startScanner}>
                Start Camera
              </button>
            )
            : (
              <button style={{ ...styles.btnPrimary, background: '#dc2626' }} onClick={stopScanner}>
                Stop Camera
              </button>
            )
          }
          <button style={styles.btnSecondary} onClick={handleReset}>
            Reset
          </button>
        </div>

        {/* Manual entry */}
        <div style={{
          background: '#13131a',
          borderRadius: 14,
          border: '1px solid rgba(255,255,255,0.07)',
          padding: '14px 16px',
          marginBottom: 14,
        }}>
          <p style={{ fontSize: 11, color: '#7a7a8c', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 10, fontWeight: 500 }}>
            Manual Entry
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <input
              type="tel"
              inputMode="numeric"
              value={manualId}
              onChange={e => setManualId(e.target.value.replace(/\D/g, ''))}
              onKeyDown={e => e.key === 'Enter' && handleManualSearch()}
              placeholder="Enter registration ID (e.g. 42)"
              style={{
                flex: 1,
                background: '#1c1c26',
                border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: 9,
                padding: '10px 14px',
                color: '#f0ede8',
                fontSize: 14,
                outline: 'none',
              }}
            />
            <button
              onClick={handleManualSearch}
              style={{ ...styles.btnPrimary, flex: 'none', padding: '10px 22px' }}
            >
              Search
            </button>
          </div>
        </div>

        {/* Status messages */}
        {loading && (
          <div style={styles.statusBox('loading')}>
            <Spinner />
            {loading}
          </div>
        )}
        {error && (
          <div style={styles.statusBox('error')}>
            <span style={{ flexShrink: 0 }}>⚠</span>
            {error}
          </div>
        )}

        {/* Attendee result card */}
        {attendee && (
          <div style={styles.card}>
            {/* Card header */}
            <div style={{
              background: attendee.registration_status === 'VALIDATED'
                ? 'linear-gradient(135deg, #0d1a0d, #121f12)'
                : 'linear-gradient(135deg, #1a1208, #211608)',
              padding: '18px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              borderBottom: '1px solid rgba(255,255,255,0.07)',
            }}>
              {attendee.photo_base64 ? (
                <img
                  src={`data:image/jpeg;base64,${attendee.photo_base64}`}
                  alt={attendee.name}
                  style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.1)' }}
                />
              ) : (
                <div style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: attendee.registration_status === 'VALIDATED'
                    ? 'linear-gradient(135deg, #16a34a, #15803d)'
                    : 'linear-gradient(135deg, #f97316, #dc2626)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 17,
                  flexShrink: 0,
                }}>
                  {initials(attendee.name)}
                </div>
              )}

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: 17, color: '#f0ede8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {attendee.name}
                </p>
                {(attendee.designation || attendee.company) && (
                  <p style={{ fontSize: 12, color: '#7a7a8c', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {[attendee.designation, attendee.company].filter(Boolean).join(' · ')}
                  </p>
                )}
              </div>

              <span style={{
                padding: '5px 12px',
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.3px',
                flexShrink: 0,
                ...(attendee.registration_status === 'VALIDATED'
                  ? { background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }
                  : { background: 'rgba(249,115,22,0.15)', color: '#f97316', border: '1px solid rgba(249,115,22,0.3)' }
                ),
              }}>
                {attendee.registration_status}
              </span>
            </div>

            {/* Info grid */}
            <div style={{ padding: '14px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[
                { label: 'Email', value: attendee.email, full: true, accent: true },
                { label: 'Mobile', value: attendee.mobile },
                { label: 'WhatsApp', value: attendee.whatsapp_number },
                { label: 'Gender', value: attendee.gender ? attendee.gender.charAt(0).toUpperCase() + attendee.gender.slice(1) : '—' },
                { label: 'Age', value: attendee.age ? `${attendee.age} yrs` : '—' },
                { label: 'Attendee Type', value: ATTENDEE_TYPE_LABELS[attendee.attendee_type] || attendee.attendee_type, full: true },
                { label: 'State', value: attendee.state || '—', full: true },
                { label: 'Meal', value: attendee.meal_preference === 'veg' ? 'Vegetarian' : 'Non-Vegetarian' },
                { label: 'Parking', value: attendee.parking_facility === 'yes' ? 'Required' : 'Not Required' },
                { label: 'Registration ID', value: `#${attendee.id}`, accent: true },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    background: '#1c1c26',
                    borderRadius: 10,
                    padding: '10px 14px',
                    gridColumn: item.full ? '1 / -1' : 'auto',
                  }}
                >
                  <p style={{ fontSize: 10, color: '#7a7a8c', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4, fontWeight: 500 }}>
                    {item.label}
                  </p>
                  <p style={{ fontSize: 14, fontWeight: 500, color: item.accent ? '#22c55e' : '#f0ede8', wordBreak: 'break-word' }}>
                    {item.value || '—'}
                  </p>
                </div>
              ))}
            </div>

            {/* Scan another */}
            <div style={{ padding: '0 16px 16px' }}>
              <button
                onClick={handleScanAnother}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.09)',
                  borderRadius: 10,
                  color: '#7a7a8c',
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'color 0.2s, border-color 0.2s',
                }}
              >
                Scan Next Attendee
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
