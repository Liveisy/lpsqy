import React, { useState } from 'react';

function parseLinks(html) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  // 提取a标签
  const aTags = Array.from(doc.querySelectorAll('a')).map(a => ({
    name: a.innerText.trim() || a.getAttribute('aria-label') || 'a标签',
    url: a.href || a.getAttribute('href') || '',
    type: 'a'
  }));
  // 提取button标签
  const btnTags = Array.from(doc.querySelectorAll('button')).map(btn => ({
    name: btn.innerText.trim() || btn.getAttribute('aria-label') || 'button',
    url: btn.getAttribute('onclick') || '',
    type: 'button'
  }));
  return [...aTags, ...btnTags].filter(item => item.url);
}

export default function App() {
  const [targetUrl, setTargetUrl] = useState('');
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleGo = async () => {
    setLoading(true);
    try {
      const res = await fetch(targetUrl);
      const html = await res.text();
      const foundLinks = parseLinks(html);
      setLinks(foundLinks);
    } catch (e) {
      alert('获取页面失败，请检查URL或网络！');
    }
    setLoading(false);
  };

  const handleLinkChange = (idx, value) => {
    setLinks(links.map((l, i) => i === idx ? { ...l, url: value } : l));
  };

  const handleFinish = () => {
    // 生成简单的index.html
    const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>导出页面</title>
</head>
<body>
  <h2>跳转点列表</h2>
  <ul>
    ${links.map(l => `<li>${l.name}: <a href="${l.url}" target="_blank">${l.url}</a></li>`).join('')}
  </ul>
</body>
</html>
    `.trim();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'index.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', textAlign: 'center', fontFamily: 'Arial' }}>
      <h1>LIVESIY’ Lpspy</h1>
      <div style={{ margin: '40px 0' }}>
        <span style={{ fontWeight: 'bold', fontSize: 28 }}>TargetURL</span>
        <input
          style={{ width: 400, marginLeft: 20, marginRight: 20, padding: 8, fontSize: 18, background: '#ddd', border: 'none', borderRadius: 4 }}
          value={targetUrl}
          onChange={e => setTargetUrl(e.target.value)}
          placeholder="请输入目标LP页面URL"
        />
        <button
          style={{ background: 'black', color: 'white', fontWeight: 'bold', padding: '10px 24px', border: 'none', borderRadius: 6, fontSize: 16, cursor: 'pointer' }}
          onClick={handleGo}
          disabled={loading}
        >
          {loading ? '分析中...' : 'GOOOO!!!!'}
        </button>
      </div>
      <div>
        {links.map((l, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', margin: '18px 0', justifyContent: 'center' }}>
            <span style={{ width: 120, textAlign: 'right', fontSize: 20, marginRight: 10 }}>{l.name || 'Purchase'}</span>
            <input
              style={{ width: 400, padding: 8, fontSize: 16, marginRight: 20, border: '1px solid #ccc', borderRadius: 4 }}
              value={l.url}
              onChange={e => handleLinkChange(idx, e.target.value)}
            />
            <button
              style={{ background: 'black', color: 'white', fontWeight: 'bold', padding: '8px 18px', border: 'none', borderRadius: 6, fontSize: 15, cursor: 'pointer' }}
              onClick={() => {}} // 可扩展：单独保存
            >
              ALTER
            </button>
          </div>
        ))}
      </div>
      {links.length > 0 && (
        <div style={{ marginTop: 60 }}>
          <button
            style={{ background: 'black', color: 'white', fontWeight: 'bold', padding: '12px 40px', border: 'none', borderRadius: 8, fontSize: 18, cursor: 'pointer' }}
            onClick={handleFinish}
          >
            FINISH!!!!!
          </button>
        </div>
      )}
    </div>
  );
}