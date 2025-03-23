import { BrowserModule } from '@angular/platform-browser';
import { NgModule, LOCALE_ID } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { IntlModule } from '@progress/kendo-angular-intl';
import { AppComponent } from './app.component';
import { LocalizationService, L10N_PREFIX } from '@progress/kendo-angular-l10n';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { registerLocaleData } from '@angular/common';
import localeVi from '@angular/common/locales/vi';
import { DateTimePickerComponent } from './in-app/in-config/pages/components/custom-calendar/datetimepicker.component';
import { InConfigComponent } from './in-app/in-config/in-config.component';
import { MonthNameViPipe } from './in-app/in-config/pages/components/custom-calendar/pipes/month-format-pipe/month-name-vi.pipe';

registerLocaleData(localeVi, 'vi');


@NgModule({
  declarations: [AppComponent, DateTimePickerComponent, InConfigComponent, MonthNameViPipe],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    DateInputsModule,
    IntlModule,
    DropDownsModule
  ],
  providers: [
    LocalizationService,
    { provide: L10N_PREFIX, useValue: 'kendo' },
    { provide: LOCALE_ID, useValue: 'vi' } 
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
