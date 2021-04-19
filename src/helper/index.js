import axios from "axios"
import TypeRequestEnum from "../enums/TypeRequestEnum"
import { identity, ssoUI } from "../lib";
import {
    notification
} from "ant-design-vue"

class BaseHelper {
    static url = ""

    static handleResponse = async (response, callback, config) => {
        const { success = true, error = true } = config;

        let { 
            status,
            result,
            paging 
        } = response.data; 

        let {
            responsecode = "9198",
            responsedesc
        } = status || {};

        if(responsecode === "9198") responsedesc = "Response error, Please contact your administrator";

        if (paging) result = {
            result,
            paging
        };

        const statusOk =  responsecode === "0000";
        
        if(success && statusOk) notification.success({ message: "Success", description: responsedesc })
        if(error && !statusOk) notification.error({ message: "Error", description: responsedesc })
        
        if (callback) callback(statusOk, result, responsedesc);
        else return { status: statusOk, data: result || response.data, message: responsedesc }
    }

    static async request(method, url, data, callback, config = {}) {
        const { auth = true } = config;
        const { apitoken } = await ssoUI.get() || {};
        let headers = { "Content-Type": "application/json" }

        data.identity = identity();

        const client = axios.create({ baseURL: url, json: true });


        if(apitoken && auth) headers.Authorization = `Bearer ${apitoken}`;

        return client({ method, data, headers, responseType: "json", })
            .then(async (response) => this.handleResponse(response, callback, config))
            .catch(async error => this.handleResponse({ data: { status: { responsecode: error.response.status || "9198", responsedesc: error.message, }, result: null, } }, callback, config));
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