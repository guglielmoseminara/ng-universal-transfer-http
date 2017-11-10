import { ApplicationRef, Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { TransferState, makeStateKey, StateKey } from '@angular/platform-browser';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { first, filter, flatMap } from 'rxjs/operators';
import { mergeStatic } from 'rxjs/operators/merge';

/**
 * Response interface
 */
interface TransferHttpResponse {
    body?: any | null;
    headers?: { [k: string]: string[] };
    status?: number;
    statusText?: string;
    url?: string;
}

@Injectable()
export class TransferHttpCacheInterceptor implements HttpInterceptor {
    // private property to store cache activation status
    private _isCacheActive: boolean;
    // private property to store unique id of the key
    private _id: number;

    /**
     * Class constructor
     *
     * @param {ApplicationRef} _appRef
     * @param {TransferState} _transferState
     */
    constructor(private _appRef: ApplicationRef, private _transferState: TransferState) {
        this._isCacheActive = true;
        this._id = 0;

        // Stop using the cache if the application has stabilized, indicating initial rendering is complete.
        of(this._appRef.isStable)
            .pipe(
                first(_ => !!_),
            )
            .subscribe(_ => this._isCacheActive = false);
    }

    /**
     * Interceptor process
     *
     * @param {HttpRequest<any>} req
     * @param {HttpHandler} next
     *
     * @return {Observable<HttpEvent<any>>}
     */
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const isCacheActive = of(this._isCacheActive);
        return mergeStatic(
            isCacheActive
                .pipe(
                    filter(_ => !_),
                    flatMap(_ => next.handle(req))
                ),
            isCacheActive
                .pipe(
                    filter(_ => !!_),
                    flatMap(_ =>
                        this._createStoreKey(req)
                            .pipe(
                                flatMap(__ => this._transferStateProcess(req, next, __))
                            )
                    )
                )
        );
    }

    private _transferStateProcess(req: HttpRequest<any>,
                                  next: HttpHandler,
                                  storeKey: StateKey<TransferHttpResponse>): Observable<any> {
        const hasKey = of(this._transferState.hasKey(storeKey));
        return mergeStatic(
            hasKey
                .pipe(
                    filter(_ => !!_)
                ),
            hasKey
                .pipe(
                    filter(_ => !_)
                )
        );
    }

    /**
     * Creates store key
     *
     * @param {HttpRequest<any>} req
     *
     * @return {Observable<StateKey<TransferHttpResponse>>}
     *
     * @private
     */
    private _createStoreKey(req: HttpRequest<any>): Observable<StateKey<TransferHttpResponse>> {
        return of(makeStateKey<TransferHttpResponse>(JSON.stringify(req)));
    }

    /**
     * Creates Headers Map
     *
     * @param {HttpHeaders} headers
     *
     * @return {{[name: string]: string[]}}
     *
     * @private
     */
    /*private _getHeadersMap(headers: HttpHeaders): { [name: string]: string[] } {
        return headers.keys().reduce((acc, curr) => Object.assign(acc, { [curr]: headers.getAll(curr)! }), {});
    }*/
}
