<template>
  <v-layout column class="file" @click="$emit('click', file)">
    <v-flex class="file__preview">
      <v-icon v-if="file.d" size="50">mdi-folder-outline</v-icon>
      <v-img
        v-else-if="isImageFile"
        :src="imageSrc"
        max-width="200"
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
    </v-flex>
    <div class="file__name">{{ file.n }}</div>
  </v-layout>
</template>
<script lang="ts">
  import {Component, Prop, Vue} from "vue-property-decorator";
  import FileEntry from "../models/FileEntry";
  import RestAPI from "../utils/RestAPI";
  import FileUtil from "../utils/File";

  @Component
  export default class File extends Vue {
    @Prop({ type: Object, required: true }) file!: FileEntry;

    get siteSecret(): string {
      return RestAPI.getSecret() || '';
    }

    get isImageFile(): boolean {
      return FileUtil.isImageFile(this.file);
    }

    get imageSrc(): string {
      const { query: { path } } = this.$route;
      const { file: { n }, siteSecret } = this;
      return `/thumbnails${path}/${n}` + (siteSecret ? `?_secret=${siteSecret}` : '');
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
    &:hover
      cursor: pointer
      transform: scale(1.2)
      box-shadow: 0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)
      z-index: 1
    &__preview
      justify-content: center
      align-items: center
      display: flex
    &__name
      text-align: center
      font-size: 13px
      line-height: 20px
      overflow: hidden
      text-overflow: ellipsis
      white-space: nowrap
</style>
