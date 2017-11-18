import { ModuleWithProviders, NgModule } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserTransferStateModule } from '@angular/platform-browser';
import { TransferHttpCacheInterceptor, NG_UNIVERSAL_TRANSFER_HTTP_CONFIG } from './shared';

@NgModule({
    imports: [BrowserTransferStateModule],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: TransferHttpCacheInterceptor, multi: true },
    ],
})
export class TransferHttpCacheModule {
    static enableOnProdMode(prodMode: boolean = true): ModuleWithProviders {
        return {
            ngModule: TransferHttpCacheModule,
            providers: [{ provide: NG_UNIVERSAL_TRANSFER_HTTP_CONFIG, useValue: prodMode }]
        };
    }
}
