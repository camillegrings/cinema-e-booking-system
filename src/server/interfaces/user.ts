export default interface IUser {
	id: number;
	role: string;
	email: string;
	password_hash: string;
	created_at: Date;
}
