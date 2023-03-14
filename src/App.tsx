import React, { useEffect, useState } from 'react';
import './App.css';
import Camera from './Camera/Camera';

function App() {
  const [isOffline, setIsOffline] = useState<boolean>(false)
  const offlineStatus = !navigator.onLine;
  useEffect(() => {
    window.addEventListener('online', () => {
      setIsOffline(false);
    })
    window.addEventListener('offline', () => {
      setIsOffline(true);
    })
  }, [])
  useEffect(() => {
    console.log(offlineStatus);
    if (isOffline !== offlineStatus) {
      setIsOffline(offlineStatus)
    }
  }, [offlineStatus, isOffline])
  return (
    <div className="App">
      <Camera  isOffline={isOffline} />
    </div>
  );
}

export default App;
