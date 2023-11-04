import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppComponent } from "./app.component";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { PlayerCardComponent } from "./player-card/player-card.component";
import { RSOServiceService } from "./services/rsoservice.service";
import { SweetAlert2Module } from "@sweetalert2/ngx-sweetalert2";
import { ToastrModule } from "ngx-toastr";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

@NgModule({
  declarations: [AppComponent, PlayerCardComponent],
  imports: [
    BrowserModule,
    FontAwesomeModule,
    SweetAlert2Module.forRoot({
      provideSwal: () => import("sweetalert2/dist/sweetalert2.js"),
    }),
    ToastrModule.forRoot(),
    BrowserAnimationsModule,
  ],
  providers: [RSOServiceService],
  bootstrap: [AppComponent],
})
export class AppModule {}
