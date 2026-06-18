import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA6k13paYr3-Cpi0lNClBtG5qJ-7hSYmbY",
  authDomain: "app-inventory-11d2c.firebaseapp.com",
  projectId: "app-inventory-11d2c",
  storageBucket: "app-inventory-11d2c.firebasestorage.app",
  messagingSenderId: "681154473124",
  appId: "1:681154473124:web:32d3f709cb2cccb425ca31"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();