import React, { useState } from 'react';

// 工具函数：转义正则特殊字符
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// 解析所有a和button跳转点
function parseLinks(html) {
  const parser = new window.DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  // a标签
  const aTags = Array.from(doc.querySelectorAll('a')).filter(a => a.hasAttribute('href'));
  // button标签（假设用data-href或onclick跳转）
  const btnTags = Array.from(doc.querySelectorAll('button')).filter(btn => btn.hasAttribute('data-href') || btn.hasAttribute('onclick'));

  const links = [];
  aTags.forEach(a => {
    links.push({
      type: 'a',
      name: a.innerText.trim() || a.getAttribute('aria-label') || 'a标签',
      originalUrl: a.getAttribute('href'),
      url: a.getAttribute('href'),
    });
  });
  btnTags.forEach(btn => {
    let href = btn.getAttribute('data-href') || btn.getAttribute('onclick') || '';
    links.push({
      type: 'button',
      name: btn.innerText.trim() || btn.getAttribute('aria-label') || 'button',
      originalUrl: href,
      url: href,
    });
  });
  return links;
}

export default function App() {
  const [targetUrl, setTargetUrl] = useState('');
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [originalHtml, setOriginalHtml] = useState('');

  const handleGo = async () => {
    setLoading(true);
    try {
      const res = await fetch(targetUrl);
      const html = await res.text();
      setOriginalHtml(html);
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
    let newHtml = originalHtml;
    links.forEach(link => {
      if (link.type === 'a') {
        // 替换a标签href
        const reg = new RegExp(`(<a[^>]*?href=["'])${escapeRegExp(link.originalUrl)}(["'][^>]*?>)`, 'g');
        newHtml = newHtml.replace(reg, `$1${link.url}$2`);
      } else if (link.type === 'button') {
        // 替换button的data-href或onclick
        if (link.originalUrl && link.originalUrl.startsWith('http')) {
          // data-href
          const reg = new RegExp(`(<button[^>]*?data-href=["'])${escapeRegExp(link.originalUrl)}(["'][^>]*?>)`, 'g');
          newHtml = newHtml.replace(reg, `$1${link.url}$2`);
        } else {
          // onclick
          const reg = new RegExp(`(<button[^>]*?onclick=["'])${escapeRegExp(link.originalUrl)}(["'][^>]*?>)`, 'g');
          newHtml = newHtml.replace(reg, `$1${link.url}$2`);
        }
      }
    });
    // 下载
    const blob = new Blob([newHtml], { type: 'text/html' });
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
            <span style={{ width: 180, textAlign: 'right', fontSize: 20, marginRight: 10 }}>{l.name || (l.type === 'a' ? 'Purchase' : 'Button')}</span>
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