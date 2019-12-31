<template>
  <div class="browse" v-resize="onWindowResize">
    <v-app-bar app color="indigo" dark>
      <v-toolbar-title>Your location: {{ $route.query.path || '/' }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-menu v-if="$vuetify.breakpoint.mdAndUp" left bottom offset-y>
        <template v-slot:activator="{ on }">
          <v-btn icon v-on="on">
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>

        <v-card raised class="browse__menu pa-3">
          <v-slider
            v-model="gridColumns"
            :min="minGridColumns"
            :max="maxGridColumns"
            step="1"
            reverse
            append-icon="mdi-magnify-minus-outline"
            prepend-icon="mdi-magnify-plus-outline"
            hide-details
          />
        </v-card>
      </v-menu>
    </v-app-bar>


    <template v-for="(file, i) in files">
      <file
        :size="displaySize "
        :file="file"
        :key="i"
        class="browse__file ma-1"
        @click="onFileClick"
        :secret="siteSecret"
      />
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
        />
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
            @keydown.enter="proceedWithSecret"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
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

  const MIN_GRID_COLUMNS = 4;
  const MAX_GRID_COLUMNS = 10;
  const GRID_GAP = 8;

  @Component({
    components: {MediaCarousel, File }
  })
  export default class Browse extends Vue {
    windowWidth = 0;
    gridColumns = 6;
    siteSecret = '';
    wrongSecret = false;
    showSecretDialog = false;
    showCarouselDialog = false;
    files: FileEntry[] = [];
    carouselIndex: number = 0;

    @Watch('$route.query.path')
    onPathChange(path: string) {
      this.files = [];
      this.showCarouselDialog = false;
      this.getFileList();
    }

    created() {
      this.windowWidth = window.innerWidth;

      if (!this.$route.query.path) {
        this.$router.replace({ query: { path: '/' } });
      } else {
        this.getFileList();
      }
    }

    get mediaFiles(): FileEntry[] {
      return this.files.filter((file) => FileUtil.isImageFile(file) || FileUtil.isVideoFile(file));
    }

    get minGridColumns(): number {
      return MIN_GRID_COLUMNS;
    }

    get maxGridColumns(): number {
      return MAX_GRID_COLUMNS;
    }

    get displaySize(): number {
      if (this.$vuetify.breakpoint.xsOnly) {
        return this.windowWidth - GRID_GAP;
      } else if (this.$vuetify.breakpoint.smOnly) {
        return (this.windowWidth - GRID_GAP * 2) / 2;
      }
      return (this.windowWidth - this.gridColumns * GRID_GAP) / this.gridColumns;
    }

    proceedWithSecret() {
      const {siteSecret} = this;
      if (siteSecret) {
        RestAPI.setSecret(siteSecret);
        this.getFileList();
      }
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

    onWindowResize() {
      this.windowWidth = window.innerWidth;
    }

    getFileList() {
      const path = (this.$route.query.path as string) || '/';
      RestAPI
        .getFileList(path)
        .then((response) => {
          this.showSecretDialog = false;
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
        .catch((e) => {
          console.error(e);
          if (e.response.status === 401) {
            this.showSecretDialog = true;

            if (this.siteSecret) {
              this.wrongSecret = true;
            }
          }
        })
    }
  }
</script>
<style lang="sass" scoped>
  .browse
    &__menu
      width: 500px
    &__file
      float: left
</style>
