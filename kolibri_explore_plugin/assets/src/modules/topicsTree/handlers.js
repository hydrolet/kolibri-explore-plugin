import samePageCheckGenerator from 'kolibri.utils.samePageCheckGenerator';
import ConditionalPromise from 'kolibri.lib.conditionalPromise';
import router from 'kolibri.coreVue.router';
import urls from 'kolibri.urls';
import axios from 'axios';
import { ContentNodeResource } from 'kolibri.resources';
import { PageNames } from '../../constants';
import { getAppNameByID, getChannelIcon } from '../../customApps';
import { normalizeContentNode, contentState } from '../coreExplore/utils';

function _getAppMetadata(appName) {
  const url = urls['kolibri:kolibri_explore_plugin:app_metadata']({ app: appName });
  return axios.get(url);
}

function _parseAppMetadata(data, appName) {
  if (!data) {
    return {};
  }

  const newData = { ...data };

  if (data.contentBackgroundImage) {
    const backgroundUrl = urls['kolibri:kolibri_explore_plugin:app_file']({
      app: appName,
      filename: data.contentBackgroundImage,
    });
    newData.contentBackgroundImage = `url(${backgroundUrl})`;
  }

  return newData;
}

export function showTopicsTopic(store, { id, isRoot = false }) {
  return store.dispatch('loading').then(() => {
    store.commit('SET_PAGE_NAME', isRoot ? PageNames.TOPICS_CHANNEL : PageNames.TOPICS_TOPIC);
    const promises = [
      ContentNodeResource.fetchModel({ id, force: true }), // the topic
      store.dispatch('setChannelInfo'),
    ];

    return ConditionalPromise.all(promises).only(
      samePageCheckGenerator(store),
      ([topic]) => {
        const currentChannel = store.getters.getChannelObject(topic.channel_id);
        if (!currentChannel) {
          router.replace({ name: PageNames.CONTENT_UNAVAILABLE });
          return;
        }
        if (isRoot) {
          topic.description = currentChannel.description;
          topic.tagline = currentChannel.tagline;
          topic.thumbnail = currentChannel.thumbnail;
        }
        store.commit('topicsTree/SET_STATE', {
          isRoot,
          channel: currentChannel,
          topic: normalizeContentNode(topic),
        });

        const appName = getAppNameByID(topic.channel_id);
        if (appName) {
          _getAppMetadata(appName)
            .then(({ data }) => {
              store.commit('topicsTree/SET_APP_METADATA', _parseAppMetadata(data, appName));
            })
            .catch(() => {
              console.log(`no metadata ${appName}`);
            });
        }

        store.dispatch('notLoading');
        store.commit('CORE_SET_ERROR', null);
      },
      error => {
        store.dispatch('handleApiError', error);
      }
    );
  });
}

export function showCustomContent(store, id) {
  store.commit('SET_EMPTY_LOGGING_STATE');
  store.commit('CORE_SET_PAGE_LOADING', true);

  const promises = [store.dispatch('setChannelInfo')];

  ConditionalPromise.all(promises).only(
    samePageCheckGenerator(store),
    () => {
      const currentChannel = store.getters.getChannelObject(id);
      if (!currentChannel) {
        router.replace({ name: PageNames.CONTENT_UNAVAILABLE });
        return;
      }
      currentChannel.thumbnail = getChannelIcon(currentChannel);
      store.commit('topicsTree/SET_STATE', {
        channel: currentChannel,
      });

      const appName = getAppNameByID(id);
      if (appName) {
        _getAppMetadata(appName)
          .then(({ data }) => {
            store.commit('topicsTree/SET_APP_METADATA', _parseAppMetadata(data, appName));
          })
          .catch(() => {
            console.log(`no metadata ${appName}`);
          });
      }

      store.commit('CORE_SET_PAGE_LOADING', false);
      store.commit('CORE_SET_ERROR', null);
    },
    error => {
      store.dispatch('handleApiError', error);
    }
  );
}

export function showTopicsChannel(store, id) {
  return store.dispatch('loading').then(() => {
    store.commit('SET_PAGE_NAME', PageNames.TOPICS_CHANNEL);
    return showCustomContent(store, id);
  });
}

export function showTopicsContent(store, id) {
  store.commit('SET_EMPTY_LOGGING_STATE');
  store.commit('CORE_SET_PAGE_LOADING', true);
  store.commit('SET_PAGE_NAME', PageNames.TOPICS_CONTENT);

  const promises = [
    ContentNodeResource.fetchModel({ id }),
    ContentNodeResource.fetchNextContent(id),
    store.dispatch('setChannelInfo'),
  ];
  ConditionalPromise.all(promises).only(
    samePageCheckGenerator(store),
    ([content, nextContent]) => {
      const currentChannel = store.getters.getChannelObject(content.channel_id);
      if (!currentChannel) {
        router.replace({ name: PageNames.CONTENT_UNAVAILABLE });
        return;
      }
      store.commit('topicsTree/SET_STATE', {
        content: contentState(content, nextContent),
        channel: currentChannel,
      });

      const appName = getAppNameByID(content.channel_id);
      if (appName) {
        _getAppMetadata(appName)
          .then(({ data }) => {
            store.commit('topicsTree/SET_APP_METADATA', _parseAppMetadata(data, appName));
          })
          .catch(() => {
            console.log(`no metadata ${appName}`);
          });
      }

      store.commit('CORE_SET_PAGE_LOADING', false);
      store.commit('CORE_SET_ERROR', null);
    },
    error => {
      store.dispatch('handleApiError', error);
    }
  );
}

export function showTopicsContentInLightbox(store, id) {
  const promises = [
    ContentNodeResource.fetchModel({ id }),
    ContentNodeResource.fetchNextContent(id),
    store.dispatch('setChannelInfo'),
  ];
  ConditionalPromise.all(promises).only(
    samePageCheckGenerator(store),
    ([content, nextContent]) => {
      const currentChannel = store.getters.getChannelObject(content.channel_id);
      if (!currentChannel) {
        router.replace({ name: PageNames.CONTENT_UNAVAILABLE });
        return;
      }
      store.commit('topicsTree/SET_STATE', {
        content: contentState(content, nextContent),
        channel: currentChannel,
      });

      const appName = getAppNameByID(content.channel_id);
      if (appName) {
        _getAppMetadata(appName)
          .then(({ data }) => {
            store.commit('topicsTree/SET_APP_METADATA', _parseAppMetadata(data, appName));
          })
          .catch(() => {
            console.log(`no metadata ${appName}`);
          });
      }
    },
    error => {
      store.dispatch('handleApiError', error);
    }
  );
}

export function hideTopicsContentFromLightbox(store) {
  store.commit('topicsTree/RESET_CONTENT');
}
