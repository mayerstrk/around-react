import axios, { type AxiosResponse, type AxiosError, isAxiosError } from 'axios';

export interface UserIdentifiers {
	data: {
		_id: string;
		email: string;
	};
}

export interface UserCredentials {
	email: string;
	password: string;
}

export interface UserToken {
	token: string;
}

export interface AuthApiError {
	error: string;
}

export type AxiosAuthApiError = AxiosError<AuthApiError>;

const baseAuthApi = axios.create({
	baseURL: 'https://register.nomoreparties.co',
	headers: {
		'Content-Type': 'application/json',
	},
});

const handleApiError = (error: unknown): string => {
	if (isAxiosError<AuthApiError>(error)) {
		if (error.response) {
			// Ensuring that we are returning a string
			return error.response.data.error || `Error Status: ${error.response.status}`;
		}

		if (error.request) {
			return 'No response from the server.';
		}

		return error.message;
	}

	return 'An unknown error occurred.';
};

const authApi = {
	async getToken(credentials: UserCredentials): Promise<AxiosResponse<UserToken>> {
		try {
			const response = await baseAuthApi.post<UserToken>('/signin', credentials);
			return response;
		} catch (error) {
			throw new Error(handleApiError(error));
		}
	},

	async register(credentials: UserCredentials): Promise<AxiosResponse<UserIdentifiers>> {
		try {
			return await baseAuthApi.post<UserIdentifiers>('/signup', credentials);
		} catch (error) {
			throw new Error(handleApiError(error));
		}
	},

	async validateToken(token: string): Promise<AxiosResponse<UserIdentifiers>> {
		try {
			return await baseAuthApi.get<UserIdentifiers>('/users/me', {
				headers: {
					authorization: `Bearer ${token}`,
				},
			});
		} catch (error) {
			throw new Error(handleApiError(error));
		}
	},
};

export const {
	getToken: getTokenMutation,
	register: registerMutation,
	validateToken: validateTokenQuery,
} = authApi;
