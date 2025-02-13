<template>

  <div>
    <BackToTop />
    <keep-alive>
      <div>
        <GradeSelectionModal
          :visible="gradeModalVisible"
          :error="installError"
          @gradeSelected="gradeSelected"
        />
        <CollectionSelectionModal
          :visible="collectionModalVisible"
          :grade="grade"
          :collections="gradeCollections"
          @downloadCollection="downloadCollection"
          @goBack="visibleModal = 'grade'"
        />
        <InstallContentModal
          :visible="contentModalVisible"
          :collection="downloadingCollection"
          :grade="grade"
          @showModal="visibleModal = 'content'"
          @hide="installContentHide"
          @newContent="reloadChannels"
        />
      </div>
    </keep-alive>
    <ContentModal />
    <AboutModal id="about-modal" />
    <DevTag v-if="showBuildInfo" />
    <keep-alive include="SearchPage">
      <component
        :is="currentPage"
        v-if="currentPage"
        @loading="onLoading"
        @load="onLoad"
      />
    </keep-alive>
    <b-overlay :show="isLoading" noWrap>
      <template #overlay>
        <img :src="loadingImg">
      </template>
    </b-overlay>
    <router-view />
  </div>

</template>


<script>

  import { mapState } from 'vuex';
  import commonCoreStrings from 'kolibri.coreVue.mixins.commonCoreStrings';
  import LoadingImage from 'eos-components/src/assets/loading-animation.gif';
  import responsiveWindowMixin from 'kolibri.coreVue.mixins.responsiveWindowMixin';
  import { ChannelResource, ContentNodeResource } from 'kolibri.resources';
  import axios from 'axios';
  import { constants } from 'eos-components';
  import { showChannels } from '../modules/topicsRoot/handlers';
  import { PageNames } from '../constants';
  import AboutModal from '../components/AboutModal';
  import commonExploreStrings from './commonExploreStrings';
  import DiscoveryPage from './DiscoveryPage';
  import CustomChannelPresentationApp from './CustomChannelPresentationApp';
  import ContentUnavailablePage from './ContentUnavailablePage';
  import SearchPage from './SearchPage';
  import ContentPage from './ContentPage';
  import DevTag from './DevTag';
  import ContentModal from './ContentModal';

  const pageNameToComponentMap = {
    [PageNames.TOPICS_ROOT]: DiscoveryPage,
    [PageNames.TOPICS_CHANNEL]: CustomChannelPresentationApp,
    [PageNames.TOPICS_TOPIC]: CustomChannelPresentationApp,
    [PageNames.CONTENT_UNAVAILABLE]: ContentUnavailablePage,
    [PageNames.SEARCH]: SearchPage,
    [PageNames.CONTENT]: ContentPage,
  };

  export default {
    name: 'ExploreIndex',
    components: {
      AboutModal,
      ContentModal,
      DevTag,
    },
    mixins: [commonCoreStrings, commonExploreStrings, responsiveWindowMixin],
    data() {
      return {
        lastRoute: null,
        isLoading: false,
        visibleModal: 'none',
        downloadingCollection: null,
        collections: {},
        grade: 'intermediate',
        installError: '',
      };
    },
    computed: {
      ...mapState(['noContent', 'pageName']),
      gradeCollections() {
        return Object.values(this.collections[this.grade] || {});
      },
      currentPage() {
        return pageNameToComponentMap[this.pageName] || null;
      },
      showBuildInfo() {
        return window.showBuildInfo;
      },
      loadingImg() {
        return LoadingImage;
      },
      contentModalVisible() {
        return this.visibleModal === 'content';
      },
      collectionModalVisible() {
        return this.visibleModal === 'collection';
      },
      gradeModalVisible() {
        return this.visibleModal === 'grade';
      },
    },
    watch: {
      noContent() {
        if (this.noContent) {
          this.visibleModal = 'grade';
        }
      },
      $route: function(newRoute, oldRoute) {
        // Return if the user is leaving or entering the Search page.
        // This ensures we never set this.lastRoute to be any kind of
        // SEARCH route and avoids infinite loops.
        if (newRoute.name === 'SEARCH' || oldRoute.name === 'SEARCH') {
          return;
        }

        // Destructure the oldRoute into an object with 3 specific properties.
        // Setting this.lastRoute = oldRoute causes issues for some reason.
        this.lastRoute = {
          name: oldRoute.name,
          query: oldRoute.query,
          params: oldRoute.params,
        };
      },
    },
    mounted() {
      axios.get(constants.ApiURL).then(({ data }) => {
        if (data.collections) {
          this.collections = data.collections;
        }

        if (data.collection) {
          const [grade, size] = data.collection.split('-');
          const collection = data.collections[grade][size];
          this.downloadCollection(grade, collection);
        }
      });
    },
    methods: {
      onLoading() {
        this.isLoading = true;
      },
      onLoad() {
        this.isLoading = false;
      },
      reloadChannels() {
        ContentNodeResource.useContentCacheKey = false;
        ContentNodeResource.clearCache();
        ChannelResource.useContentCacheKey = false;
        ChannelResource.clearCache();
        showChannels(this.$store);
        this.$store.commit('SET_NOCONTENT', false);
      },
      downloadCollection(grade, collection) {
        this.grade = grade;
        this.downloadingCollection = collection;
        this.visibleModal = 'content';
      },
      gradeSelected(grade) {
        this.grade = grade;
        this.visibleModal = 'collection';
        this.installError = '';
      },
      installContentHide(error) {
        if (error || this.installError) {
          this.visibleModal = 'grade';
          this.installError = 'Can not install the selected collection';
        } else {
          this.visibleModal = 'none';
        }
      },
    },
  };

</script>


<style lang="scss">

  @import '../index';

  .partial-fonts-loaded body,
  .partial-fonts-loaded input,
  .partial-fonts-loaded select,
  .partial-fonts-loaded textarea,
  .full-fonts-loaded body,
  .full-fonts-loaded input,
  .full-fonts-loaded select,
  .full-fonts-loaded textarea {
    font-family: $font-family-sans-serif;
  }

  .partial-fonts-loaded button,
  .full-fonts-loaded button {
    font-family: $headings-font-family;
  }

  /** Non scoped styles to be able to modify body css to fix the footer to the bottom **/
  html {
    height: 100%;
  }

  body,
  body > div {
    height: 100vh;
    min-height: 100vh;
  }

  // Remove the padding added by the modal
  // https://stackoverflow.com/questions/32862394/bootstrap-modals-keep-adding-padding-right-to-body-after-closed
  body.modal-open {
    padding-right: 0 !important;
  }

</style>
