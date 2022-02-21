export default {
  namespaced: true,
  state: {
    rootNodes: [],
    searchResult: {},
    searchQueryIndex: 0,
    carouselNodes: [],
  },
  mutations: {
    SET_STATE(state, payload) {
      state.rootNodes = payload.rootNodes;
    },
    RESET_STATE(state) {
      state.rootNodes = [];
    },
    SET_SEARCH_RESULT(state, payload) {
      state.searchResult = payload;
    },
    SET_CAROUSEL_NODES(state, payload) {
      state.carouselNodes = payload;
    },
    SET_SEARCH_QUERY_INDEX(state, index) {
      state.searchQueryIndex = index;
    },
  },
};
