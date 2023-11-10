import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name:'addComma',
    standalone:true
})
export class AddCommaPipe implements PipeTransform{
    transform(text:string,currentIndex:number, maxIndex:number){
        if(currentIndex===maxIndex){
            return text;
        }
        return text+", ";
    }
}