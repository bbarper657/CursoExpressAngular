import { Routes } from '@angular/router';
import { HomeComponent } from './features/home/home';
import { LoginComponent } from './features/login/login';
import { StudentsComponent } from './features/students/students';
import { ForbiddenComponent } from './features/forbidden/forbidden';
import { Error404Component } from './features/error404/error404';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
    },
    {
        path: 'login',
        component: LoginComponent,
    },
    {
        path: 'students',
        component: StudentsComponent,
        canActivate: [authGuard], // Protegida por el guard
    },
    {
        path: 'forbidden',
        component: ForbiddenComponent,
    },
    {
        path: '**',
        component: Error404Component,
    },
];
