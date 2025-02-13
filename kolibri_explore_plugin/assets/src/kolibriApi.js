import urls from 'kolibri.urls';
import { ChannelResource, ContentNodeResource, ContentNodeSearchResource } from 'kolibri.resources';

import { ContentNodeKinds } from 'kolibri.coreVue.vuex.constants';

import Store from 'kolibri.coreVue.vuex.store';
import { utils } from 'eos-components';
import { showTopicsContentInLightbox } from './modules/topicsTree/handlers';

import { getChannelIcon } from './customApps';

class KolibriApi {
  constructor(channelId) {
    this.channelId = channelId;
  }

  themeRenderer() {
    // Doing nothing
    console.log('theme renderer');
  }

  getChannelMetadata() {
    return ChannelResource.fetchModel({ id: this.channelId }).then(metadata => {
      // Override channel icon with customApps icons
      metadata.thumbnail = getChannelIcon(metadata);
      return metadata;
    });
  }

  getChannelFilterOptions() {
    return ChannelResource.fetchFilterOptions(this.channelId).then(response => {
      return {
        availableAuthors: response.data.available_authors,
        availableTags: response.data.available_tags,
        availableKinds: response.data.available_kinds,
      };
    });
  }

  navigateTo(nodeId) {
    showTopicsContentInLightbox(Store, nodeId);
  }

  getContentByFilter(options) {
    const { kinds, onlyContent, onlyTopics } = options;

    if (onlyContent && onlyTopics) {
      const err = new Error('onlyContent and onlyTopics can not be used at the same time');
      throw err;
    }
    const kind = onlyContent ? 'content' : onlyTopics ? ContentNodeKinds.TOPIC : undefined;

    return ContentNodeResource.fetchCollection({
      getParams: {
        ids: options.ids,
        authors: options.authors,
        tags: options.tags,
        channel_id: this.channelId,
        parent: options.parent === 'self' ? this.channelId : options.parent,
        max_results: options.maxResults ? options.maxResults : 50,
        kind: kind,
        kind_in: kinds,
        descendant_of: options.descendantOf,
      },
    }).then(contentNodes => {
      const { more, results } = contentNodes;

      return {
        maxResults: options.maxResults ? options.maxResults : 50,
        results,
        more,
      };
    });
  }

  getContentPage(options) {
    return ContentNodeResource.fetchCollection({
      getParams: options,
    }).then(contentNodes => {
      const { more, results } = contentNodes;

      return {
        maxResults: options.max_results ? options.max_results : 50,
        more,
        results,
      };
    });
  }

  getContentById(id) {
    return ContentNodeResource.fetchModel({ id: id });
  }

  searchContent(options) {
    let searchPromise;
    const { keyword } = options;
    if (!keyword) {
      searchPromise = Promise.resolve({
        page: 0,
        pageSize: 0,
        results: [],
      });
    } else {
      searchPromise = ContentNodeSearchResource.fetchCollection({
        getParams: {
          search: keyword,
          channel_id: this.channelId,
        },
      });
    }

    return searchPromise;
  }

  getHighlightedContent(options) {
    const maxResults = options.maxResults ? options.maxResults : 10;
    const highlightedContentUrl = urls.static(`highlighted-content.json`);
    return (
      fetch(highlightedContentUrl)
        // Parse the JSON:
        .then(response => response.json())
        .catch(error => {
          console.error(error);
        })
        // Get the set of IDs using a rotation logic:
        .then(jsonData => {
          if (!(this.channelId in jsonData)) {
            throw new Error('NoHighlights');
          }
          const channelData = jsonData[this.channelId];

          // How many full sets?
          const setsNumber = Math.floor(channelData.length / maxResults);

          // Reduce day number to a valid index:
          const dayNumber = utils.getDayOfYearNumber();
          const i = dayNumber % setsNumber;

          // return jsonData[this.channelId].slice(0, maxResults);
          return channelData.slice(i * maxResults, i * maxResults + maxResults);
        })
        // Map IDs to content nodes:
        .then(ids => {
          return Promise.all(
            ids.map(id => {
              return this.getContentById(id)
                .then(node => {
                  return node;
                })
                .catch(() => {
                  return null;
                });
            })
          );
        })
        // Filter out the content not found:
        .then(nodes => {
          return {
            results: nodes.filter(n => n !== null),
          };
        })
    );
  }

  getRandomNodes(options) {
    return this.getHighlightedContent(options).catch(() => {
      return this.getRandomNodesReal(options);
    });
  }

  // This is the upstream API:
  getRandomNodesReal(options) {
    const { kinds, onlyContent } = options;

    return ContentNodeResource.fetchRandomCollection({
      getParams: {
        parent: options.parent === 'self' ? this.channelId : options.parent,
        channel_id: this.channelId,
        max_results: options.maxResults ? options.maxResults : 10,
        kind: onlyContent ? 'content' : undefined,
        kind_in: kinds,
        // Time seed to avoid cache
        seed: Date.now().toString(),
      },
    }).then(response => {
      return {
        maxResults: options.maxResults ? options.maxResults : 10,
        results: response.data,
      };
    });
  }
}

const kolibriApi = new KolibriApi();

export { KolibriApi, kolibriApi as default };
