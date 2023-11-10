import { Component } from "@angular/core";

@Component({
    selector:'app-spinner',
    standalone:true,
    template:`<span class="loader"></span>`,
    styleUrls:["./spinner.component.css"]
})
export class SpinnerComponent{}