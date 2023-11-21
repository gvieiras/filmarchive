import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable, OnInit, isDevMode } from "@angular/core";
import { environment } from "src/environments/environment";
import { catchError, tap, throwError, BehaviorSubject, delayWhen, from } from "rxjs"
import { Router } from "@angular/router";
import { AuthDatabaseService } from "./auth-database.service";

@Injectable({providedIn:'root'})
export class AuthService{

    user = new BehaviorSubject<User|null>(null);
    private tokenExpirationTimer!:number;

    constructor(private http:HttpClient, private router:Router, private authDb:AuthDatabaseService){}

    logIn(a:Account){
        const url = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key="+environment.firebase.apiKey;
        return this.http.post<AuthResponseData>(url,{
            email:a.email,
            password:a.password,
            returnSecureToken:true
        }).pipe(catchError(this.handleError), delayWhen((resData)=>from(
                this.handleAuth(
                    resData.email,
                    resData.localId,
                    resData.idToken,
                    +resData.expiresIn,
                )
        )));
    }
    
    signUp(a:Account){
        const url = "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key="+environment.firebase.apiKey;
        return this.http.post<AuthResponseData>(url,{
            email:a.email,
            password:a.password,
            returnSecureToken:true
        }).pipe(catchError(this.handleError), delayWhen((resData)=>from(
            this.handleAuth(
                resData.email,
                resData.localId,
                resData.idToken,
                +resData.expiresIn,
            )
        )),tap(d=>{
            this.authDb.addNewUser({email:d.email,uid:d.localId});
        }));
    }

    async updateUserFilms(){
        const user = this.user.value;
        if(user){
            await this.authDb.getUserFromDb(user.id!).then(f=>{
                user.films = f!['films'];
                this.user.next(user);
            })
        }
    }

    async handleAuth(email: string, localId:string, idToken: string, expiresIn:number){
        let userFilms;
        await this.authDb.getUserFromDb(localId).then(f=>userFilms = f!['films']).catch((e)=>{
            if(isDevMode()){
                console.log(e);
            }
        });

        const expirationDate = new Date(new Date().getTime() + (expiresIn * 1000));
        console.log("token expires in:"+expirationDate);
        const authUser = new User(email, localId, idToken, expirationDate);
        authUser.films = userFilms;

        await this.authDb.getUserFromDb(localId).then(d=>{authUser.admin = d!['admin']}).catch((e)=>{
            if(isDevMode()){
                console.log(e);
            }
        });

        this.user.next(authUser);
        this.autoLogout(expiresIn * 1000);
        localStorage.setItem('userData',JSON.stringify(authUser));
        this.router.navigate(['/']);
    }

    private handleError(errorResponse:HttpErrorResponse){
        let errorMsg = "An error occured."
        if(!errorResponse.error || !errorResponse.error.error){//if it's an unhandled error
            return throwError(()=>errorMsg);
        }
        switch(errorResponse.error.error.message){
            case "EMAIL_EXISTS":
                errorMsg = "The email address is already in use.";
            break;
            case "EMAIL_NOT_FOUND":
                errorMsg = "Email not found."
            break;
            case "USER_DISABLED":
                errorMsg = "User disabled from access.";
            break;
            case "INVALID_LOGIN_CREDENTIALS" || "INVALID_PASSWORD":
                errorMsg = "Invalid login credentials."
            break;
        }
        return throwError(()=>errorMsg);
    }

    async autoLogin(){
        const userData:{
            email:string,
            id:string,
            _token:string,
            _tokenExpirationDate:string,
            admin:boolean
        } = JSON.parse(localStorage.getItem("userData") || '{}');
        if(!userData){
            console.log("no user found on localstorage.");
            return;
        }
        const authenticatedUser = new User(userData.email, userData.id, userData._token, new Date(userData._tokenExpirationDate));
        authenticatedUser.admin = userData.admin;
        if(authenticatedUser.token){
            let userFilms;
            await this.authDb.getUserFromDb(userData.id).then(f=>userFilms = f!['films']);
            authenticatedUser.films = userFilms;
            this.user.next(authenticatedUser);
            //future time to expire MINUS current time
            const expirationDuration = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
            this.autoLogout(expirationDuration);
        }
    }

    logOut(){
        this.user.next(null);
        this.router.navigate(['/login']);
        localStorage.removeItem('userData');  
        if(this.tokenExpirationTimer){
            clearTimeout(this.tokenExpirationTimer);
        }
    }

    autoLogout(expirationDuration:number){
        this.tokenExpirationTimer = window.setTimeout(()=>{
            this.logOut();
        },expirationDuration)
    }
}

export class User{
    constructor(public email?:string, public id?:string, private _token?:string, private _tokenExpirationDate?:Date,public films?:{filmUid:string,score:number}[], public admin?:boolean){}

    get token(){
        if(!this._tokenExpirationDate || new Date() > this._tokenExpirationDate){
            return null;
        }else{
            return this._token;
        }
    }
}

export class Account{
    constructor(public email?:string, public password?:string){}
}

export interface AuthResponseData{
    idToken:string,
    username:string,
    email:string,
    refreshToken:string,
    expiresIn:string,
    localId:string,
    admin:boolean,
}