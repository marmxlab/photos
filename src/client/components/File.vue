<template>
  <v-layout column class="file" @click="$emit('click', file)">
    <v-flex class="file__preview">
      <v-icon v-if="file.d" size="50">mdi-folder-outline</v-icon>
      <v-img
        v-else-if="isImageFile"
        :src="`/thumbnails/${file.n}?_secret=${siteSecret}`"
        max-width="200"
      ></v-img>
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
  }
</script>
<style lang="sass" scoped>
  .file
    width: 200px
    height: 220px
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
