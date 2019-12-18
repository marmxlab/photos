<template>
  <div class="browse">
    <template v-for="(file, i) in files">
      <file
        :file="file"
        :key="i"
        class="browse__file ma-1"
        @click="onFileClick"
        :secret="siteSecret"
      ></file>
    </template>

    <!-- Carousel Dialog -->
    <v-dialog v-model="showCarouselDialog" fullscreen hide-overlay>
      <v-card>
        <media-carousel
          v-if="showCarouselDialog"
          v-model="carouselIndex"
          :files="mediaFiles"
          :secret="siteSecret"
          @close="showCarouselDialog = false"
        ></media-carousel>
      </v-card>
    </v-dialog>

    <!-- Secret Dialog -->
    <v-dialog v-model="showSecretDialog" persistent max-width="600px">
      <v-card>
        <v-card-title>Authorization</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="siteSecret"
            type="password"
            label="Site Secret"
            filled
            :error-messages="wrongSecret ? 'Incorrect site secret.': ''"
            @keydown="wrongSecret = false"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="proceedWithSecret" :disabled="!siteSecret">Proceed</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
  import {Component, Vue, Watch} from "vue-property-decorator";
  import RestAPI from "../utils/RestAPI";
  import FileEntry from "../models/FileEntry";
  import File from "../components/File.vue";
  import FileUtil from "../utils/File";
  import MediaCarousel from "../components/MediaCarousel.vue";
  @Component({
    components: {MediaCarousel, File }
  })
  export default class Browse extends Vue {
    siteSecret = '';
    wrongSecret = false;
    showSecretDialog = false;
    showCarouselDialog = false;
    files: FileEntry[] = [];
    carouselIndex: number = 0;

    @Watch('$route.query.path')
    onPathChange(path: string) {
      this.files = [];

      this
        .getFileList()
        .catch((e) => {
          console.error(e);
          if (e.response.status === 401) {
            this.showSecretDialog = true;
          }
        })
    }

    created() {
      if (!this.$route.query.path) {
        this.$router.replace({ query: { path: '/' } });
      } else {
        this
          .getFileList()
          .catch((e) => {
            console.error(e);
            if (e.response.status === 401) {
              this.showSecretDialog = true;
            }
          })
      }
    }

    get mediaFiles(): FileEntry[] {
      return this.files.filter((file) => FileUtil.isImageFile(file) || FileUtil.isVideoFile(file));
    }

    getFileList(): Promise<FileEntry[]> {
      const path = (this.$route.query.path as string) || '/';
      return RestAPI
        .getFileList(path)
        .then((response) => {
          response.data.sort((a, b) => {
            if (a.d && !b.d) return -1;
            if (!a.d && b.d) return 1;

            if (a.n > b.n) return 1;
            if (b.n > a.n) return -1;

            return 0;
          });
          this.files = response.data;
          return response.data;
        })
    }

    proceedWithSecret() {
      const { siteSecret } = this;

      RestAPI.setSecret(siteSecret);

      this
        .getFileList()
        .then(() => { this.showSecretDialog = false; })
        .catch((e) => {
          console.error(e);
          this.wrongSecret = true;
        })
    }

    onFileClick(file: FileEntry) {
      if (FileUtil.isImageFile(file) || FileUtil.isVideoFile(file)) {
        this.carouselIndex = this.mediaFiles.indexOf(file);
        this.showCarouselDialog = true;
      } else if (file.d) {
        const { query: { path } } = this.$route;
        const nextPath = path === '/' ? `/${file.n}` : `${path}/${file.n}`;
        this.$router.push({ query: { path: nextPath } });
      }
    }
  }
</script>
<style lang="sass" scoped>
  .browse
    &__file
      float: left
</style>
