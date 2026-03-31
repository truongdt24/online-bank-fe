import React, {useState, useEffect } from "react";

const API = `${process.env.REACT_APP_API_URL}/api/account`;

function Dashboard({token, cardNumber, onLogout}){
    const [balance, setBalance] = useState(null);
    const [amount, setAmount] = useState('');
    const [toCard, setToCard] = useState('');
    const [history, setHistory] = useState([]);
    const [message, setMessage] = useState('');
    const [activeTab, setActiveTab] = useState('balance');

    const headers = {
        'Content-Type' : 'application/json',
        'Authorization' : `Bearer ${token}`
    };
    const fetchBalance = async() =>{
        try{
            const res = await fetch(`${API}/${cardNumber}/balance`, {headers});
            const data = await res.json();
            setBalance(data.balance);

        }catch(err){
            console.log('Error fetching balance', err);
        }
    };

    const fetchHistory = async() =>{
        try{
            const res = await fetch(`${API}/${cardNumber}/history`, {headers});
            const data = await res.json();
            setHistory(data);

        }catch(err){
            console.log('Error fetching history',err);
        }
    };

    useEffect(() => {fetchBalance()},[]);

    const showMessage = (msg) => {
        setMessage(msg);
        setTimeout(() => setMessage(''), 3000);
    };

    const handleDeposit = async() =>{
        if(!amount) return;
        try{
            const res = await fetch(`${API}/${cardNumber}/deposit`,{
                method: 'POST',headers,
                body: JSON.stringify({amount: parseFloat(amount)})
            });
            if(res.ok){
                showMessage('Nạp tiền thành công / Deposit successful');
                fetchBalance();
                setAmount('');
            }else{
                showMessage('Nạp tiền thất bại / Deposit failed');
            }
        }catch(err){
            showMessage('Cannot connect to server');
        }
    };

    const handleWithdraw = async() =>{
        if(!amount) return;
        try{
            const res = await fetch(`${API}/${cardNumber}/withdraw`, {
                method: 'POST', headers,
                body: JSON.stringify({amount: parseFloat(amount)})
            });
            if(res.ok){
                showMessage('Rút tiền thành công / Withdraw successful');
                fetchBalance();
                setAmount('');
            }else{
                showMessage('Rút tiền thất bại / Withdraw failed');
            }
        }catch(err){
            showMessage('Cannot connect to server');
        }
    };
    const handleTransfer = async() => {
        if(!amount || !toCard) return;
        try{
            const res = await fetch(`${API}/transfer`,{
                method: 'POST', headers,
                body: JSON.stringify({
                    fromCard: cardNumber,
                    toCard: toCard,
                    amount: parseFloat(amount)
                })
            });
            if(res.ok){
                showMessage('Chuyển tiền thành công / Transfer successful');
                fetchBalance();
                setAmount('');
                setToCard('');
            } else{
                showMessage('Chuyển tiền thất bại / Transfer failed');
            }

        }catch(err){
            showMessage('Cannot connect to server');
        }
    };
    return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h2 style={styles.headerTitle}>🏧 Online Banking</h2>
          <p style={styles.cardNum}>Card: {cardNumber}</p>
        </div>
        <button style={styles.logoutBtn} onClick={onLogout}>Logout</button>
      </div>

      {/* Balance card */}
      <div style={styles.balanceCard}>
        <p style={styles.balanceLabel}>Current Balance</p>
        <h1 style={styles.balanceAmount}>
          {balance !== null
            ? Number(balance).toLocaleString('vi-VN') + ' VND'
            : 'Loading...'}
        </h1>
        <button style={styles.refreshBtn} onClick={fetchBalance}>
           Refresh
        </button>
      </div>

      {/* Message */}
      {message && <div style={styles.messageBox}>{message}</div>}

      {/* Tabs */}
      <div style={styles.tabs}>
        {['balance', 'deposit', 'withdraw', 'transfer', 'history'].map(tab => (
          <button
            key={tab}
            style={activeTab === tab ? styles.tabActive : styles.tab}
            onClick={() => {
              setActiveTab(tab);
              setAmount('');
              if (tab === 'history') fetchHistory();
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={styles.tabContent}>

        {activeTab === 'balance' && (
          <div>
            <p style={{ color: '#666', lineHeight: '2' }}>
              Your current balance is shown above.
            </p>
            <p style={{ color: '#666' }}>
              Click <strong>Refresh</strong> to get latest balance.
            </p>
          </div>
        )}

        {(activeTab === 'deposit' || activeTab === 'withdraw') && (
          <div style={styles.actionBox}>
            <input
  style={styles.input}
  type="text"
  placeholder="Enter amount (VND)"
  value={amount ? Number(amount.replace(/\./g, '')).toLocaleString('vi-VN') : ''}
  onChange={e => {
    const raw = e.target.value.replace(/\./g, '').replace(/\D/g, '');
    setAmount(raw);
  }}
/>
            <button
              style={styles.actionBtn}
              onClick={activeTab === 'deposit' ? handleDeposit : handleWithdraw}
            >
              {activeTab === 'deposit' ? 'Deposit' : 'Withdraw'}
            </button>
          </div>
        )}

        {activeTab === 'transfer' && (
          <div style={styles.actionBox}>
            <input
              style={styles.input}
              type="text"
              placeholder="Receiver card number"
              value={toCard}
              onChange={e => setToCard(e.target.value)}
              maxLength={16}
            />
            <input
  style={styles.input}
  type="text"
  placeholder="Enter amount (VND)"
  value={amount ? Number(amount.replace(/\./g, '')).toLocaleString('vi-VN') : ''}
  onChange={e => {
    const raw = e.target.value.replace(/\./g, '').replace(/\D/g, '');
    setAmount(raw);
  }}
/>
            <button style={styles.actionBtn} onClick={handleTransfer}>
             Transfer
            </button>
          </div>
        )}

        {activeTab === 'history' && (
  <div>
    {history.length === 0
      ? <p style={{ color: '#888' }}>No transactions yet!</p>
      : history.map((t, i) => {
          const isPositive = ['TRANSFER_IN', 'DEPOSIT']
            .includes(t.type.toUpperCase());
          return (
            <div key={i} style={{
              ...styles.historyItem,
              borderLeftColor: isPositive ? '#1a6b3a' : '#e74c3c'
            }}>
              <div>
                <strong>{t.type}</strong>
                {t.relatedName &&
                  <p style={{ fontSize: '12px', color: '#555', marginTop: '2px' }}>
                    👤 {t.relatedName}
                  </p>
                }
                <p style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>
                  {new Date(t.createdAt).toLocaleString('vi-VN')}
                </p>
              </div>
              <span style={{ fontWeight: '700', color: isPositive ? '#1a6b3a' : '#e74c3c' }}>
                {isPositive ? '+' : '-'}
                {Number(t.amount).toLocaleString('vi-VN')} VND
              </span>
            </div>
          );
        })
    }
  </div>
)}
      </div>
    </div>
  );
}

const styles = {
  page: { maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'Segoe UI, sans-serif' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  headerTitle: { fontSize: '20px', color: '#1a6b3a', margin: '0' },
  cardNum: { fontSize: '12px', color: '#888', marginTop: '2px' },
  logoutBtn: { padding: '8px 16px', background: 'white', border: '1.5px solid #e0e0e0', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' },
  balanceCard: { background: 'linear-gradient(135deg, #1a6b3a, #0d4a28)', color: 'white', padding: '28px', borderRadius: '16px', textAlign: 'center', marginBottom: '16px' },
  balanceLabel: { fontSize: '13px', opacity: '0.8', marginBottom: '8px' },
  balanceAmount: { fontSize: '32px', fontWeight: '700', marginBottom: '12px', margin: '8px 0 12px' },
  refreshBtn: { background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.4)', padding: '6px 16px', borderRadius: '20px', cursor: 'pointer', fontSize: '13px' },
  messageBox: { padding: '12px 16px', borderRadius: '8px', background: '#e8f5ee', color: '#1a6b3a', marginBottom: '16px', fontWeight: '500', textAlign: 'center' },
  tabs: { display: 'flex', gap: '8px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' },
  tab: { padding: '8px 16px', borderRadius: '20px', border: '1.5px solid #e0e0e0', background: 'white', cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap' },
  tabActive: { padding: '8px 16px', borderRadius: '20px', border: '1.5px solid #1a6b3a', background: '#1a6b3a', color: 'white', cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap' },
  tabContent: { background: 'white', borderRadius: '12px', padding: '20px', border: '1.5px solid #e0e0e0' },
  actionBox: { display: 'flex', flexDirection: 'column', gap: '12px' },
  input: { padding: '12px 16px', border: '1.5px solid #e0e0e0', borderRadius: '8px', fontSize: '15px', outline: 'none', width: '100%', boxSizing: 'border-box' },
  actionBtn: { padding: '14px', background: '#1a6b3a', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' },
  historyItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: '8px', background: '#f9f9f9', borderLeft: '3px solid #e0e0e0', marginBottom: '8px' }

}
export default Dashboard;