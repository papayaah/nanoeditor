import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { Shell } from './Shell.jsx';

// Lazy load the full App after initial render
const App = lazy(() => import('./App.jsx'));

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Suspense fallback={<Shell />}>
      <App />
    </Suspense>
  </React.StrictMode>
);
