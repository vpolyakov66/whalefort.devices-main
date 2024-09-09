export interface IResponseDataWrapper<T = any>{
	data?: T
	error?: string
	code: number,
	isOk: boolean
}
