import { Firestore, collection, collectionData, doc, runTransaction, query, where, orderBy, arrayUnion, increment, arrayRemove, QueryConstraint, limit, WhereFilterOp, getCountFromServer, setDoc, deleteDoc, or} from '@angular/fire/firestore';
import { Film } from '../components/films/film.model';
import { Injectable, inject } from '@angular/core';
import { Observable, Subject, Subscription, last, map } from "rxjs";
import { FilmsService } from '../components/films/films.service';
import { AuthService } from '../components/auth/auth.service';
import { AngularFirestore } from "@angular/fire/compat/firestore"

@Injectable({
    providedIn:'root'
})
export class DatabaseStorageService{
    private firestore:Firestore = inject(Firestore);
    private db:AngularFirestore = inject(AngularFirestore);
    filmsSubj = new Subject<Observable<Film[]>>;

    constructor(private filmsService:FilmsService, private authService:AuthService){}

    async debugAddFilmsServiceFilmsToDatabase(){
        for(let i = 0;i<this.filmsService.getFilms().length;i++){
            await (this.addNewFilm(this.filmsService.getFilm(i))).then(
                ()=>console.log("film added")
            );
        }
    }

    getFilms(startAt:number = 0){
        const q = query(collection(this.firestore,"films"), orderBy("id"), where("id",">",startAt),limit(12));
        const cd = collectionData(q, {idField:'uid'}) as Observable<Film[]>;
        this.getTotalNumberOfFilms();
        this.filmsSubj.next(cd);
    }

    numberOfFilms = new Subject<number>;

    async getTotalNumberOfFilms(){
        const q_coll = query(collection(this.firestore,"films"),where("id",">=",0));
        //need the query otherwise metadata would count
        const snapshot = await getCountFromServer(q_coll);
        this.numberOfFilms.next(snapshot.data().count);
    }

    queryConditions:QueryConstraint[] = [];
    queryExists = new Subject<boolean>;

    changeFilter(filter:{id:string,value:string|string[]}[]){   
        this.queryConditions = filter.map(f=>{
            let operator:WhereFilterOp = "==";
            let value:string|number|string[] = "";
            let filter = {...f};
            switch(filter.id){
                case "filterByYearFROM":
                    filter.id = "yearReleased";
                    operator = ">=";
                    value = +filter.value;
                break;
                case "filterByYearTO":
                    filter.id = "yearReleased";
                    operator = "<=";
                    value = +filter.value;
                break;
                case "filterByTitle":
                    filter.id = "title_lowercase";
                    operator = "==";
                    value = filter.value.toString().toLowerCase();
                break;
                case "filterByDirector":
                    filter.id = "directorName_lowercase";
                    operator = "==";
                    value = filter.value.toString().toLowerCase();
                break;
                case "filterByCountry":
                    filter.id = "countryName_lowercase";
                    operator = "==";
                    value = filter.value.toString().toLowerCase();
                break;
                case "filterByGenre":
                    filter.id = "genres";
                    operator = "array-contains-any"
                    value = filter.value;
                break;
            }
            return where(filter.id,operator,value);
        });
        
        this.queryExists.next(this.queryConditions.length !== 0);

        console.log(this.queryConditions);

        if(this.queryConditions.length === 0){
            this.getFilms();
            return;
        }
        const q = query(collection(this.firestore,"films"), ...this.queryConditions);
        const cd = collectionData(q, {idField:'uid'}) as Observable<Film[]>;
        this.filmsSubj.next(cd);
    }

    getPopularFilms():Observable<Film[]>{
        return this.db.collection<Film>("films",ref=>{return ref.orderBy("medianScore", "desc").limit(4)}).valueChanges();
    }

    getFilm(id:number):Observable<Film[]>{
        const f = this.db.collection<Film>("films",ref=>{
            return ref.where("id","==",id)
        }).valueChanges({idField:'uid'});
        return f;
    }

    async addNewFilm(film:Film){
        const metaRef = doc(this.firestore,"films/_metadata");
        const collRef = collection(this.firestore,"films"); //doing this way creates a document with random ID 
        const filmRef = doc(collRef);
        try{
            await runTransaction(this.firestore, async(transaction)=>{
                const meta = await transaction.get(metaRef);
                const newId = (meta.data()?.['film_id'] || 0)+1;
    
                transaction.set(filmRef,
                    {...film,countryIssued:{name:film.countryIssued.name,cca3:film.countryIssued.cca3}, id:newId, directorName_lowercase:film.directorName.toLocaleLowerCase(), title_lowercase:film.title.toLowerCase(), countryName_lowercase:film.countryIssued.name.toLowerCase()},{merge:false});
                transaction.set(metaRef,{film_id:newId},{merge:true});
            })
        }catch(err){
            console.log(err);
            throw err;
        }
    }

    updateFilm(uid:string, updatedFilm:Film){
        const film = doc(this.firestore,"films",uid);
        return setDoc(film,{...updatedFilm,countryIssued:{name:updatedFilm.countryIssued.name,cca3:updatedFilm.countryIssued.cca3},directorName_lowercase:updatedFilm.directorName.toLocaleLowerCase(), title_lowercase:updatedFilm.title.toLowerCase(), countryName_lowercase:updatedFilm.countryIssued.name.toLowerCase()},{merge:true});
    }

    async removeFilm(uid:string){
        const film = doc(this.firestore,"films",uid);
        const meta = doc(this.firestore,"films/_metadata");

        await runTransaction(this.firestore,async(transaction)=>{
            transaction.delete(film);
        }).then(()=>{
            this.db.collection<Film>("films",ref=>{return ref.orderBy("id").limitToLast(1)}).get().subscribe(f=>{
                runTransaction(this.firestore,async(transaction)=>{
                    transaction.set(meta,{
                        film_id:f.docs[0].data()['id']
                    },{merge:true});
                })
            })
        })
    }

    async rateFilm(userUid:string, filmUid:string, score:number){
        const filmRef = doc(this.firestore,"films",filmUid);
        const userRef = doc(this.firestore,"users",userUid);
        await runTransaction(this.firestore, async(transaction)=>{
            const film = await transaction.get(filmRef);
            const user = await transaction.get(userRef);

            const usersArray:string[] = film.get('users');
            if(usersArray && usersArray.includes(user.id)){
                const filmsArr:{filmUid:string,score:number}[] = user.get('films');
                const oldScore = filmsArr[filmsArr.findIndex(f=>f.filmUid === film.id)].score;

                transaction.set(filmRef,{wholeScore: increment(-oldScore)},{merge:true})
                transaction.set(filmRef,{numberOfRatings: increment(-1)},{merge:true})
                transaction.set(filmRef,{users:arrayRemove(userUid)},{merge:true});

                const oldFilm = {
                    filmUid:filmUid,
                    score:oldScore
                };
                transaction.set(userRef,{films:arrayRemove(oldFilm)},{merge:true});
            }
            if(score !== -1){
                transaction.set(filmRef,{numberOfRatings: increment(1)},{merge:true})
                transaction.set(filmRef,{users:arrayUnion(userUid)},{merge:true});
                transaction.set(filmRef,{wholeScore: increment(score)},{merge:true})
                const newFilm = {
                    filmUid:filmUid,
                    score:score,
                };
                transaction.set(userRef,{films:arrayUnion(newFilm)},{merge:true});
            }
        })
        await runTransaction(this.firestore,async(transaction)=>{
            const film = await transaction.get(filmRef);
            const ws:number = +film.data()!['wholeScore'];
            const nr:number = +film.data()!['numberOfRatings'];
            const md = ws/nr;
            transaction.set(filmRef,{medianScore:md},{merge:true});
        })
        await this.authService.updateUserFilms();
    }
}

export interface FirestoreQuery{
        property:string;
        operator:WhereFilterOp;
        value:unknown;
}