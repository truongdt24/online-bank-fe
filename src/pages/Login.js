import React, { useState } from "react";

function Login({ onLogin }){
    const [isSignup, setIsSignup] = useState(false);
    const [cardNumber, setCardNumber] = useState('');
    const [holderName, setHolderName] = useState('');
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async() =>{
        if(!cardNumber || !pin){
            setError('Vui lòng nhập số tài khoản và mã pin / Please enter card number and PIN');
            return;
        }

        setLoading(true);
        setError('');
        
        try{
            const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/login`,
                {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json' },
                    body: JSON.stringify({cardNumber, pin})
            });
            
            const data = await response.json();

            if(response.ok){
                onLogin(data.token, cardNumber);
            }else{
                setError('Sai số tài khoản hoặc mã pin / Wrong card number or PIN');
            }


        }catch(err){
            setError('Cannot connect to server');
        }finally{
            setLoading(false);
        }

    };
    const handleSignup = async () =>{
      if(!cardNumber || !holderName || !pin || !confirmPin){
        setError(' Vui lòng điền đầy đủ thông tin / Please fill in all fields');
        return;
      }
      if(cardNumber.length !== 16){
        setError(' Số tài khoản phải có 16 ký tự / Card number must be 16 digits');
        return;
      }
      if(pin !== confirmPin){
        setError(' Mật khẩu không khớp / PIN do not match');
        return;
      }
      if(pin.length < 4){
        setError(' Mã pin phải chứa ít nhất 4 ký tự / PIN must be at least 4 digits');
        return;
      }
      setLoading(true);
      setError('');
      try{
        const response = await fetch(`${process.env.REACT_APP_API_URL}/auth/signup`,{
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({cardNumber, holderName, pin})
        });
        const data = await response.json();
        if(response.ok){
          onLogin(data.token, cardNumber);

        }else{
          setError(data.error || 'Đăng ký thất bại / Sign up failed');
        }
      }catch(err){
        setError('Cannot connect to server');
      }finally{
        setLoading(false);
      }
    };
    
    const switchMode = () =>{
      setIsSignup(!isSignup);
      setError('');
      setCardNumber('');
      setPin('');
      setConfirmPin('');
      setHolderName('');
    };
    //test
    console.log('API URL:', process.env.REACT_APP_API_URL);

    return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.icon}>🏧</div>
          <h1 style={styles.title}>Online Banking</h1>
          <p style={styles.subtitle}>
            {isSignup ? 'Create your account' : 'Welcome back!'}
          </p>
        </div>

        <div style={styles.toggleRow}>
          <button
            style={!isSignup ? styles.toggleActive : styles.toggle}
            onClick={() => isSignup && switchMode()}
          >
            Login
          </button>
          <button
            style={isSignup ? styles.toggleActive : styles.toggle}
            onClick={() => !isSignup && switchMode()}
          >
            Sign Up
          </button>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.inputGroup}>
          <label style={styles.label}>Card Number</label>
          <input
            style={styles.input}
            type="text"
            placeholder="Enter 16-digit card number"
            value={cardNumber}
            onChange={e => setCardNumber(e.target.value.replace(/\D/g, ''))}
            maxLength={16}
          />
          <span style={styles.hint}>{cardNumber.length}/16</span>
        </div>

        {isSignup && (
          <div style={styles.inputGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              style={styles.input}
              type="text"
              placeholder="Enter your full name"
              value={holderName}
              onChange={e => setHolderName(e.target.value)}
            />
          </div>
        )}

        <div style={styles.inputGroup}>
          <label style={styles.label}>PIN</label>
          <input
            style={styles.input}
            type="password"
            placeholder="Enter PIN"
            value={pin}
            onChange={e => setPin(e.target.value.replace(/\D/g, ''))}
            maxLength={6}
            onKeyPress={e => e.key === 'Enter' && !isSignup && handleLogin()}
          />
        </div>

        {isSignup && (
          <div style={styles.inputGroup}>
            <label style={styles.label}>Confirm PIN</label>
            <input
              style={styles.input}
              type="password"
              placeholder="Re-enter PIN"
              value={confirmPin}
              onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))}
              maxLength={6}
            />
          </div>
        )}

        <button
          style={loading ? styles.btnDisabled : styles.btn}
          onClick={isSignup ? handleSignup : handleLogin}
          disabled={loading}
        >
          {loading ? 'Please wait...' : isSignup ? ' Create Account' : ' Login'}
        </button>

        <p style={styles.switchText}>
          {isSignup ? 'Already have an account? ' : "Don't have an account? "}
          <span style={styles.switchLink} onClick={switchMode}>
            {isSignup ? 'Login' : 'Sign Up'}
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #1a6b3a, #0d4a28)'
  },
  card: {
    background: 'white',
    padding: '40px',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
  },
  header: { textAlign: 'center', marginBottom: '24px' },
  icon: { fontSize: '48px', marginBottom: '12px' },
  title: { fontSize: '24px', color: '#1a6b3a', margin: '0' },
  subtitle: { color: '#888', marginTop: '4px', fontSize: '14px' },
  toggleRow: {
    display: 'flex',
    marginBottom: '20px',
    border: '1.5px solid #e0e0e0',
    borderRadius: '8px',
    overflow: 'hidden'
  },
  toggle: {
    flex: 1, padding: '10px',
    background: 'white', border: 'none',
    cursor: 'pointer', fontSize: '14px', color: '#888'
  },
  toggleActive: {
    flex: 1, padding: '10px',
    background: '#1a6b3a', border: 'none',
    cursor: 'pointer', fontSize: '14px',
    color: 'white', fontWeight: '600'
  },
  inputGroup: { marginBottom: '14px' },
  label: {
    display: 'block', fontSize: '13px',
    fontWeight: '600', color: '#444', marginBottom: '6px'
  },
  input: {
    width: '100%', padding: '12px 16px',
    border: '1.5px solid #e0e0e0', borderRadius: '8px',
    fontSize: '15px', outline: 'none', boxSizing: 'border-box'
  },
  hint: { fontSize: '11px', color: '#aaa', float: 'right' },
  btn: {
    width: '100%', padding: '14px',
    background: '#1a6b3a', color: 'white',
    border: 'none', borderRadius: '8px',
    fontSize: '16px', fontWeight: '600',
    cursor: 'pointer', marginTop: '8px'
  },
  btnDisabled: {
    width: '100%', padding: '14px',
    background: '#aaa', color: 'white',
    border: 'none', borderRadius: '8px',
    fontSize: '16px', cursor: 'not-allowed', marginTop: '8px'
  },
  error: {
    background: '#fff0f0', color: '#c0392b',
    padding: '10px 16px', borderRadius: '8px',
    marginBottom: '16px', fontSize: '14px',
    borderLeft: '3px solid #c0392b'
  },
  switchText: {
    textAlign: 'center', marginTop: '16px',
    fontSize: '13px', color: '#888'
  },
  switchLink: {
    color: '#1a6b3a', fontWeight: '600',
    cursor: 'pointer', textDecoration: 'underline'
  }
};
export default Login;