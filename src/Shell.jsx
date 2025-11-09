import { ChevronLeft, Settings } from 'lucide-react';

/**
 * Shell component - renders immediately for instant FCP/LCP
 * Shows the basic layout structure before the full app loads
 * Styles are inlined for fastest possible render (no CSS file request)
 */
export function Shell() {
  return (
    <>
      <style>{`
        :root {
          --bg-primary: #ffffff;
          --bg-secondary: #f7f7f5;
          --border-color: #e5e5e5;
          --text-primary: #37352f;
          --text-secondary: #9b9a97;
          --hover-bg: #ebebea;
        }
        :root[data-theme="dark"] {
          --bg-primary: #1a1a1a;
          --bg-secondary: #2d2d2d;
          --border-color: #404040;
          --text-primary: #e3e3e3;
          --text-secondary: #a0a0a0;
          --hover-bg: #3a3a3a;
        }
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: ui-sans-serif, system-ui, sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          background: var(--bg-primary, #ffffff);
          color: var(--text-primary, #37352f);
          transition: background-color 0.3s, color 0.3s;
        }
        .app {
          height: 100vh;
          display: flex;
          background: var(--bg-primary, #ffffff);
          overflow: hidden;
        }
        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .sidebar-toggle-btn {
          position: fixed;
          top: 20px;
          left: 12px;
          width: 32px;
          height: 32px;
          border-radius: 4px;
          border: 1px solid var(--border-color);
          background: var(--bg-secondary);
          color: var(--text-primary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s;
          z-index: 101;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .sidebar-toggle-btn:hover {
          background: var(--hover-bg);
        }
        .floating-settings {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 1000;
        }
        .settings-toggle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 1px solid var(--border-color);
          background: var(--bg-primary);
          color: var(--text-primary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .settings-toggle:hover {
          background: var(--bg-secondary);
          transform: scale(1.05);
        }
        .editor-container {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
        }
        .editor-wrapper {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: 60px 96px;
          min-height: 100%;
        }
        .editor-skeleton p {
          font-size: 14px;
          color: var(--text-secondary);
          margin-bottom: 24px;
        }
        .skeleton-line {
          height: 20px;
          background: linear-gradient(90deg, var(--bg-secondary) 25%, var(--hover-bg) 50%, var(--bg-secondary) 75%);
          background-size: 200% 100%;
          animation: skeleton-loading 1.5s ease-in-out infinite;
          border-radius: 4px;
          margin-bottom: 16px;
        }
        .skeleton-title {
          height: 32px;
          width: 60%;
          margin-bottom: 24px;
        }
        .skeleton-short {
          width: 80%;
        }
        @keyframes skeleton-loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @media (max-width: 768px) {
          .editor-wrapper { padding: 40px 24px; }
        }
      `}</style>
      
      <div className="app">
        <button className="sidebar-toggle-btn" aria-label="Show sidebar">
          <ChevronLeft size={18} style={{ transform: 'rotate(180deg)' }} />
        </button>
        
        <div className="main-content">
          <div className="floating-settings">
            <button className="settings-toggle" aria-label="Open settings menu">
              <Settings size={20} />
            </button>
          </div>
          
          <div className="editor-container">
            <div className="editor-wrapper">
              <div className="editor-skeleton">
                <p>Loading your document...</p>
                <div className="skeleton-line skeleton-title"></div>
                <div className="skeleton-line"></div>
                <div className="skeleton-line"></div>
                <div className="skeleton-line skeleton-short"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
