import { Inject, Injectable, Optional } from '@angular/core';
import { NG_UNIVERSAL_TRANSFER_HTTP_CONFIG } from '../../tokens';
import { TransferHttpCacheConfig } from '../../interfaces';

@Injectable()
export class TransferHttpCacheConfigService {
    // private property to store config
    private _config: TransferHttpCacheConfig;

    /**
     * Class constructor
     *
     * @param {TransferHttpCacheConfig} _transferHttpCacheConfig
     */
    constructor(@Optional() @Inject(NG_UNIVERSAL_TRANSFER_HTTP_CONFIG) private _transferHttpCacheConfig: TransferHttpCacheConfig) {
        this._config = { prodMode: true, skipUrlSchemeWhenCaching: false };
        if (this._transferHttpCacheConfig !== null) {
            Object.assign(this._config, this._transferHttpCacheConfig);
        }
    }

    /**
     * Returns private property _config
     *
     * @return {TransferHttpCacheConfig}
     */
    get config(): TransferHttpCacheConfig {
        return this._config;
    }
}
