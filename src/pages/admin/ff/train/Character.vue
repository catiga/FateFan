<template>
  <div class="form-elements grid grid-cols-12 gap-6">
    <va-card class="col-span-12">
      <div class="cards-container grid grid-cols-12 items-start gap-6 wrap">
        <template v-for="loop in listLoops" :key="loop + '-0'">
          <va-card class="col-span-12 sm:col-span-6 md:col-span-3" @click="handleClick(characters[loop - 1])">
            <va-image :src="characters[loop - 1].avatar" style="height: 200px" />
            <va-card-title
              >{{ characters[loop - 1].name }} - {{ characters[loop - 1].age }} -
              {{ characters[loop - 1].place }}</va-card-title
            >
            <va-card-content>{{ characters[loop - 1].info }}</va-card-content>
          </va-card>
        </template>
      </div>

      <va-inner-loading class="w-full py-4 justify-center" :loading="isLoading">
        <va-button @click="addCards()">Add</va-button>
      </va-inner-loading>
    </va-card>

    <va-card class="col-span-12">
      <va-card-title>Character Info</va-card-title>
      <va-card-content>
        <form>
          <div class="grid grid-cols-12 gap-6">
            <div class="flex md:col-span-4 sm:col-span-6 col-span-12">
              <va-input v-model="form.name" placeholder="character name" />
            </div>
            <div class="flex md:col-span-4 sm:col-span-6 col-span-12">
              <va-input v-model="form.info" placeholder="character info">
                <template #prepend>
                  <va-icon color="gray" name="envelope" />
                </template>
              </va-input>
            </div>
            <div class="flex md:col-span-4 sm:col-span-6 col-span-12">
              <va-input v-model="form.avatar" placeholder="Upldate character avatar">
                <template #append>
                  <va-button style="margin-right: 0" small> UPLOAD </va-button>
                </template>
              </va-input>
            </div>
            <div class="flex md:col-span-4 sm:col-span-6 col-span-12">
              <va-input v-model="form.birth" label="describe birth" success> </va-input>
            </div>
            <div class="flex md:col-span-4 sm:col-span-6 col-span-12">
              <va-input v-model="form.age" placeholder="input character age" clearable />
            </div>
            <div class="flex md:col-span-4 sm:col-span-6 col-span-12">
              <va-input v-model="form.place" label="input birth place" error :error-messages="errorMessages">
              </va-input>
            </div>
            <div class="flex md:col-span-4 sm:col-span-6 col-span-12">
              <va-input v-model="form.gender" placeholder="describe gender" :messages="messages" />
            </div>
            <div class="flex md:col-span-4 sm:col-span-6 col-span-12">
              <va-input v-model="form.region" placeholder="describe region area" :messages="messages" />
            </div>
            <div class="flex md:col-span-4 sm:col-span-6 col-span-12">
              <va-slider
                v-model="form.nature"
                color="danger"
                label="character nature"
                invert-label
                icon-prepend="music"
                track-label-visible
              />
            </div>

            <div class="flex md:col-span-6 sm:col-span-6 col-span-12">
              <va-input v-model="form.code" placeholder="describe code" />
            </div>
            <div class="flex md:col-span-6 sm:col-span-6 col-span-12">
              <va-input v-model="form.lan" placeholder="describe language" />
            </div>

            <div class="flex md:col-span-12 sm:col-span-6 col-span-12">
              <va-input v-model="form.profile" label="edit profile" type="textarea" error min-rows="10" max-rows="20">
              </va-input>
            </div>

            <div class="flex">
              <UploadOss v-model="form.bodyimg" :path="'/bodyimg'" :showtext="'Upload Bodyimg'" />
              <UploadOss v-model="form.avatar" :path="'/avatar'" :showtext="'Upload Avatar'" class="ml-12" />
            </div>
            <!-- <div class="flex md:col-span-12 sm:col-span-6 col-span-12">
            </div> -->

            <div class="flex md:col-span-12 sm:col-span-6 col-span-12">
              <va-button :loading="submiting" :disabled="submiting" @click="submit"> Update Save </va-button>
              <va-button :loading="submiting" :disabled="submiting" color="warning" @click="submitNew">
                New Save
              </va-button>
            </div>
          </div>
        </form>
      </va-card-content>
    </va-card>
  </div>
</template>

<script setup lang="ts">
  import axios from 'axios'
  import qs from 'qs'
  import { ref, watchEffect, reactive } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useForm, useModal, useToast, useColors } from 'vuestic-ui'
  import { onMounted } from 'vue'
  import UploadOss from '../../../../components/UploadOss.vue'

  interface CharRole {
    id: number
    name: string
    avatar: string
    info: string
    birth: string
    age: string
    gender: string
    place: string
    code: string
    lan: string
    profile: string
    region: string
    nature: number
    bodyimg: string
  }

  const createEmpty = (): CharRole => {
    let e: CharRole = {
      id: 0,
      name: '',
      avatar: '',
      info: '',
      birth: '',
      age: '',
      gender: '',
      place: '',
      code: '',
      lan: '',
      profile: '',
      region: '',
      nature: 0,
      bodyimg: '',
    }
    return e
  }

  const { t } = useI18n()
  const { init } = useToast()

  const characters = ref<CharRole[]>([])
  const submiting = ref<boolean>(false)

  const form = reactive<CharRole>(createEmpty())
  let messages = ref<string>('')
  let errorMessages = ref<string>('')

  const listLoops = ref(0)
  const isLoading = ref(false)

  function addCards() {
    isLoading.value = true
    setTimeout(() => {
      isLoading.value = false
      ++listLoops.value
    }, 1000)
  }

  const handleCharList = async () => {
    characters.value.splice(0, characters.value.length, ...[])
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
            code: e.Code,
            lan: e.Lan,
            profile: e.CharProfile,
            region: e.CharRegion,
            nature: e.CharNatureCode,
            bodyimg: e.CharFullBody,
          })
        }
        listLoops.value = characters.value.length
      }
    } catch (err) {
      console.log('err:::', err)
      init({ message: 'Network Error', color: 'danger' })
    }
  }

  const handleClick = async (item: CharRole) => {
    console.log(item, item)
    form.id = item.id
    form.name = item.name
    form.info = item.info
    form.birth = item.birth
    form.age = item.age
    form.gender = item.gender
    form.place = item.place
    form.code = item.code
    form.lan = item.lan
    form.profile = item.profile
    form.region = item.region
    form.nature = item.nature
    form.avatar = item.avatar
    form.bodyimg = item.bodyimg
  }

  const submit = async () => {
    try {
      const response = await axios.post('/rpc/spwapi/admin/characteradd', qs.stringify(form), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
      if (response.data && response.data.Code == 0) {
        init({ message: 'success', color: 'success' })
        handleCharList()
      } else {
        init({ message: response.data.Msg, color: 'danger' })
      }
    } catch (err) {
      console.log('err:::', err)
      init({ message: 'Network Error', color: 'danger' })
    }
  }

  const submitNew = async () => {
    form.id = 0
    await submit()
  }

  onMounted(() => {
    handleCharList()
  })
</script>
