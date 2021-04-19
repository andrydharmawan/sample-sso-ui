import BaseHelper from "../";
import { api } from "../../config";

class IndexHelper extends BaseHelper {
    static url = api.sso;

    static async checkSession(data, callback){
        return await super.post(`session/checking`, data, callback, { success: false, error: false })
    }

    static async logout(data, callback){
        return await super.post(`logout`, { parameter: data }, callback, { success: false, error: false })
    }

    static async generateApiToken(data, callback){
        return await super.post(`token/generate`, { parameter: data }, callback, { success: false, error: false })
    }

    static async revoke(data, callback){
        return await super.post(`token/revoke`, { parameter: data }, callback, { success: false, error: false })
    }
}

export default IndexHelper;