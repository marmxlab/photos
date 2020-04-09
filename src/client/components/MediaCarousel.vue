<template>
  <div class="media-carousel">
    <v-carousel v-model="carouselIndex" hide-delimiters height="100vh" class="media-carousel__body">
      <template v-for="(file,i) in files">
        <!-- Image -->
        <v-carousel-item v-if="isImage(file)" :key="i" :src="getSrc(file)" contain>
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

        <!-- Video -->
        <v-carousel-item v-else-if="isVideo(file)" :key="i">
          <video v-if="i === carouselIndex" :src="getSrc(file)" controls width="100%" height="100%"></video>
        </v-carousel-item>
      </template>
    </v-carousel>

    <v-layout align-center class="media-carousel__bar">
      <div class="font-weight-medium">{{ files[carouselIndex].n }}</div>
      <v-spacer></v-spacer>
      <v-btn large dark icon color="black" :href="getSrc(files[carouselIndex])" download>
        <v-icon>mdi-download</v-icon>
      </v-btn>
      <v-btn large dark icon color="black" class="ml-2" @click="$emit('close')">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-layout>
  </div>
</template>
<script lang="ts">
  import {Component, Prop, Vue, Watch} from "vue-property-decorator";
  import FileEntry from "../models/FileEntry";
  import FileUtil from "../utils/File";
  import PathUtils from "../utils/Path";

  @Component
  export default class MediaCarousel extends Vue {
    @Prop(Number) value!: number; // current carousel item index
    @Prop({ type: Array, required: true }) files!: FileEntry[];
    @Prop(String) secret!: string;
    private carouselIndex: number = 0;

    @Watch('value')
    onValueChange(value: number) {
      this.carouselIndex = value;
    }

    @Watch('carouselIndex')
    onIndexChange(carouselIndex: number) {
      this.$emit('input', carouselIndex);
    }

    created() {
      this.carouselIndex = this.value;
    }

    getSrc(file: FileEntry): string {
      const { secret, $route: { query: { path } } } = this;
      const { n } = file;
      const queries = { _secret: secret };
      return PathUtils.buildImageUrl(path as string, n, queries)
    }

    isImage(file: FileEntry): boolean {
      return FileUtil.isImageFile(file);
    }
    isVideo(file: FileEntry): boolean {
      return FileUtil.isVideoFile(file);
    }
  }
</script>
<style lang="sass" scoped>
  .media-carousel
    &__body
      background-color: black
    &__bar
      position: absolute
      left: 0
      right: 0
      top: 0
      padding: 16px
      background-color: rgba(255, 255, 255, .86)
      transition: all 0.3s cubic-bezier(.25,.8,.25,1)
      opacity: 0
      &:hover
        opacity: 1
</style>
