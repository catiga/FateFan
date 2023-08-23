<template>
  <form @submit.prevent="onsubmit">
    <va-input
      v-model="username"
      class="mb-4"
      :label="t('auth.username')"
      :error="!!emailErrors.length"
      :error-messages="emailErrors"
    />

    <va-input
      v-model="password"
      class="mb-4"
      type="password"
      :label="t('auth.password')"
      :error="!!passwordErrors.length"
      :error-messages="passwordErrors"
    />

    <div class="auth-layout__options flex items-center justify-between">
      <va-checkbox v-model="keepLoggedIn" class="mb-0" :label="t('auth.keep_login')" />
      <router-link class="ml-1 va-link" :to="{ name: 'recover-password' }">{{
        t('auth.recover_password')
      }}</router-link>
    </div>

    <div class="flex justify-center mt-4">
      <va-button class="my-0" @click="onsubmit">{{ t('auth.btn.sign_in') }}</va-button>
    </div>
  </form>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { useForm, useModal, useToast, useColors } from 'vuestic-ui'
  import { useGlobalStore } from '../../../stores/global-store'
  import axios from 'axios'
  import qs from 'qs'

  const { t } = useI18n()
  const { init } = useToast()

  const GlobalStore = useGlobalStore()

  const username = ref('')
  const password = ref('')
  const keepLoggedIn = ref(false)
  const emailErrors = ref<string[]>([])
  const passwordErrors = ref<string[]>([])
  const router = useRouter()

  const formReady = computed(() => !emailErrors.value.length && !passwordErrors.value.length)

  async function computeSha256(text: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(text)
    const hash = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hash))
    const hashHex = hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('')
    return hashHex
  }

  const handleLogin = async (un: string, pass: string) => {
    const encPass = await computeSha256(pass)
    const data = { username: un, password: encPass }
    try {
      const response = await axios.post('/rpc/spwapi/admin/login', qs.stringify(data), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
      console.log('response:::', response)
      if (!response.data) {
        init({ message: 'Network Error', color: 'danger' })
      } else if (response.data.Code != 0) {
        init({ message: response.data.Msg, color: 'danger' })
      } else {
        init({ message: 'Success', color: 'success' })
        GlobalStore.setLoginAdmin({ userId: response.data.Data.admin_id, userToken: response.data.Data.token })
        router.push({ name: 'dashboard' })
      }
    } catch (err) {
      console.log('err:::', err)
      init({ message: 'Network Error', color: 'danger' })
    }
  }

  function onsubmit() {
    if (!formReady.value) return

    emailErrors.value = username.value ? [] : ['Username is required']
    passwordErrors.value = password.value ? [] : ['Password is required']

    // router.push({ name: 'dashboard' })
    handleLogin(username.value, password.value)
  }
</script>
