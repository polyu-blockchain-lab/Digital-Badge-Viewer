import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'viewer', pathMatch: 'full' },
  { path: 'viewer', loadChildren: './viewer/viewer.module#ViewerModule' },
  { path: '**', redirectTo: 'viewer'},
];

@NgModule({
    imports: [
      RouterModule.forRoot(routes, {
        preloadingStrategy: PreloadAllModules,
        useHash: true,
      })
    ],
    exports: [RouterModule]
})
export class AppRoutingModule { }
