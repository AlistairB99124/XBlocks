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

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
