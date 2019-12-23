<template>
  <v-layout column class="file" :class="{ 'file__disabled': isOtherFile }" @click="$emit('click', file)">
    <v-flex class="file__preview">
      <v-icon v-if="file.d" size="50">mdi-folder-outline</v-icon>
      <v-img
        ref="img"
        v-else-if="isImageFile || isVideoFile"
        :src="imageSrc"
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
      <div v-if="isVideoFile" class="file__video-icon">
        <v-icon size="50" dark>mdi-play-outline</v-icon>
      </div>
    </v-flex>
    <div class="file__name">{{ file.n }}</div>
  </v-layout>
</template>
<script lang="ts">
  import {Component, Prop, Vue} from "vue-property-decorator";
  import FileEntry from "../models/FileEntry";
  import FileUtil from "../utils/File";

  @Component
  export default class File extends Vue {
    @Prop({ type: Object, required: true }) file!: FileEntry;
    @Prop(String) secret!: string;

    get isDirectory(): boolean {
      return this.file.d;
    }

    get isImageFile(): boolean {
      return FileUtil.isImageFile(this.file);
    }

    get isVideoFile(): boolean {
      return FileUtil.isVideoFile(this.file);
    }

    get isOtherFile(): boolean {
      return !this.isDirectory && !this.isImageFile && !this.isVideoFile;
    }

    get imageSrc(): string {
      const { query: { path } } = this.$route;
      const { file: { n: filename }, secret } = this;
      const filePath = (path === '/' ? '' : (path as string).substr(1) + '/') + filename + '.jpeg';
      return '/thumbnails/' + filePath + (secret ? `?_secret=${secret}` : '');
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
    width: 200px
    height: 220px
    background-color: white
    transition: all 0.3s cubic-bezier(.25,.8,.25,1)
    border-radius: 4px
    overflow: hidden
    &:not(&__disabled):hover
      cursor: pointer
      transform: scale(1.2)
      box-shadow: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)
      z-index: 1
    &__preview
      justify-content: center
      align-items: center
      display: flex
      position: relative
      height: 200px
    &__video-icon
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
    &__disabled
      cursor: not-allowed
</style>
