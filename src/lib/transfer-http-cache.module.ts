import { NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserTransferStateModule } from '@angular/platform-browser';
import { TransferHttpCacheInterceptor } from './shared';

@NgModule({
    imports: [BrowserTransferStateModule],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: TransferHttpCacheInterceptor, multi: true },
    ],
})
export class TransferHttpCacheModule {
}
