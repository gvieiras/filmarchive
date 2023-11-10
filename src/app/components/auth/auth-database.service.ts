import { Injectable } from "@angular/core";
import { Firestore, doc, setDoc, getDoc } from "@angular/fire/firestore";
@Injectable({providedIn:"root"})
export class AuthDatabaseService{
    constructor(private firestore:Firestore){}

    addNewUser(acc:{email:string,uid:string}){
        const newUserDocRef = doc(this.firestore,"users/"+acc.uid);
        setDoc(newUserDocRef,{...acc,admin:false}).catch(err=>{throw err});
    }

    async getUserFromDb(uid:string){
        const userSnapshot = await getDoc(doc(this.firestore,"users",uid));
        if(userSnapshot.exists()){
            return userSnapshot.data();
        }
        return null;
    }
}