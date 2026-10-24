export default interface ICustomer {
	user_id: number;
	first_name: string;
	last_name: string;
	status: string;
	is_verified: boolean;
	subscribed_to_promos: boolean;
	home_address_id: number;
}
