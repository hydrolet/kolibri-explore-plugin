<template>
  <b-navbar class="navbar px-0" :class="{ shadow: castShadow }" fixed="top">
    <b-container fluid class="justify-content-start mx-3">
      <slot></slot>
    </b-container>
  </b-navbar>
</template>

<script>
  import _ from 'underscore';

  export default {
    name: 'NavBar',
    props: {
      alwaysCastShadow: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        hasScrolled: false,
      };
    },
    computed: {
      castShadow() {
        return this.alwaysCastShadow || this.hasScrolled;
      },
    },
    created() {
      if (this.alwaysCastShadow) {
        return;
      }
      this.debouncedScroll = _.debounce(this.onScroll, 100);
      window.addEventListener('scroll', this.debouncedScroll);
    },
    destroyed() {
      if (this.alwaysCastShadow) {
        return;
      }
      window.removeEventListener('scroll', this.debouncedScroll);
    },
    methods: {
      onScroll() {
        this.hasScrolled = window.scrollY !== 0;
      },
    },
  }
</script>

<style lang="scss" scoped>

  @import '../styles.scss';

  .navbar {
    height: $navbar-height;
    @include transition($btn-transition);
  }

</style>
