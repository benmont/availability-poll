import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
	  apiKey: "AIzaSyDSLCaBlIpV3_joru8XyBVvDhaBPrt6JaE",
	  authDomain: "availability-poll.firebaseapp.com",
	  projectId: "availability-poll",
	  storageBucket: "availability-poll.firebasestorage.app",
	  messagingSenderId: "13882600731",
	  appId: "1:13882600731:web:c2e6859ac93ab584e337be"
          databaseURL: "https://availability-poll-default-rtdb.firebaseio.com/"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
