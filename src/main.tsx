import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { registerServiceWorker, requestNotificationPermission } from "./lib/notifications";

createRoot(document.getElementById("root")!).render(<App />);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    const registration = await registerServiceWorker();
    
    if (registration) {
      const permission = await requestNotificationPermission();
      if (permission === 'granted') {
        console.log('알림 권한이 허용되었습니다.');
      }
    }
  });
}