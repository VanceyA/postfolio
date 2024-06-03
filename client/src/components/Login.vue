<template>
  <v-alert title="Login Failed!" text="Invalid username or password." type="error" v-if="loginFailed"></v-alert>
  <v-alert title="Register Failed!" text="Username already exists." type="error" v-if="registerFailed && usernameExists"></v-alert>
  <v-alert title="Register Failed!" text="Unknown error registering user." type="error" v-if="registerFailed && !usernameExists"></v-alert>

  <v-container>
    <v-tabs v-model="tab" centered class="mb-5">
      <v-tab value="login" @click="loginFailed = false; registerFailed = false">Login</v-tab>
      <v-tab value="register" @click="loginFailed = false; registerFailed = false">Register</v-tab>
    </v-tabs>
    <v-window v-model="tab">
      <v-window-item value="login">
        <v-form @submit.prevent="submitLoginForm">
          <v-text-field v-model="loginForm.username" variant="solo-filled" label="Username" :rules="[rules.required]"></v-text-field>
          <v-text-field v-model="loginForm.password" variant="solo-filled" label="Password" type="password" :rules="[rules.required]"></v-text-field>
          <v-btn color="primary" type="submit" class="mt-2">Login</v-btn>
        </v-form>
      </v-window-item>
      <v-window-item value="register">
        <v-form @submit.prevent="submitRegisterForm">
          <v-text-field v-model="registerForm.username" variant="solo-filled" label="Username" :rules="[rules.required]"></v-text-field>
          <v-text-field v-model="registerForm.password" variant="solo-filled" label="Password" type="password" :rules="[rules.required]"></v-text-field>
          <v-text-field v-model="registerForm.confirmPassword" variant="solo-filled" label="Confirm Password" type="password" :rules="[rules.required, confirmPasswordRule]"></v-text-field>
          <v-btn color="primary" type="submit" class="mt-2">Register</v-btn>
        </v-form>
      </v-window-item>
    </v-window>
  </v-container>


  


  
</template>

<script>
export default {
  data() {
    return {
      tab: null,
      loginFailed: false,
      registerFailed: false,
      usernameExists: false,
      loginForm: {
        username: '',
        password: ''
      },
      registerForm: {
        username: '',
        password: '',
        confirmPassword: ''
      },
      rules: {
        required: value => !!value || 'Required.'
      }
    }
  },
  computed: {
    confirmPasswordRule() {
      return value => value === this.registerForm.password || 'Passwords must match.';
    }
  },
  methods: {
    async submitLoginForm() {
      try {
        const data = `username=${this.loginForm.username}&password=${this.loginForm.password}`
        const response = await fetch(`/api/session`, {
          method: 'POST',
          body: data,
          headers:{
            "Content-Type": "application/x-www-form-urlencoded"
          }
        });

        if (response.ok) {
          const newData = await response.json();
          this.loginFailed = false;
          this.registerFailed = false;
          this.usernameExists = false;
          this.$emit('loginSuccess', {
            loggedIn: true, 
            user: newData
          });
        } else {
          console.error('Login failed');
          this.loginFailed = true;
          this.registerFailed = false;
          this.usernameExists = false;
        }
      } catch (error) {
        console.error('Error occurred during login:', error);
      }
    },

    async submitRegisterForm() {
      if (this.registerForm.password !== this.registerForm.confirmPassword) {
        return;
      }
      try {
        const data = `username=${this.registerForm.username}&password=${this.registerForm.password}`
        const response = await fetch(`/api/users`, {
          method: 'POST',
          body: data,
          headers:{
            "Content-Type": "application/x-www-form-urlencoded"
          }
        });

        if (response.ok) {
          const newData = await response.json();
          this.registerFailed = false;
          this.loginFailed = false;
          this.usernameExists = false;
          this.$emit('loginSuccess', {
            loggedIn: true, 
            user: newData
          });
        } else {
          response.json().then((data) => {
            if (response.status === 422 && data.username === "User with that username already exists!") {
              this.usernameExists = true;
            } else {
              this.usernameExists = false;
            }
            console.error('Register failed');
            this.registerFailed = true;
            this.loginFailed = false;

          })
          
        }
      } catch (error) {
        console.error('Error occurred during registration:', error);
      }
    }
  }
};
</script>