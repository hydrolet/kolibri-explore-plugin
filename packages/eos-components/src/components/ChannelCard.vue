<template>
  <b-card :class="variant">
    <div
      v-if="hasBigThumbnail"
      class="bigThumbnail shadow"
      :style="bigThumbnailStyles"
    >
    </div>
    <b-card-header
      :class="{ withBigThumbnail: hasBigThumbnail, 'pb-3': !isSmall }"
    >
      <ChannelLogo class="mr-3 rounded-logo" :channel="channel" size="md" />
      <h6>
        {{ channel.title }}
      </h6>
    </b-card-header>
    <b-card-text v-if="!isSmall" class="pt-2 text-muted">
      <VClamp
        autoresize
        :maxLines="maxDescriptionLines"
      >
        {{ description }}
      </VClamp>
    </b-card-text>
  </b-card>
</template>

<script>
  import VClamp from 'vue-clamp';

  export default {
    name: 'ChannelCard',
    components: {
      VClamp,
    },
    props: {
      channel: {
        type: Object,
        required: true,
      },
      variant: {
        type: String,
        default: 'basicCard',
        validator: (value) => {
          return ['basicCard', 'smallCard'].indexOf(value) !== -1;
        },
      },
    },
    data() {
      return {
        maxDescriptionLines: 3,
      };
    },
    computed: {
      description() {
        return this.channel.tagline || this.channel.description;
      },
      bigThumbnailStyles() {
        return {
          background: `url(${this.channel.bigThumbnail}) white`,
          backgroundSize: '100% auto',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        };
      },
      hasBigThumbnail() {
        return this.channel.bigThumbnail;
      },
      isSmall() {
        return this.variant === 'smallCard';
      },
    },
  }
</script>

<style lang="scss" scoped>
  @import '../styles';

  .smallCard,
  .basicCard {
    cursor: pointer;
    border-radius: $border-radius-lg !important;
    background-color: #EFF0F3 !important;
    transition: all 0.3s ease;
  }

  .basicCard {
    border: 0 !important;
  }

  .smallCard:hover,
  .basicCard:hover {
    box-shadow: $box-shadow;
  }

  .card-header {
    background-color: transparent;
    padding: 0;
    font-weight: bold;
    display: flex;
    align-items: center;
  }

  .smallCard .card-header {
    border-bottom: none;
  }

  .smallCard {
    border: $border-width solid $card-border-color;
  }

  $card-image-ar: 376 / 600;
  .bigThumbnail {
    padding-top: percentage($card-image-ar);
    width: 100%;
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
  }

  .withBigThumbnail {
    margin-top: percentage($card-image-ar);
    padding-top: $card-spacer-y * 2;
  }

  .bigThumbnail, .rounded-logo {
    border-radius: $border-radius-lg !important;
  }
</style>
