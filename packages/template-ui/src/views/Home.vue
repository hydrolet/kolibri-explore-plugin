<template>
  <div
    :style="{ backgroundImage: backgroundImageURL }"
  >
    <slot></slot>
    <SectionsSearchRow v-if="hasSectionsSearch" />

    <template v-if="loading">
      <CarouselPlaceholder v-if="hasCarousel" />
      <CardGridPlaceholder />
    </template>

    <template v-else>
      <Carousel v-if="hasCarousel" :nodes="carouselNodes" />
      <b-container v-if="hasCarousel">
        <hr>
      </b-container>
      <FilterContent v-if="hasFilters" />

      <div v-if="isFilterEmpty">
        <b-container v-if="contentNodes.length && displayHeroContent">
          <CarouselCard
            v-for="node in contentNodes"
            :key="'node-' + node.id"
            :node="node"
            class="template-ui-hero-card"
            @click="goToContent(node)"
          />
        </b-container>
        <div v-else-if="contentNodes.length">
          <CardGrid
            :nodes="contentNodes"
            :variant="hasFlatGrid ? 'collapsible' : 'slidable'"
            :mediaQuality="mediaQuality"
            :cardColumns="cardColumns"
          />
        </div>
        <div
          v-for="section in mainSections"
          :key="section.id"
        >
          <CardGrid
            :id="section.id"
            :nodes="sectionNodes[section.id]"
            :mediaQuality="mediaQuality"
            :cardColumns="cardColumns"
          >
            <b-row>
              <SectionTitle :section="section" />
            </b-row>
          </CardGrid>
        </div>
      </div>

      <div v-else>
        <FilterResult :node="section" />
      </div>

    </template>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import _ from 'underscore';
import { goToContent } from 'kolibri-api';

export default {
  name: 'Home',
  data() {
    return {
      contentNodes: [],
      mainSections: [],
      sectionNodes: {},
      loading: true,
    };
  },
  computed: {
    ...mapState([
      'nodes',
      'carouselNodeIds',
      'carouselSlideNumber',
      'section',
      // 'loading',
      'cardColumns',
      'mediaQuality',
      'hasSectionsSearch',
      'hasCarousel',
      'hasFilters',
      'hasFlatGrid',
      'displayHeroContent',
    ]),
    ...mapGetters({
      // mainSections: 'mainSections',
      getAssetURL: 'getAssetURL',
      isFilterEmpty: 'filters/isEmpty',
    }),
    backgroundImageURL() {
      return this.getAssetURL('homeBackgroundImage');
    },
      carouselNodes() {
      if (this.carouselNodeIds.length) {
        return this.carouselNodesFixed(this.carouselNodeIds);
      }

      return this.carouselNodesRandom(this.carouselSlideNumber);
    },
  },
  mounted() {
    return this.fetchNodes();
  },
  methods: {
    fetchNodes() {
      window.kolibri.themeRenderer({
          appBarColor: null,
          textColor: null,
          backdropColor: null,
          backgroundColor: null,
      });
      console.log(window.kolibri.version);

      return window.kolibri.getContentByFilter({ parent: 'self' })
        .then((page) => {
          console.log(page);
          this.contentNodes = page.results.filter((n) => n.kind !== 'topic');
          this.mainSections = page.results.filter((n) => n.kind === 'topic');
          Promise.all(this.mainSections.map((section) => {
            return this.fetchSectionNodes(section.id);
          })).then(() => {
            this.loading = false;
          });
        });
    },
    fetchSectionNodes(nodeId) {
      return window.kolibri.getContentByFilter({ parent: nodeId })
        .then((page) => {
          console.log(page);
          this.sectionNodes[nodeId] = page.results;
        });
    },
    carouselNodesRandom(n) {
      // Get n random nodes that are not topic:
      const possibleNodes = this.nodes.filter((node) => node.kind !== 'topic');
      return _.sample(possibleNodes, n);
    },
    carouselNodesFixed(nodeIds) {
      return nodeIds.map((n) => (
        this.nodes.find((m) => m.id === n.id)
      ));
    },
    goToContent,
  },
};
</script>

<style lang="scss" scoped>
@import '../styles.scss';

::v-deep .template-ui-hero-card {
  cursor: pointer;
  margin-bottom: 2rem;

  .subtitle {
    display: none;
  }
}

</style>
