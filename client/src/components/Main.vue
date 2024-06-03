<template>
  <v-layout class="rounded rounded-md">

    <v-navigation-drawer app style="position: fixed" order="-1">
      <div class="d-flex flex-column justify-start h-100">
        
        <v-list dense>
          <div class="w-100 d-flex justify-start mb-4 ml-4 mt-2">
            <v-img
              src="../assets/logo-white.png"
              width="50"
              height="50"
            />
            <v-spacer></v-spacer>
          </div>

          <v-list-item link @click="handleNavItemClick('Home')" :active="isActive('Home')">
            <v-list-item-title><v-icon size="x-large" class="mr-3">mdi-home</v-icon>Home</v-list-item-title>
          </v-list-item>

          <v-list-item link @click="handleNavItemClick('Explore')" :active="isActive('Explore')">
            <v-list-item-title><v-icon size="x-large" class="mr-3">mdi-compass</v-icon>Explore</v-list-item-title>
          </v-list-item>

          <v-list-item link>
            <v-list-item-title>
              <v-icon size="x-large" class="mr-3">mdi-plus</v-icon>
              Add Post
            </v-list-item-title>
            <v-dialog v-if="loggedIn" v-model="addPostDialog" activator="parent" width="1200">
              <v-card class="bg-black d-flex flex-row" style="height: 700px;">
                <v-btn
                  flat
                  class="bg-transparent mt-3 ml-3"
                  v-if="image"
                >
                  <v-icon
                    size="x-large"
                    icon="mdi-delete"
                    :ripple="false"
                    @click="this.image = null; this.imageBgColor = 'blue-darken-1';"
                  ></v-icon>
                </v-btn>
                
                <div class="bg-transparent d-flex flex-column justify-center align-center" style="width:60%">
                  <v-file-input
                    v-if="!image"
                    v-model="image"
                    prepend-icon=""
                    prepend-inner-icon="mdi-cloud-upload"
                    rounded
                    :bg-color=imageBgColor
                    variant="solo-filled"
                    label="Select image"
                    accept="image/*"
                    style="width: 500px;"
                    :rules="imageRules"
                    class="form-input"
                  ></v-file-input>
                  <v-img v-if="image" :src="imagePreview" aspect-ratio="1"></v-img>
                  
                </div>

                <div class="d-flex flex-column bg-grey-darken-2 rounded-s-xl" style="width:40%; padding:16px;">
                    <!-- Website Link Section -->
                    <v-text-field v-model="uploadWebsite" :rules="urlRules" variant="solo-filled" class="mt-2" bg-color="gray" label="Website Link"></v-text-field>
            
                    <!-- Description Section -->
                    <v-textarea v-model="uploadDescription" no-resize variant="solo-filled" bg-color="gray" class="h-100" counter maxLength="200" label="Description"></v-textarea>

                  <div class="d-flex flex-row justify-space-around">
                      <v-btn @click="addPostDialog = false" flat class="bg-grey-darken-1 text-white w-25 rounded-pill">Cancel</v-btn>
                      <v-btn @click="handleUpload" flat class="bg-blue-darken-1 w-25 rounded-pill" color="white">Post</v-btn>
                  </div>
                </div>
                
                
                
                
              </v-card>
            </v-dialog>
          </v-list-item>

          <v-list-item v-if="loggedIn" class="fixedBottom mb-2" link @click="handleNavItemClick('Account')">
            <v-list-item-title><v-icon size="x-large" class="mr-3">mdi-account</v-icon>{{ currentUser.username }}</v-list-item-title>
          </v-list-item>


        </v-list>
    </div>
    
    </v-navigation-drawer>

    

    <v-main class="d-flex align-center justify-center" style="min-height: 300px;">
      <div v-if="!loggedIn">
        <Login @loginSuccess="onSuccess"/>
      </div>
      <div v-else>
        <Feed v-if="isActive('Home')" :resetPosts="resetPosts" :currentUser="currentUser" />
        <Explore v-if="isActive('Explore')" :resetPosts="resetPosts" :currentUser="currentUser" />
        <Account v-if="isActive('Account')" @logoutSuccess="onLogoutSuccess"/>
      </div>
    </v-main>
  </v-layout>
</template>
<script>
import Feed from "./Feed.vue";
export default {
  components: { Feed },
  data() {
    return {
      loggedIn: false,
      resetPosts: false,
      addPostDialog: false,
      currentUser: {},
      image: null,
      uploadWebsite: '',
      uploadDescription: '',
      selectedNavItem: 'Home',
      firstImageValidation: false,
      imageBgColor: "blue-darken-1",
      imageRules: [
        (value) => {
          if (!value && this.firstImageValidation) {
            this.imageBgColor = "red-darken-4";
            return "Image is required.";
          } else if (!this.firstImageValidation) {
            this.firstImageValidation = true;
          }
          return true;
        }
      ],
      urlRules: [
        (value) => {
          if (!value) {
            return "Website URL is required.";
          }
          if (!this.isValidUrl(value)) {
            return "Please enter a valid URL.";
          }
          return true;
        }
      ]
    };
  },
  created() {
    fetch("/api/session").then((response) => {
      if (response.ok) {
        response.json().then((data) => {
          this.loggedIn = true;
          this.currentUser = data;
        })
      }
    })
  },
  computed: {
      imagePreview() {
        if(!this.image) return;
        return URL.createObjectURL(this.image[0]);
      }
    },
  methods: {
    isActive(title) {
      return this.selectedNavItem == title;
    },
    handleNavItemClick(title) {
      this.selectedNavItem = title;
    },
    onSuccess({ loggedIn, user }) {
      this.loggedIn = loggedIn;
      this.currentUser = user;
    },
    onLogoutSuccess(loggedIn) {
      this.loggedIn = loggedIn;
      this.selectedNavItem = "Home";
    },
    async handleUpload() {
      if (this.image[0] && this.isValidUrl(this.uploadWebsite)) {
        const blob = this.image[0];
        const formData = new FormData;
        formData.append("website_url", this.uploadWebsite);
        formData.append("description", this.uploadDescription);
        formData.append("image", blob);

        fetch("/api/posts", {
          body: formData,
          method: "post"
        })
        .then((res) => {
          if(res.status === 201) {
            this.uploadWebsite = "";
            this.uploadDescription = "";
            this.image = null;
            this.addPostDialog = false;
            this.resetPosts = true;
            this.imageBgColor = "blue-darken-1";
            setTimeout(() => {this.resetPosts = false;}, 500);
          }
        })
        .catch((err) => {
          console.error(err.response);
        })

      }
    },
    isValidUrl(string) {
      try {
        let website = string.replace(/^https?:\/\//, '');
        website = `https://${website}`;
        new URL(website);
        return true;
      } catch (err) {
        return false;
      }
    }
  },
};
</script>

<style>

.fixedBottom {
  position: fixed !important;
  bottom: 0 !important;
}

.v-textarea .v-field {
  border-radius: 20px;
}

.v-text-field .v-field {
  border-radius: 20px;
}

.bg-transparent.d-flex.flex-column.justify-center.align-center .v-input.v-input--horizontal.v-input--center-affix.v-input--density-default.v-locale--is-ltr.v-file-input {
  flex: 0;
}
.bg-transparent.d-flex.flex-column.justify-center.align-center .v-responsive.v-img.v-img--booting {
  width: 550px;
}

.v-input.v-input--horizontal.v-input--density-default.v-locale--is-ltr.v-textarea.v-text-field.v-textarea--no-resize.h-100 .v-input__control {
  height: 500px;
}

</style>