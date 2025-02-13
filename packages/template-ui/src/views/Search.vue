<template>
  <div
    class="root"
    :style="{ backgroundImage: backgroundImageURL }"
  >
    <ChannelNavBar />
    <SearchBar
      v-model="query"
      @clear-input="onClearInput"
    />

    <EmptyResultsMessage v-if="notFound" :showTopics="false">
      <h1 class="text-secondary">
        Sorry, we can’t find any content that matches your search.
      </h1>
      <h5 class="text-muted">
        You can try a different search, maybe use fewer words, or try one
        of the topic suggestions below.
      </h5>
    </EmptyResultsMessage>

    <CardGrid
      v-if="!resultNodes.length"
      :nodes="mainSections"
      :mediaQuality="mediaQuality"
      :cardColumns="cardColumns"
    >
      <b-row>
        <b-container>
          <h4 class="explore-title text-dark text-truncate w-75">
            Explore topics
          </h4>
        </b-container>
      </b-row>
    </CardGrid>
    <CardGrid
      v-else
      :nodes="resultNodes"
      :mediaQuality="mediaQuality"
      :cardColumns="cardColumns"
      variant="collapsible"
    >
      <div class="font-weight-bold my-4 text-muted">
        {{ totalResults }} Results
        <Keywords :words="keywords" @click="removeKeyword" />
      </div>
    </CardGrid>

  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

// Escapes the RegExp special characters in string.
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export default {
  name: 'Search',
  data() {
    return {
      query: '',
      resultNodes: [],
      page: null,
      searching: false,
    };
  },
  computed: {
    ...mapGetters(['getAssetURL']),
    ...mapState(['mainSections', 'cardColumns', 'mediaQuality', 'searchQuery']),
    backgroundImageURL() {
      return this.getAssetURL('homeBackgroundImage');
    },
    notFound() {
      return !this.searching && !this.resultNodes.length && this.cleanedQuery !== '';
    },
    cleanedQuery() {
      return escapeRegExp(this.query.trim());
    },
    keywords() {
      return this.cleanedQuery.split(/\s+/);
    },
    totalResults() {
      // We have the real total results in the backend in this.page.total_results,
      // but the search doesn't have pagination, so it shows 30 nodes at max,
      // So for the UX it's better to show just the number of nodes returned by
      // the search API because it's not possible to show the rest.
      return this.resultNodes.length;
    },
  },
  watch: {
    cleanedQuery() {
      this.$store.commit('setSearchQuery', this.cleanedQuery);
      if (this.cleanedQuery === '') {
        this.searching = false;
        this.resultNodes = [];
        this.page = null;
        return;
      }
      this.searching = true;
      this.search();
    },
    searchQuery() {
      this.query = this.searchQuery;
    },
  },
  methods: {
    search() {
      return window.kolibri.searchContent({ keyword: this.cleanedQuery })
        .then((page) => {
          this.page = page;
          this.resultNodes = page.results;
          this.searching = false;
        });
    },
    onClearInput() {
      this.query = '';
    },
    removeKeyword(keyword) {
      const words = this.keywords.filter((k) => k !== keyword);
      this.query = words.join(' ');
    },
  },
};
</script>

<style lang="scss" scoped>
@import '@/styles.scss';

.root {
  margin-top: $navbar-height;
}

.explore-title {
  margin-top: $big-spacer !important;
}

</style>
