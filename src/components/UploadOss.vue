<template>
  <!-- <va-file-upload
    v-model="basic"
    type="gallery"
    file-types="image/*"
    @fileAdded="handlefile"
    @fileRemoved="handleRemoved"
    ><va-button class="upload-btn" :loading="submiting" :disabled="submiting">
      {{ showtext }}
    </va-button></va-file-upload
  > -->
  <div>
    <va-button
      class="upload-btn"
      :loading="submiting"
      :disabled="submiting"
      @click="modelValue ? handleDelete() : handleUploadClick()"
    >
      {{ modelValue ? 'Delete' : showtext }}
    </va-button>
    <div class="image-list mt-4">
      <va-image class="w-36 rounded-xl overflow-hidden" :ratio="9 / 9" :src="modelValue" />
    </div>
    <!-- 上传 input -->
    <input
      ref="selectFile"
      type="file"
      style="display: none"
      accept="image/png, image/jpeg, image/jpg, image/webp"
      @change="handlefile($event)"
    />
  </div>
</template>

<script>
  import { getAliToken, clientObj, getFileName } from '~/oss/ali-oss.js'
  import { useToast } from 'vuestic-ui'
  const { init } = useToast()
  export default {
    props: {
      path: {
        type: String,
        require: true,
      },
      modelValue: {
        type: String,
      },
      limitSize: {
        type: Number,
        default: 5,
      },
      showtext: {
        type: String,
        default: 'upload',
      },
    },
    data() {
      return {
        client: null,
        ossImgList: [],
        submiting: false,
        bloburl: null,
      }
    },
    watch: {
      // ..
    },
    async mounted() {
      const data = await getAliToken()
      this.client = clientObj(data)
    },
    methods: {
      handlefile(e) {
        let files = e.target.files
        this.submiting = true
        files = Array.prototype.slice.call(files)
        this.ossUpload(files)
      },
      ossUpload(files) {
        let resultOss = []
        files.forEach(async (v, i) => {
          // let fileSizeInMB = v.size / (1024 * 1024); // 文件大小以MB为单位
          // if (fileSizeInMB > this.limitSize) {
          //     return init({ message: `请将图片限制在${this.limitSize}M内哦`, color: 'danger' })
          // }
          resultOss.push(
            new Promise((resolve, reject) => {
              let filename = this.getName(v)
              this.client.put(`${this.path}/${filename}`, v).then(() => {
                this.client
                  .putACL(`${this.path}/${filename}`, 'public-read')
                  .then((r) => {
                    resolve(r.res.requestUrls[0].replace('?acl=', '').replace('http://', 'https://'))
                  })
                  .catch((e) => {
                    reject('')
                  })
              })
            }),
          )
        })

        Promise.all(resultOss).then((res) => {
          this.postImgLoading = false
          this.ossImgList = [...this.ossImgList, ...res]
          // 单图
          this.submiting = false
          this.$emit('update:modelValue', this.ossImgList[0])
        })
      },
      getName(file) {
        let nameArray = file.name.split('.')
        return `${getFileName()}-${nameArray[0]}.${nameArray[nameArray.length - 1].toLocaleLowerCase()}`
      },
      handleUploadClick() {
        this.$refs['selectFile'].click()
      },
      handleDelete() {
        this.ossImgList = []
        this.$emit('update:modelValue', '')
      },
    },
  }
</script>

<style lang="scss">
  .va-file-upload__field {
    width: 100px;
  }
  .va-file-upload-list {
    flex-wrap: initial;
  }
  .upload-btn {
    white-space: nowrap;
  }
</style>
