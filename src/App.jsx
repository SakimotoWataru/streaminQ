import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function App() {
  const [url, setUrl] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // 例: https://www.start.gg/tournament/abc-tourney/event/xyz
    const match = url.match(/start.gg\/tournament\/([^/]+)/);
    if (match) {
      const slug = match[1];
      navigate(`/matches/${slug}`);
    } else {
      alert('正しい大会URLを入力してください');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>start.gg大会URLを入力</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="https://www.start.gg/tournament/..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{ width: '100%', padding: '0.5rem', fontSize: '1rem' }}
        />
        <button type="submit" style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>
          表示ページへ
        </button>
      </form>
    </div>
  );
}

export default App;
