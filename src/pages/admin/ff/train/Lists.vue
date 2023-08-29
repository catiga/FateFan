<template>
  <div class="lists grid grid-cols-12 items-start gap-6">
    <va-card class="col-span-12 lg:col-span-6 p-4">
      <va-list class="py-4">
        <va-list-label>
          {{ t('lists.customers') }}
        </va-list-label>

        <template v-for="(item, index) in characters" :key="index">
          <va-list-item clickable @click="notify(item)">
            <va-list-item-section avatar>
              <va-avatar>
                <img :src="item.avatar" :alt="item.name" />
              </va-avatar>
            </va-list-item-section>

            <va-list-item-section>
              <va-list-item-label>
                {{ item.name }}
              </va-list-item-label>

              <va-list-item-label caption>
                {{ item.info }}
              </va-list-item-label>

              <va-list-item-label caption>
                {{ item.lan }}
              </va-list-item-label>
              <va-list-item-label caption>
                {{ item.age }}
              </va-list-item-label>
            </va-list-item-section>

            <va-list-item-section icon>
              <va-icon name="eye" color="gray" />
            </va-list-item-section>
          </va-list-item>

          <va-list-separator class="my-1" fit />
        </template>
      </va-list>
    </va-card>

    <va-card class="col-span-12 lg:col-span-6 p-4">
      <va-form ref="transferForm" class="flex flex-col gap-6">
        <va-list class="py-4">
          <va-list-label> 角色参数优化 </va-list-label>

          <va-list-item class="mb-2" clickable>
            <va-list-item-section>
              <va-list-item-label>调参类型</va-list-item-label>
              <va-select v-model="form.role" class="mb-4" :options="roleList" track-by="code" text-by="name" />
            </va-list-item-section>
          </va-list-item>

          <va-list-item clickable>
            <va-list-item-section>
              <va-list-item-label>排序优先级</va-list-item-label>

              <va-list-item-label caption>
                <va-input v-model="form.seq" class="mb-8" type="number" />
              </va-list-item-label>
            </va-list-item-section>
          </va-list-item>

          <va-list-separator fit spaced />

          <va-list-item clickable>
            <va-list-item-section>
              <va-list-item-label>{{ form.role.code == 'system' ? '角色描述' : '样例问题' }}</va-list-item-label>

              <va-list-item-label caption>
                <va-input v-model="form.prompt" class="mb-8" type="textarea" />
              </va-list-item-label>
            </va-list-item-section>
          </va-list-item>

          <va-list-item clickable>
            <va-list-item-section>
              <va-list-item-label>{{ form.role.code != 'assistant' ? '不可用' : '样例回答' }}</va-list-item-label>

              <va-list-item-label caption>
                <va-input
                  v-model="form.answer"
                  class="mb-8"
                  type="textarea"
                  :disabled="form.role.code != 'assistant'"
                />
              </va-list-item-label>
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

    <va-card class="col-span-12">
      <va-card-title>{{ selectChar?.name }} 角色设定</va-card-title>
      <va-card-content>
        <va-accordion v-for="(item, index) in charsettings" :key="index" active="true">
          <va-collapse
            :header="index + 1 + ':' + (item.role == 'system' ? '角色设定' : '数据设定') + '-优先级' + item.seq"
          >
            <div class="p-4">
              <div>{{ item.prompt }}</div>
              <div v-if="item.role == 'assistant'">回答：{{ item.answer }}</div>
              <va-button :loading="deleteStatus" :disable="deleteStatus" @click="handleDelete(item)">Delete</va-button>
            </div>
          </va-collapse>
        </va-accordion>
      </va-card-content>
    </va-card>
  </div>
</template>

<script setup lang="ts">
  import axios from 'axios'
  import qs from 'qs'
  import { ref, onMounted, reactive } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useToast } from 'vuestic-ui'

  interface CharRole {
    id: number
    name: string
    avatar: string
    info: string
    birth: string
    age: string
    gender: string
    place: string
    lan: string
    code: string
  }

  interface CharSetting {
    id: number
    code: string
    lan: string
    role: string
    prompt: string
    seq: number
    answer: string
  }

  interface SettingRole {
    code: string
    name: string
  }
  interface Setting {
    role: SettingRole
    prompt: string
    answer: string
    seq: number
  }

  const { t } = useI18n()
  const { init } = useToast()

  const roleList = ref([
    {
      code: 'system',
      name: '角色设定',
    },
    {
      code: 'assistant',
      name: '数据设定',
    },
  ])

  const characters = ref<CharRole[]>([])
  const charsettings = ref<CharSetting[]>([])
  let selectChar = ref<CharRole>()
  const submitPlace = ref<boolean>(false)
  const deleteStatus = ref<boolean>(false)

  const form = reactive<Setting>({ role: { name: '', code: '' }, prompt: '', answer: '', seq: 0 })

  const appBanners = ref(false)
  const banners = ref(false)
  const notifications = ref(true)

  function getGenderIcon(gender: string) {
    return gender === 'male' ? 'mars' : 'venus'
  }

  function getGenderColor(gender: string) {
    return gender === 'male' ? 'info' : 'success'
  }

  function notify(item: CharRole) {
    init({
      message: `Clicked ${item.name}`,
      position: 'bottom-right',
    })
    handleCharSettings(item.code, item.lan)
    selectChar.value = item
  }

  function toggleStar(customer: { starred: boolean }) {
    customer.starred = !customer.starred
  }

  const handleCharList = async () => {
    try {
      const response = await axios.get('/rpc/spwapi/admin/characters', {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (response.data && response.data.Data) {
        for (let e of response.data.Data) {
          characters.value.push({
            id: e.Id,
            name: e.CharName,
            avatar: e.CharAvatar,
            info: e.CharInfo,
            birth: e.CharBirth,
            age: e.CharAge,
            gender: e.CharGender,
            place: e.CharPlace,
            lan: e.Lan,
            code: e.Code,
          })
        }
      }
    } catch (err) {
      console.log('err:::', err)
      init({ message: 'Network Error', color: 'danger' })
    }
  }

  const handleCharSettings = async (code: string, lan: string) => {
    charsettings.value.splice(0, charsettings.value.length, ...[])
    try {
      const response = await axios.post('/rpc/spwapi/admin/charsettings', qs.stringify({ lan: lan, code: code }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
      if (response.data && response.data.Data) {
        for (let e of response.data.Data) {
          charsettings.value.push({
            id: e.Id,
            code: e.Code,
            lan: e.Lan,
            prompt: e.Prompt,
            seq: e.Seq,
            role: e.Role,
            answer: e.Answer,
          })
        }
      }
    } catch (err) {
      console.log('err:::', err)
      init({ message: 'Network Error', color: 'danger' })
    }
  }

  const handleSave = async () => {
    if (!selectChar?.value) {
      init({ message: 'please choose character', color: 'danger' })
      return
    }
    submitPlace.value = true

    try {
      const response = await axios.post(
        '/rpc/spwapi/admin/charsetsave',
        qs.stringify({
          charId: selectChar?.value.id,
          role: form.role.code,
          prompt: form.prompt,
          answer: form.answer,
          seq: form.seq,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      )
      init({ message: 'success', color: 'success' })
      handleCharSettings(selectChar?.value.code, selectChar?.value.lan)
    } catch (err) {
      console.log('err:::', err)
      init({ message: 'Network Error', color: 'danger' })
    }
    submitPlace.value = false
  }

  const handleDelete = async (item: CharSetting) => {
    if (!selectChar?.value) {
      init({ message: 'please choose character', color: 'danger' })
      return
    }
    deleteStatus.value = true

    try {
      const response = await axios.post('/rpc/spwapi/admin/charsetdel', qs.stringify({ setid: item.id }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
      init({ message: 'success', color: 'success' })
      handleCharSettings(selectChar.value.code, selectChar.value.lan)
    } catch (err) {
      console.log('err:::', err)
      init({ message: 'Network Error', color: 'danger' })
    }
    deleteStatus.value = false
  }

  onMounted(() => {
    handleCharList()
  })
</script>
