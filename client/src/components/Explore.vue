<template>
  <v-infinite-scroll @load="loadMorePosts" class="d-flex">
    <template v-for="post in posts">
      <v-card
          class="mx-auto mt-6 rounded-xl"
          width="800"
          
          :post="post"
        >
          <v-card-item>
            <div>
              <div class="d-flex justify-space-between pl-1 pr-1 pt-1">
                <div class="d-flex flex-column">
                  <div class="text-title text-h6">
                    {{ post.author_username }}
                  </div>
                  <div class="text-subtitle-2 font-weight-light mb-4">
                    {{ new Date(post.createdAt) > new Date() ?
                      (new Date(post.createdAt).toLocaleString().split(', ')[1]) :
                      (new Date() - new Date(post.createdAt) < 3600000 ?
                        Math.floor((new Date() - new Date(post.createdAt)) / (1000 * 60)) + ' minutes ago' :
                        (new Date() - new Date(post.createdAt) < 7200000 ?
                          '1 hour ago' :
                          (new Date() - new Date(post.createdAt) < 86400000 ?
                            Math.floor((new Date() - new Date(post.createdAt)) / (1000 * 60 * 60)) + ' hours ago' :
                            (Math.floor((new Date() - new Date(post.createdAt)) / (1000 * 60 * 60 * 24)) == 1 ?
                              '1 day ago' :
                              Math.floor((new Date() - new Date(post.createdAt)) / (1000 * 60 * 60 * 24)) + ' days ago'))))
                    }}
                  </div>
                </div>
                <div v-if="post.author === currentUser._id">
                  <v-btn
                    icon
                    flat
                    plain
                    class="bg-transparent"
                    :ripple="false"
                  >
                    <v-icon
                      icon="mdi-dots-vertical"
                    >
                    </v-icon>
                    <v-menu
                      activator="parent"
                      location="bottom end"
                      transition="fade-transition"
                    >
                      <v-list>
                        <v-list-item>
                          <v-btn
                            prepend-icon="mdi-delete"
                            flat
                            class="bg-transparent text-subtitle-2 font-weight-light"
                            :ripple="false"
                          >
                          Delete
                          <v-dialog
                            v-model="confirmDelete"
                            activator="parent"
                            width="auto"
                          >
                            <v-card>
                              <div class="d-flex justify-space-around flex-column pa-5">
                                <div class="text-title text-h6 mb-8">Are you sure you want to delete this post?</div>
                                <div class="d-flex justify-space-evenly flex-row">
                                  <v-btn @click="confirmDelete = false" flat class="bg-grey-darken-1 text-white w-25 rounded-pill">Cancel</v-btn>
                                  <v-btn @click="handleDeletePost(post)" flat class="bg-red-darken-1 text-white w-25 rounded-pill">Delete</v-btn>
                                </div>
                              </div>
                            </v-card>
                          </v-dialog>
                          </v-btn>
                        </v-list-item>
                      </v-list>
                      
                    </v-menu>
                  </v-btn>
                </div>
              </div>
              <v-img
               :src=post.image_url
               max-width="900px"
               max-height="460px"
              />
              <div class="d-flex justify-space-between align-center">
                <div class="bg-white rounded-pill mt-3 d-flex align-center" style="height: 40px; width: 680px;">
                  <a :href="`https://${post.website_url}`" target="_blank" class="pl-5" style="color: black;">{{ post.website_url }}</a>
                </div>
                <v-btn
                  icon="mdi-heart"
                  flat
                  class="bg-transparent mt-3 mr-1"
                  @click="handleLikeButton(post)"
                  :ripple="false"
                >
                  <v-icon
                    size="x-large"
                    :color="post.likedBy.includes(currentUser._id) ? 'red' : 'white'"
                    icon="mdi-heart"
                  ></v-icon>
                </v-btn>
              </div>
              
              <div class="d-flex justify-space-between align-center">
                <div class="" style="width: 680px;">
                  <p class="pl-5">{{ post.description }}</p>
                </div>
                <div class="d-flex justify-center" style="width: 48px; height: 48px;">
                  <p class="pr-2">{{ post.likes }}</p>
                </div>
              </div>
            </div>
          </v-card-item>
        </v-card>
    </template>
  </v-infinite-scroll>
</template>

<script>
import { defineComponent, ref, watch } from 'vue';
export default {
  props: {
    resetPosts: Boolean,
    currentUser: Object
  },
  setup(props) {
    const posts = ref([]);
    watch(() => props.resetPosts, (shouldReset) => {
      if (shouldReset) {
        posts.value = [];
        
      }
    });

    return {
      posts,
      empty: ref(false),
      confirmDelete: ref(false)
    };
  },
  methods: {
    async loadMorePosts({done}) {
      if (this.empty) {
        done('empty');
        return;
      }

      try {
        const nextPage = Math.ceil(this.posts.length / 3) + 1;
        const response = await fetch(`/api/explore?page=${nextPage}`);
        if(!response.ok) {
          throw new Error(`HTTP Error! Status: ${response.status}`);
        }
        const newData = await response.json();
        if(newData.length == 0) {
          this.empty = true;
        }

        this.posts = [...this.posts, ...newData];
      } catch (error) {
        console.error(error);
      } finally {
        done('ok');
      }
    },
    async handleLikeButton(post) {
      try {

        fetch(`/api/posts/${post._id}`, {
          method: "put"
        }).then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP Error! Status: ${response.status}`);
          }
          response.json().then((newData) => {
            const postIndex = this.posts.indexOf(post);
            this.posts[postIndex] = newData;
          });
        
        });
        
      } catch(err) {
        console.log(err);
      }
    },
    async handleDeletePost(post) {
      try {

        fetch(`/api/posts/${post._id}`, {
          method: "delete"
        }).then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP Error! Status: ${response.status}`);
          }
          const postIndex = this.posts.indexOf(post);
          this.posts.splice(postIndex, 1);
          this.confirmDelete = false;

        });

        } catch(err) {
        console.log(err);
        }    
    },
  }
};
</script>

<style>

</style>
