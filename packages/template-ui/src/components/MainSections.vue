<template>
  <b-button-toolbar keyNav aria-label="Sections">
    <b-button-group
      v-for="section in mainSections"
      :key="'menu-' + section.id"
      size="sm"
      class="mx-1 my-1"
    >
      <b-button
        pill
        size="sm"
        variant="primary"
        :to="getNodeUrl(section)"
      >
        {{ section.title }}
      </b-button>
    </b-button-group>
    <slot>
    </slot>
  </b-button-toolbar>
</template>

<script>
import { mapState } from 'vuex';
import { utils } from 'eos-components';

export default {
  name: 'MainSections',
  computed: {
    ...mapState(['mainSections', 'channel']),
  },
  methods: {
    getNodeUrl(node) {
      return utils.getNodeUrl(node, this.channel.id);
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles.scss';
</style>
