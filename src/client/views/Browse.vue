<template>
  <div class="browse">
    <template v-for="(file, i) in files">
      <file
        :file="file"
        :key="i"
        class="browse__file ma-1"
        @click="onFileClick"
      ></file>
    </template>

    <!-- Carousel Dialog -->
    <v-dialog v-model="showCarouselDialog" fullscreen hide-overlay>
      <v-card>
        <v-carousel v-model="carouselIndex" hide-delimiters height="100vh">
          <v-carousel-item
            v-for="(file,i) in imageFiles"
            :key="i"
            :src="getImageSrc(file)"
          >
            <template v-slot:placeholder>
              <v-row
                class="fill-height ma-0"
                align="center"
                justify="center"
              >
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
              </v-row>
            </template>
          </v-carousel-item>
        </v-carousel>

        <v-btn top right large icon text dark absolute @click="showCarouselDialog = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
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
  @Component({
    components: { File }
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
      this
        .getFileList()
        .catch((e) => {
          console.error(e);
        })
    }

    created() {
      this
        .getFileList()
        .catch((e) => {
          console.error(e);
          if (e.response.status === 401) {
            this.showSecretDialog = true;
          }
        })
    }

    get imageFiles(): FileEntry[] {
      return this.files.filter((file) => FileUtil.isImageFile(file));
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
        });
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
      if (FileUtil.isImageFile(file)) {
        this.carouselIndex = this.imageFiles.indexOf(file);
        this.showCarouselDialog = true;
      } else if (file.d) {
        this.$router.push({ query: { path: '/' + file.n } });
      }
    }

    getImageSrc(file: FileEntry): string {
      const { query: { path } } = this.$route;
      const { siteSecret } = this;
      const { n } = file;
      return `/images/${path}/${n}` + (siteSecret ? `?_secret=${siteSecret}` : '');
    }
  }
</script>
<style lang="sass" scoped>
  .browse
    &__file
      float: left
</style>
