export const { VUE_APP_URL, VUE_APP_API_VERSION } = process.env;

export const api = {
	sso					: `${VUE_APP_URL}sso/${VUE_APP_API_VERSION}`
}