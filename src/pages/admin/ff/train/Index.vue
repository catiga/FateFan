<template>
  <div class="tooltips grid grid-cols-12 items-start gap-6">
    <va-card class="col-span-12 md:col-span-12">
      <va-card-title>{{ t('train-data.form') }}</va-card-title>
      <va-card-content>
        <va-input v-model="form.constraint" class="mb-8" :label="t('train-data.constraint')" />
        <va-input v-model="form.question" class="mb-8" :label="t('train-data.question')" />

        <va-card class="larger-padding col-span-12">
          <va-card-title>占卜方法. 当前选择： {{ form.method?.name }}</va-card-title>
          <va-card-content>
            <div class="mb-6 my-3 flex flex-wrap items-center gap-2">
              <va-button
                v-for="(e, index) in methods"
                :key="index"
                preset="outline"
                border-color="danger"
                color="danger"
                @click="selMethod(e)"
              >
                {{ e.name }}</va-button
              >
            </div>
          </va-card-content>
        </va-card>

        <va-card class="larger-padding col-span-12">
          <va-card-title>赋能人物. 当前选择： {{ showChars() }}</va-card-title>
          <va-card-content>
            <div class="mb-6 my-3 flex flex-wrap items-center gap-2">
              <va-button v-for="(e, index) in characters" :key="index" color="danger" @click="selChar(e)">
                {{ e.name }}</va-button
              >
            </div>
          </va-card-content>
        </va-card>

        <va-input
          v-model="form.answer"
          class="mb-6"
          type="textarea"
          :label="t('train-data.answer')"
          :min-rows="10"
          :max-rows="20"
        />

        <div class="popover-example mt-5">
          <va-button color="danger" @click="handleSave"> {{ t('train-data.btn.save-train') }} </va-button>
          <va-button @click="handleTrain"> {{ t('train-data.btn.gpt-train') }} </va-button>
        </div>
      </va-card-content>
    </va-card>
  </div>
</template>

<script setup lang="ts">
  import axios from 'axios'
  import qs from 'qs'
  import { onMounted } from 'vue'
  import { reactive, ref } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useForm, useModal, useToast, useColors } from 'vuestic-ui'
  const { t } = useI18n()

  const { init } = useToast()

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

  interface Method {
    id: number
    name: string
    lan: string
    code: string
  }

  interface FormSel {
    method?: Method
    role?: CharRole[]
    question?: string
    constraint?: string
    answer?: string
  }

  const characters = ref<CharRole[]>([])
  const methods = ref<Method[]>([])

  let fs: FormSel = {}
  const form = reactive<FormSel>(fs)

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
      // init({ message: 'Network Error', color: 'danger' })
    }
  }

  const handleMethodList = async () => {
    try {
      const response = await axios.get('/rpc/spwapi/admin/methods', {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (response.data && response.data.Data) {
        for (let e of response.data.Data) {
          methods.value.push({
            id: e.Id,
            name: e.Name,
            lan: e.Lan,
            code: e.Code,
          })
        }
      }
    } catch (err) {
      console.log('err:::', err)
      // init({ message: 'Network Error', color: 'danger' })
    }
  }

  const selMethod = (e: Method) => {
    form.method = e
  }

  const selChar = (e: CharRole) => {
    let data: CharRole[] = form.role ?? []
    let isIn = false
    console.log(isIn, data, e)
    for (let a of data) {
      if (a.code == e.code) {
        isIn = true
        break
      }
    }
    if (!isIn) {
      data.push(e)
    } else {
      for (let i = 0; i < data.length; i++) {
        if (data[i].code == e.code) {
          data.splice(i, 1)
        }
      }
    }
    form.role = data
    // console.log('form.role===', form.role)
  }

  const showChars = () => {
    let s = ''
    let data: CharRole[] = form.role ?? []
    for (let e of data) {
      s += e.name + ','
    }
    return s
  }

  const handleTrain = async () => {
    let prompt = '' + form.constraint + '\n'
    prompt += '' + form.method?.name + '\n'
    prompt += '' + form.question
    const d = {
      type: 'chatGPT',
      method: 'request_train',
      data: prompt,
    }
    ws.send(JSON.stringify(d))
  }

  const handleSave = async () => {
    init({ message: 'unsupport operation for now', color: 'danger' })
  }

  onMounted(() => {
    handleCharList()
    handleMethodList()
  })

  //ws
  const ws: WebSocket = new WebSocket('ws://localhost:18080/spwapi/ws')

  ws.onopen = () => {
    console.log('WebSocket is connected.')
  }

  ws.onmessage = (event) => {
    const message = event.data
    if (!form.answer) {
      form.answer = message
    } else {
      form.answer += message
    }
  }

  ws.onerror = (error) => {
    console.error('WebSocket Error:', error)
  }

  ws.onclose = (event) => {
    if (event.wasClean) {
      console.log(`Closed cleanly, code=${event.code}, reason=${event.reason}`)
    } else {
      console.error('Connection died')
    }
  }
</script>
