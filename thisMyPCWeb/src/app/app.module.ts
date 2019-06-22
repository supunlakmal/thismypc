import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {HomeComponent} from './components/home/home.component';
import {HttpClientModule} from '@angular/common/http';
import {SystemComponent} from './components/system/system.component';
import {RouterModule, Routes} from '@angular/router';
import {AccountComponent} from './components/account/account.component';
import {DashboardComponent} from './components/admin/dashboard/dashboard.component';
import {LoginComponent} from './components/admin/login/login.component';
import {UserComponent} from './components/admin/user/user.component';
import {PcComponent} from './components/admin/pc/pc.component';
import {SoftwareComponent} from './components/admin/software/software.component';
import {FrontEndComponent} from './components/admin/front-end/front-end.component';
import {AuthGuard} from './guards/auth-guard.service';

// todo  need to create  rout  guard  for  login
const appRoutes: Routes = [
    {path: '', component: HomeComponent},
    {path: 'login', component: HomeComponent},
    {path: 'system', component: SystemComponent},
    {path: 'account', component: AccountComponent},
    {
        path: 'admin', component: DashboardComponent
    }, {
        path: 'admin/software', component: SoftwareComponent , canActivate: [AuthGuard],
    },
    // {path: 'demo', component: DemoComponent}
];

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        SystemComponent,

        AccountComponent,
        DashboardComponent,
        LoginComponent,
        UserComponent,
        PcComponent,
        SoftwareComponent,
        FrontEndComponent
    ],
    imports: [RouterModule.forRoot(
        appRoutes,
        // {enableTracing: true} // <-- debugging purposes only it will show  big  console  log  data
    ),
        BrowserModule,
        AppRoutingModule,
        FormsModule,
        HttpClientModule
    ],

    providers: [AuthGuard],
    bootstrap: [AppComponent]
})
export class AppModule {
}