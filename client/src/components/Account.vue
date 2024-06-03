<template>
    <v-container>
        <v-btn class="w-100" @click="logout()">Logout</v-btn>
    </v-container>
</template>

<script>
export default {
  methods: {
    async logout() {
      fetch("/api/session", {method: "delete"}).then((response) => {
        if (response.ok) {
            this.$emit("logoutSuccess", false);
        }
      })
    },
  },
};
</script>