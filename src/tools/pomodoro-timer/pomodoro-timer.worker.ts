let timer: number | null = null;

self.onmessage = (e: MessageEvent) => {
  const { type, endTime } = e.data;
  
  if (type === 'start') {
    if (timer) clearInterval(timer);
    
    timer = setInterval(() => {
      const timeLeft = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      self.postMessage({ type: 'tick', timeLeft });
      
      if (timeLeft <= 0) {
        self.postMessage({ type: 'complete' });
        clearInterval(timer);
        timer = null;
      }
    }, 1000);
  } else if (type === 'stop') {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }
}; 