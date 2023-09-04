<template>
  <div class="lists grid grid-cols-12 items-start gap-6">
    <va-card class="col-span-12 lg:col-span-6 p-4">
      <div class="tree-view-advanced-preview__buttons">
        <va-button class="mr-2" @click="removeSels">删除选中</va-button>
      </div>
      <va-tree-view v-model:checked="selectedNodes" :nodes="catalogData" selectable> </va-tree-view>
    </va-card>

    <va-card class="col-span-12 lg:col-span-6 p-4">
      <va-form ref="transferForm" class="flex flex-col gap-6">
        <va-list class="py-4">
          <va-list-label> 类型信息 </va-list-label>

          <va-list-item class="mb-2" clickable>
            <va-list-item-section>
              <va-list-item-label>所属</va-list-item-label>
              <va-select
                v-model="form.parent"
                class="mb-4"
                :options="catalogData"
                track-by="id"
                text-by="label"
                clearable
              />
            </va-list-item-section>
          </va-list-item>

          <va-list-item class="mb-2" clickable>
            <va-list-item-section>
              <va-list-item-label>编码</va-list-item-label>
              <va-input v-model="form.code" class="mb-8" type="text" />
            </va-list-item-section>
          </va-list-item>

          <va-list-item class="mb-2" clickable>
            <va-list-item-section>
              <va-list-item-label>名称</va-list-item-label>
              <va-input v-model="form.name" class="mb-8" type="text" />
            </va-list-item-section>
          </va-list-item>

          <va-list-item class="mb-2" clickable>
            <va-list-item-section>
              <va-list-item-label>生效语言</va-list-item-label>
              <va-select v-model="form.lan" class="mb-4" :options="lanList" track-by="code" text-by="name" />
            </va-list-item-section>
          </va-list-item>

          <va-list-separator fit spaced />

          <va-list-item class="mb-2">
            <va-list-item-section>
              <va-button :loading="submitPlace" :disable="submitPlace" @click="handleSave">Save</va-button>
            </va-list-item-section>
          </va-list-item>
        </va-list>
      </va-form>
    </va-card>
  </div>
</template>

<script setup lang="ts">
  import axios from 'axios'
  import qs from 'qs'
  import { ref, watchEffect, reactive } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useRouter } from 'vue-router'
  import { useForm, useModal, useToast, useColors } from 'vuestic-ui'
  import { onMounted } from 'vue'
  import UploadOss from '../../../../components/UploadOss.vue'
  import { useGlobalStore } from '../../../../stores/global-store'

  interface Lan {
    code: string
    name: string
  }
  interface CatInfo {
    code: string
    name: string
    lan: Lan
    parent: { id: number }
    id: number
  }

  const { init } = useToast()
  const GlobalStore = useGlobalStore()
  const router = useRouter()

  const selectedNodes = ref([])

  const catalogData = ref([])

  const form = reactive<CatInfo>({
    code: '',
    name: '',
    lan: { code: '', name: '' },
    parent: { id: 0 },
    id: 0,
  })

  const lanList = ref([
    {
      code: 'en',
      name: 'English',
    },
    {
      code: 'zh-CN',
      name: '简体中文',
    },
  ])

  const handleSonList = async (pid) => {
    try {
      const response = await axios.post('/rpc/spwapi/admin/catalog/list', qs.stringify({ lan: 'zh-CN', pid: pid }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Auth-Token': GlobalStore.loginAdmin.userToken,
        },
      })
      const responseData = response.data
      if (responseData.Code == 0 && responseData.Data) {
        for (let e of catalogData.value) {
          if (e.id == pid) {
            e.children = []
            for (let f of responseData.Data) {
              e.children.push({
                id: f.Id,
                label: f.Name,
                code: f.Code,
                lan: f.Lan,
                pid: f.Parent,
              })
            }
          }
        }
      }
    } catch (err) {
      console.log('err:::', err)
      init({ message: 'Network Error', color: 'danger' })
    }
  }

  const handleList = async () => {
    catalogData.value.splice(0, catalogData.value.length, ...[])
    console.log('GlobalStore.loginAdmin...', GlobalStore.loginAdmin)
    try {
      const response = await axios.post('/rpc/spwapi/admin/catalog/list', qs.stringify({ lan: 'zh-CN' }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Auth-Token': GlobalStore.loginAdmin.userToken,
        },
      })
      const responseData = response.data
      if (responseData.Code == 0 && responseData.Data) {
        for (let e of responseData.Data) {
          handleSonList(e.Id)
          catalogData.value.push({
            id: e.Id,
            label: e.Name,
            code: e.Code,
          })
        }
      } else if (responseData.Code == 3) {
        router.replace('/auth/login')
      } else {
        init({ message: responseData.Msg, color: 'danger' })
      }
    } catch (err) {
      console.log('err:::', err)
      init({ message: 'Network Error', color: 'danger' })
    }
  }

  const handleSave = async () => {
    try {
      const data = { code: form.code, name: form.name, lan: form.lan?.code, pid: form.parent?.id, id: form.id ?? 0 }
      const response = await axios.post('/rpc/spwapi/admin/catalog/add', qs.stringify(data), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Auth-Token': GlobalStore.loginAdmin.userToken,
        },
      })
      const responseData = response.data
      if (responseData.Code == 0) {
        handleList()
      } else if (responseData.Code == 3) {
        router.replace('/auth/login')
      } else {
        init({ message: responseData.Msg, color: 'danger' })
      }
    } catch (err) {
      console.log('err:::', err)
      init({ message: 'Network Error', color: 'danger' })
    }
  }

  const removeSels = async () => {
    console.log('selec', selectedNodes)
    selectedNodes.value.map((num) => {
      axios
        .post('/rpc/spwapi/admin/catalog/del', qs.stringify({ id: num }), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Auth-Token': GlobalStore.loginAdmin.userToken,
          },
        })
        .then((v) => {
          console.log('remove', num, v)
        })
    })
    return
  }

  onMounted(() => {
    handleList().then((v) => {
      console.log(v)
    })
  })
</script>
