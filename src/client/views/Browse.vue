<template>
  <div class="browse" v-resize="onWindowResize">
    <v-app-bar app color="indigo" dark>
      <v-toolbar-title>Your location: {{ $route.query.path || '/' }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-menu v-model="menuShown" left bottom offset-y :close-on-content-click="false">
        <template v-slot:activator="{ on }">
          <v-btn icon v-on="on">
            <v-icon>mdi-dots-vertical</v-icon>
          </v-btn>
        </template>

        <v-list raised class="browse__menu pa-3">

          <v-list-item @click="regenerateThumbnails">
            <v-list-item-content>
              <v-list-item-title>Regenerate thumbnails</v-list-item-title>
            </v-list-item-content>
            <v-list-item-action>
              <v-progress-circular
                v-if="regenStatus === 1"
                indeterminate
                color="primary"
              ></v-progress-circular>
              <v-tooltip bottom v-if="regenStatus === 2">
                <template v-slot:activator="{ on }">
                  <v-icon color="red" dark v-on="on">mdi-alert-circle-outline</v-icon>
                </template>
                <span>{{ regenError }}</span>
              </v-tooltip>
            </v-list-item-action>
          </v-list-item>

          <v-list-item v-if="$vuetify.breakpoint.mdAndUp">
            <v-list-item-content>
              <v-list-item-title>Icon size</v-list-item-title>
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
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>


    <template v-for="(file, i) in files">
      <file
        :size="displaySize"
        :file="file"
        :key="i"
        class="browse__file ma-1"
        @click="onFileClick"
        :secret="siteSecret"
        :ts="lastRefreshTs"
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
  import {AxiosError} from "axios";

  const MIN_GRID_COLUMNS = 4;
  const MAX_GRID_COLUMNS = 10;
  const GRID_GAP = 8;

  @Component({
    components: {MediaCarousel, File }
  })
  export default class Browse extends Vue {
    lastRefreshTs = 0;
    windowWidth = 0;
    gridColumns = 6;
    siteSecret = '';
    wrongSecret = false;
    showSecretDialog = false;
    showCarouselDialog = false;
    files: FileEntry[] = [];
    carouselIndex = 0;
    regenStatus = 0; // 0: pending; 1: loading; 2: failed
    regenError = '';
    menuShown = false;

    @Watch('$route.query.path')
    onPathChange(path: string) {
      this.files = [];
      this.showCarouselDialog = false;
      this.getFileList();
    }

    @Watch('menuShown')
    onMenuShownChange(menuShown: boolean) {
      if (!menuShown) {
        // reset thumbnail regeneration status
        this.regenStatus = 0;
        this.regenError = '';
      }
    }

    created() {
      this.windowWidth = document.body.clientWidth;

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
      } else {
        const { siteSecret } = this;
        const { query: { path } } = this.$route;
        const { n: filename } = file;
        const { origin, pathname } = window.location;
        const baseUrl = `${origin}${pathname === '/' ? '' : pathname}`;
        const url = `${baseUrl}/images${path === '/' ? '' : path}/${filename}?_secret=${encodeURIComponent(siteSecret)}`;
        window.open(url);
      }
    }

    onWindowResize() {
      this.windowWidth = document.body.clientWidth;
    }

    regenerateThumbnails() {
      const path = (this.$route.query.path as string) || '/';
      this.regenStatus = 1;
      RestAPI
        .regenerateThumbnails(path)
        .then(() => {
          this.regenStatus = 0;
          this.files = [];
          this.$nextTick(() => {
            this.getFileList();
          })
        })
        .catch((e: AxiosError) => {
          if (e.response) {
            this.regenError = e.response.data;
            this.regenStatus = 2;
          }
        })
    }

    getFileList() {
      const path = (this.$route.query.path as string) || '/';
      this.lastRefreshTs = Date.now();
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
