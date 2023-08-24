<template>
  <div class="cards">
    <div class="cards-container grid grid-cols-12 items-start gap-6 wrap">
      <template v-for="loop in listLoops" :key="loop + '-0'">
        <va-card class="col-span-12 sm:col-span-6 md:col-span-3">
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
  </div>
</template>

<script setup lang="ts">
  import axios from 'axios'
  import qs from 'qs'
  import { ref, watchEffect } from 'vue'
  import { useI18n } from 'vue-i18n'
  import { useForm, useModal, useToast, useColors } from 'vuestic-ui'
  import { onMounted } from 'vue'

  interface CharRole {
    id: number
    name: string
    avatar: string
    info: string
    birth: string
    age: string
    gender: string
    place: string
  }

  const { t } = useI18n()
  const { init } = useToast()

  const characters = ref<CharRole[]>([])

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
          })
        }
        listLoops.value = characters.value.length
      }
    } catch (err) {
      console.log('err:::', err)
      init({ message: 'Network Error', color: 'danger' })
    }
  }

  onMounted(() => {
    handleCharList()
  })
</script>
