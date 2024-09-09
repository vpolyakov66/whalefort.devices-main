import { HttpContext, HttpParams } from '@angular/common/http';

export interface IRequestOptions<T extends any> {
	url: string,
	options?: {
		context?: HttpContext,
		params?: HttpParams | {},
		reportProgress?: boolean,
		responseType?: 'arraybuffer'|'blob'|'json'|'text'
	},
	body?: T
}
