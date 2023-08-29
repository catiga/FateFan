<template>
  <div class="dashboard">Welcome Spirit War Dashboard</div>
</template>

<script setup lang="ts">
  import { ref } from 'vue'
</script>

<style lang="scss">
  .dashboard {
    .va-card {
      margin-bottom: 0 !important;
      &__title {
        display: flex;
        justify-content: space-between;
      }
    }
  }
</style>
