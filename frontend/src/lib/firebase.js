import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCIGnLLTiT9RThMWQMl2Qtbk4gOXshIKcw",
  authDomain: "diasporaloveconnect-1ae71.firebaseapp.com",
  projectId: "diasporaloveconnect-1ae71",
  storageBucket: "diasporaloveconnect-1ae71.firebasestorage.app",
  messagingSenderId: "812894368322",
  appId: "1:812894368322:web:d7bcae64f8cbdfbf3433db"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
