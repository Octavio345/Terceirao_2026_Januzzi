import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const testFirebaseConnection = () => {
  try {
    const firebaseConfig = {
      apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
      authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
      storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.REACT_APP_FIREBASE_APP_ID,
      measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
    };
    
    console.log('🔧 Testando configuração Firebase...');
    console.log('Projeto:', firebaseConfig.projectId);
    
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    
    console.log('✅ Firebase conectado com sucesso!');
    console.log('App:', app.name);
    console.log('Firestore disponível:', !!db);
    
    return { success: true, app, db };
  } catch (error) {
    console.error('❌ Erro ao conectar ao Firebase:', error.message);
    return { success: false, error };
  }
};

export default testFirebaseConnection;