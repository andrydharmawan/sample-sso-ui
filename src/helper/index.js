import axios from "axios"
import TypeRequestEnum from "../enums/TypeRequestEnum"
import { identity, ssoUI } from "../lib";
import {
    notification
} from "ant-design-vue"

class BaseHelper {
    static url = ""

    static handleResponse = async ({ data }, callback, config) => {
        const { success = true, error = true } = config;

        let { 
            status,
            result
        } = data; 

        let {
            responsecode,
            responsedesc
        } = status || {};

        const statusOk = responsecode === "0000";
        
        if(success && statusOk) notification.success({ message: "Success", description: responsedesc })
        if(error && !statusOk) notification.error({ message: "Error", description: responsedesc })
        
        const response = { status: statusOk, data: result || data, message: responsedesc };
        if (callback) callback(response);
        else return response;
    }

    static async request(method, url, data, callback, config = {}) {
        const { auth = true } = config;
        
        const { apitoken } = await ssoUI.get() || {};

        let headers = { "Content-Type": "application/json" }

        data.identity = identity();

        const client = axios.create({ baseURL: url, json: true });

        if(apitoken && auth) headers.Authorization = `Bearer ${apitoken}`;

        return client({ method, data, headers, responseType: "json", })
            .then(async response => this.handleResponse(response, callback, config))
            .catch(async error => this.handleResponse({ data: { status: { responsecode: error.response.status, responsedesc: error.message, }, result: null, } }, callback, config));
    }

    static post(url, data, callback, config) {
        return this.request(TypeRequestEnum.REQUEST_POST, this.url + url, data, callback, config)
    }

    static put(url, data, callback, config) {
        return this.request(TypeRequestEnum.REQUEST_PUT, this.url + url, data, callback, config)
    }

    static patch(url, data, callback, config) {
        return this.request(TypeRequestEnum.REQUEST_PATCH, this.url + url, data, callback, config)
    }

    static delete(url, data, callback, config) {
        return this.request(TypeRequestEnum.REQUEST_DELETE, this.url + url, data, callback, config)
    }

    static get(url, data, callback, config) {
        return this.request(TypeRequestEnum.REQUEST_GET, this.url + url, data, callback, config)
    }
}

export default BaseHelper;