<template>
  <v-layout column class="file" @click="$emit('click', file)" :style="{'width': size + 'px'}">
    <v-flex class="file__preview" :style="previewStyle">
      <v-icon v-if="isDirectory" size="50">mdi-folder-outline</v-icon>
      <v-img
        ref="img"
        v-else-if="isPreviewable"
        :src="thumbnailSrc"
        @error="onImageError"
        height="100%"
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
      </v-img>
      <v-icon v-else size="50">mdi-file-outline</v-icon>
      <div v-if="isVideoFile" class="file__icon">
        <v-icon size="50" dark>mdi-play-outline</v-icon>
      </div>
      <div v-if="canOnlyBeDownloaded" class="file__tag">
        <v-icon size="15" class="mr-1" dark>mdi-download</v-icon>
        Direct download
      </div>
    </v-flex>
    <div class="file__name">{{ file.n }}</div>
  </v-layout>
</template>
<script lang="ts">
  import {Component, Prop, Vue} from "vue-property-decorator";
  import FileEntry from "../models/FileEntry";
  import FileUtil from "../utils/File";
  import PathUtils from "../utils/Path";

  @Component
  export default class File extends Vue {
    @Prop({ type: [String, Number], default: '200' }) size!: string;
    @Prop({ type: Object, required: true }) file!: FileEntry;
    @Prop(String) secret!: string;
    @Prop(Number) ts!: number;

    get isDirectory(): boolean {
      return this.file.d;
    }

    get isImageFile(): boolean {
      return FileUtil.isImageFile(this.file);
    }

    get isVideoFile(): boolean {
      return FileUtil.isVideoFile(this.file);
    }

    get isPreviewable(): boolean {
      return this.isImageFile || this.isVideoFile || FileUtil.isHEICFile(this.file)
    }

    get canOnlyBeDownloaded(): boolean {
      return !this.isImageFile && !this.isVideoFile && !this.isDirectory;
    }

    get thumbnailSrc(): string {
      const { query: { path } } = this.$route;
      const { file: { n }, secret, ts } = this;
      const filename = `${n}.jpg`;
      const queries = { _secret: secret, ts: ts.toString() };
      return PathUtils.buildThumbnailUrl(path as string, filename, queries)
    }

    get previewStyle() {
      const { size } = this;
      return {
        width: `${size}px`,
        height: `${size}px`,
      };
    }

    onImageError() {
      const MIN_TIMEOUT = 3000;
      const MAX_TIMEOUT = 5000;
      const randomTimeout =  Math.floor(Math.random() * (MAX_TIMEOUT - MIN_TIMEOUT)) + MIN_TIMEOUT;
      setTimeout(() => {
        (this.$refs.img as any).loadImage();
      }, randomTimeout)
    }
  }
</script>
<style lang="sass" scoped>
  .file
    position: relative
    background-color: white
    transition: transform 0.3s cubic-bezier(.25,.8,.25,1)
    border-radius: 4px
    overflow: hidden
    &:not(&__disabled):hover
      cursor: pointer
      transform: scale(1.2)
      box-shadow: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)
      z-index: 1
    &__preview
      overflow: hidden
      justify-content: center
      align-items: center
      display: flex
      position: relative
    &__icon
      position: absolute
      top: 50%
      left: 50%
      transform: translateX(-50%) translateY(-50%)
    &__name
      text-align: center
      font-size: 13px
      line-height: 20px
      overflow: hidden
      text-overflow: ellipsis
      white-space: nowrap
      padding: 0 4px
    &__tag
      position: absolute
      right: 0
      top: 0
      color: white
      background-color: #37474F
      text-transform: uppercase
      font-size: 10px
      padding: 4px 8px

</style>
