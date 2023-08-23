import { defineStore } from 'pinia'

export const useGlobalStore = defineStore('global', {
  state: () => {
    return {
      isSidebarMinimized: false,
      userName: 'Vasili S',
      userAddress: '', // 钱包地址
      userChainId: 0, // 链 ID

      loginAdmin: JSON.parse(localStorage.getItem('loginAdmin') || '{"userId": 0, "userToken": ""}'),
    }
  },

  getters: {
    getUserAddress: (state) => state.userAddress,
    getUserChainId: (state) => state.userChainId,
  },

  actions: {
    toggleSidebar() {
      this.isSidebarMinimized = !this.isSidebarMinimized
    },

    changeUserName(userName: string) {
      this.userName = userName
    },

    setUserAddress(address: string) {
      this.userAddress = address
    },

    setUserChainId(address: number) {
      this.userChainId = address
    },

    setLoginAdmin(e: any) {
      this.loginAdmin.userId = e.userId
      this.loginAdmin.userToken = e.userToken
      localStorage.setItem('loginAdmin', JSON.stringify(this.loginAdmin))
    },
  },
})
