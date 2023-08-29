<template>
    <va-file-upload
        v-model="basic"
        @fileAdded="handlefile"
        @fileRemoved="handleRemoved"
        type="gallery"
        file-types="image/*"
    />
</template>

<script>
import { getAliToken, clientObj, getFileName } from "~/oss/ali-oss.js";
import { useToast } from 'vuestic-ui'
const { init } = useToast()
export default {
    props: {
        path: {
            type: String,
            require: true,
        },
        modelValue: {
            type: Array
        },
        limitSize: {
            type: Number,
            default: 5
        }
    },
    data() {
        return {
            client: null,
            originFile: [],
            ossImgList: [],
            basic: ''
        }
    },
    watch: {
        // ..
    },
    async mounted() {
        const data = await getAliToken();
        this.client = clientObj(data);
    },
    methods: {
        handlefile(e) {
            let files = e
            this.originFile = files
            files = Array.prototype.slice.call(files);
            this.ossUpload(files)
        },
        handleRemoved(e) {
            let index = this.originFile.findIndex((v,i) => {
                return (v.name == e.name) && (v.size == v.size)
            })
            this.originFile.splice(index, 1)
            this.ossImgList.splice(index, 1)
            this.$emit('update:modelValue', this.ossImgList)
        },
        ossUpload(files) {
            let resultOss = []
            files.forEach(async (v,i) => {
                // let fileSizeInMB = v.size / (1024 * 1024); // 文件大小以MB为单位
                // if (fileSizeInMB > this.limitSize) {
                //     return init({ message: `请将图片限制在${this.limitSize}M内哦`, color: 'danger' })
                // }
                resultOss.push(new Promise(async (resolve, reject) => {
                    let filename = this.getName(v)
                    await this.client.put(`${this.path}/${filename}`, v)
                    this.client.putACL(`${this.path}/${filename}`, "public-read").then(r => {
                        resolve(r.res.requestUrls[0].replace("?acl=", "").replace('http://', 'https://'))
                    }).catch(e => {
                        reject('')
                    })
                }))
            })

            Promise.all(resultOss).then(res => {
                this.postImgLoading = false
                this.ossImgList = [...this.ossImgList, ...res]
                this.$emit('update:modelValue', this.ossImgList)
            })
        },
        getName(file) {
            let nameArray = file.name.split(".");
            return `${getFileName()}-${nameArray[0]}.${nameArray[nameArray.length - 1].toLocaleLowerCase()}`;
        },
    }
}

</script>

<style lang="scss">
.va-file-upload__field {
    width: 100px;
}
.va-file-upload-list {
    flex-wrap: initial;
}
</style>