import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { Vec } from './app/models/vec';
import { environment } from './environments/environment';

declare global {
  interface Array<T> {
    getByVec: (vec: Vec) => number;
  }
}

Array.prototype.getByVec = function (vec: Vec) {
  if (vec.x < 0 || vec.y < 0) {
    return undefined;
  }
  return this[vec.y][vec.x];
}

if (environment.production) {
  enableProdMode();
}

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDnJi91Cs-GLbyJd7XnvuODFGZEl-1Fsvk",
  authDomain: "xblocks-25e99.firebaseapp.com",
  projectId: "xblocks-25e99",
  storageBucket: "xblocks-25e99.appspot.com",
  messagingSenderId: "77165600475",
  appId: "1:77165600475:web:65735e2e2f407f2487f6fe",
  measurementId: "G-D23TMYPTNF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
