import { useState, useRef, useCallback } from 'react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
const MAX_FILE_SIZE = 2 * 1024 * 1024;

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh',
  'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh',
  'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

const HEARD_FROM_OPTIONS = [
  { value: 'social_media', label: 'Social Media' },
  { value: 'friend', label: 'Friend / Colleague' },
  { value: 'college', label: 'College / University' },
  { value: 'company', label: 'Company / Organization' },
  { value: 'email', label: 'Email Newsletter' },
  { value: 'other', label: 'Other' },
];

const INITIAL_FORM = {
  name: '',
  email: '',
  gender: '',
  age: '',
  attendee_type: '',
  designation: '',
  company: '',
  state: '',
  aadhaar_mobile: '',
  whatsapp_number: '',
  sameAsMobile: false,
  meal_preference: '',
  parking_facility: '',
  heard_about: '',
  special_requirement: '',
  photo: null,
};

const styles = {
  page: {
    minHeight: 'calc(100vh - 60px)',
    background: 'linear-gradient(135deg, #f0f4f8 0%, #e8eef5 100%)',
    padding: '40px 16px 60px',
  },
  card: {
    background: '#ffffff',
    maxWidth: 720,
    margin: '0 auto',
    borderRadius: 20,
    padding: '40px 36px',
    boxShadow: '0 4px 32px rgba(8,52,89,0.10)',
  },
  header: {
    textAlign: 'center',
    marginBottom: 36,
    paddingBottom: 28,
    borderBottom: '1px solid #e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: '#083459',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: 400,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: '#083459',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottom: '2px solid #f0f4f8',
  },
  section: { marginBottom: 28 },
  row: { marginBottom: 20 },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: '#374151',
    marginBottom: 7,
  },
  required: { color: '#ef4444', marginLeft: 2 },
  input: {
    width: '100%',
    padding: '11px 14px',
    border: '1.5px solid #d1d5db',
    borderRadius: 10,
    fontSize: 14,
    color: '#111827',
    background: '#fff',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  },
  inputError: {
    borderColor: '#ef4444',
    background: '#fff5f5',
  },
  select: {
    width: '100%',
    padding: '11px 14px',
    border: '1.5px solid #d1d5db',
    borderRadius: 10,
    fontSize: 14,
    color: '#111827',
    background: '#fff',
    outline: 'none',
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 14px center',
    paddingRight: 36,
    transition: 'border-color 0.2s',
  },
  phoneWrap: {
    display: 'flex',
    border: '1.5px solid #d1d5db',
    borderRadius: 10,
    overflow: 'hidden',
  },
  phoneFlag: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '11px 14px',
    background: '#f9fafb',
    borderRight: '1.5px solid #e5e7eb',
    fontSize: 13,
    fontWeight: 600,
    color: '#374151',
    whiteSpace: 'nowrap',
    userSelect: 'none',
  },
  phoneInput: {
    flex: 1,
    padding: '11px 14px',
    border: 'none',
    outline: 'none',
    fontSize: 14,
    color: '#111827',
    background: 'transparent',
    letterSpacing: '0.5px',
  },
  radioGroup: {
    display: 'flex',
    gap: 20,
    flexWrap: 'wrap',
    padding: '4px 0',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 14,
    color: '#374151',
    cursor: 'pointer',
    fontWeight: 400,
  },
  checkLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 13,
    color: '#6b7280',
    cursor: 'pointer',
    marginTop: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 5,
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  textarea: {
    width: '100%',
    padding: '11px 14px',
    border: '1.5px solid #d1d5db',
    borderRadius: 10,
    fontSize: 14,
    color: '#111827',
    background: '#fff',
    outline: 'none',
    resize: 'vertical',
    minHeight: 90,
    marginTop: 10,
    transition: 'border-color 0.2s',
    fontFamily: 'inherit',
  },
  photoUpload: {
    display: 'flex',
    gap: 16,
    padding: '16px 20px',
    border: '2px dashed #d1d5db',
    borderRadius: 12,
    cursor: 'pointer',
    alignItems: 'center',
    background: '#fafafa',
  },
  photoPreview: {
    display: 'flex',
    gap: 16,
    padding: '14px 18px',
    border: '1.5px solid #d1d5db',
    borderRadius: 12,
    alignItems: 'center',
    background: '#f9fafb',
  },
  submitBtn: {
    width: '100%',
    padding: '14px',
    background: '#083459',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: 8,
    letterSpacing: '0.2px',
  },
};

function Field({ label, required, error, hint, children }) {
  return (
    <div style={styles.row}>
      <label style={styles.label}>
        {label}
        {required && <span style={styles.required}>*</span>}
      </label>
      {children}
      {hint && !error && (
        <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>{hint}</p>
      )}
      {error && (
        <p style={styles.errorText}>
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
}

function SuccessModal({ result, photoPreview, onClose }) {
  const passRef = useRef();

  const downloadPass = () => {
    const win = window.open('', '_blank');
    if (!win || !passRef.current) return;
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Event Pass — ${result.name}</title>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: Inter, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #f3f4f6; }
            @media print { body { background: white; } }
          </style>
        </head>
        <body>
          ${passRef.current.outerHTML}
          <script>window.onload = () => setTimeout(() => window.print(), 500);</script>
        </body>
      </html>
    `);
    win.document.close();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      zIndex: 1000,
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 24,
        padding: '32px 28px',
        maxWidth: 680,
        width: '100%',
        position: 'relative',
        boxShadow: '0 24px 64px rgba(0,0,0,0.25)',
        maxHeight: '90vh',
        overflowY: 'auto',
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            width: 36,
            height: 36,
            background: '#f3f4f6',
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            fontSize: 18,
            color: '#6b7280',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            lineHeight: 1,
          }}
        >
          ✕
        </button>

        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 60,
            height: 60,
            background: 'linear-gradient(135deg, #16a34a, #15803d)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            color: '#fff',
            fontSize: 26,
            fontWeight: 700,
            boxShadow: '0 4px 16px rgba(22,163,74,0.3)',
          }}>
            ✓
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#083459', marginBottom: 4 }}>
            Registration Successful
          </h2>
          <p style={{ color: '#6b7280', fontSize: 14 }}>
            Registration ID: <strong style={{ color: '#083459' }}>#{result.id}</strong>
          </p>
        </div>

        <div
          ref={passRef}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 16,
            justifyContent: 'center',
            background: '#f8fafc',
            borderRadius: 16,
            padding: 20,
            marginBottom: 20,
          }}
        >
          <div style={{
            border: '3px solid #083459',
            borderRadius: 14,
            padding: 10,
            width: 200,
            height: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#fff',
            flexShrink: 0,
          }}>
            {result.qr
              ? <img src={`data:image/png;base64,${result.qr}`} alt="QR Code" style={{ width: '100%' }} />
              : <p style={{ color: '#9ca3af', fontSize: 13, textAlign: 'center' }}>Generating QR...</p>
            }
          </div>

          <div style={{
            background: 'linear-gradient(160deg, #0f3460, #083459)',
            color: '#fff',
            borderRadius: 18,
            padding: '22px 24px',
            minWidth: 260,
            maxWidth: 320,
            flex: 1,
            fontFamily: 'Inter, sans-serif',
          }}>
            <p style={{ fontSize: 11, opacity: 0.6, letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: 4 }}>
              Event Name
            </p>
            <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 18, lineHeight: 1.2 }}>
              Pre AI Summit
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, fontSize: 12, marginBottom: 16 }}>
              <div>
                <p style={{ opacity: 0.55, fontSize: 10, marginBottom: 2 }}>Location</p>
                <p style={{ fontWeight: 600 }}>Bengaluru</p>
              </div>
              <div>
                <p style={{ opacity: 0.55, fontSize: 10, marginBottom: 2 }}>Date</p>
                <p style={{ fontWeight: 600 }}>05/02/2026</p>
              </div>
              <div>
                <p style={{ opacity: 0.55, fontSize: 10, marginBottom: 2 }}>Time</p>
                <p style={{ fontWeight: 600 }}>11:00 AM</p>
              </div>
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <p style={{ fontSize: 10, opacity: 0.55, marginBottom: 4 }}>Registered Attendee</p>
                  <p style={{ fontSize: 17, fontWeight: 700, lineHeight: 1.2 }}>{result.name}</p>
                  <p style={{ fontSize: 11, opacity: 0.5, marginTop: 8 }}>ID #{result.id}</p>
                </div>
                {photoPreview && (
                  <img
                    src={photoPreview}
                    alt="Attendee"
                    style={{ width: 70, height: 84, objectFit: 'cover', borderRadius: 10, border: '2px solid rgba(255,255,255,0.2)' }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#9ca3af', marginBottom: 20 }}>
          Scan with a regular camera to save contact · Scan with EventScan app to validate entry
        </p>

        <button onClick={downloadPass} style={styles.submitBtn}>
          Download Event Pass
        </button>
      </div>
    </div>
  );
}

export default function RegistrationPage() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const photoInputRef = useRef();

  const updateField = useCallback((name, value) => {
    setForm(prev => {
      const next = { ...prev, [name]: value };
      if (name === 'aadhaar_mobile' && prev.sameAsMobile) next.whatsapp_number = value;
      if (name === 'sameAsMobile' && value) next.whatsapp_number = prev.aadhaar_mobile;
      if (name === 'sameAsMobile' && !value) next.whatsapp_number = '';
      if (name === 'attendee_type' && value !== 'working_professional') {
        next.designation = '';
        next.company = '';
      }
      return next;
    });
    setErrors(prev => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;

    if (type === 'checkbox') {
      updateField(name, checked);
      return;
    }
    if (name === 'aadhaar_mobile' || name === 'whatsapp_number') {
      updateField(name, value.replace(/\D/g, '').slice(0, 10));
      return;
    }
    if (name === 'age') {
      updateField(name, value.replace(/\D/g, '').slice(0, 2));
      return;
    }
    if (name === 'name') {
      updateField(name, value.replace(/[^a-zA-Z\s]/g, ''));
      return;
    }
    updateField(name, value);
  }, [updateField]);

  const handlePhoto = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, photo: 'Please upload a valid image file (JPG, PNG, etc.)' }));
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setErrors(prev => ({ ...prev, photo: 'Image size must not exceed 2MB.' }));
      return;
    }

    setPhotoPreview(prev => { if (prev) URL.revokeObjectURL(prev); return URL.createObjectURL(file); });
    updateField('photo', file);
  }, [updateField]);

  const removePhoto = useCallback(() => {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    updateField('photo', null);
    if (photoInputRef.current) photoInputRef.current.value = '';
  }, [photoPreview, updateField]);

  const validate = useCallback(() => {
    const e = {};

    if (!form.name.trim()) e.name = 'Full name is required.';
    else if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters.';

    if (!form.email.trim()) e.email = 'Email address is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Please enter a valid email address.';

    if (!form.gender) e.gender = 'Please select your gender.';

    if (!form.age) e.age = 'Age is required.';
    else if (Number(form.age) < 12 || Number(form.age) > 65) e.age = 'Age must be between 12 and 65.';

    if (!form.attendee_type) e.attendee_type = 'Please select an attendee type.';

    if (form.attendee_type === 'working_professional') {
      if (!form.designation.trim()) e.designation = 'Designation is required for working professionals.';
      if (!form.company.trim()) e.company = 'Company name is required for working professionals.';
    }

    if (!form.state) e.state = 'Please select your state.';

    if (!form.aadhaar_mobile) e.aadhaar_mobile = 'Mobile number is required.';
    else if (!/^[6-9]\d{9}$/.test(form.aadhaar_mobile)) e.aadhaar_mobile = 'Enter a valid 10-digit Indian mobile number.';

    if (!form.whatsapp_number) e.whatsapp_number = 'WhatsApp number is required.';
    else if (!/^[6-9]\d{9}$/.test(form.whatsapp_number)) e.whatsapp_number = 'Enter a valid 10-digit Indian mobile number.';

    if (!form.meal_preference) e.meal_preference = 'Please select your meal preference.';
    if (!form.parking_facility) e.parking_facility = 'Please indicate if you require parking.';
    if (!form.photo) e.photo = 'A profile photo is required.';

    setErrors(e);
    return Object.keys(e).length === 0;
  }, [form]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name.trim());
      fd.append('email', form.email.trim().toLowerCase());
      fd.append('gender', form.gender);
      fd.append('age', form.age);
      fd.append('attendee_type', form.attendee_type);
      fd.append('designation', form.designation.trim());
      fd.append('company', form.company.trim());
      fd.append('state', form.state);
      fd.append('aadhaar_mobile', form.aadhaar_mobile);
      fd.append('whatsapp_number', form.whatsapp_number);
      fd.append('meal_preference', form.meal_preference);
      fd.append('parking_facility', form.parking_facility);
      fd.append('heard_about', form.heard_about);
      fd.append('special_requirement', form.special_requirement.trim());
      if (form.photo) fd.append('photo', form.photo);

      const res = await fetch(`${API}/register/`, { method: 'POST', body: fd });
      const data = await res.json();

      if (res.ok && data.status) {
        setResult({ id: data.registration_id, qr: data.qr_base64, name: form.name.trim() });
      } else {
        setErrors({ _server: data.error || 'Registration failed. Please try again.' });
      }
    } catch {
      setErrors({ _server: 'Unable to connect to the server. Please check your connection and try again.' });
    } finally {
      setSubmitting(false);
    }
  }, [form, validate]);

  const resetForm = useCallback(() => {
    setForm(INITIAL_FORM);
    setErrors({});
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    if (photoInputRef.current) photoInputRef.current.value = '';
    setResult(null);
  }, [photoPreview]);

  const inputStyle = (name) => ({
    ...styles.input,
    ...(errors[name] ? styles.inputError : {}),
  });

  const selectStyle = (name) => ({
    ...styles.select,
    ...(errors[name] ? styles.inputError : {}),
  });

  return (
    <div style={styles.page}>
      {result && (
        <SuccessModal result={result} photoPreview={photoPreview} onClose={resetForm} />
      )}

      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>Participant Registration</h1>
          <p style={styles.subtitle}>Complete the form below to register for the event</p>
        </div>

        {errors._server && (
          <div style={{
            padding: '14px 18px',
            background: '#fef2f2',
            border: '1.5px solid #fecaca',
            borderRadius: 12,
            marginBottom: 24,
            color: '#dc2626',
            fontSize: 14,
          }}>
            ⚠ {errors._server}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate autoComplete="off">

          {/* Personal Information */}
          <div style={styles.section}>
            <p style={styles.sectionTitle}>Personal Information</p>

            <Field label="Full Name" required error={errors.name}>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                style={inputStyle('name')}
                autoComplete="off"
                spellCheck={false}
              />
            </Field>

            <Field label="Email Address" required error={errors.email}>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="example@email.com"
                style={inputStyle('email')}
                autoComplete="off"
              />
            </Field>

            <div style={styles.grid2}>
              <Field label="Gender" required error={errors.gender}>
                <div style={styles.radioGroup}>
                  {['Male', 'Female'].map(g => (
                    <label key={g} style={styles.radioLabel}>
                      <input
                        type="radio"
                        name="gender"
                        value={g.toLowerCase()}
                        checked={form.gender === g.toLowerCase()}
                        onChange={handleChange}
                      />
                      {g}
                    </label>
                  ))}
                </div>
              </Field>

              <Field label="Age" required error={errors.age}>
                <input
                  name="age"
                  value={form.age}
                  onChange={handleChange}
                  placeholder="e.g. 25"
                  style={inputStyle('age')}
                  autoComplete="off"
                  inputMode="numeric"
                  maxLength={2}
                />
              </Field>
            </div>

            <Field label="Profile Photo" required error={errors.photo} hint="JPG or PNG · Max 2MB · Minimum 250×250 px recommended">
              {!photoPreview ? (
                <label
                  htmlFor="photo-upload"
                  style={{
                    ...styles.photoUpload,
                    ...(errors.photo ? { borderColor: '#ef4444', background: '#fff5f5' } : {}),
                  }}
                >
                  <div style={{
                    width: 52,
                    height: 52,
                    background: '#e8eef5',
                    borderRadius: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 22,
                    flexShrink: 0,
                  }}>
                    📷
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#374151', marginBottom: 2 }}>
                      Click to upload photo
                    </p>
                    <p style={{ fontSize: 12, color: '#9ca3af' }}>JPG, PNG · Max 2MB</p>
                  </div>
                </label>
              ) : (
                <div style={styles.photoPreview}>
                  <img
                    src={photoPreview}
                    alt="Preview"
                    style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 10, border: '1px solid #e5e7eb' }}
                  />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#111827', marginBottom: 2 }}>Photo uploaded</p>
                    <p style={{ fontSize: 12, color: '#6b7280' }}>Click "Change" to select a different photo</p>
                  </div>
                  <button
                    type="button"
                    onClick={removePhoto}
                    style={{ fontSize: 13, color: '#083459', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                  >
                    Change
                  </button>
                </div>
              )}
              <input
                id="photo-upload"
                ref={photoInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhoto}
                style={{ display: 'none' }}
              />
            </Field>
          </div>

          {/* Professional Details */}
          <div style={styles.section}>
            <p style={styles.sectionTitle}>Professional Details</p>

            <Field label="Attendee Type" required error={errors.attendee_type}>
              <select
                name="attendee_type"
                value={form.attendee_type}
                onChange={handleChange}
                style={selectStyle('attendee_type')}
              >
                <option value="">Select attendee type</option>
                <option value="student">Student</option>
                <option value="working_professional">Working Professional</option>
                <option value="retired">Retired</option>
              </select>
            </Field>

            {form.attendee_type === 'working_professional' && (
              <div style={styles.grid2}>
                <Field label="Designation" required error={errors.designation}>
                  <input
                    name="designation"
                    value={form.designation}
                    onChange={handleChange}
                    placeholder="e.g. Software Engineer"
                    style={inputStyle('designation')}
                    autoComplete="off"
                  />
                </Field>
                <Field label="Company / Organization" required error={errors.company}>
                  <input
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    placeholder="e.g. Acme Corp"
                    style={inputStyle('company')}
                    autoComplete="off"
                  />
                </Field>
              </div>
            )}

            <Field label="State" required error={errors.state}>
              <select
                name="state"
                value={form.state}
                onChange={handleChange}
                style={selectStyle('state')}
              >
                <option value="">Select your state</option>
                {INDIAN_STATES.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </Field>
          </div>

          {/* Contact Information */}
          <div style={styles.section}>
            <p style={styles.sectionTitle}>Contact Information</p>

            <Field label="Mobile Number" required error={errors.aadhaar_mobile} hint="10-digit Indian mobile number">
              <div style={{ ...styles.phoneWrap, ...(errors.aadhaar_mobile ? { borderColor: '#ef4444' } : {}) }}>
                <div style={styles.phoneFlag}>
                  <span>🇮🇳</span>
                  <span>+91</span>
                </div>
                <input
                  name="aadhaar_mobile"
                  type="tel"
                  value={form.aadhaar_mobile}
                  onChange={handleChange}
                  placeholder="9876543210"
                  style={styles.phoneInput}
                  maxLength={10}
                  inputMode="numeric"
                  autoComplete="off"
                />
              </div>
            </Field>

            <label style={styles.checkLabel}>
              <input
                type="checkbox"
                name="sameAsMobile"
                checked={form.sameAsMobile}
                onChange={handleChange}
              />
              WhatsApp number is the same as mobile number
            </label>

            <div style={{ marginTop: 16 }}>
              <Field label="WhatsApp Number" required error={errors.whatsapp_number}>
                <div style={{ ...styles.phoneWrap, ...(errors.whatsapp_number ? { borderColor: '#ef4444' } : {}) }}>
                  <div style={styles.phoneFlag}>
                    <span>🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <input
                    name="whatsapp_number"
                    type="tel"
                    value={form.whatsapp_number}
                    onChange={handleChange}
                    placeholder="9876543210"
                    style={{ ...styles.phoneInput, background: form.sameAsMobile ? '#f9fafb' : '#fff' }}
                    maxLength={10}
                    inputMode="numeric"
                    disabled={form.sameAsMobile}
                    autoComplete="off"
                  />
                </div>
              </Field>
            </div>
          </div>

          {/* Event Preferences */}
          <div style={styles.section}>
            <p style={styles.sectionTitle}>Event Preferences</p>

            <Field label="Meal Preference" required error={errors.meal_preference}>
              <div style={styles.radioGroup}>
                <label style={styles.radioLabel}>
                  <input
                    type="radio"
                    name="meal_preference"
                    value="veg"
                    checked={form.meal_preference === 'veg'}
                    onChange={handleChange}
                  />
                  Vegetarian
                </label>
                <label style={styles.radioLabel}>
                  <input
                    type="radio"
                    name="meal_preference"
                    value="non_veg"
                    checked={form.meal_preference === 'non_veg'}
                    onChange={handleChange}
                  />
                  Non-Vegetarian
                </label>
              </div>
            </Field>

            <Field label="Parking Required?" required error={errors.parking_facility}>
              <div style={styles.radioGroup}>
                <label style={styles.radioLabel}>
                  <input
                    type="radio"
                    name="parking_facility"
                    value="yes"
                    checked={form.parking_facility === 'yes'}
                    onChange={handleChange}
                  />
                  Yes, I need parking
                </label>
                <label style={styles.radioLabel}>
                  <input
                    type="radio"
                    name="parking_facility"
                    value="no"
                    checked={form.parking_facility === 'no'}
                    onChange={handleChange}
                  />
                  No, I don't need parking
                </label>
              </div>
            </Field>

            <Field label="How did you hear about this event?">
              <select
                name="heard_about"
                value={form.heard_about}
                onChange={handleChange}
                style={styles.select}
              >
                <option value="">Select an option (optional)</option>
                {HEARD_FROM_OPTIONS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>

            <Field label="Special Requirements" hint="Dietary restrictions, accessibility needs, or any other requirements">
              <textarea
                name="special_requirement"
                value={form.special_requirement}
                onChange={handleChange}
                placeholder="Describe any special requirements (optional)..."
                style={styles.textarea}
                maxLength={500}
              />
            </Field>
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{ ...styles.submitBtn, opacity: submitting ? 0.75 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}
          >
            {submitting ? 'Submitting Registration...' : 'Submit Registration'}
          </button>
        </form>
      </div>
    </div>
  );
}