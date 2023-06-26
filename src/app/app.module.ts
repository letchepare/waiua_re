import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";

import { AppComponent } from "./app.component";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { PlayerCardComponent } from './player-card/player-card.component';
import { RSOServiceService } from "./services/rsoservice.service";

@NgModule({
  declarations: [AppComponent, PlayerCardComponent],
  imports: [BrowserModule, FontAwesomeModule],
  providers: [RSOServiceService],
  bootstrap: [AppComponent],
})
export class AppModule {}
