import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ProjectComponent } from './project.component';
import { ShareButtonsModule } from 'ng2-sharebuttons';
import { CookieService } from 'angular2-cookie/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';


@NgModule({
  declarations: [ProjectComponent],
  imports: [BrowserModule, FormsModule, HttpModule],
  providers: [CookieService],
  bootstrap: [ProjectComponent]
})
export class AppModule { }
