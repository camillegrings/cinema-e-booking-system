export default interface IToken {
	user_id: number;
	email: string;
	verification_code: string;
	created_at: Date;
}
