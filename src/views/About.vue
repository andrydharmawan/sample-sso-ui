<template>
    <div class="about">
        <a-descriptions
            title="About Sample Project Single Sign-on Universitas Indonesia"
            bordered
        >
            <a-descriptions-item label="Name" span="1.5">{{name}}</a-descriptions-item>
            <a-descriptions-item label="Version" span="1.5">{{version}}</a-descriptions-item>
            <a-descriptions-item label="Script" span="3">
                <div v-for="{ key, value } of scripts" :key="key">
                    <b>{{key}}</b>: {{value}}
                </div>
            </a-descriptions-item>
            <a-descriptions-item label="Dependencies" span="3">
                <table width="100%">
                    <tr v-for="{ key, value } of dependencies" :key="key">
                        <td style="width:30%;"><b>{{key}}</b></td>
                        <td><div class="border rounded">{{value}}</div></td>
                    </tr>
                </table>
            </a-descriptions-item>
        </a-descriptions>
    </div>
</template>
<script>
import { dependencies, scripts, name, version } from "../../package.json";
export default {
    data(){
        return {
            scripts: Object.keys(scripts).map(item => {
                return {
                    key: item,
                    value: scripts[item]
                }
            }),
            dependencies: Object.keys(dependencies).map(item => {
                return {
                    key: item,
                    value: dependencies[item]
                }
            }),
            name,
            version
        }
    }
}
</script>

