import { Component, Input, OnDestroy, OnInit, isDevMode } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, User } from '../auth/auth.service';
import { Subscription } from "rxjs";
import { DatabaseStorageService } from 'src/app/shared/database-storage.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy{
  @Input() isFilmsRoute:boolean = false;
  userSubscription = new Subscription();
  user:User | null = null;
  devMode:boolean = isDevMode();
  
  constructor(private authService:AuthService, private dbService:DatabaseStorageService){}

  ngOnInit(): void {
    this.userSubscription = this.authService.user.subscribe(u=>{
      this.user = u;
    });
  }
  
  ngOnDestroy(): void {
    this.userSubscription.unsubscribe();
  }

  onLogout(){
    this.authService.logOut();
  }

  onDevAddFilms(){
    if(window.confirm("do you really want to populate the database with films?")){
      this.dbService.debugAddFilmsServiceFilmsToDatabase();
    }
  }
}
